/**
 * Rate-limited proxy for NVIDIA API.
 *
 * Queues outgoing requests to stay within 40 requests per 60 seconds.
 * Handles streaming (SSE) responses correctly.
 *
 * opencode.jsonc should set the NVIDIA provider's baseURL to:
 *   http://localhost:1340/v1
 *
 * Status dashboard: http://localhost:1340/status
 * Health check:    http://localhost:1340/health
 */

process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

const express = require("express");
const https = require("https");
const http = require("http");
const { exec } = require("child_process");
const Bottleneck = require("bottleneck");
const { dirname } = require("path");
const { writeFile, mkdir, readFile } = require("fs/promises");
const { existsSync, readFileSync } = require("fs");

// ---------------------------------------------------------------------------
// Config — load from config.json, fallback to env vars, then defaults
// ---------------------------------------------------------------------------
const CONFIG_FILE = `${__dirname}/config.json`;

const DEFAULT_CONFIG = {
  PORT: 1340,
  UPSTREAM_HOST: "integrate.api.nvidia.com",
  UPSTREAM_PORT: 443,
  RPM: 40,
  MAX_CONCURRENT: 12,
  UPSTREAM_TIMEOUT_MS: 300_000,
};

function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
      return { ...DEFAULT_CONFIG, ...fileConfig };
    } catch (e) {
      log("WARN", "failed to parse config.json, using defaults", { error: e.message });
    }
  }
  // Fallback to env vars
  return {
    PORT: parseInt(process.env.PROXY_PORT, 10) || DEFAULT_CONFIG.PORT,
    UPSTREAM_HOST: process.env.UPSTREAM_HOST || DEFAULT_CONFIG.UPSTREAM_HOST,
    UPSTREAM_PORT: parseInt(process.env.UPSTREAM_PORT, 10) || DEFAULT_CONFIG.UPSTREAM_PORT,
    RPM: parseInt(process.env.RATE_LIMIT_RPM, 10) || DEFAULT_CONFIG.RPM,
    MAX_CONCURRENT: parseInt(process.env.MAX_CONCURRENT, 10) || DEFAULT_CONFIG.MAX_CONCURRENT,
    UPSTREAM_TIMEOUT_MS: parseInt(process.env.UPSTREAM_TIMEOUT_MS, 10) || DEFAULT_CONFIG.UPSTREAM_TIMEOUT_MS,
  };
}

const CONFIG = loadConfig();

const PORT = CONFIG.PORT;
const UPSTREAM_HOST = CONFIG.UPSTREAM_HOST;
const UPSTREAM_PORT = CONFIG.UPSTREAM_PORT;
const RPM = CONFIG.RPM;
const MAX_CONCURRENT = CONFIG.MAX_CONCURRENT;
const UPSTREAM_TIMEOUT_MS = CONFIG.UPSTREAM_TIMEOUT_MS;
const LOG_DIR = `${__dirname}/logs`;

// ---------------------------------------------------------------------------
// Metrics — tracks what's happening so you're not in the dark
// ---------------------------------------------------------------------------
const metrics = {
  startedAt: Date.now(),
  totalRequests: 0,
  completedRequests: 0,
  failedRequests: 0,
  queueedRequests: 0,      // how many times a request had to wait for the reservoir
  bytesSent: 0,
  bytesReceived: 0,
  lastError: null,          // { at, message, path }
  lastRequestAt: null,
  draining: false,          // when true, reject new requests with 503 (used during shutdown)
  // Rolling window: timestamps of completed requests (for live RPM)
  completedTimestamps: [],
  // Per-path stats
  byPath: {},
};

function recordComplete(elapsedMs) {
  metrics.completedRequests++;
  metrics.lastRequestAt = new Date().toISOString();
  metrics.completedTimestamps.push(Date.now());
  // Keep only last 2 minutes of timestamps for live RPM calculation
  const cutoff = Date.now() - 120_000;
  metrics.completedTimestamps = metrics.completedTimestamps.filter(t => t > cutoff);
}

function recordError(err, path) {
  metrics.failedRequests++;
  metrics.lastError = { at: new Date().toISOString(), message: err.message, path };
}

function liveRpm() {
  const cutoff = Date.now() - 60_000;
  return metrics.completedTimestamps.filter(t => t > cutoff).length;
}

