param(
  [int]$Port = 1340
)

$proxyDir = Split-Path -Parent $PSCommandPath

Write-Host "=== Proxy Restart ===" -ForegroundColor Magenta

# Step 1: Stop
Write-Host "Step 1/2: Stopping proxy..." -ForegroundColor Cyan
& (Join-Path $proxyDir "proxy-stop.ps1") -Port $Port
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
  Write-Host "  (stop had exit code $LASTEXITCODE, continuing anyway)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Step 2: Start
Write-Host "Step 2/2: Starting proxy..." -ForegroundColor Cyan
& (Join-Path $proxyDir "proxy-start.ps1") -Port $Port
