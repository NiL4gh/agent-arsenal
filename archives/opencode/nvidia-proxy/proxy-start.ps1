param(
  [int]$Port = 1340,
  [string]$LogDir = ""
)

$proxyDir = Split-Path -Parent $PSCommandPath
$serverJs = Join-Path $proxyDir "server.js"

# Check if already running
try {
  $tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  $proc = Get-Process -Id $tcp.OwningProcess -ErrorAction Stop
  Write-Host "Proxy already running on port ${Port} (PID $($proc.Id), started $($proc.StartTime))" -ForegroundColor Yellow
  Write-Host "  -> Use proxy-restart.ps1 to restart, proxy-stop.ps1 to stop" -ForegroundColor DarkYellow
  exit 0
} catch {
  # Not running = good, we'll start it
}

$env:PROXY_PORT = $Port
if ($LogDir) { $env:LOG_DIR = $LogDir }

Write-Host "-> Starting proxy on port ${Port}..." -ForegroundColor Cyan

try {
  $logDirLocation = Join-Path $proxyDir "logs"
  if (-not (Test-Path $logDirLocation)) {
    New-Item -ItemType Directory -Path $logDirLocation -Force | Out-Null
  }

  $proc = Start-Process node -ArgumentList """$serverJs""" -WorkingDirectory $proxyDir -WindowStyle Hidden -PassThru
  
  # Wait briefly and check if it stayed up
  Start-Sleep -Milliseconds 1500
  
  if ($proc.HasExited) {
    Write-Host "[x] Proxy exited immediately. Check logs in $proxyDir\logs\proxy.log" -ForegroundColor Red
    exit 1
  }

  Write-Host "[ok] Proxy started (PID $($proc.Id))" -ForegroundColor Green
  Write-Host "  Dashboard: http://127.0.0.1:${Port}/status" -ForegroundColor DarkYellow
  Write-Host "  Health:    http://127.0.0.1:${Port}/health" -ForegroundColor DarkYellow
} catch {
  Write-Host "[x] Failed to start proxy: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
