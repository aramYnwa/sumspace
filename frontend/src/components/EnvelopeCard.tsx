import { Envelope } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface EnvelopeCardProps {
  envelope: Envelope;
  isSelected: boolean;
  onToggle: () => void;
}

export function EnvelopeCard({ envelope, isSelected, onToggle }: EnvelopeCardProps) {
  const percentage = envelope.budget > 0
    ? Math.min((envelope.spent / envelope.budget) * 100, 100)
    : 0;
  const remaining = envelope.budget - envelope.spent;
  const isOverBudget = remaining < 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all border-2 hover:shadow-md",
        isSelected && "border-primary shadow-sm"
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span 
            className="w-3 h-3 border border-border" 
            style={{ backgroundColor: envelope.color }}
          />
          {envelope.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-mono font-medium">${envelope.spent.toFixed(2)}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-mono">${envelope.budget.toFixed(2)}</span>
        </div>
        <div className={cn(
          "text-sm font-medium pt-1 border-t border-border",
          isOverBudget ? "text-destructive" : "text-foreground"
        )}>
          {isOverBudget ? 'Over by' : 'Remaining'}: ${Math.abs(remaining).toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
}
