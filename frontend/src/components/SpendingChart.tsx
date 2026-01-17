import { Envelope, Transaction } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SpendingChartProps {
  envelopes: Envelope[];
  transactions: Transaction[];
}

export function SpendingChart({ envelopes, transactions }: SpendingChartProps) {
  const data = envelopes.map(env => {
    const envTransactions = transactions.filter(t => t.envelopeId === env.id);
    const total = envTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      name: env.name,
      value: total,
      color: env.color,
    };
  }).filter(d => d.value > 0);

  const totalSpending = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Spending by Category</span>
          <span className="font-mono text-lg">${totalSpending.toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '0',
                }}
              />
              <Legend
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            No transactions in selected range
          </div>
        )}
      </CardContent>
    </Card>
  );
}
