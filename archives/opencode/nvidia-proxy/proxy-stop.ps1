param(
  [switch]$Force,
  [int]$Port = 1340
)

$proxyDir = Split-Path -Parent $PSCommandPath

if (-not $Force) {
  Write-Host "-> Attempting graceful shutdown on port ${Port}..." -ForegroundColor Cyan
  try {
    $body = Invoke-RestMethod -Uri "http://127.0.0.1:${Port}/control/shutdown" -Method POST -TimeoutSec 5
    Write-Host "[ok] Proxy responded: $($body.message)" -ForegroundColor Green
    Write-Host "  (waiting for in-flight requests to complete before exit)" -ForegroundColor DarkYellow
    # The proxy exits itself after this, usually within a few seconds
    Start-Sleep -Seconds 2
    return
  } catch {
    Write-Host "  graceful shutdown failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "-> falling back to taskkill..." -ForegroundColor Cyan
  }
}

# Find any node process listening on :Port
try {
  $tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  $proc = Get-Process -Id $tcp.OwningProcess -ErrorAction Stop
  Write-Host "-> Killing PID $($proc.Id) (node, started $($proc.StartTime))" -ForegroundColor Cyan
  $proc | Stop-Process -Force
  Write-Host "[ok] Proxy stopped" -ForegroundColor Green
} catch {
  Write-Host "No proxy found on port ${Port}." -ForegroundColor Yellow
}
