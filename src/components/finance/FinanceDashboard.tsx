import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthz } from '@/hooks/useAuthz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
  FileCheck,
  FileText,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export interface FinanceDashboardProps {
  mode: 'branch' | 'district' | 'global';
  branchId?: string;
  districtId?: string;
}

const TABS_BY_MODE: Record<FinanceDashboardProps['mode'], string[]> = {
  branch: ['overview', 'transactions', 'remittance', 'fund_requests', 'reports', 'settings'],
  district: ['overview', 'transactions', 'remittances', 'fund_requests', 'reports', 'settings'],
  global: ['overview', 'districts', 'compliance', 'reports', 'audit_logs', 'settings'],
};

type BranchRow = { id: string; name: string; district_id: string | null };

type FinanceRecord = {
  id: string;
  branch_id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  transaction_date: string;
};

type RemittanceRow = {
  id: string;
  branch_id: string;
  district_id: string | null;
  week_start: string;
  week_end: string;
  offerings: number;
  tithes: number;
  total_due: number;
  proof_path: string | null;
  status: string;
  submitted_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string | null;
};

type FundRequestRow = {
  id: string;
  branch_id: string;
  district_id: string | null;
  amount: number;
  purpose: string;
  attachment_path: string | null;
  status: string;
  requested_by: string | null;
  requested_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string | null;
};

const isMissingTableOrColumnError = (error: any) => {
  const msg = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  const hint = String(error?.hint || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  return (
    msg.includes('schema cache') ||
    msg.includes('could not find') ||
    msg.includes('relation') ||
    msg.includes('column') ||
    details.includes('schema cache') ||
    details.includes('could not find') ||
    details.includes('relation') ||
    details.includes('column') ||
    hint.includes('schema cache') ||
    hint.includes('could not find') ||
    code === 'pgrst204' ||
    code === '42p01'
  );
};

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};

const formatCurrency = (amount: number) => {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
};

const statusVariant = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'default';
  if (s === 'rejected') return 'destructive';
  if (s === 'submitted' || s === 'pending') return 'secondary';
  return 'outline';
};