// ---------------------------------------------------------------------------
// Simple file logger (no external dep)
// ---------------------------------------------------------------------------
async function log(level, msg, extra) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${level}: ${msg}${extra ? " " + JSON.stringify(extra) : ""}\n`;
  try {
    if (!existsSync(LOG_DIR)) await mkdir(LOG_DIR, { recursive: true });
    await writeFile(`${LOG_DIR}/proxy.log`, line, { flag: "a" });
  } catch {
    // Best-effort logging
  }
  // Also print to stderr so it shows in the terminal / Windows Event viewer
  process.stderr.write(line);
}

// Periodically log proxy status every 30s
setInterval(async () => {
  const uptime = Math.floor((Date.now() - metrics.startedAt) / 1000);
  const limiterCounts = limiter.counts();
  await log("STATS", `uptime=${uptime}s req=${metrics.totalRequests} done=${metrics.completedRequests} fail=${metrics.failedRequests} live-rpm=${liveRpm()} queued=${limiterCounts.QUEUED || 0} running=${limiterCounts.RUNNING || 0}`);
}, 30_000);

// ---------------------------------------------------------------------------
// Rate limiter — token-bucket reservoir (40/min) + concurrency cap
// ---------------------------------------------------------------------------
// Reservoir alone lets 40 requests/minute fire in one burst. NVIDIA's worker
// caps concurrent in-flight around 32. We layer MAX_CONCURRENT on top so a
// burst of N parallel sub-agents never exceeds NVIDIA's per-worker cap.
const limiter = new Bottleneck({
  reservoir: RPM,
  reservoirRefreshAmount: RPM,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: MAX_CONCURRENT,
  // No minTime — once a slot frees up, queue dispatches immediately.
});

limiter.on("error", (err) => log("ERROR", "limiter error", { error: err.message }));

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

// Capture raw body for all content types (we need to replay it upstream)
// ONLY for the proxy route — must come before the proxy route
function rawBodyMiddleware(req, res, next) {
  if (req.path.startsWith("/config") || req.path.startsWith("/control") || req.path === "/health" || req.path === "/status" || req.path === "/tail-log") {
    return next();
  }
  express.raw({ type: "*/*", limit: "20mb" })(req, res, next);
}
app.use(rawBodyMiddleware);

// Health check — quick liveness probe (machine-readable)
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    uptime_sec: Math.floor((Date.now() - metrics.startedAt) / 1000),
    live_rpm: liveRpm(),
    max_rpm: RPM,
    max_concurrent: MAX_CONCURRENT,
    running: limiter.counts().RUNNING || 0,
    queued: limiter.counts().QUEUED || 0,
    draining: metrics.draining,
    pid: process.pid,
    total_requests: metrics.totalRequests,
    failed_requests: metrics.failedRequests,
  });
});

// Status dashboard — real-time HTML page (self-updating every 2s)
app.get("/status", (_req, res) => {
  const uptimeSec = Math.floor((Date.now() - metrics.startedAt) / 1000);
  const uptimeStr = uptimeSec < 60 ? `${uptimeSec}s`
    : uptimeSec < 3600 ? `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`
    : `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m`;
  const counts = limiter.counts();
  const avgMs = metrics.completedRequests > 0
    ? Math.round(Object.values(metrics.byPath).reduce((s, p) => s + p.totalMs, 0) / metrics.completedRequests)
    : 0;

  const pathRows = Object.entries(metrics.byPath)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([path, s]) => `<tr><td>${escHtml(path)}</td><td>${s.count}</td><td>${s.errors}</td><td>${s.count > 0 ? Math.round(s.totalMs / s.count) : '-'}ms</td></tr>`)
    .join("");

  const statusHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>NVIDIA Proxy Live</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 1rem; background: #0d1117; color: #c9d1d9; }
  h1 { color: #58a6ff; font-size: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
  #last-updated { color: #484f58; font-size: 0.75rem; font-weight: normal; margin-left: auto; }
  .live-badge { background: #1a7f37; color: #fff; font-size: 0.65rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; letter-spacing: 0.5px; }
  h2 { color: #8b949e; font-size: 1rem; margin: 1.5rem 0 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid #21262d; font-size: 0.85rem; }
  th { color: #8b949e; font-weight: 600; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
  .stat-item { background: #161b22; padding: 0.75rem; border-radius: 6px; border: 1px solid #21262d; }
  .stat-label { color: #8b949e; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value { font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
  .stat-sub { font-size: 0.75rem; font-weight: normal; color: #8b949e; }
  .ok { color: #3fb950; }
  .warn { color: #d29922; }
  .err { color: #f85149; }
  .neutral { color: #c9d1d9; }
  .error-box { background: #2d1215; border: 1px solid #f85149; padding: 0.6rem 0.8rem; border-radius: 6px; margin: 0.3rem 0; font-size: 0.85rem; }
  .log-box { background: #161b22; border: 1px solid #21262d; border-radius: 6px; padding: 0; max-height: 300px; overflow-y: auto; }
  .log-box pre { margin: 0; padding: 0.5rem; font-size: 0.75rem; line-height: 1.5; font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace; }
  .log-error { color: #f85149; }
  .log-warn { color: #d29922; }
  .log-stats { color: #58a6ff; }
  .log-info { color: #8b949e; }
  a { color: #58a6ff; }
  .path-table-wrap { max-height: 250px; overflow-y: auto; border: 1px solid #21262d; border-radius: 6px; }
  .path-table-wrap table { border: none; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .detail-card { background: #161b22; border: 1px solid #21262d; border-radius: 6px; padding: 0.75rem; max-height: 380px; overflow: hidden; display: flex; flex-direction: column; }
  .detail-card h2 { margin-top: 0; }
  .scroll-area { overflow-y: auto; flex: 1; }
  .spark { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
  .spark-ok { background: #3fb950; }
  .spark-warn { background: #d29922; }
  .spark-err { background: #f85149; }
  .status-bar { display: flex; gap: 1rem; align-items: center; font-size: 0.8rem; color: #8b949e; }
</style></head>
<body>
<div style="display:flex;align-items:center;justify-content:space-between">
  <h1>◉ NVIDIA Proxy <span class="live-badge">LIVE</span></h1>
  <div class="status-bar">
    <span><span class="spark spark-ok"></span> ${RPM} RPM limit</span>
    <span id="relay-status">→ <span id="relay-host">${escHtml(UPSTREAM_HOST)}</span></span>
    <span id="last-updated">updating...</span>
    <button id="settings-btn" style="background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:0.3rem 0.6rem;border-radius:6px;cursor:pointer;font-size:0.85rem" title="Settings">⚙</button>
  </div>
</div>

<!-- Settings Modal -->
<div id="settings-modal" class="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1000;align-items:center;justify-content:center">
  <div style="background:#161b22;border:1px solid #21262d;border-radius:8px;padding:1.5rem;max-width:480px;width:90%;max-height:80vh;overflow:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="margin:0;color:#58a6ff">Proxy Settings</h2>
      <button id="modal-close" style="background:none;border:none;color:#8b949e;font-size:1.5rem;cursor:pointer;line-height:1">&times;</button>
    </div>
    <form id="settings-form">
      <div style="margin-bottom:1rem">
        <label style="display:block;margin-bottom:0.25rem;color:#8b949e;font-size:0.85rem">RPM Limit (requests/minute)</label>
        <input type="number" name="RPM" id="cfg-rpm" value="${RPM}" min="1" max="1000" style="width:100%;padding:0.5rem;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:0.9rem">
      </div>
      <div style="margin-bottom:1rem">
        <label style="display:block;margin-bottom:0.25rem;color:#8b949e;font-size:0.85rem">Max Concurrent Requests</label>
        <input type="number" name="MAX_CONCURRENT" id="cfg-max-concurrent" value="${MAX_CONCURRENT}" min="1" max="100" style="width:100%;padding:0.5rem;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:0.9rem">
      </div>
      <div style="margin-bottom:1rem">
        <label style="display:block;margin-bottom:0.25rem;color:#8b949e;font-size:0.85rem">Upstream Timeout (ms)</label>
        <input type="number" name="UPSTREAM_TIMEOUT_MS" id="cfg-timeout" value="${UPSTREAM_TIMEOUT_MS}" min="5000" max="600000" style="width:100%;padding:0.5rem;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:0.9rem">
      </div>
      <div style="margin-bottom:1rem">
        <label style="display:block;margin-bottom:0.25rem;color:#8b949e;font-size:0.85rem">Upstream Host</label>
        <input type="text" name="UPSTREAM_HOST" id="cfg-host" value="${escHtml(UPSTREAM_HOST)}" style="width:100%;padding:0.5rem;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:0.9rem">
      </div>
      <div style="margin-bottom:1rem">
        <label style="display:block;margin-bottom:0.25rem;color:#8b949e;font-size:0.85rem">Port (requires restart)</label>
        <input type="number" name="PORT" id="cfg-port" value="${PORT}" min="1" max="65535" style="width:100%;padding:0.5rem;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:0.9rem">
      </div>
      <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem">
        <button type="button" id="modal-cancel" style="background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:0.5rem 1rem;border-radius:6px;cursor:pointer">Cancel</button>
        <button type="submit" style="background:#238636;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600">Save & Restart Proxy</button>
      </div>
    </form>
    <div id="modal-toast" style="margin-top:1rem;padding:0.75rem;border-radius:6px;display:none;font-size:0.85rem"></div>
  </div>
</div>

<div class="stat-grid" id="stat-grid">
  <div class="stat-item"><div class="stat-label">Status</div><div class="stat-value ok" id="stat-status">● Running</div></div>
  <div class="stat-item"><div class="stat-label">Uptime</div><div class="stat-value neutral" id="stat-uptime">${uptimeStr}</div></div>
  <div class="stat-item"><div class="stat-label">Live RPM</div><div class="stat-value ok" id="stat-rpm">${liveRpm()} <span class="stat-sub">/ ${RPM}</span></div></div>
  <div class="stat-item"><div class="stat-label">Running / Queued</div><div class="stat-value neutral" id="stat-concurrency">${counts.RUNNING || 0} <span class="stat-sub">/ ${counts.QUEUED || 0} queued</span></div></div>
  <div class="stat-item"><div class="stat-label">Total Requests</div><div class="stat-value neutral" id="stat-total">${metrics.totalRequests}</div></div>
  <div class="stat-item"><div class="stat-label">Completed</div><div class="stat-value ok" id="stat-done">${metrics.completedRequests}</div></div>
  <div class="stat-item"><div class="stat-label">Failed</div><div class="stat-value" id="stat-failed">${metrics.failedRequests}</div></div>
  <div class="stat-item"><div class="stat-label">Avg Response</div><div class="stat-value neutral" id="stat-avg">${avgMs > 0 ? (avgMs / 1000).toFixed(1) + 's' : '—'}</div></div>
</div>

<div id="error-container">${metrics.lastError ? `<h2>Last Error</h2><div class="error-box"><strong>${escHtml(metrics.lastError.message)}</strong><br><span style="color:#8b949e">at ${metrics.lastError.at} — ${escHtml(metrics.lastError.path)}</span></div>` : ''}</div>

<div class="detail-grid">
  <div class="detail-card">
    <h2>Per-Path Breakdown</h2>
    <div class="scroll-area">
      <div class="path-table-wrap">
        <table><thead><tr><th>Path</th><th>Count</th><th style="color:#f85149">Errors</th><th>Avg</th></tr></thead>
        <tbody id="path-tbody">${pathRows}</tbody></table>
      </div>
    </div>
  </div>
  <div class="detail-card">
    <h2>Live Log <span style="font-weight:normal;font-size:0.75rem;color:#484f58">(last 50 lines, auto-refresh)</span></h2>
    <div class="log-box" id="log-box"><pre id="log-pre">loading...</pre></div>
  </div>
</div>

<p style="color:#484f58;font-size:0.75rem;margin-top:0.75rem">
  Log file: <code>${escHtml(LOG_DIR)}\\proxy.log</code>
</p>

<script>
// ---- Real-time poller ----
const RPM_MAX = ${RPM};

function colorClass(v) {
  if (v === 0) return '';
  return v > 0 ? 'err' : '';
}

function animateValue(el, newVal, suffix) {
  const oldVal = el.getAttribute('data-val');
  if (oldVal !== null && oldVal !== String(newVal)) {
    el.style.transition = 'color 0.1s';
    el.style.color = '#58a6ff';
    setTimeout(() => { el.style.color = ''; }, 400);
  }
  el.setAttribute('data-val', String(newVal));
  el.textContent = suffix ? newVal + suffix : newVal;
}

async function pollHealth() {
  try {
    const r = await fetch('/health');
    const d = await r.json();

    // Uptime
    const u = d.uptime_sec;
    const uStr = u < 60 ? u + 's' : u < 3600 ? Math.floor(u/60) + 'm ' + (u%60) + 's' : Math.floor(u/3600) + 'h ' + Math.floor((u%3600)/60) + 'm';
    document.getElementById('stat-uptime').textContent = uStr;

    // RPM
    const rpmEl = document.getElementById('stat-rpm');
    rpmEl.innerHTML = d.live_rpm + ' <span class="stat-sub">/ ' + RPM_MAX + '</span>';
    rpmEl.className = 'stat-value' + (d.live_rpm > RPM_MAX * 0.8 ? ' warn' : d.live_rpm > 0 ? ' ok' : '');

    // Running / Queued
    const conEl = document.getElementById('stat-concurrency');
    conEl.innerHTML = d.running + ' <span class="stat-sub">/ ' + d.queued + ' queued</span>';
    conEl.className = 'stat-value' + (d.queued > 0 ? ' warn' : ' neutral');

    // Counts
    animateValue(document.getElementById('stat-total'), d.total_requests);
    animateValue(document.getElementById('stat-done'), d.completed_requests);
    const failEl = document.getElementById('stat-failed');
    animateValue(failEl, d.failed_requests);
    failEl.className = 'stat-value' + (d.failed_requests > 0 ? ' err' : '');

    // Status dot
    const statusEl = document.getElementById('stat-status');
    statusEl.textContent = '● Running';
    statusEl.className = 'stat-value ok';

    // Last updated
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
  } catch(e) {
    document.getElementById('stat-status').textContent = '● OFFLINE';
    document.getElementById('stat-status').className = 'stat-value err';
    document.getElementById('last-updated').textContent = 'poll failed: ' + e.message;
  }
}

async function pollLog() {
  try {
    const r = await fetch('/tail-log');
    const text = await r.text();
    const pre = document.getElementById('log-pre');
    // Colorize log lines
    const lines = text.split('\\n').map(line => {
      if (line.match(/ERROR/)) return '<span class="log-error">' + escHtml(line) + '</span>';
      if (line.match(/WARN/))  return '<span class="log-warn">' + escHtml(line) + '</span>';
      if (line.match(/STATS/)) return '<span class="log-stats">' + escHtml(line) + '</span>';
      return escHtml(line);
    }).join('\\n');
    pre.innerHTML = lines || '(empty log)';
    // Auto-scroll to bottom
    const box = document.getElementById('log-box');
    box.scrollTop = box.scrollHeight;
  } catch(e) {
    document.getElementById('log-pre').textContent = '(log unavailable)';
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Settings Modal Logic
const modal = document.getElementById('settings-modal');
const modalOpen = document.querySelector('[title="Settings"]');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalForm = document.getElementById('settings-form');
const modalToast = document.getElementById('modal-toast');

function showToast(message, isError = false) {
  modalToast.textContent = message;
  modalToast.style.background = isError ? '#2d1215' : '#1a3a2a';
  modalToast.style.border = isError ? '1px solid #f85149' : '1px solid #3fb950';
  modalToast.style.color = isError ? '#f85149' : '#3fb950';
  modalToast.style.display = 'block';
  setTimeout(() => { modalToast.style.display = 'none'; }, 4000);
}

modalOpen.addEventListener('click', () => { modal.style.display = 'flex'; });
modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
modalCancel.addEventListener('click', () => { modal.style.display = 'none'; });
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = modalForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  try {
    const formData = new FormData(modalForm);
    const body = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'PORT' || key === 'RPM' || key === 'MAX_CONCURRENT' || key === 'UPSTREAM_TIMEOUT_MS') {
        body[key] = parseInt(value, 10);
      } else {
        body[key] = value;
      }
    }
    const resp = await fetch('/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await resp.json();
    if (data.ok) {
      showToast('Config saved! Restart proxy to apply changes.', false);
      setTimeout(() => { modal.style.display = 'none'; }, 1500);
    } else {
      showToast('Error: ' + (data.error || 'unknown'), true);
    }
  } catch (err) {
    showToast('Error: ' + err.message, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save & Restart Proxy';
  }
});

// Poll immediately, then every 2s
pollHealth();
pollLog();
setInterval(pollHealth, 2000);
setInterval(pollLog, 3000);
</script>
</body>
</html>`;

  res.type("html").send(statusHtml);
});

