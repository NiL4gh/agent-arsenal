<#
.SYNOPSIS
    Runs autonomous, headless Antigravity tasks without an interactive UI.
.DESCRIPTION
    Executes a task prompt using agy -p with auto-approval and timestamped logging.
    Designed for overnight jobs, batch contest submissions, and automated pipelines.
.EXAMPLE
    .\headless-runner.ps1 -Prompt "Process all pending clips in highlights.json and save results."
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Prompt,

    [Parameter(Mandatory=$false)]
    [string]$WorkingDirectory = $PWD.Path,

    [Parameter(Mandatory=$false)]
    [string]$LogDir = ".\logs\headless_runs",

    [Parameter(Mandatory=$false)]
    [int]$MaxRetries = 1
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $LogDir "run_$timestamp.log"
$statusFile = Join-Path $LogDir "run_$timestamp.status"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Antigravity Headless Runner Starting" -ForegroundColor Cyan
Write-Host " Working Dir: $WorkingDirectory" -ForegroundColor Gray
Write-Host " Log File:    $logFile" -ForegroundColor Gray
Write-Host " Prompt:      $Prompt" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

$attempt = 0
$success = $false

while ($attempt -le $MaxRetries -and -not $success) {
    $attempt++
    $startTime = Get-Date
    "[$startTime] Attempt $attempt starting. Prompt: $Prompt" | Out-File -FilePath $logFile -Append -Encoding utf8

    try {
        Push-Location $WorkingDirectory
        
        # Execute agy in non-interactive print mode with auto-approvals
        $output = agy.exe -p "$Prompt" --dangerously-skip-permissions 2>&1
        $exitCode = $LASTEXITCODE

        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds

        $output | Out-File -FilePath $logFile -Append -Encoding utf8
        "[$endTime] Execution completed in $([math]::Round($duration, 2))s with exit code: $exitCode" | Out-File -FilePath $logFile -Append -Encoding utf8

        if ($exitCode -eq 0) {
            $success = $true
            "SUCCESS" | Out-File -FilePath $statusFile -Encoding utf8
            Write-Host "`nTask completed successfully ($([math]::Round($duration, 2))s)." -ForegroundColor Green
        } else {
            Write-Host "`nAttempt $attempt failed with exit code $exitCode." -ForegroundColor Red
            if ($attempt -le $MaxRetries) {
                Write-Host "Retrying in 10 seconds..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            }
        }
    } catch {
        "[$([DateTime]::Now)] Exception: $_" | Out-File -FilePath $logFile -Append -Encoding utf8
        Write-Host "Exception occurred: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

if (-not $success) {
    "FAILED" | Out-File -FilePath $statusFile -Encoding utf8
    Write-Host "`nTask failed after $attempt attempts. Review logs: $logFile" -ForegroundColor Red
    exit 1
}

exit 0
