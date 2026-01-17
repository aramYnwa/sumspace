import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';

interface AddEnvelopeDialogProps {
  onAdd: (envelope: { name: string; budget: number }) => Promise<void>;
}

export function AddEnvelopeDialog({ onAdd }: AddEnvelopeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        const trimmedName = name.trim();
        const normalizedBudget = budget.trim() === '' ? 0 : parseFloat(budget);
        if (Number.isNaN(normalizedBudget)) {
          toast({
            title: 'Invalid budget',
            description: 'Enter a valid number for the budget.',
            variant: 'destructive',
          });
          return;
        }
        await onAdd({ name: trimmedName, budget: normalizedBudget });
        setName('');
        setBudget('');
        setOpen(false);
        toast({
          title: 'Envelope added',
          description: `"${trimmedName}" is ready to use.`,
          className: 'border-emerald-500 bg-emerald-50 text-emerald-950',
        });
      } catch (error) {
        console.error('Failed to add envelope', error);
        toast({
          title: 'Could not add envelope',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-2 border-dashed h-full min-h-[140px] hover:border-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Envelope
        </Button>
      </DialogTrigger>
      <DialogContent className="border-2">
        <DialogHeader>
          <DialogTitle>Create New Envelope</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Envelope Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Savings"
              className="border-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="border-2 font-mono"
            />
          </div>
          <Button type="submit" className="w-full">Create Envelope</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
