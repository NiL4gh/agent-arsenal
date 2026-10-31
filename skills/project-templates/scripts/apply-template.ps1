param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("web-app", "python-ds", "react-native", "enterprise-backend", "devops-infra", "oss-library")]
    [string]$Template,

    [string]$Target = ".",

    [ValidateSet("GEMINI.md", "CLAUDE.md", "AGENTS.md")]
    [string]$FileName = "GEMINI.md",

    [switch]$InitAgents
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check templates or resources folder
$templateFile = Join-Path $scriptDir "..\templates\$Template.md"
if (-not (Test-Path $templateFile)) {
    $templateFile = Join-Path $scriptDir "..\resources\$Template.md"
}

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

if ($InitAgents) {
    $agentsDir = Join-Path $Target ".agents"
    $rulesDir = Join-Path $agentsDir "rules"
    $skillsDir = Join-Path $agentsDir "skills"

    New-Item -ItemType Directory -Path $rulesDir -Force | Out-Null
    New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null

    Write-Host "Success: Initialized .agents/ scaffold in $Target" -ForegroundColor Green
}