// Tail the log file (last 50 lines)
app.get("/tail-log", async (_req, res) => {
  try {
    const content = await readFile(`${LOG_DIR}/proxy.log`, "utf8");
    const lines = content.trim().split("\n").slice(-50).join("\n");
    res.type("text/plain").send(lines || "(empty log)");
  } catch {
    res.type("text/plain").send("(log file not found)");
  }
});

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// Config endpoints — read/write proxy config (requires restart to apply)
// ---------------------------------------------------------------------------

// GET /config — returns current effective config
app.get("/config", (_req, res) => {
  res.json({
    port: PORT,
    rpm: RPM,
    maxConcurrent: MAX_CONCURRENT,
    upstreamHost: UPSTREAM_HOST,
    upstreamTimeoutMs: UPSTREAM_TIMEOUT_MS,
  });
});

// POST /config — update config file, returns restart_required: true
app.post("/config", express.json({ limit: "1kb" }), (req, res) => {
  const { PORT, RPM, MAX_CONCURRENT, UPSTREAM_HOST, UPSTREAM_TIMEOUT_MS } = req.body || {};
  const updates = {};
  if (typeof PORT === "number" && PORT > 0 && PORT < 65536) updates.PORT = PORT;
  if (typeof RPM === "number" && RPM > 0 && RPM <= 1000) updates.RPM = RPM;
  if (typeof MAX_CONCURRENT === "number" && MAX_CONCURRENT > 0 && MAX_CONCURRENT <= 100) updates.MAX_CONCURRENT = MAX_CONCURRENT;
  if (typeof UPSTREAM_HOST === "string" && UPSTREAM_HOST.length > 0) updates.UPSTREAM_HOST = UPSTREAM_HOST;
  if (typeof UPSTREAM_TIMEOUT_MS === "number" && UPSTREAM_TIMEOUT_MS > 0) updates.UPSTREAM_TIMEOUT_MS = UPSTREAM_TIMEOUT_MS;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ ok: false, error: "no valid fields provided" });
  }

  const current = loadConfig();
  const merged = { ...current, ...updates };
  saveConfig(merged);
  log("INFO", "config updated via /config", merged);
  res.json({ ok: true, restart_required: true, config: merged });
});

