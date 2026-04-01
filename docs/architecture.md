# Architecture

This repository is organized into four layers:

- `apps/web`: renders dashboards, tables, and charts for expense data.
- `apps/mobile`: renders the mobile experience and can later host SMS-based collection.
- `services/api`: serves transactions, dashboard summaries, import endpoints, and Excel sync endpoints.
- `services/collector`: contains agents, parsers, and normalizers for SMS, email, and statement imports.

## Data flow

1. A collector agent receives raw payment data from SMS, email, or statement files.
2. A parser extracts merchant, amount, date, and reference details.
3. A normalizer standardizes the payload into the shared `Transaction` schema.
4. The API categorizes, deduplicates, stores, and syncs transactions into Excel.
5. Web and mobile apps fetch normalized data and render summaries and trends.

## Current status

- Shared TypeScript schema is defined.
- API and collector services are scaffolded.
- Excel sync is represented as a placeholder service and endpoint.
- Existing web and mobile starter apps still run against local state until API wiring is added.
