import { Envelope, Transaction } from '@/types/budget';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react';

interface SummaryStatsProps {
  envelopes: Envelope[];
  transactions: Transaction[];
}

export function SummaryStats({ envelopes, transactions }: SummaryStatsProps) {
  const totalBudget = envelopes.reduce((sum, e) => sum + e.budget, 0);
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalRemaining = totalBudget - envelopes.reduce((sum, e) => sum + e.spent, 0);
  const avgTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;

  const stats = [
    {
      label: 'Total Budget',
      value: `$${totalBudget.toFixed(2)}`,
      icon: Wallet,
      description: 'Monthly allocation',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      icon: TrendingDown,
      description: 'In selected period',
    },
    {
      label: 'Remaining',
      value: `$${totalRemaining.toFixed(2)}`,
      icon: PiggyBank,
      description: 'Available to spend',
    },
    {
      label: 'Avg Transaction',
      value: `$${avgTransaction.toFixed(2)}`,
      icon: TrendingUp,
      description: `From ${transactions.length} transactions`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-2">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-mono mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