// ---------------------------------------------------------------------------
// Control endpoints — loopback only, no auth (localhost-only binding)
// ---------------------------------------------------------------------------

// Drain: stop accepting new requests (503), keep running for inspection
app.post("/control/drain", (_req, res) => {
  metrics.draining = true;
  log("INFO", "control: drain requested — new requests will return 503");
  res.json({ ok: true, message: "draining: new requests rejected, in-flight continue" });
});

// Resume: accept new requests again
app.post("/control/resume", (_req, res) => {
  metrics.draining = false;
  log("INFO", "control: resume requested — accepting new requests");
  res.json({ ok: true, message: "resumed: accepting new requests" });
});

// Graceful shutdown: drain, wait for in-flight to finish, then exit
app.post("/control/shutdown", async (req, res) => {
  const waitForInFlight = req.query.wait !== "false";
  metrics.draining = true;
  log("INFO", "control: graceful shutdown requested", { waitForInFlight });

  // Tell the client we're shutting down before we exit
  res.json({
    ok: true,
    pid: process.pid,
    message: waitForInFlight
      ? "shutting down after in-flight requests complete"
      : "shutting down immediately",
  });

  // Small delay so the response reaches the client
  await new Promise(r => setTimeout(r, 500));

  if (waitForInFlight) {
    // Wait for RUNNING to hit 0 (max 60s)
    const maxWaitMs = 60_000;
    const pollInterval = 500;
    let waited = 0;
    while (waited < maxWaitMs) {
      const running = limiter.counts().RUNNING || 0;
      if (running === 0) {
        log("INFO", "control: all in-flight complete, exiting");
        process.exit(0);
      }
      await new Promise(r => setTimeout(r, pollInterval));
      waited += pollInterval;
    }
    log("WARN", "control: timed out waiting for in-flight, forcing exit");
    process.exit(1);
  } else {
    log("INFO", "control: immediate shutdown");
    process.exit(0);
  }
});

