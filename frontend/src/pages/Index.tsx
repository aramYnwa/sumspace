import { useRef } from 'react';
import { useBudgetStore } from '@/hooks/useBudgetStore';
import { Header } from '@/components/Header';
import { EnvelopeCard } from '@/components/EnvelopeCard';
import { AddEnvelopeDialog } from '@/components/AddEnvelopeDialog';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { SpendingChart } from '@/components/SpendingChart';
import { TrendChart } from '@/components/TrendChart';
import { BudgetProgressChart } from '@/components/BudgetProgressChart';
import { TransactionList } from '@/components/TransactionList';
import { SummaryStats } from '@/components/SummaryStats';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

const Index = () => {
  const {
    envelopes,
    transactions,
    selectedEnvelopeIds,
    setSelectedEnvelopeIds,
    dateRange,
    setDateRange,
    addEnvelope,
    addTransaction,
    getEnvelopeById,
    importAmexStatement,
    updateTransaction,
  } = useBudgetStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const toggleEnvelope = (id: number) => {
    setSelectedEnvelopeIds(
      selectedEnvelopeIds.includes(id)
        ? selectedEnvelopeIds.filter((i) => i !== id)
        : [...selectedEnvelopeIds, id]
    );
  };

  const clearFilters = () => {
    setSelectedEnvelopeIds([]);
  };

  const handleStatementUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await importAmexStatement(file);
      const total =
        result.debits.length + result.credits.length + result.payments.length;
      toast({
        title: 'Statement processed',
        description: `Found ${total} transactions.`,
        className: 'border-emerald-500 bg-emerald-50 text-emerald-950',
      });
    } catch (error) {
      console.error('Failed to process statement', error);
      toast({
        title: 'Statement processing failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Filters & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleStatementUpload}
              className="hidden"
            />
            {selectedEnvelopeIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear filters ({selectedEnvelopeIds.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Import statement
            </Button>
            <AddTransactionDialog envelopes={envelopes} onAdd={addTransaction} />
          </div>
        </div>

        {/* Summary Stats */}
        <SummaryStats envelopes={envelopes} transactions={transactions} />

        {/* Envelopes Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Your Envelopes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {envelopes.map((envelope) => (
              <EnvelopeCard
                key={envelope.id}
                envelope={envelope}
                isSelected={selectedEnvelopeIds.includes(envelope.id)}
                onToggle={() => toggleEnvelope(envelope.id)}
              />
            ))}
            <AddEnvelopeDialog onAdd={addEnvelope} />
          </div>
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart envelopes={envelopes} transactions={transactions} />
          <TrendChart transactions={transactions} envelopes={envelopes} dateRange={dateRange} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetProgressChart envelopes={envelopes} />
          <TransactionList
            transactions={transactions}
            getEnvelopeById={getEnvelopeById}
            envelopes={envelopes}
            onUpdate={updateTransaction}
          />
        </section>
      </main>
    </div>
  );
};

export default Index;
