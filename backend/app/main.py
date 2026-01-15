from datetime import date
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .db import SessionLocal, init_db

app = FastAPI(title="Sumspace")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/envelopes", response_model=List[schemas.EnvelopeOut])
def list_envelopes(db: Session = Depends(get_db)) -> List[models.Envelope]:
    return db.query(models.Envelope).order_by(models.Envelope.name).all()


@app.post("/api/envelopes", response_model=schemas.EnvelopeOut)
def create_envelope(
    payload: schemas.EnvelopeCreate, db: Session = Depends(get_db)
) -> models.Envelope:
    existing = db.query(models.Envelope).filter_by(name=payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Envelope already exists")
    envelope = models.Envelope(**payload.dict())
    db.add(envelope)
    db.commit()
    db.refresh(envelope)
    return envelope


@app.get("/api/transactions", response_model=List[schemas.TransactionOut])
def list_transactions(
    month: Optional[str] = None,
    envelope_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[models.Transaction]:
    query = db.query(models.Transaction)
    if month:
        start = date.fromisoformat(f"{month}-01")
        end_month = start.month % 12 + 1
        end_year = start.year + (1 if start.month == 12 else 0)
        end = date(end_year, end_month, 1)
        query = query.filter(models.Transaction.date >= start)
        query = query.filter(models.Transaction.date < end)
    if envelope_id:
        query = query.filter(models.Transaction.envelope_id == envelope_id)
    return query.order_by(models.Transaction.date.desc()).all()


@app.post("/api/transactions", response_model=schemas.TransactionOut)
def create_transaction(
    payload: schemas.TransactionCreate, db: Session = Depends(get_db)
) -> models.Transaction:
    transaction = models.Transaction(**payload.dict())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@app.get("/api/summary", response_model=List[schemas.SummaryItem])
def get_summary(
    month: str, db: Session = Depends(get_db)
) -> List[schemas.SummaryItem]:
    start = date.fromisoformat(f"{month}-01")
    end_month = start.month % 12 + 1
    end_year = start.year + (1 if start.month == 12 else 0)
    end = date(end_year, end_month, 1)

    results = (
        db.query(
            models.Transaction.envelope_id,
            models.Envelope.name,
            func.coalesce(func.sum(models.Transaction.amount), 0).label("total"),
        )
        .outerjoin(models.Envelope, models.Transaction.envelope_id == models.Envelope.id)
        .filter(models.Transaction.date >= start)
        .filter(models.Transaction.date < end)
        .group_by(models.Transaction.envelope_id, models.Envelope.name)
        .order_by(models.Envelope.name)
        .all()
    )

    return [
        schemas.SummaryItem(
            envelope_id=row[0],
            envelope_name=row[1] or "Uncategorized",
            total=row[2],
        )
        for row in results
    ]
