# Sumspace Project Plan

## Status
- MVP scope is manual entry only (no PDF import yet).
- Backend + frontend scaffolding created in `/Users/aram/src/sumspace`.
- Directory renamed from `finance` to `sumspace`.
- Branding updated to "Sumspace".

## MVP Features
- Manual transaction entry (date, merchant, amount, envelope).
- Envelope creation with monthly budget.
- Monthly summary (totals by envelope).
- Transaction list for the selected month.
- Filters: month (UI), optional envelope filter in API.

## Deferred Features
- PDF upload and parsing (AMEX statements).
- Auto-categorization + review queue.
- Advanced filtering and analytics (merchant, trends, multi-month views).

## Tech Stack
- Backend: FastAPI + SQLAlchemy + SQLite.
- Frontend: React + Vite + Recharts.
- Local-first, deployable later with Postgres.

## Architecture
- Data model:
  - `Envelope`: id, name, monthly_budget, color (optional).
  - `Transaction`: id, date, merchant, amount, notes, envelope_id.
- API endpoints:
  - `GET /api/envelopes`, `POST /api/envelopes`
  - `GET /api/transactions?month=YYYY-MM`, `POST /api/transactions`
  - `GET /api/summary?month=YYYY-MM`
- Frontend uses Vite dev server proxy to `/api`.

## Files Created
- Backend:
  - `backend/app/main.py`
  - `backend/app/models.py`
  - `backend/app/schemas.py`
  - `backend/app/db.py`
  - `backend/requirements.txt`
  - `backend/app/__init__.py`
- Frontend:
  - `frontend/src/App.jsx`
  - `frontend/src/main.jsx`
  - `frontend/src/index.css`
  - `frontend/index.html`
  - `frontend/vite.config.js`
  - `frontend/package.json`
- Docs:
  - `README.md`

## TODO (Immediate)
- (Done) Rename branding "Finance Tracker" -> "Sumspace".
- (Optional) Add seed script for envelopes/transactions.
- (Optional) Add edit/delete for transactions and envelopes.

## Run (Local)
Backend:
- `cd backend`
- `python -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`
- `uvicorn app.main:app --reload`

Frontend:
- `cd frontend`
- `npm install`
- `npm run dev`

## Notes
- SQLite DB stored at `backend/data/app.db`.
- PDF ingestion will reuse the same data model later.
