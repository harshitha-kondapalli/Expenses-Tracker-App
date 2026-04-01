# Windows Server Setup

This guide turns your old Windows laptop into a small home server for the expense tracker project.

## What the old laptop should do

- run the backend API
- run the collector service
- keep the shared `data/` folder and future `expenses.xlsx`
- optionally host the web dashboard on your home network

## Recommended role split

- Main machine: coding and development
- Old Windows laptop: API, collector, imports, Excel processing

## Minimum requirements

- Windows 10 or Windows 11
- 8 GB RAM recommended
- stable Wi-Fi or ethernet
- at least 10 GB free disk space

## One-time setup

1. Copy or clone this repository to `C:\expense-tracker`
2. Open PowerShell as your normal user
3. Run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd C:\expense-tracker
.\infra\windows\bootstrap.ps1
```

This script:

- installs `git` and `node` with `winget` if missing
- runs `npm install`
- creates the `data`, `imports`, `raw`, and `logs` folders
- creates `.env.local.ps1` from the template

## Start services

API:

```powershell
cd C:\expense-tracker
.\infra\windows\start-api.ps1
```

Collector:

```powershell
cd C:\expense-tracker
.\infra\windows\start-collector.ps1
```

Web dashboard:

```powershell
cd C:\expense-tracker
.\infra\windows\start-web.ps1
```

## Use it from other devices

Find the Windows laptop IP address:

```powershell
ipconfig
```

Then you can later access services like:

- `http://<windows-ip>:4000` for API
- `http://<windows-ip>:5173` for web app

You may need to allow Node.js through Windows Firewall the first time.

## Suggested operating pattern

- keep the API running all the time
- use the collector when importing statements or processing payment feeds
- store uploaded CSV/Excel statements in `data\imports`
- keep `data\expenses.xlsx` on this machine as the source workbook

## Good future upgrades

- Task Scheduler jobs for periodic import/sync
- automatic backup of `data\expenses.xlsx`
- a shared folder for statement uploads
- `pm2` or NSSM to keep services running after login

## Current limitation

The API and collector in this repo are scaffolds right now. This Windows setup is ready for that next phase, but real Excel sync and real ingestion still need to be implemented.