// ---------------------------------------------------------------------------
// Drain middleware: reject new requests when draining
// ---------------------------------------------------------------------------
function drainGuard(req, res, next) {
  if (metrics.draining) {
    res.setHeader("Retry-After", "5");
    return res.status(503).json({
      error: {
        message: "Proxy is draining — not accepting new requests",
        type: "proxy_draining",
        retry_after: 5,
      },
    });
  }
  next();
}

// Proxy all other paths (with drain guard)
app.all("/*", drainGuard, async (req, res) => {
  const startMs = Date.now();
  const path = req.originalUrl;

  metrics.totalRequests++;
  metrics.lastRequestAt = new Date().toISOString();
  // Track per-path
  const pathKey = `${req.method} ${path}`;
  if (!metrics.byPath[pathKey]) metrics.byPath[pathKey] = { count: 0, totalMs: 0, errors: 0 };
  metrics.byPath[pathKey].count++;

  log("INFO", `→ ${req.method} ${path}`);

  try {
    // Schedule the upstream call through the rate limiter
    await limiter.schedule(() => forwardToNvidia(req, res, path));
    const elapsed = Date.now() - startMs;
    metrics.byPath[pathKey].totalMs += elapsed;
    recordComplete(elapsed);
    log("INFO", `✓ ${req.method} ${path} (${elapsed}ms)`);
  } catch (err) {
    const elapsed = Date.now() - startMs;
    metrics.byPath[pathKey].errors++;
    recordError(err, path);
    log("ERROR", `✗ ${req.method} ${path} (${elapsed}ms)`, { error: err.message });

    // If headers already sent (e.g. streaming mid-response failure), we can't send a response
    if (res.headersSent) {
      log("WARN", "headers already sent, destroying connection");
      res.destroy();
      return;
    }

    res.status(502).json({
      error: {
        message: `Proxy error: ${err.message}`,
        type: "proxy_error",
        proxy: true,
      },
    });
  }
});

