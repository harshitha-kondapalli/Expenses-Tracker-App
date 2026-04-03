# Expense Tracker App

This repository contains a frontend-focused monorepo for an expense tracker with:

- a `web` app built with React + Vite
- a `mobile` app built with Expo + React Native
- a shared TypeScript package for expense models, sample data, formatting, and summary helpers

## Features

- explore a richer web dashboard with filters, trends, categories, and payment-method views
- add expenses manually with merchant, amount, category, date, and payment method
- review mock transaction data shaped to match a future backend contract
- persist frontend state locally on web (`localStorage`) and mobile (`AsyncStorage`)

## Project structure

```text
apps/
  mobile/   Expo mobile app
  web/      React + Vite web app
packages/
  shared/   Shared expense types and helpers
data/
  imports/  Reserved for future imported files
  raw/      Reserved for future raw payloads
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

3. Start your backend from its separate repository.

```bash
Update apps/web/.env so VITE_API_BASE_URL points to that backend.
```

4. Start the mobile app:

```bash
npm run dev:mobile
```

The web app reads the backend URL from [apps/web/.env](/Users/munna/myProjects/Expenses-Tracker-App/apps/web/.env). Point it at your separate backend repo, for example `http://127.0.0.1:8000`.

- parse smart input through `POST /parse-expense`
- fetch saved transactions through `GET /expenses`
- persist new expenses through `POST /expenses`

If you need a different backend URL, change:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Next ideas

- add edit/delete actions to the web dashboard
- build import preview and review screens
- improve charts for monthly and category trends
- connect this frontend to a separate backend repository later
