param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("web-app", "python-ds", "react-native", "enterprise-backend", "devops-infra", "oss-library")]
    [string]$Template,

    [string]$Target = ".",

    [ValidateSet("CLAUDE.md", "GEMINI.md")]
    [string]$FileName = "CLAUDE.md"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templateFile = Join-Path $scriptDir "..\templates\$Template.md"

if (-not (Test-Path $templateFile)) {
    Write-Error "Template file not found at $templateFile"
    exit 1
}

# Resolve target path
$targetPath = [System.IO.Path]::GetFullPath((Join-Path $Target $FileName))
$targetDir = Split-Path -Parent $targetPath

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Copy-Item -Path $templateFile -Destination $targetPath -Force
Write-Host "Success: Copied '$Template' template to $targetPath" -ForegroundColor Green
