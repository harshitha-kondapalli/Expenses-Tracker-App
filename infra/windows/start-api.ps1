param(
  [string]$ProjectRoot = "C:\expense-tracker"
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

$envFile = Join-Path $ProjectRoot ".env.local.ps1"
if (Test-Path $envFile) {
  . $envFile
}

$port = $env:PORT
if ([string]::IsNullOrWhiteSpace($port)) {
  $port = "4000"
}

Write-Host "Starting Expense Tracker API on port $port..." -ForegroundColor Cyan
npm run dev:api
