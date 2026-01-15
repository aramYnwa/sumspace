from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from .db import Base


class Envelope(Base):
    __tablename__ = "envelopes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    monthly_budget = Column(Numeric(12, 2), nullable=True)
    color = Column(String(20), nullable=True)

    transactions = relationship("Transaction", back_populates="envelope")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    merchant = Column(String(200), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    notes = Column(String(500), nullable=True)
    envelope_id = Column(Integer, ForeignKey("envelopes.id"), nullable=True)

    envelope = relationship("Envelope", back_populates="transactions")
