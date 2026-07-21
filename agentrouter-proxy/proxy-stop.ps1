param(
  [int]$Port = 8318
)

try {
  $tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  $proc = Get-Process -Id $tcp.OwningProcess -ErrorAction Stop
  Stop-Process -Id $proc.Id -Force
  Write-Host "Stopped AgentRouter proxy running on port ${Port} (PID $($proc.Id))"
} catch {
  Write-Host "Proxy is not running on port ${Port}."
}
