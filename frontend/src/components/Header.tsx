import { Wallet } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b-2 border-border bg-background">
      <div className="container py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">EnvelopeFlow</h1>
            <p className="text-sm text-muted-foreground">Budget smarter, spend wiser</p>
          </div>
        </div>
      </div>
    </header>
  );
}
