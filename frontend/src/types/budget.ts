export interface Envelope {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

export interface Transaction {
  id: number;
  envelopeId: number | null;
  merchant: string;
  amount: number;
  date: string;
  notes?: string | null;
}

export type DateRange = {
  from: Date;
  to: Date;
};
