# Sumspace Envelope Budgeting MVP PRD

## Title
Sumspace: Manual Envelope Budgeting MVP

## Problem statement
The bank app only shows a flat list of transactions with no tagging or aggregation, so it is hard to understand spending by category (shopping, subscriptions, etc.). A focused envelope budgeting app should make it easy to categorize spend and view totals over time.

## Goals
- Provide a clean, interactive UI to filter, group, and aggregate spend by envelope and time range.
- Allow users to create envelope categories and add transactions manually.
- Persist envelopes and transactions in a database.
- Keep MVP focused on manual entry while enabling a future PDF import workflow.

## Non-goals
- PDF ingestion or transaction parsing (post-MVP).
- Bank sync or external integrations.
- Multi-user collaboration or shared accounts.
- Advanced budgeting features (rules, forecasts, alerts).

## Proposed solution
- UI for creating, editing, and deleting envelope categories.
- UI for entering transactions with date, amount, description, and envelope assignment.
- API endpoints to store and retrieve envelopes and transactions.
- Analytics views: totals by envelope and summaries over a selected time range.
- Single-user, local-first data storage for MVP.

## User stories / Use cases
- As a user, I can create envelope categories to organize my spending.
- As a user, I can add transactions and assign them to an envelope.
- As a user, I can view transactions filtered by date range or envelope.
- As a user, I can see aggregated totals per envelope and per month.

## Success metrics
- User can select a month or time range and see totals by envelope.
- User can filter and aggregate transactions without manual spreadsheets.
- User can add transactions manually and see them reflected in dashboards.

## Risks & mitigations
- Risk: Manual entry is too slow or error-prone.
  - Mitigation: Keep forms minimal and provide sensible defaults.
- Risk: Aggregation queries become inconsistent across UI views.
  - Mitigation: Define a single source-of-truth API for summaries.
- Risk: Data model becomes brittle before PDF import is added.
  - Mitigation: Keep transaction schema flexible with optional metadata fields.

## Tech stack
- Backend: FastAPI (Python)
- Frontend: Vite + React
- Database: SQLite (local file at `backend/data/app.db`)
