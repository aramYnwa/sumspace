# Sumspace (MVP)

Manual entry MVP for envelope budgeting with monthly summaries.

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`.

## Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`.

## Notes
- SQLite database is stored at `backend/data/app.db`.
- Use the UI to create envelopes and add transactions.
- When ready to add PDF imports, we can add an ingestion pipeline and a review queue on top of the same data model.