// ---------------------------------------------------------------------------
// Connection pool — smarter keep-alive so we don't ECONNRESET
// ---------------------------------------------------------------------------
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 40,
  maxFreeSockets: 10,
  timeout: UPSTREAM_TIMEOUT_MS,
});

// Track last-used time per socket so we can retire stale ones
const socketMeta = new WeakMap();
httpsAgent.createConnection = ((original) => (options, cb) => {
  const socket = original.call(httpsAgent, options, cb);
  socketMeta.set(socket, { born: Date.now() });
  return socket;
})(httpsAgent.createConnection);

function markSocketClosed(socket) {
  // Called after a streaming response to retire the socket
  if (socket && !socket.destroyed) {
    socket.destroy(); // Don't reuse SSE connections — they're unreliable
  }
}

// ---------------------------------------------------------------------------
// Forward a single request to NVIDIA upstream (with one ECONNRESET retry)
// ---------------------------------------------------------------------------
async function forwardToNvidia(expressReq, expressRes, path) {
  let body = expressReq.body;

  // Intercept and normalize model names to prevent 404s on upstream NIM catalog mismatches
  if (body && body.length > 0) {
    try {
      const bodyStr = body.toString("utf8");
      const json = JSON.parse(bodyStr);
      if (json.model) {
        const originalModel = json.model;
        const normalized = json.model.toLowerCase();
        
        if (normalized.endsWith("nemotron-3-ultra") || normalized.endsWith("nemotron-3-ultra-550b-a55b")) {
          json.model = "nvidia/nemotron-3-ultra-550b-a55b";
        } else if (normalized.includes("deepseek-v4-pro") || normalized.includes("deepseek-ai/deepseek-v4-pro")) {
          json.model = "deepseek-ai/deepseek-v4-pro";
        } else if (normalized.includes("deepseek-v4-flash") || normalized.includes("deepseek-ai/deepseek-v4-flash")) {
          json.model = "deepseek-ai/deepseek-v4-flash";
        } else if (normalized.includes("minimax-m3") || normalized.includes("minimaxai/minimax-m3")) {
          json.model = "minimaxai/minimax-m3";
        } else if (normalized.includes("glm-5.2") || normalized.includes("thudm/glm-5.2")) {
          json.model = "thudm/glm-5.2";
        }
        
        if (json.model !== originalModel) {
          log("INFO", `Aliased model '${originalModel}' -> '${json.model}'`);
          body = Buffer.from(JSON.stringify(json), "utf8");
          expressReq.body = body;
        }
      }
    } catch (e) {
      // Best-effort
    }
  }

  const isStreaming = isStreamRequest(expressReq);
  let lastErr;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await doForward(expressReq, expressRes, path, body, isStreaming);
      return; // success
    } catch (err) {
      lastErr = err;
      const isReset = err.message.includes("ECONNRESET");
      const isTimeout = err.message.includes("timed out");

      if (isReset && attempt === 1) {
        log("WARN", `↻ ECONNRESET on attempt ${attempt}, retrying once`, { path });
        // Small backoff before retry
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      // For timeout or second ECONNRESET — fail
      break;
    }
  }
  throw lastErr;
}

