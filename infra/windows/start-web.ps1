param(
  [string]$ProjectRoot = "C:\expense-tracker"
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

Write-Host "Starting Expense Tracker web app..." -ForegroundColor Cyan
npm run dev:web
