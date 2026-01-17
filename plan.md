# Plan

Summary: Build a manual-entry envelope budgeting MVP that stores transactions and categories in SQLite, and provides a UI for filtering and aggregating spend over a selected time range.

## Deliverables

- [ ] Envelope and transaction data model
  - [ ] Define envelope fields and constraints
  - [ ] Define transaction fields (date, amount, description, envelope_id, notes)
  - [ ] Validate schema against planned aggregation needs

- [ ] Backend API for CRUD and summaries
  - [ ] Endpoints for envelopes CRUD
  - [ ] Endpoints for transactions CRUD
  - [ ] Endpoint for aggregated totals by envelope and time range

- [ ] Frontend UI for manual entry and browsing
  - [ ] Envelope management UI
  - [ ] Transaction entry form with envelope assignment
  - [ ] Transaction list with filters (date range, envelope)

- [ ] Insights and aggregation UI
  - [ ] Totals by envelope view
  - [ ] Summary view for selected time range

- [ ] MVP QA and documentation
  - [ ] Smoke test CRUD and summary flows
  - [ ] Update README with MVP usage notes

- [ ] Post-MVP placeholder: PDF import workflow
  - [ ] Capture desired PDF formats and sample statements
  - [ ] Define ingestion + review flow requirements
