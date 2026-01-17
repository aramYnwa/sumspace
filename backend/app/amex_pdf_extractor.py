#!/usr/bin/env python3
import re
from typing import BinaryIO, Optional, Tuple
from pathlib import Path

import pdfplumber


def _extract_text_from_pdf(pdf: pdfplumber.PDF) -> str:
    parts = []
    for idx, page in enumerate(pdf.pages, start=1):
        text = page.extract_text() or ""
        parts.append(f"\n--- Page {idx} ---\n{text}")
    return "\n".join(parts).strip()


def extract_text(pdf_path: Path) -> str:
    with pdfplumber.open(pdf_path) as pdf:
        return _extract_text_from_pdf(pdf)


def extract_text_from_file(file_obj: BinaryIO) -> str:
    with pdfplumber.open(file_obj) as pdf:
        return _extract_text_from_pdf(pdf)


SECTION_HEADERS = {
    "Payments Details": "payments",
    "Credits Details": "credits",
    "New Charges Details": "debits",
}

SECTION_TERMINATORS = {
    "Fees",
    "Interest Charged",
    "About Trailing Interest",
    "Interest Charge Calculation",
    "Information on Pay Over Time and Purchasing Options",
    "New Charges Summary",
}

DATE_RE = re.compile(r"^\d{2}/\d{2}/\d{2}\*?\b")
AMOUNT_RE = re.compile(r"-?\$[\d,]+\.\d{2}")
CARD_ENDING_RE = re.compile(r"Card Ending\s+([0-9-]+)")


def _extract_amount(text: str) -> Tuple[Optional[float], Optional[str]]:
    matches = AMOUNT_RE.findall(text)
    if not matches:
        return None, None
    token = matches[-1]
    amount = float(token.replace("$", "").replace(",", ""))
    return amount, token


def _clean_description(text: str) -> str:
    return " ".join(text.split())


def parse_transactions(text: str) -> dict[str, list[dict[str, object]]]:
    results: dict[str, list[dict[str, object]]] = {
        "payments": [],
        "credits": [],
        "debits": [],
    }
    current_section: Optional[str] = None
    current_card_ending: Optional[str] = None
    current_lines: list[str] = []
    current_date: Optional[str] = None

    def flush_entry() -> None:
        nonlocal current_lines, current_date
        if not current_lines or not current_section or not current_date:
            current_lines = []
            current_date = None
            return
        entry_text = " ".join(line.strip() for line in current_lines if line.strip())
        amount, token = _extract_amount(entry_text)
        if amount is None:
            current_lines = []
            current_date = None
            return
        remainder = entry_text
        if remainder.startswith(current_date):
            remainder = remainder[len(current_date) :].strip()
        remainder = remainder.lstrip("*").strip()
        if token and token in remainder:
            remainder = remainder.rsplit(token, 1)[0].strip()
        entry = {
            "date": current_date,
            "description": _clean_description(remainder),
            "amount": amount,
        }
        if current_card_ending:
            entry["card_ending"] = current_card_ending
        results[current_section].append(entry)
        current_lines = []
        current_date = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("--- Page"):
            continue

        card_match = CARD_ENDING_RE.search(line)
        if card_match:
            current_card_ending = card_match.group(1)
            continue

        if line in SECTION_HEADERS:
            flush_entry()
            current_section = SECTION_HEADERS[line]
            continue

        if line in SECTION_TERMINATORS:
            flush_entry()
            current_section = None
            continue

        if line.startswith("Date ") or line.startswith("*I") or line.startswith("*Indicates"):
            continue

        if current_section and DATE_RE.match(line):
            flush_entry()
            current_lines = [line]
            current_date = line.split()[0].rstrip("*")
            continue

        if current_section and current_lines:
            current_lines.append(line)

    flush_entry()
    return results
