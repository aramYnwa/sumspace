from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class EnvelopeBase(BaseModel):
    name: str
    monthly_budget: Optional[Decimal] = None
    color: Optional[str] = None


class EnvelopeCreate(EnvelopeBase):
    pass


class EnvelopeOut(EnvelopeBase):
    id: int

    class Config:
        orm_mode = True


class TransactionBase(BaseModel):
    date: date
    merchant: str
    amount: Decimal
    notes: Optional[str] = None
    envelope_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int

    class Config:
        orm_mode = True


class SummaryItem(BaseModel):
    envelope_id: Optional[int] = None
    envelope_name: Optional[str] = None
    total: Decimal
