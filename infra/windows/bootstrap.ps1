param(
  [string]$ProjectRoot = "C:\expense-tracker",
  [switch]$SkipGitClone
)

$ErrorActionPreference = "Stop"

Write-Host "Preparing Windows machine for Expense Tracker..." -ForegroundColor Cyan

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  throw "winget is required on the Windows laptop. Please install App Installer / winget first."
}

function Ensure-Command {
  param(
    [string]$CommandName,
    [string]$PackageId,
    [string]$DisplayName
  )

  if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
    Write-Host "$DisplayName already installed." -ForegroundColor Green
    return
  }

  Write-Host "Installing $DisplayName..." -ForegroundColor Yellow
  winget install --id $PackageId --exact --accept-source-agreements --accept-package-agreements
}

Ensure-Command -CommandName "git" -PackageId "Git.Git" -DisplayName "Git"
Ensure-Command -CommandName "node" -PackageId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS"

if (-not (Test-Path $ProjectRoot)) {
  Write-Host "Creating project directory at $ProjectRoot" -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $ProjectRoot | Out-Null
}

if (-not $SkipGitClone) {
  $isRepoInitialized = Test-Path (Join-Path $ProjectRoot ".git")
  if (-not $isRepoInitialized) {
    Write-Host "Project directory is ready. Clone your repository into $ProjectRoot before continuing." -ForegroundColor Yellow
  }
}

Set-Location $ProjectRoot

if (-not (Test-Path "package.json")) {
  Write-Host "No package.json found in $ProjectRoot yet." -ForegroundColor Yellow
  Write-Host "Clone or copy the repository to this machine, then rerun this script." -ForegroundColor Yellow
  exit 0
}

Write-Host "Installing workspace dependencies..." -ForegroundColor Yellow
npm install

$folders = @(
  "data",
  "data\imports",
  "data\raw",
  "logs"
)

foreach ($folder in $folders) {
  if (-not (Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder | Out-Null
  }
}

$envTemplatePath = Join-Path $PSScriptRoot "env.example.ps1"
$envPath = Join-Path $ProjectRoot ".env.local.ps1"

if (-not (Test-Path $envPath) -and (Test-Path $envTemplatePath)) {
  Copy-Item $envTemplatePath $envPath
  Write-Host "Created environment file at $envPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Bootstrap complete." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review .env.local.ps1"
Write-Host "2. Start the API with infra\windows\start-api.ps1"
Write-Host "3. Start the collector with infra\windows\start-collector.ps1"
