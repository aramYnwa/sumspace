import { Envelope } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface BudgetProgressChartProps {
  envelopes: Envelope[];
}

export function BudgetProgressChart({ envelopes }: BudgetProgressChartProps) {
  const data = envelopes.map(env => ({
    name: env.name,
    spent: env.spent,
    budget: env.budget,
    remaining: Math.max(env.budget - env.spent, 0),
    color: env.color,
    percentage: env.budget > 0 ? (env.spent / env.budget) * 100 : 0,
  }));

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Budget vs Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={100}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'spent' ? 'Spent' : 'Budget'
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '0',
              }}
            />
            <Bar dataKey="spent" stackId="a" strokeWidth={2} stroke="hsl(var(--background))">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" strokeWidth={2} stroke="hsl(var(--background))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
