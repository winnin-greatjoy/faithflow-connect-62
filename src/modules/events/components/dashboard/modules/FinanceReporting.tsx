import React, { useMemo, useState } from 'react';
import { PieChart, TrendingUp, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BudgetCategory } from '@/modules/events/types/finance';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

// Mock Data
const MOCK_BUDGET: BudgetCategory[] = [
  {
    id: 'b1',
    name: 'Venue & Facilities',
    allocated: 20000,
    spent: 18500,
    remaining: 1500,
    status: 'on_track',
  },
  {
    id: 'b2',
    name: 'Catering & Food',
    allocated: 15000,
    spent: 16200,
    remaining: -1200,
    status: 'over_budget',
  },
  {
    id: 'b3',
    name: 'Media & Technical',
    allocated: 10000,
    spent: 8500,
    remaining: 1500,
    status: 'on_track',
  },
  {
    id: 'b4',
    name: 'Guest Speakers',
    allocated: 8000,
    spent: 7800,
    remaining: 200,
    status: 'warning',
  },
];

export const FinanceReportingModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('budget');
  const [budgetItems] = useState<BudgetCategory[]>(MOCK_BUDGET);
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageFinance = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageFinance || !hasEventContext;

  const totalAllocated = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.allocated, 0),
    [budgetItems]
  );
  const totalSpent = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.spent, 0),
    [budgetItems]
  );
  const totalRemaining = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.remaining, 0),
    [budgetItems]
  );

  const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const handleExport = () => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Finance Reporting from an event dashboard.');
      return;
    }
    if (actionsDisabled) {
      toast.error('You do not have permission to export finance reports.');
      return;
    }

    const headers = ['Category', 'Allocated', 'Spent', 'Remaining', 'Status'];
    const rows = budgetItems.map((item) => [
      item.name,
      item.allocated,
      item.spent,
      item.remaining,
      item.status,
    ]);

    const csv = [
      ['Event ID', eventId || 'unknown'],
      ['Total Allocated', totalAllocated],
      ['Total Spent', totalSpent],
      ['Total Remaining', totalRemaining],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-report-${eventId || 'unknown'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Finance report export started');
  };

  const BudgetView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgetItems.map((item) => {
          const progress = (item.spent / item.allocated) * 100;
          return (
            <Card
              key={item.id}
              className="p-6 bg-white rounded-3xl border border-primary/5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-black text-lg">{item.name}</h5>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Allocated: ${item.allocated.toLocaleString()}
                  </p>
                </div>
                <Badge
                  className={cn(
                    'h-6 border-none font-black text-[9px] uppercase tracking-widest px-3',
                    item.status === 'on_track'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : item.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>Spent: ${item.spent.toLocaleString()}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <Progress
                  value={progress}
                  className={cn('h-2', progress > 100 ? 'bg-red-200' : 'bg-muted')}
                  indicatorClassName={
                    progress > 100
                      ? 'bg-destructive'
                      : progress > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }
                />
              </div>

              <div className="flex justify-between items-center text-xs font-medium border-t border-primary/5 pt-4">
                <span className="text-muted-foreground">Remaining</span>
                <span
                  className={cn(
                    'font-black',
                    item.remaining < 0 ? 'text-destructive' : 'text-emerald-600'
                  )}
                >
                  ${item.remaining.toLocaleString()}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Financial Reporting
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Budget vs Actuals & Yield Analysis
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
            {['budget', 'income', 'projections'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={!hasEventContext}
                className={cn(
                  'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === tab
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={actionsDisabled}
            onClick={handleExport}
            className="h-11 px-4 rounded-xl border-primary/10 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'budget' && <BudgetView />}
        {activeTab === 'income' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <PieChart className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Income distribution charts</p>
          </div>
        )}
        {activeTab === 'projections' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Future projections and yield analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};
