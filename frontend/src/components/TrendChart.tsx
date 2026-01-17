import { Transaction, Envelope } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from '@/types/budget';

interface TrendChartProps {
  transactions: Transaction[];
  envelopes: Envelope[];
  dateRange: DateRange;
}

export function TrendChart({ transactions, envelopes, dateRange }: TrendChartProps) {
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  
  const data = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTransactions = transactions.filter(t => t.date === dayStr);
    const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: format(day, 'MMM dd'),
      amount: total,
    };
  });

  // Calculate cumulative spending
  let cumulative = 0;
  const cumulativeData = data.map(d => {
    cumulative += d.amount;
    return { ...d, cumulative };
  });

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Spent']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '0',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
