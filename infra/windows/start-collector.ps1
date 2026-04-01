param(
  [string]$ProjectRoot = "C:\expense-tracker"
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

$envFile = Join-Path $ProjectRoot ".env.local.ps1"
if (Test-Path $envFile) {
  . $envFile
}

Write-Host "Starting Expense Tracker collector..." -ForegroundColor Cyan
npm run dev:collector
