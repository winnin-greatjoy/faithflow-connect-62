import React, { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Gift,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Calculator,
  Smartphone,
  Receipt,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Transaction } from '@/modules/events/types/finance';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

// Mock Data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    donorName: 'Anonymous',
    amount: 150.0,
    currency: 'USD',
    method: 'cash',
    campaign: 'Offering',
    timestamp: 'Just now',
    status: 'completed',
  },
  {
    id: 't2',
    donorName: 'Isaac N.',
    amount: 1200.0,
    currency: 'USD',
    method: 'card',
    campaign: 'Tithes',
    timestamp: '5m ago',
    status: 'completed',
  },
  {
    id: 't3',
    donorName: 'Gloria A.',
    amount: 500.0,
    currency: 'USD',
    method: 'transfer',
    campaign: 'Building Fund',
    timestamp: '12m ago',
    status: 'completed',
  },
  {
    id: 't4',
    donorName: 'Samuel K.',
    amount: 25.0,
    currency: 'USD',
    method: 'mobile_money',
    campaign: 'Offering',
    timestamp: '30m ago',
    status: 'completed',
  },
];

export const GivingManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [manualEntryForm, setManualEntryForm] = useState({
    donorName: '',
    amount: '',
    method: 'cash' as Transaction['method'],
    campaign: '',
  });
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageGiving = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageGiving || !hasEventContext;

  const ensureActionAllowed = () => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Giving Manager from an event dashboard.');
      return false;
    }
    if (actionsDisabled) {
      toast.error('You do not have permission to manage giving actions.');
      return false;
    }
    return true;
  };

  const resetManualEntryForm = () => {
    setManualEntryForm({
      donorName: '',
      amount: '',
      method: 'cash',
      campaign: '',
    });
  };

  const handleCopyLink = async () => {
    if (!ensureActionAllowed()) return;

    const givingLink = `${window.location.origin}/events/${eventId}/giving`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(givingLink);
      }
      toast.success('Giving link copied');
    } catch {
      toast.info('Copy not available on this device. Share this link manually.', {
        description: givingLink,
      });
    }
  };

  const handleOpenManualEntry = () => {
    if (!ensureActionAllowed()) return;
    setShowManualEntryDialog(true);
  };

  const handleCreateManualEntry = () => {
    if (!ensureActionAllowed()) return;

    const amount = Number(manualEntryForm.amount);
    if (!amount || amount <= 0 || !manualEntryForm.campaign.trim()) {
      toast.error('Campaign and a valid amount are required.');
      return;
    }

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      donorName: manualEntryForm.donorName.trim() || 'Anonymous',
      amount,
      currency: 'USD',
      method: manualEntryForm.method,
      campaign: manualEntryForm.campaign.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setShowManualEntryDialog(false);
    resetManualEntryForm();
    toast.success('Manual giving entry added');
  };

  const handleOpenRegister = () => {
    if (!ensureActionAllowed()) return;
    setShowRegisterDialog(true);
  };

  const totalGiving = useMemo(
    () => transactions.reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );
  const uniqueGivers = useMemo(() => {
    const givers = new Set(
      transactions
        .map((tx) => tx.donorName.trim().toLowerCase())
        .filter((name) => name && name !== 'anonymous')
    );
    return givers.size;
  }, [transactions]);
  const givingGoal = 200000;
  const goalProgress = Math.min((totalGiving / givingGoal) * 100, 100);

  const LiveTickerView = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            {tx.method === 'cash' ? (
              <Wallet className="h-4 w-4 text-primary" />
            ) : tx.method === 'mobile_money' ? (
              <Smartphone className="h-4 w-4 text-primary" />
            ) : (
              <CreditCard className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-black text-foreground">{tx.donorName}</h5>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[9px] h-5 px-2 border-primary/10 text-muted-foreground uppercase tracking-widest"
              >
                {tx.campaign}
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest leading-none mt-0.5">
                - {tx.method.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <h5 className="text-sm font-black text-primary">${tx.amount.toFixed(2)}</h5>
            <p className="text-[9px] font-bold text-muted-foreground opacity-60">{tx.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Giving & Finance
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Donation Tracking & Reports
          </p>
        </div>
        <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
          {['transactions', 'campaigns', 'settings'].map((tab) => (
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-black rounded-[32px] text-white border-none shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <Gift className="h-8 w-8 mb-4 opacity-40" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
            Total Event Giving
          </p>
          <h3 className="text-3xl font-black mb-6">${totalGiving.toFixed(2)}</h3>
          <div className="flex items-center gap-2 text-xs font-black bg-white/10 w-fit p-1 px-3 rounded-full">
            <ArrowUpRight className="h-3 w-3" />
            12% vs last event
          </div>
        </Card>

        <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
          <Heart className="h-6 w-6 text-destructive mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
            Unique Givers
          </p>
          <h3 className="text-2xl font-black text-foreground mb-4">{uniqueGivers}</h3>
          <div className="flex items-center gap-2">
            <Progress value={goalProgress} className="h-1.5 flex-1 bg-muted" />
            <span className="text-[10px] font-black text-primary">
              {Math.round(goalProgress)}% of Goal
            </span>
          </div>
        </Card>

        <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5 flex flex-col items-center justify-center text-center">
          <Share2 className="h-6 w-6 text-primary mb-4" />
          <h4 className="text-sm font-black mb-2">Giving Link</h4>
          <p className="text-[10px] font-bold text-muted-foreground mb-4">
            Share this link for quick mobile giving
          </p>
          <Button
            variant="outline"
            disabled={actionsDisabled}
            onClick={handleCopyLink}
            className="h-10 px-6 rounded-xl border-primary/10 bg-muted/30 text-primary font-black text-[9px] uppercase tracking-widest"
          >
            Copy Link
          </Button>
        </Card>
      </div>

      <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h4 className="text-xl font-serif font-black">Transaction Stream</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Real-time giving updates
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={actionsDisabled}
              onClick={handleOpenManualEntry}
              className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border-primary/10"
            >
              <Calculator className="h-4 w-4 mr-2 opacity-50" /> Manual Entry
            </Button>
            <Button
              variant="ghost"
              disabled={actionsDisabled}
              onClick={handleOpenRegister}
              className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border border-primary/5"
            >
              <Receipt className="h-4 w-4 mr-2 opacity-50" /> View Register
            </Button>
          </div>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'transactions' && <LiveTickerView />}
          {activeTab === 'campaigns' && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
              <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Campaign breakdown visualizations</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showManualEntryDialog} onOpenChange={setShowManualEntryDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manual Giving Entry</DialogTitle>
            <DialogDescription>
              Capture in-person donations not processed by the payment link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              aria-label="Donor name"
              placeholder="Donor name (optional)"
              value={manualEntryForm.donorName}
              onChange={(event) =>
                setManualEntryForm((prev) => ({ ...prev, donorName: event.target.value }))
              }
            />
            <Input
              aria-label="Amount"
              type="number"
              min={0}
              placeholder="Amount"
              value={manualEntryForm.amount}
              onChange={(event) =>
                setManualEntryForm((prev) => ({ ...prev, amount: event.target.value }))
              }
            />
            <Input
              aria-label="Campaign"
              placeholder="Campaign (e.g. Offering)"
              value={manualEntryForm.campaign}
              onChange={(event) =>
                setManualEntryForm((prev) => ({ ...prev, campaign: event.target.value }))
              }
            />
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Method
              </label>
              <select
                aria-label="Method"
                value={manualEntryForm.method}
                onChange={(event) =>
                  setManualEntryForm((prev) => ({
                    ...prev,
                    method: event.target.value as Transaction['method'],
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowManualEntryDialog(false);
                resetManualEntryForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateManualEntry}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Giving Register</DialogTitle>
            <DialogDescription>Live event register of all captured transactions.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-bold">Donor</th>
                  <th className="text-left p-3 font-bold">Campaign</th>
                  <th className="text-left p-3 font-bold">Method</th>
                  <th className="text-right p-3 font-bold">Amount</th>
                  <th className="text-right p-3 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="p-3">{tx.donorName}</td>
                    <td className="p-3">{tx.campaign}</td>
                    <td className="p-3 capitalize">{tx.method.replace('_', ' ')}</td>
                    <td className="p-3 text-right font-semibold">${tx.amount.toFixed(2)}</td>
                    <td className="p-3 text-right text-muted-foreground">{tx.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
