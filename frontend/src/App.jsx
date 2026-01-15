import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const today = new Date();

function toMonthString(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function App() {
  const [month, setMonth] = useState(toMonthString(today));
  const [envelopes, setEnvelopes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [envelopeName, setEnvelopeName] = useState("");
  const [budget, setBudget] = useState("");
  const [txForm, setTxForm] = useState({
    date: today.toISOString().slice(0, 10),
    merchant: "",
    amount: "",
    envelope_id: ""
  });

  useEffect(() => {
    fetch("/api/envelopes")
      .then((res) => res.json())
      .then(setEnvelopes)
      .catch(() => setEnvelopes([]));
  }, []);

  useEffect(() => {
    fetch(`/api/transactions?month=${month}`)
      .then((res) => res.json())
      .then(setTransactions)
      .catch(() => setTransactions([]));

    fetch(`/api/summary?month=${month}`)
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => setSummary([]));
  }, [month]);

  const envelopeOptions = useMemo(() => {
    return [{ id: "", name: "Uncategorized" }, ...envelopes];
  }, [envelopes]);

  function handleEnvelopeSubmit(event) {
    event.preventDefault();
    if (!envelopeName.trim()) {
      return;
    }
    fetch("/api/envelopes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: envelopeName.trim(),
        monthly_budget: budget ? Number(budget) : null
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create envelope");
        }
        return res.json();
      })
      .then((created) => {
        setEnvelopes((prev) => [...prev, created]);
        setEnvelopeName("");
        setBudget("");
      })
      .catch(() => {});
  }

  function handleTxSubmit(event) {
    event.preventDefault();
    if (!txForm.merchant.trim() || !txForm.amount || !txForm.date) {
      return;
    }

    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: txForm.date,
        merchant: txForm.merchant.trim(),
        amount: Number(txForm.amount),
        envelope_id: txForm.envelope_id ? Number(txForm.envelope_id) : null
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create transaction");
        }
        return res.json();
      })
      .then((created) => {
        setTransactions((prev) => [created, ...prev]);
        return fetch(`/api/summary?month=${month}`);
      })
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => {});

    setTxForm({
      date: txForm.date,
      merchant: "",
      amount: "",
      envelope_id: txForm.envelope_id
    });
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Envelope Budgeting</p>
          <h1>Sumspace</h1>
          <p className="sub">Manual entry MVP with monthly rollups.</p>
        </div>
        <div className="month-picker">
          <label htmlFor="month">Month</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <h2>Monthly Summary</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="envelope_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#1f3c2f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="summary-list">
            {summary.map((item) => (
              <div key={`${item.envelope_id}-${item.envelope_name}`} className="summary-row">
                <span>{item.envelope_name}</span>
                <span>${Number(item.total).toFixed(2)}</span>
              </div>
            ))}
            {!summary.length && <p className="muted">No data yet for this month.</p>}
          </div>
        </section>

        <section className="panel">
          <h2>Add Transaction</h2>
          <form className="form" onSubmit={handleTxSubmit}>
            <label>
              Date
              <input
                type="date"
                value={txForm.date}
                onChange={(event) =>
                  setTxForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Merchant
              <input
                type="text"
                value={txForm.merchant}
                onChange={(event) =>
                  setTxForm((prev) => ({ ...prev, merchant: event.target.value }))
                }
                placeholder="Coffee shop"
                required
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                step="0.01"
                value={txForm.amount}
                onChange={(event) =>
                  setTxForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="24.50"
                required
              />
            </label>
            <label>
              Envelope
              <select
                value={txForm.envelope_id}
                onChange={(event) =>
                  setTxForm((prev) => ({ ...prev, envelope_id: event.target.value }))
                }
              >
                {envelopeOptions.map((envelope) => (
                  <option key={envelope.id || "uncategorized"} value={envelope.id}>
                    {envelope.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Add transaction</button>
          </form>
        </section>

        <section className="panel">
          <h2>Envelopes</h2>
          <form className="form" onSubmit={handleEnvelopeSubmit}>
            <label>
              Name
              <input
                type="text"
                value={envelopeName}
                onChange={(event) => setEnvelopeName(event.target.value)}
                placeholder="Groceries"
                required
              />
            </label>
            <label>
              Monthly Budget
              <input
                type="number"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="400"
              />
            </label>
            <button type="submit">Create envelope</button>
          </form>
          <div className="summary-list">
            {envelopes.map((envelope) => (
              <div key={envelope.id} className="summary-row">
                <span>{envelope.name}</span>
                <span>
                  {envelope.monthly_budget
                    ? `$${Number(envelope.monthly_budget).toFixed(2)}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Transactions</h2>
          <div className="table">
            <div className="table-row head">
              <span>Date</span>
              <span>Merchant</span>
              <span>Envelope</span>
              <span>Amount</span>
            </div>
            {transactions.map((tx) => (
              <div key={tx.id} className="table-row">
                <span>{tx.date}</span>
                <span>{tx.merchant}</span>
                <span>
                  {envelopes.find((env) => env.id === tx.envelope_id)?.name ||
                    "Uncategorized"}
                </span>
                <span>${Number(tx.amount).toFixed(2)}</span>
              </div>
            ))}
            {!transactions.length && <p className="muted">No transactions yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