export function FinanceDashboard({ mode, branchId, districtId }: FinanceDashboardProps) {
  const { toast } = useToast();
  const { hasRole } = useAuthz();

  const [activeTab, setActiveTab] = React.useState<string>(TABS_BY_MODE[mode][0]);
  const [loading, setLoading] = React.useState(true);

  const [branches, setBranches] = React.useState<BranchRow[]>([]);
  const [records, setRecords] = React.useState<FinanceRecord[]>([]);
  const [remittances, setRemittances] = React.useState<RemittanceRow[]>([]);
  const [fundRequests, setFundRequests] = React.useState<FundRequestRow[]>([]);

  const isApprover = hasRole('district_admin', 'super_admin');
  const canWriteBranch = mode === 'branch' && !hasRole('district_admin', 'super_admin');

  const scopeReady = React.useMemo(() => {
    if (mode === 'branch') return Boolean(branchId);
    if (mode === 'district') return Boolean(districtId);
    return true;
  }, [mode, branchId, districtId]);

  React.useEffect(() => {
    setActiveTab(TABS_BY_MODE[mode][0]);
  }, [mode]);

  const reload = React.useCallback(async () => {
    if (!scopeReady) return;

    setLoading(true);
    try {
      let branchRows: BranchRow[] = [];

      if (mode === 'branch' && branchId) {
        const { data, error } = await supabase
          .from('church_branches')
          .select('id, name, district_id')
          .eq('id', branchId)
          .maybeSingle();
        if (error) throw error;
        branchRows = data ? ([data] as any) : [];
      }

      if (mode === 'district' && districtId) {
        const { data, error } = await supabase
          .from('church_branches')
          .select('id, name, district_id')
          .eq('district_id', districtId)
          .order('name');
        if (error) throw error;
        branchRows = (data || []) as any;
      }

      if (mode === 'global') {
        const { data, error } = await supabase
          .from('church_branches')
          .select('id, name, district_id')
          .order('name');
        if (error) throw error;
        branchRows = (data || []) as any;
      }

      setBranches(branchRows);

      const branchIds = branchRows.map((b) => b.id);
      let recordsData: FinanceRecord[] = [];
      if (branchIds.length > 0) {
        const { data, error } = await supabase
          .from('finance_records')
          .select('id, branch_id, type, category, description, amount, transaction_date')
          .in('branch_id', branchIds)
          .order('transaction_date', { ascending: false })
          .limit(250);
        if (error) throw error;
        recordsData = (data || []) as any;
      }
      setRecords(recordsData);

      // New tables might not be in DB yet; treat as optional.
      const { data: remData, error: remErr } = await (supabase as any)
        .from('finance_remittances' as any)
        .select('*')
        .in(
          'branch_id',
          branchIds.length > 0 ? branchIds : ['00000000-0000-0000-0000-000000000000']
        )
        .order('created_at', { ascending: false })
        .limit(250);
      if (remErr) {
        if (!isMissingTableOrColumnError(remErr)) throw remErr;
        setRemittances([]);
      } else {
        setRemittances(((remData as any[]) || []) as any);
      }

      const { data: frData, error: frErr } = await (supabase as any)
        .from('finance_fund_requests' as any)
        .select('*')
        .in(
          'branch_id',
          branchIds.length > 0 ? branchIds : ['00000000-0000-0000-0000-000000000000']
        )
        .order('created_at', { ascending: false })
        .limit(250);
      if (frErr) {
        if (!isMissingTableOrColumnError(frErr)) throw frErr;
        setFundRequests([]);
      } else {
        setFundRequests(((frData as any[]) || []) as any);
      }
    } catch (e: any) {
      toast({
        title: 'Finance load failed',
        description: e?.message || 'Could not load finance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [scopeReady, mode, branchId, districtId, toast]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const totals = React.useMemo(() => {
    const income = records
      .filter((r) => (r.type || '').toLowerCase() === 'income')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const expenses = records
      .filter((r) => (r.type || '').toLowerCase() === 'expense')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const net = income - expenses;
    const pending = remittances.filter((r) => {
      const s = (r.status || '').toLowerCase();
      return s === 'pending' || s === 'submitted';
    }).length;
    return { income, expenses, net, pending };
  }, [records, remittances]);

  if (!scopeReady) {
    return (
      <div className="p-8 rounded-lg border bg-muted/20 text-muted-foreground">
        Missing required context for {mode} finance.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-7 w-7" />
          Finance Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Context: {mode}</p>
        {hasRole('district_admin') && mode === 'branch' && (
          <p className="text-xs text-muted-foreground mt-1">
            Branch finance is read-only for district admins.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Income"
          value={loading ? '—' : formatCurrency(totals.income)}
          icon={<ArrowUpRight className="h-6 w-6 text-green-600" />}
          accentClass="bg-green-100"
        />
        <KpiCard
          title="Expenses"
          value={loading ? '—' : formatCurrency(totals.expenses)}
          icon={<ArrowDownRight className="h-6 w-6 text-red-600" />}
          accentClass="bg-red-100"
        />
        <KpiCard
          title="Net"
          value={loading ? '—' : formatCurrency(totals.net)}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          accentClass="bg-primary/10"
        />
        <KpiCard
          title="Pending"
          value={loading ? '—' : String(totals.pending)}
          icon={<HandCoins className="h-6 w-6 text-amber-600" />}
          accentClass="bg-amber-100"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start">
          {TABS_BY_MODE[mode].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            mode={mode}
            loading={loading}
            branches={branches}
            fundRequests={fundRequests}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab
            mode={mode}
            loading={loading}
            canCreate={canWriteBranch}
            branchId={branchId}
            branches={branches}
            records={records}
            onCreated={reload}
          />
        </TabsContent>

        <TabsContent value="remittance" className="space-y-4">
          {mode === 'branch' && branchId ? (
            <BranchRemittanceTab
              branchId={branchId}
              districtId={branches[0]?.district_id ?? null}
              canSubmit={canWriteBranch}
              remittances={remittances.filter((r) => r.branch_id === branchId)}
              onSubmitted={reload}
            />
          ) : (
            <PlaceholderTab title="Remittance" description="Not available." icon={FileCheck} />
          )}
        </TabsContent>

        <TabsContent value="remittances" className="space-y-4">
          {mode === 'district' || mode === 'global' ? (
            <DistrictRemittancesTab
              loading={loading}
              remittances={remittances}
              branches={branches}
              canApprove={isApprover || mode === 'global'}
              onUpdated={reload}
            />
          ) : (
            <PlaceholderTab title="Remittances" description="Not available." icon={FileCheck} />
          )}
        </TabsContent>

        <TabsContent value="fund_requests" className="space-y-4">
          {mode === 'branch' && branchId ? (
            <BranchFundRequestsTab
              branchId={branchId}
              districtId={branches[0]?.district_id ?? null}
              canSubmit={canWriteBranch}
              requests={fundRequests.filter((r) => r.branch_id === branchId)}
              onSubmitted={reload}
            />
          ) : (
            <DistrictFundRequestsTab
              loading={loading}
              requests={fundRequests}
              branches={branches}
              canApprove={isApprover || mode === 'global'}
              onUpdated={reload}
            />
          )}
        </TabsContent>

        <TabsContent value="districts" className="space-y-4">
          <PlaceholderTab title="Districts" description="Coming soon." icon={ShieldCheck} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <PlaceholderTab title="Compliance" description="Coming soon." icon={ShieldCheck} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <PlaceholderTab title="Reports" description="Coming soon." icon={FileText} />
        </TabsContent>

        <TabsContent value="audit_logs" className="space-y-4">
          <PlaceholderTab title="Audit Logs" description="Coming soon." icon={FileCheck} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <PlaceholderTab title="Settings" description="Coming soon." icon={Settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  accentClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-full ${accentClass} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({
  mode,
  loading,
  branches,
  fundRequests,
}: {
  mode: FinanceDashboardProps['mode'];
  loading: boolean;
  branches: BranchRow[];
  fundRequests: FundRequestRow[];
}) {
  const pendingRequests = fundRequests.filter(
    (r) => (r.status || '').toLowerCase() === 'pending'
  ).length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>High-level summary for this scope</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="text-sm text-muted-foreground">Mode</div>
          <div className="text-lg font-semibold">{mode}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Branches in scope</div>
          <div className="text-lg font-semibold">{loading ? '—' : branches.length}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Pending fund requests</div>
          <div className="text-lg font-semibold">{loading ? '—' : pendingRequests}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionsTab({
  mode,
  loading,
  canCreate,
  branchId,
  branches,
  records,
  onCreated,
}: {
  mode: FinanceDashboardProps['mode'];
  loading: boolean;
  canCreate: boolean;
  branchId?: string;
  branches: BranchRow[];
  records: FinanceRecord[];
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [type, setType] = React.useState<'income' | 'expense'>('income');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(() => isoDate(new Date()));

  const currentBranchId = branchId || branches[0]?.id;
  const currentBranchName = branches.find((b) => b.id === currentBranchId)?.name || 'Branch';

  const createTransaction = async () => {
    if (!currentBranchId) return;
    if (!category.trim()) {
      toast({ title: 'Validation', description: 'Category is required.', variant: 'destructive' });
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        title: 'Validation',
        description: 'Amount must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id || null;
      const { error } = await supabase.from('finance_records').insert({
        branch_id: currentBranchId,
        type,
        category: category.trim(),
        description: description.trim() || null,
        amount: parsed,
        transaction_date: date,
        recorded_by: uid,
      });
      if (error) throw error;
      toast({ title: 'Recorded', description: `Transaction recorded for ${currentBranchName}.` });
      setOpen(false);
      setCategory('');
      setDescription('');
      setAmount('');
      onCreated();
    } catch (e: any) {
      toast({
        title: 'Create failed',
        description: e?.message || 'Could not create transaction',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            {canCreate ? 'Create and track transactions.' : 'Read-only view.'}
          </p>
        </div>
        {canCreate && mode === 'branch' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Record Transaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Transaction</DialogTitle>
                <DialogDescription>Branch: {currentBranchName}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={type === 'income' ? 'default' : 'outline'}
                      onClick={() => setType('income')}
                    >
                      Income
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'expense' ? 'default' : 'outline'}
                      onClick={() => setType('expense')}
                    >
                      Expense
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Offerings"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={createTransaction} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.slice(0, 50).map((r) => {
                    const bName = branches.find((b) => b.id === r.branch_id)?.name || r.branch_id;
                    const isIncome = (r.type || '').toLowerCase() === 'income';
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{r.transaction_date}</TableCell>
                        <TableCell>{bName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate">
                          {r.description || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isIncome ? 'default' : 'destructive'}>
                            {isIncome ? 'income' : 'expense'}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(Number(r.amount || 0))}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BranchRemittanceTab({
  branchId,
  districtId,
  canSubmit,
  remittances,
  onSubmitted,
}: {
  branchId: string;
  districtId: string | null;
  canSubmit: boolean;
  remittances: RemittanceRow[];
  onSubmitted: () => void;
}) {
  const { toast } = useToast();
  const [offerings, setOfferings] = React.useState('');
  const [tithes, setTithes] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [proofPath, setProofPath] = React.useState<string | null>(null);

  const now = new Date();
  const ws = startOfWeek(now);
  const we = endOfWeek(now);
  const weekStart = isoDate(ws);
  const weekEnd = isoDate(we);
  const total = (Number(offerings) || 0) + (Number(tithes) || 0);

  const uploadProof = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `finance/remittances/${branchId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('profile-photos').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      setProofPath(path);
      toast({ title: 'Uploaded', description: 'Proof uploaded.' });
    } catch (e: any) {
      toast({
        title: 'Upload failed',
        description: e?.message || 'Could not upload proof',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) {
      toast({
        title: 'Not allowed',
        description: 'You cannot submit remittance in this mode.',
        variant: 'destructive',
      });
      return;
    }
    if (total <= 0) {
      toast({
        title: 'Validation',
        description: 'Enter offerings and/or tithes.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id || null;

      const { error } = await (supabase as any).from('finance_remittances' as any).upsert(
        {
          branch_id: branchId,
          district_id: districtId,
          week_start: weekStart,
          week_end: weekEnd,
          offerings: Number(offerings) || 0,
          tithes: Number(tithes) || 0,
          total_due: total,
          proof_path: proofPath,
          status: 'submitted',
          submitted_by: uid,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'branch_id,week_start' }
      );

      if (error) {
        if (isMissingTableOrColumnError(error)) {
          toast({
            title: 'Migration required',
            description: 'Apply the finance remittances migration and refresh schema cache.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      toast({ title: 'Submitted', description: 'Weekly remittance submitted.' });
      setOfferings('');
      setTithes('');
      setProofPath(null);
      onSubmitted();
    } catch (e: any) {
      toast({
        title: 'Submit failed',
        description: e?.message || 'Could not submit remittance',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Remittance</CardTitle>
          <CardDescription>
            Week: {weekStart} – {weekEnd}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Offerings</Label>
              <Input
                value={offerings}
                onChange={(e) => setOfferings(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tithes</Label>
              <Input
                value={tithes}
                onChange={(e) => setTithes(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">Total Due</div>
            <div className="text-lg font-semibold">{formatCurrency(total)}</div>
          </div>

          <div className="grid gap-2">
            <Label>Upload Proof</Label>
            <Input
              type="file"
              disabled={!canSubmit || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadProof(f);
                if (e.target) e.target.value = '';
              }}
            />
            {proofPath && <div className="text-xs text-muted-foreground">Proof attached.</div>}
          </div>

          <Button onClick={submit} disabled={!canSubmit || saving}>
            {saving ? 'Submitting…' : 'Submit Remittance'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Your recent remittances</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remittances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No remittances yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  remittances.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.week_start} – {r.week_end}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(r.total_due || 0))}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DistrictRemittancesTab({
  loading,
  remittances,
  branches,
  canApprove,
  onUpdated,
}: {
  loading: boolean;
  remittances: RemittanceRow[];
  branches: BranchRow[];
  canApprove: boolean;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [proofUrl, setProofUrl] = React.useState<string | null>(null);

  const viewProof = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(path, 60 * 15);
    if (error) {
      toast({ title: 'Proof load failed', description: error.message, variant: 'destructive' });
      return;
    }
    setProofUrl(data?.signedUrl ?? null);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!canApprove) {
      toast({
        title: 'Not allowed',
        description: 'You cannot approve remittances.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id || null;
      const { error } = await (supabase as any)
        .from('finance_remittances' as any)
        .update({ status, approved_by: uid, approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Updated', description: `Remittance ${status}.` });
      onUpdated();
    } catch (e: any) {
      toast({
        title: 'Update failed',
        description: e?.message || 'Could not update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Remittances</h2>
          <p className="text-sm text-muted-foreground">Branch remittances in scope</p>
        </div>
        <Dialog open={Boolean(proofUrl)} onOpenChange={(o) => !o && setProofUrl(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Proof</DialogTitle>
              <DialogDescription>Signed URL preview</DialogDescription>
            </DialogHeader>
            {proofUrl ? (
              <img
                src={proofUrl}
                alt="Proof"
                className="max-h-[60vh] w-auto object-contain rounded"
              />
            ) : (
              <div className="text-muted-foreground">No proof</div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : remittances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No remittances.
                    </TableCell>
                  </TableRow>
                ) : (
                  remittances.slice(0, 50).map((r) => {
                    const branch = branches.find((b) => b.id === r.branch_id)?.name || r.branch_id;
                    const canAct =
                      canApprove &&
                      ['pending', 'submitted'].includes((r.status || '').toLowerCase());
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{branch}</TableCell>
                        <TableCell>
                          {r.week_start} – {r.week_end}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(r.total_due || 0))}</TableCell>
                        <TableCell>
                          {r.proof_path ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewProof(r.proof_path)}
                            >
                              View
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canAct}
                              onClick={() => updateStatus(r.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={!canAct}
                              onClick={() => updateStatus(r.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BranchFundRequestsTab({
  branchId,
  districtId,
  canSubmit,
  requests,
  onSubmitted,
}: {
  branchId: string;
  districtId: string | null;
  canSubmit: boolean;
  requests: FundRequestRow[];
  onSubmitted: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = React.useState('');
  const [purpose, setPurpose] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [attachmentPath, setAttachmentPath] = React.useState<string | null>(null);

  const uploadAttachment = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const path = `finance/fund-requests/${branchId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('profile-photos').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      setAttachmentPath(path);
      toast({ title: 'Uploaded', description: 'Attachment uploaded.' });
    } catch (e: any) {
      toast({
        title: 'Upload failed',
        description: e?.message || 'Could not upload attachment',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) {
      toast({
        title: 'Not allowed',
        description: 'You cannot request funds in this mode.',
        variant: 'destructive',
      });
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        title: 'Validation',
        description: 'Amount must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }
    if (!purpose.trim()) {
      toast({ title: 'Validation', description: 'Purpose is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id || null;
      const { error } = await (supabase as any).from('finance_fund_requests' as any).insert({
        branch_id: branchId,
        district_id: districtId,
        amount: parsed,
        purpose: purpose.trim(),
        attachment_path: attachmentPath,
        status: 'pending',
        requested_by: uid,
        requested_at: new Date().toISOString(),
      });
      if (error) {
        if (isMissingTableOrColumnError(error)) {
          toast({
            title: 'Migration required',
            description: 'Apply the finance fund requests migration and refresh schema cache.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }
      toast({ title: 'Submitted', description: 'Fund request submitted.' });
      setAmount('');
      setPurpose('');
      setAttachmentPath(null);
      onSubmitted();
    } catch (e: any) {
      toast({
        title: 'Submit failed',
        description: e?.message || 'Could not submit request',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Request Funds</CardTitle>
          <CardDescription>Submit a funding request to district finance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Amount</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          </div>
          <div className="grid gap-2">
            <Label>Purpose</Label>
            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Attachment</Label>
            <Input
              type="file"
              disabled={!canSubmit || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAttachment(f);
                if (e.target) e.target.value = '';
              }}
            />
            {attachmentPath && (
              <div className="text-xs text-muted-foreground">Attachment attached.</div>
            )}
          </div>
          <Button onClick={submit} disabled={!canSubmit || saving}>
            {saving ? 'Submitting…' : 'Submit Request'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Your recent fund requests</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formatCurrency(Number(r.amount || 0))}</TableCell>
                      <TableCell className="max-w-[320px] truncate">{r.purpose}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DistrictFundRequestsTab({
  loading,
  requests,
  branches,
  canApprove,
  onUpdated,
}: {
  loading: boolean;
  requests: FundRequestRow[];
  branches: BranchRow[];
  canApprove: boolean;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [attachmentUrl, setAttachmentUrl] = React.useState<string | null>(null);

  const viewAttachment = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(path, 60 * 15);
    if (error) {
      toast({
        title: 'Attachment load failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    setAttachmentUrl(data?.signedUrl ?? null);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!canApprove) {
      toast({
        title: 'Not allowed',
        description: 'You cannot approve fund requests.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id || null;
      const { error } = await (supabase as any)
        .from('finance_fund_requests' as any)
        .update({ status, approved_by: uid, approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Updated', description: `Fund request ${status}.` });
      onUpdated();
    } catch (e: any) {
      toast({
        title: 'Update failed',
        description: e?.message || 'Could not update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fund Requests</h2>
          <p className="text-sm text-muted-foreground">Requests from branches in scope</p>
        </div>
        <Dialog open={Boolean(attachmentUrl)} onOpenChange={(o) => !o && setAttachmentUrl(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attachment</DialogTitle>
              <DialogDescription>Signed URL preview</DialogDescription>
            </DialogHeader>
            {attachmentUrl ? (
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Open attachment
              </a>
            ) : (
              <div className="text-muted-foreground">No attachment</div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.slice(0, 50).map((r) => {
                    const branch = branches.find((b) => b.id === r.branch_id)?.name || r.branch_id;
                    const canAct = canApprove && (r.status || '').toLowerCase() === 'pending';
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{branch}</TableCell>
                        <TableCell className="max-w-[320px] truncate">{r.purpose}</TableCell>
                        <TableCell>{formatCurrency(Number(r.amount || 0))}</TableCell>
                        <TableCell>
                          {r.attachment_path ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewAttachment(r.attachment_path)}
                            >
                              View
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canAct}
                              onClick={() => updateStatus(r.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={!canAct}
                              onClick={() => updateStatus(r.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlaceholderTab({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">Coming soon.</CardContent>
    </Card>
  );
}
