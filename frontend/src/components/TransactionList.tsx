import { Transaction, Envelope } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  getEnvelopeById: (id: number) => Envelope | undefined;
}

export function TransactionList({ transactions, getEnvelopeById }: TransactionListProps) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  return (
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
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
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
                    <span className="font-mono font-semibold">
                      -${transaction.amount.toFixed(2)}
                    </span>
                  </div>
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
  );
}
