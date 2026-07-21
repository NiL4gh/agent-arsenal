param(
  [int]$Port = 1340,
  [switch]$Watch
)

function Show-Status {
  try {
    $h = Invoke-RestMethod -Uri "http://127.0.0.1:${Port}/health" -TimeoutSec 3
    $uptime = if ($h.uptime_sec -lt 60) { "$($h.uptime_sec)s" }
              elseif ($h.uptime_sec -lt 3600) { "$([math]::Floor($h.uptime_sec / 60))m $($h.uptime_sec % 60)s" }
              else { "$([math]::Floor($h.uptime_sec / 3600))h $([math]::Floor(($h.uptime_sec % 3600) / 60))m" }

    Write-Host "+--------------------------------------+" -ForegroundColor Cyan
    Write-Host "|        NVIDIA Proxy - Status         |" -ForegroundColor Cyan
    Write-Host "+--------------------------------------+" -ForegroundColor Cyan
    Write-Host "| PID:          $($h.pid)" -ForegroundColor White
    Write-Host "| Uptime:       $uptime" -ForegroundColor White
    Write-Host "| Status:       $(if ($h.ok) { 'Running' } else { 'OFFLINE' })" -ForegroundColor $(if ($h.ok) { 'Green' } else { 'Red' })
    Write-Host "| Draining:     $($h.draining)" -ForegroundColor $(if ($h.draining) { 'Yellow' } else { 'DarkGray' })
    Write-Host "+--------------------------------------+" -ForegroundColor Cyan
    Write-Host "| Live RPM:     $($h.live_rpm) / $($h.max_rpm)" -ForegroundColor White
    Write-Host "| Max Concurrent: $($h.max_concurrent)" -ForegroundColor White
    Write-Host "| Running:      $($h.running)" -ForegroundColor $(if ($h.running -gt 0) { 'Yellow' } else { 'DarkGray' })
    Write-Host "| Queued:       $($h.queued)" -ForegroundColor $(if ($h.queued -gt 0) { 'Yellow' } else { 'DarkGray' })
    Write-Host "+--------------------------------------+" -ForegroundColor Cyan
    Write-Host "| Total Reqs:   $($h.total_requests)" -ForegroundColor White
    Write-Host "| Failed Reqs:  $($h.failed_requests)" -ForegroundColor $(if ($h.failed_requests -gt 0) { 'Red' } else { 'DarkGray' })
    Write-Host "+--------------------------------------+" -ForegroundColor Cyan
    Write-Host "  Dashboard: http://127.0.0.1:${Port}/status" -ForegroundColor DarkYellow
  } catch {
    Write-Host "[x] Proxy is not responding on port ${Port}:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
  }
}

Show-Status

if ($Watch) {
  Write-Host "Watching (Ctrl+C to stop)..." -ForegroundColor DarkGray
  while ($true) {
    Start-Sleep -Seconds 5
    Write-Host "--- $(Get-Date -Format 'HH:mm:ss') ---" -ForegroundColor DarkGray
    Show-Status
  }
}
