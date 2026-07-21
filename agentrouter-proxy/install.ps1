$taskName = "AgentRouterProxy"
$scriptDir = Split-Path -Parent $PSCommandPath
$nodePath = (Get-Command node).Source
$serverPath = Join-Path $scriptDir "server.js"
$logDir = Join-Path $scriptDir "logs"

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Build the action
$action = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$serverPath`"" -WorkingDirectory $scriptDir

# Trigger at logon
$trigger = New-ScheduledTaskTrigger -AtLogOn

# Settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 2) -StartWhenAvailable

# Run as current user
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Limited

# Register
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "AgentRouterProxy task registered successfully."
