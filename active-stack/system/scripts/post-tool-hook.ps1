$ErrorActionPreference = 'SilentlyContinue'

try {
    $rawInput = [Console]::In.ReadToEnd()
    if ($rawInput) {
        $json = $rawInput | ConvertFrom-Json
        $filePath = $json.toolCall.args.Path

        if ($filePath -and (Test-Path -Path $filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            if ($ext -eq '.py') {
                $compileOutput = python -m py_compile "$filePath" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    $logDir = Join-Path $env:USERPROFILE ".gemini\antigravity-cli\log"
                    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
                    "[$([DateTime]::Now.ToString('s'))] Syntax error in $filePath : $compileOutput" | Out-File -FilePath "$logDir\syntax_errors.log" -Append -Encoding utf8
                }
            }
        }
    }
} catch {
    # Non-blocking catch
}

# PostToolUse contract expects an empty JSON object
Write-Output '{}'
