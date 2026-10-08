<#
.SYNOPSIS
    Restores opencode configuration from this repo to ~/.config/opencode/

.DESCRIPTION
    Copies all skills, plugins, tools, commands, and config files to the opencode config directory.
    Creates a backup of any existing files before overwriting.

    After running this script, edit opencode.jsonc to fill in your API keys.
#>

$ErrorActionPreference = "Stop"
$configDir = "$env:USERPROFILE\.config\opencode"
$scriptDir = Split-Path -Parent $PSCommandPath
$backupDir = "$configDir\.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# --- Ensure config directory exists ---
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "[OK] Created $configDir" -ForegroundColor Green
}

# --- Backup existing config ---
Write-Host "`nBacking up existing config to $backupDir" -ForegroundColor Yellow
$backupItems = @("AGENTS.md", "opencode.jsonc", "tui.json", "skills", "plugins", "tools", "commands")
foreach ($item in $backupItems) {
    $src = Join-Path $configDir $item
    if (Test-Path $src) {
        $dest = Join-Path $backupDir $item
        Copy-Item $src $dest -Recurse -Force
    }
}
Write-Host "[OK] Backup complete" -ForegroundColor Green

# --- Copy skills ---
Write-Host "`nInstalling skills..." -ForegroundColor Cyan
$skillsSrc = Join-Path $scriptDir "skills"
if (Test-Path $skillsSrc) {
    $skillsDst = Join-Path $configDir "skills"
    Copy-Item $skillsSrc $skillsDst -Recurse -Force
    $count = (Get-ChildItem $skillsSrc -Directory).Count
    Write-Host "[OK] $count skills installed" -ForegroundColor Green
}

# --- Copy plugins ---
Write-Host "`nInstalling plugins..." -ForegroundColor Cyan
$pluginsSrc = Join-Path $scriptDir "plugins"
if (Test-Path $pluginsSrc) {
    $pluginsDst = Join-Path $configDir "plugins"
    Copy-Item $pluginsSrc $pluginsDst -Recurse -Force
    $count = (Get-ChildItem $pluginsSrc -File).Count
    Write-Host "[OK] $count plugins installed" -ForegroundColor Green
}

# --- Copy tools ---
Write-Host "`nInstalling tools..." -ForegroundColor Cyan
$toolsSrc = Join-Path $scriptDir "tools"
if (Test-Path $toolsSrc) {
    $toolsDst = Join-Path $configDir "tools"
    Copy-Item $toolsSrc $toolsDst -Recurse -Force
    $count = (Get-ChildItem $toolsSrc -File).Count
    Write-Host "[OK] $count tools installed" -ForegroundColor Green
}

# --- Copy commands ---
Write-Host "`nInstalling commands..." -ForegroundColor Cyan
$commandsSrc = Join-Path $scriptDir "commands"
if (Test-Path $commandsSrc) {
    $commandsDst = Join-Path $configDir "commands"
    Copy-Item $commandsSrc $commandsDst -Recurse -Force
    $count = (Get-ChildItem $commandsSrc -File).Count
    Write-Host "[OK] $count commands installed" -ForegroundColor Green
}

# --- Copy AGENTS.md ---
Write-Host "`nInstalling AGENTS.md..." -ForegroundColor Cyan
$agentsSrc = Join-Path $scriptDir "AGENTS.md"
if (Test-Path $agentsSrc) {
    Copy-Item $agentsSrc "$configDir\AGENTS.md" -Force
    Write-Host "[OK] AGENTS.md installed" -ForegroundColor Green
}

# --- Copy tui.json ---
Write-Host "`nInstalling tui.json..." -ForegroundColor Cyan
$tuiSrc = Join-Path $scriptDir "tui.json"
if (Test-Path $tuiSrc) {
    Copy-Item $tuiSrc "$configDir\tui.json" -Force
    Write-Host "[OK] tui.json installed" -ForegroundColor Green
}

# --- Copy opencode.jsonc ---
Write-Host "`nInstalling opencode.jsonc..." -ForegroundColor Cyan
$configSrc = Join-Path $scriptDir "opencode.jsonc"
$configDst = Join-Path $configDir "opencode.jsonc"
if (Test-Path $configSrc) {
    if (Test-Path $configDst) {
        $existing = Get-Content $configDst -Raw
        if ($existing -match "nvapi-|gho_|figd_|fc-|sk-") {
            Write-Host "[WARN] Existing config has real API keys! Not overwriting." -ForegroundColor Yellow
            Write-Host "  Manual merge needed: compare with $configSrc" -ForegroundColor Yellow
        } else {
            Copy-Item $configSrc $configDst -Force
            Write-Host "[OK] opencode.jsonc installed" -ForegroundColor Green
        }
    } else {
        Copy-Item $configSrc $configDst -Force
        Write-Host "[OK] opencode.jsonc installed" -ForegroundColor Green
    }
}

# --- Install NVIDIA proxy ---
Write-Host "`nSetting up NVIDIA proxy..." -ForegroundColor Cyan
$proxySrc = Join-Path $scriptDir "nvidia-proxy"
if (Test-Path $proxySrc) {
    $proxyDst = Join-Path $configDir "nvidia-proxy"
    Copy-Item $proxySrc $proxyDst -Recurse -Force
    Push-Location $proxyDst
    if (-not (Test-Path "node_modules")) {
        npm install 2>$null
    }
    Pop-Location
    Write-Host "[OK] NVIDIA proxy installed" -ForegroundColor Green
}

# --- Final instructions ---
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit $configDir\opencode.jsonc" -ForegroundColor White
Write-Host "     Replace all <YOUR_*> placeholders with your actual API keys" -ForegroundColor White
Write-Host ""
Write-Host "  2. Start the NVIDIA proxy (optional):" -ForegroundColor White
Write-Host "     cd $configDir\nvidia-proxy" -ForegroundColor Gray
Write-Host "     .\start-proxy.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Launch opencode" -ForegroundColor White
Write-Host "     opencode" -ForegroundColor Gray
Write-Host ""
Write-Host "Backup location: $backupDir" -ForegroundColor DarkGray
