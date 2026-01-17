import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Envelope, Transaction } from '@/types/budget';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface AddTransactionDialogProps {
  envelopes: Envelope[];
  onAdd: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
}

export function AddTransactionDialog({ envelopes, onAdd }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [envelopeId, setEnvelopeId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (merchant.trim() && amount && envelopeId && date) {
      const parsedEnvelopeId = Number(envelopeId);
      try {
        const trimmedMerchant = merchant.trim();
        const parsedAmount = parseFloat(amount);
        await onAdd({
          merchant: trimmedMerchant,
          amount: parsedAmount,
          envelopeId: Number.isNaN(parsedEnvelopeId) ? null : parsedEnvelopeId,
          date,
        });
        setMerchant('');
        setAmount('');
        setEnvelopeId('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setOpen(false);
        toast({
          title: 'Transaction added',
          description: `$${parsedAmount.toFixed(2)} at ${trimmedMerchant}.`,
          className: 'border-emerald-500 bg-emerald-50 text-emerald-950',
        });
      } catch (error) {
        console.error('Failed to add transaction', error);
        toast({
          title: 'Could not add transaction',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="border-2">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="envelope">Envelope</Label>
            <Select value={envelopeId} onValueChange={setEnvelopeId}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Select envelope" />
              </SelectTrigger>
              <SelectContent>
                {envelopes.map((env) => (
                  <SelectItem key={env.id} value={env.id.toString()}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant</Label>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Coffee shop"
              className="border-2"
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
                placeholder="0.00"
                className="border-2 font-mono"
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
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Add Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
