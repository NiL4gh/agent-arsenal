// fixtures/sample-app/App.js
// Seeded-bug mini app for ui-flow-audit self-verification.
//
// Layout:
//   state.{timerRunning, lastResult, dropdownOpen, menuExpanded}  ← see per-key notes
//
// Handlers are wires via document.getElementById + addEventListener.
// Each handler carries one or more rule violations OR is a passing example.

const state = {
  timerRunning: false,

  // R4 violation: written by recordResult() below, never read anywhere.
  lastResult: null,

  dropdownOpen: false,

  // R2 violation: written true by expandMenu(), no path writes false.
  menuExpanded: false,
};

// ---- R1 violation: startTimer with no stopTimer ----
function startTimer() {
  state.timerRunning = true;
  document.getElementById('timer-status').textContent = '(running)';
}

// ---- R1 violation: openDropdown with no closeDropdown ----
function openDropdown() {
  state.dropdownOpen = true;
  document.getElementById('dropdown').hidden = false;
}

// ---- R10 violation: showModal with no close path ----
function showModal() {
  document.getElementById('modal').hidden = false;
}

// ---- R2 violation: expandMenu sets true, no path sets false ----
function expandMenu() {
  state.menuExpanded = true;
}

// ---- PASS example: delete-with-confirm (R5 passes) ----
function deleteAccount() {
  const confirmed = confirm('Delete your account? This cannot be undone.');
  if (!confirmed) return;
  fetch('/api/account', { method: 'DELETE' });
}

// ---- R4 violation: write-only state key (called from a hypothetical timer hook) ----
function recordResult(text) {
  state.lastResult = text;
}

// ---- R12 manual-verify candidate: no re-entry guard, side-effecting fetch ----
async function syncServer() {
  await fetch('/api/sync', { method: 'POST', body: syncPayload() });
}

function syncPayload() {
  return JSON.stringify({ ts: Date.now() });
}

// Wire actions. In a real app these would be framework-bound; here we use DOM.
document.getElementById('btn-start-timer').addEventListener('click', startTimer);
document.getElementById('btn-open-dropdown').addEventListener('click', openDropdown);
document.getElementById('btn-show-modal').addEventListener('click', showModal);
document.getElementById('btn-expand-menu').addEventListener('click', expandMenu);
document.getElementById('btn-delete-account').addEventListener('click', deleteAccount);

// Expose for inspection / unit-style smoke test.
window.__audit_fixture__ = {
  state,
  handlers: { startTimer, openDropdown, showModal, expandMenu, deleteAccount, syncServer },
};
