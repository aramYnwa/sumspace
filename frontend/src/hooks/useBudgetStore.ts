import { useEffect, useMemo, useState } from 'react';
import { Envelope, Transaction, DateRange } from '@/types/budget';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { API_BASE, apiRequest } from '@/lib/api';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

type EnvelopeResponse = {
  id: number;
  name: string;
  monthly_budget: number | string | null;
  color: string | null;
};

type TransactionResponse = {
  id: number;
  envelope_id: number | null;
  merchant: string;
  amount: number | string;
  date: string;
  notes?: string | null;
};

type StatementEntry = {
  date: string;
  description: string;
  amount: number;
  card_ending?: string;
};

type StatementResponse = {
  payments: StatementEntry[];
  credits: StatementEntry[];
  debits: StatementEntry[];
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  return Number(value);
};

const normalizeEnvelope = (envelope: EnvelopeResponse, index: number): Envelope => ({
  id: envelope.id,
  name: envelope.name,
  budget: toNumber(envelope.monthly_budget),
  spent: 0,
  color: envelope.color || CHART_COLORS[index % CHART_COLORS.length],
});

const normalizeTransaction = (transaction: TransactionResponse): Transaction => ({
  id: transaction.id,
  envelopeId: transaction.envelope_id ?? null,
  merchant: transaction.merchant,
  amount: toNumber(transaction.amount),
  date: transaction.date,
  notes: transaction.notes ?? null,
});

export function useBudgetStore() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedEnvelopeIds, setSelectedEnvelopeIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    const loadData = async () => {
      const [envelopeData, transactionData] = await Promise.all([
        apiRequest<EnvelopeResponse[]>('/api/envelopes'),
        apiRequest<TransactionResponse[]>('/api/transactions'),
      ]);
      setEnvelopes(envelopeData.map(normalizeEnvelope));
      setTransactions(transactionData.map(normalizeTransaction));
    };

    loadData().catch((error) => {
      console.error('Failed to load budget data', error);
    });
  }, []);

  const addEnvelope = async (envelope: Omit<Envelope, 'id' | 'spent' | 'color'>) => {
    const color = CHART_COLORS[envelopes.length % CHART_COLORS.length];
    const created = await apiRequest<EnvelopeResponse>('/api/envelopes', {
      method: 'POST',
      body: JSON.stringify({
        name: envelope.name,
        monthly_budget: envelope.budget,
        color,
      }),
    });
    setEnvelopes((prev) => [...prev, normalizeEnvelope(created, prev.length)]);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const created = await apiRequest<TransactionResponse>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        date: transaction.date,
        merchant: transaction.merchant,
        amount: transaction.amount,
        notes: transaction.notes ?? null,
        envelope_id: transaction.envelopeId,
      }),
    });
    setTransactions((prev) => [...prev, normalizeTransaction(created)]);
  };

  const importAmexStatement = async (file: File): Promise<StatementResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/api/statements/amex`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }
    return response.json() as Promise<StatementResponse>;
  };

  const updateTransaction = async (id: number, updates: Partial<Omit<Transaction, 'id'>>) => {
    const body: Record<string, unknown> = {};
    if (updates.date !== undefined) body.date = updates.date;
    if (updates.merchant !== undefined) body.merchant = updates.merchant;
    if (updates.amount !== undefined) body.amount = updates.amount;
    if (updates.notes !== undefined) body.notes = updates.notes ?? null;
    if (updates.envelopeId !== undefined) body.envelope_id = updates.envelopeId;

    const updated = await apiRequest<TransactionResponse>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? normalizeTransaction(updated) : tx)));
  };

  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date);
      const withinDateRange = isWithinInterval(transactionDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
      return withinDateRange;
    });
  }, [transactions, dateRange]);

  const filteredTransactions = useMemo(() => {
    if (selectedEnvelopeIds.length === 0) {
      return dateFilteredTransactions;
    }
    return dateFilteredTransactions.filter(
      (transaction) =>
        transaction.envelopeId !== null &&
        selectedEnvelopeIds.includes(transaction.envelopeId)
    );
  }, [dateFilteredTransactions, selectedEnvelopeIds]);

  const envelopesWithTotals = useMemo(() => {
    return envelopes.map((envelope) => {
      const spent = dateFilteredTransactions
        .filter((transaction) => transaction.envelopeId === envelope.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return { ...envelope, spent };
    });
  }, [envelopes, dateFilteredTransactions]);

  const getEnvelopeById = (id: number) => envelopes.find((envelope) => envelope.id === id);

  return {
    envelopes: envelopesWithTotals,
    transactions: filteredTransactions,
    allTransactions: transactions,
    selectedEnvelopeIds,
    setSelectedEnvelopeIds,
    dateRange,
    setDateRange,
    addEnvelope,
    addTransaction,
    importAmexStatement,
    updateTransaction,
    getEnvelopeById,
  };
}