function doForward(expressReq, expressRes, path, body, isStreaming) {
  return new Promise((resolve, reject) => {
    const upstreamPath = path;

    // Forward headers, stripping connection-level ones
    const upstreamHeaders = { ...expressReq.headers };
    delete upstreamHeaders.host;
    delete upstreamHeaders["transfer-encoding"];
    delete upstreamHeaders["content-length"];
    delete upstreamHeaders.connection;
    delete upstreamHeaders["keep-alive"];
    // normalize content-length
    if (body && body.length > 0) {
      upstreamHeaders["content-length"] = Buffer.byteLength(body);
    }

    const options = {
      hostname: UPSTREAM_HOST,
      port: UPSTREAM_PORT,
      path: upstreamPath,
      method: expressReq.method,
      headers: upstreamHeaders,
      timeout: UPSTREAM_TIMEOUT_MS,
      rejectUnauthorized: true,
      agent: httpsAgent,
    };

    let requestFinished = false;

    const proxyReq = https.request(options, (proxyRes) => {
      // Copy upstream status and headers to the downstream response
      expressRes.status(proxyRes.statusCode);
      for (let i = 0; i < proxyRes.rawHeaders.length; i += 2) {
        const key = proxyRes.rawHeaders[i];
        const val = proxyRes.rawHeaders[i + 1];
        if (key.toLowerCase() === "transfer-encoding") continue;
        expressRes.setHeader(key, val);
      }

      if (isStreaming) {
        // Pipe the response, then destroy the socket so it's not reused
        proxyRes.pipe(expressRes);
        proxyRes.on("end", () => {
          if (requestFinished) return;
          requestFinished = true;
          expressRes.removeListener("close", onClientClose);
          if (proxyReq.socket) markSocketClosed(proxyReq.socket);
          resolve();
        });
        proxyRes.on("error", (err) => {
          if (requestFinished) return;
          requestFinished = true;
          expressRes.removeListener("close", onClientClose);
          log("ERROR", "upstream stream error", { error: err.message });
          reject(err);
        });
      } else {
        const chunks = [];
        proxyRes.on("data", (chunk) => chunks.push(chunk));
        proxyRes.on("end", () => {
          if (requestFinished) return;
          requestFinished = true;
          expressRes.removeListener("close", onClientClose);
          const buf = Buffer.concat(chunks);
          expressRes.send(buf);
          resolve();
        });
        proxyRes.on("error", (err) => {
          if (requestFinished) return;
          requestFinished = true;
          expressRes.removeListener("close", onClientClose);
          reject(err);
        });
      }
    });

    const onClientClose = () => {
      if (requestFinished) return;
      requestFinished = true;
      log("WARN", `Client disconnected before upstream completed for ${expressReq.method} ${path}`);
      try {
        proxyReq.destroy();
      } catch (e) {}
      reject(new Error("Client disconnected"));
    };

    expressRes.on("close", onClientClose);

    proxyReq.on("timeout", () => {
      if (requestFinished) return;
      requestFinished = true;
      expressRes.removeListener("close", onClientClose);
      proxyReq.destroy();
      reject(new Error(`Upstream request timed out after ${UPSTREAM_TIMEOUT_MS / 1000}s`));
    });

    proxyReq.on("error", (err) => {
      if (!requestFinished) {
        requestFinished = true;
        expressRes.removeListener("close", onClientClose);
        // Only reject for connection-level errors (ECONNRESET, DNS, etc.)
        reject(new Error(`Upstream connection failed: ${err.message}`));
      }
    });

    // Send the request body
    if (body && body.length > 0) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

// ---------------------------------------------------------------------------
// Detect streaming requests (SSE)
// ---------------------------------------------------------------------------
function isStreamRequest(req) {
  const accept = (req.headers.accept || "").toLowerCase();
  const contentType = (req.headers["content-type"] || "").toLowerCase();
  const body = req.body ? req.body.toString("utf8") : "";

  // Use both headers and body to detect streaming
  if (accept.includes("text/event-stream")) return true;
  try {
    const parsed = JSON.parse(body);
    return parsed.stream === true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Startup — gracefully handle port already in use
// ---------------------------------------------------------------------------
const server = app.listen(PORT, "127.0.0.1");
server.on("listening", () => {
  const statusUrl = `http://127.0.0.1:${PORT}/status`;
  const msg = `NVIDIA rate-limited proxy running on ${statusUrl} → https://${UPSTREAM_HOST} (${RPM} RPM)`;
  process.stdout.write(msg + "\n");
  log("INFO", msg);
  // Auto-open the dashboard in the default browser
  const cmd = process.platform === "win32" ? `start "" "${statusUrl}"` : `open "${statusUrl}"`;
  exec(cmd, (err) => { if (err) log("WARN", "failed to open browser", { error: err.message }); });
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    // Another proxy instance is already running — nothing to do
    process.exit(0);
  }
  log("ERROR", "failed to start", { error: err.message });
  process.exit(1);
});
