# Expense Tracker App

This repository contains a starter monorepo for an expense tracker platform with:

- a `web` app built with React + Vite
- a `mobile` app built with Expo + React Native
- a shared TypeScript package for expense models, sample data, formatting, and summary helpers
- an `api` service scaffold for transactions, dashboard data, and Excel sync
- a `collector` service scaffold for SMS, email, and statement-import agents

## Features

- add expenses with title, amount, category, date, and optional note
- see total spending, current month spending, and number of entries
- review recent expenses and category totals
- persist data locally on web (`localStorage`) and mobile (`AsyncStorage`)

## Project structure

```text
apps/
  mobile/   Expo mobile app
  web/      React + Vite web app
packages/
  shared/   Shared expense types and helpers
services/
  api/      Backend API scaffold
  collector/ Transaction collection scaffold
data/
  imports/  Uploaded statements
  raw/      Raw source payloads
docs/
  architecture, Excel, and categorization docs
infra/
  windows/  Windows laptop setup scripts and server guide
```

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the web app:

```bash
npm run dev:web
```

3. Start the mobile app:

```bash
npm run dev:mobile
```

4. Start the API scaffold:

```bash
npm run dev:api
```

5. Run the collector scaffold:

```bash
npm run dev:collector
```

## Old Windows laptop setup

If you want to use an old Windows laptop as a dedicated backend/import machine, start with:

- [windows-server-setup.md](/Users/munna/myProjects/Expenses-Tracker-App/infra/windows/windows-server-setup.md)
- [bootstrap.ps1](/Users/munna/myProjects/Expenses-Tracker-App/infra/windows/bootstrap.ps1)
- [start-api.ps1](/Users/munna/myProjects/Expenses-Tracker-App/infra/windows/start-api.ps1)
- [start-collector.ps1](/Users/munna/myProjects/Expenses-Tracker-App/infra/windows/start-collector.ps1)

## Next ideas

- wire the web and mobile apps to the API instead of local-only storage
- add real Excel read/write with an `xlsx` library
- support statement upload, SMS ingestion, and email ingestion
- add charts for monthly and category trends
