import { useEffect, useMemo, useState } from 'react';
import { Transaction, Envelope } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  getEnvelopeById: (id: number) => Envelope | undefined;
  envelopes: Envelope[];
  onUpdate: (id: number, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
}

export function TransactionList({ transactions, getEnvelopeById, envelopes, onUpdate }: TransactionListProps) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [envelopeId, setEnvelopeId] = useState<string>('none');
  const { toast } = useToast();

  const selectedTransaction = useMemo(
    () => sortedTransactions.find((tx) => tx.id === selectedTransactionId) ?? null,
    [sortedTransactions, selectedTransactionId]
  );

  useEffect(() => {
    if (selectedTransaction) {
      setMerchant(selectedTransaction.merchant);
      setAmount(selectedTransaction.amount.toString());
      setDate(format(parseISO(selectedTransaction.date), 'yyyy-MM-dd'));
      setEnvelopeId(selectedTransaction.envelopeId ? selectedTransaction.envelopeId.toString() : 'none');
    }
  }, [selectedTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a valid number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onUpdate(selectedTransaction.id, {
        merchant: merchant.trim(),
        amount: parsedAmount,
        date,
        envelopeId: envelopeId === 'none' ? null : Number(envelopeId),
      });
      toast({
        title: 'Transaction updated',
        description: `"${merchant.trim()}" was saved.`,
        className: 'border-emerald-500 bg-emerald-50 text-emerald-950',
      });
      setSelectedTransactionId(null);
    } catch (error) {
      console.error('Failed to update transaction', error);
      toast({
        title: 'Could not update transaction',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <span className="text-sm font-normal text-muted-foreground">
              {transactions.length} transactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {sortedTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {sortedTransactions.map((transaction) => {
                  const envelope = transaction.envelopeId
                    ? getEnvelopeById(transaction.envelopeId)
                    : undefined;
                  const envelopeLabel = envelope?.name ?? 'Unassigned';
                  const isPositive = transaction.amount >= 0;
                  const formattedAmount = `${isPositive ? '' : '-'}$${Math.abs(
                    transaction.amount
                  ).toFixed(2)}`;
                  const amountClass = isPositive
                    ? 'font-mono font-semibold text-emerald-600'
                    : 'font-mono font-semibold';
                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => setSelectedTransactionId(transaction.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 border border-border"
                          style={{ backgroundColor: envelope?.color ?? 'hsl(var(--muted))' }}
                        />
                        <div>
                          <p className="font-medium">{transaction.merchant}</p>
                          <p className="text-sm text-muted-foreground">
                            {envelopeLabel} • {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className={amountClass}>
                        {formattedAmount}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No transactions in selected range
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={selectedTransactionId !== null} onOpenChange={(open) => !open && setSelectedTransactionId(null)}>
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="border-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-2 font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-2"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="envelope">Envelope</Label>
                <Select value={envelopeId} onValueChange={setEnvelopeId}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {envelopes.map((env) => (
                      <SelectItem key={env.id} value={env.id.toString()}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save changes
                </Button>
                <Button variant="outline" type="button" onClick={() => setSelectedTransactionId(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
