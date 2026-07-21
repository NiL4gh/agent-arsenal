param(
  [int]$Port = 8318
)

$proxyDir = Split-Path -Parent $PSCommandPath
$serverJs = Join-Path $proxyDir "server.js"

# Check if already running
try {
  $tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  $proc = Get-Process -Id $tcp.OwningProcess -ErrorAction Stop
  Write-Host "Proxy already running on port ${Port} (PID $($proc.Id), started $($proc.StartTime))" -ForegroundColor Yellow
  exit 0
} catch {
  # Not running = good
}

Write-Host "-> Starting AgentRouter proxy on port ${Port}..." -ForegroundColor Cyan

try {
  $logDirLocation = Join-Path $proxyDir "logs"
  if (-not (Test-Path $logDirLocation)) {
    New-Item -ItemType Directory -Path $logDirLocation -Force | Out-Null
  }

  $nodePath = (Get-Command node).Source
  $proc = Start-Process $nodePath -ArgumentList """$serverJs""" -WorkingDirectory $proxyDir -WindowStyle Hidden -PassThru
  
  # Wait briefly
  Start-Sleep -Milliseconds 1500
  
  if ($proc.HasExited) {
    Write-Host "[x] Proxy exited immediately." -ForegroundColor Red
    exit 1
  }

  Write-Host "[ok] Proxy started (PID $($proc.Id))" -ForegroundColor Green
} catch {
  Write-Host "[x] Failed to start proxy: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
