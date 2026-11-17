$ErrorActionPreference = 'SilentlyContinue'

$allowResponse = '{"decision": "allow"}'

try {
    $rawInput = [Console]::In.ReadToEnd()
    if (-not $rawInput) {
        Write-Output $allowResponse
        exit 0
    }

    $json = $rawInput | ConvertFrom-Json
    
    # Don't loop if continuation is already active or if stopped by user/error
    if ($json.continuationActive -eq $true -or $json.terminationReason -ne 'NO_TOOL_CALL') {
        Write-Output $allowResponse
        exit 0
    }

    $cwd = $json.cwd
    if (-not $cwd -or -not (Test-Path $cwd)) {
        Write-Output $allowResponse
        exit 0
    }

    $verifyScript = Join-Path $cwd "verify.ps1"
    if (Test-Path $verifyScript) {
        $proc = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$verifyScript`"" -WorkingDirectory $cwd -NoNewWindow -PassThru -Wait -RedirectStandardError "$cwd\.verify_err.tmp" -RedirectStandardOutput "$cwd\.verify_out.tmp"
        
        $exitCode = $proc.ExitCode
        $stdout = if (Test-Path "$cwd\.verify_out.tmp") { Get-Content "$cwd\.verify_out.tmp" -Raw } else { "" }
        $stderr = if (Test-Path "$cwd\.verify_err.tmp") { Get-Content "$cwd\.verify_err.tmp" -Raw } else { "" }
        
        Remove-Item "$cwd\.verify_out.tmp", "$cwd\.verify_err.tmp" -ErrorAction SilentlyContinue

        if ($exitCode -ne 0) {
            $combined = ($stdout + "`n" + $stderr).Trim()
            if ($combined.Length -gt 1200) { $combined = $combined.Substring(0, 1200) + "... [truncated]" }
            $escapedReason = ($combined -replace '\\', '\\\\' -replace '"', '\"' -replace "`r`n", '\n' -replace "`n", '\n')
            Write-Output "{`"decision`": `"continue`", `"reason`": `"Automated Stop Hook: verify.ps1 failed (exit code $exitCode). Fix the following issues before completing:\n$escapedReason`"}"
            exit 0
        }
    }
} catch {
    # Fail-safe allow to avoid blocking user interaction
}

Write-Output $allowResponse
