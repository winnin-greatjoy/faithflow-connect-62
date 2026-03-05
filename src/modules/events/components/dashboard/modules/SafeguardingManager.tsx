import React, { useMemo, useState } from 'react';
import { ShieldCheck, ChevronRight, Search, Filter, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ClearanceRecord } from '@/modules/events/types/safety';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

// Mock Data
const MOCK_CLEARANCE: ClearanceRecord[] = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'Kwadwo Asare',
    checkType: 'DBS',
    issueDate: '2023-01-15',
    expiryDate: '2026-01-15',
    status: 'cleared',
  },
  {
    id: 'c2',
    userId: 'u2',
    userName: 'Abena Mansa',
    checkType: 'Reference',
    issueDate: '2022-12-01',
    expiryDate: '2023-12-01',
    status: 'expired',
  },
  {
    id: 'c3',
    userId: 'u3',
    userName: 'John Peterson',
    checkType: 'DBS',
    issueDate: '2023-06-20',
    expiryDate: '2026-06-20',
    status: 'cleared',
  },
  {
    id: 'c4',
    userId: 'u4',
    userName: 'Esther Kim',
    checkType: 'Training',
    issueDate: '2024-01-05',
    status: 'pending',
  },
];

export const SafeguardingManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('compliance');
  const [clearanceRecords, setClearanceRecords] = useState<ClearanceRecord[]>(MOCK_CLEARANCE);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [checkForm, setCheckForm] = useState({
    userName: '',
    checkType: 'DBS' as ClearanceRecord['checkType'],
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    status: 'pending' as ClearanceRecord['status'],
  });
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageSafeguarding = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageSafeguarding || !hasEventContext;

  const ensureActionAllowed = (deniedMessage: string) => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Safeguarding from an event dashboard.');
      return false;
    }
    if (actionsDisabled) {
      toast.error(deniedMessage);
      return false;
    }
    return true;
  };

  const resetCheckForm = () => {
    setCheckForm({
      userName: '',
      checkType: 'DBS',
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: '',
      status: 'pending',
    });
  };

  const handleNewCheck = () => {
    if (!ensureActionAllowed('You do not have permission to create safeguarding checks.')) {
      return;
    }
    setShowCheckDialog(true);
  };

  const handleCreateCheck = () => {
    if (!ensureActionAllowed('You do not have permission to create safeguarding checks.')) {
      return;
    }

    if (!checkForm.userName.trim() || !checkForm.issueDate) {
      toast.error('Staff name and issue date are required.');
      return;
    }

    const newRecord: ClearanceRecord = {
      id: `clearance-${Date.now()}`,
      userId: `user-${Date.now()}`,
      userName: checkForm.userName.trim(),
      checkType: checkForm.checkType,
      issueDate: checkForm.issueDate,
      expiryDate: checkForm.expiryDate || undefined,
      status: checkForm.status,
    };

    setClearanceRecords((prev) => [newRecord, ...prev]);
    setShowCheckDialog(false);
    resetCheckForm();
    toast.success('Safeguarding check created successfully');
  };

  const handleAdvanceStatus = (recordId: string) => {
    if (!ensureActionAllowed('You do not have permission to update safeguarding checks.')) {
      return;
    }

    setClearanceRecords((prev) =>
      prev.map((record) => {
        if (record.id !== recordId) return record;
        if (record.status === 'pending') return { ...record, status: 'cleared' };
        if (record.status === 'cleared') return { ...record, status: 'expired' };
        return { ...record, status: 'pending' };
      })
    );

    toast.success('Safeguarding status updated');
  };

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clearanceRecords;

    return clearanceRecords.filter((record) =>
      [record.userName, record.userId, record.checkType, record.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [clearanceRecords, searchQuery]);

  const clearedCount = clearanceRecords.filter((record) => record.status === 'cleared').length;
  const pendingCount = clearanceRecords.filter((record) => record.status === 'pending').length;
  const expiredCount = clearanceRecords.filter((record) => record.status === 'expired').length;
  const reportsCount = clearanceRecords.filter((record) => record.status === 'rejected').length;

  const ComplianceView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search staff by name or reference ID..."
            className="pl-12 h-12 rounded-2xl border-primary/5 bg-white shadow-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <Filter className="h-4 w-4 mr-2 opacity-60" /> Filter
          </Button>
          <Button
            onClick={handleNewCheck}
            disabled={actionsDisabled}
            className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest"
          >
            New Check
          </Button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <Card className="p-10 rounded-[28px] border-primary/10 bg-white text-center shadow-sm">
          <p className="font-bold text-muted-foreground">No safeguarding records found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-3xl border border-primary/5 hover:border-primary/20 transition-all bg-white shadow-sm group"
            >
              <div className="flex items-center gap-5 mb-4 md:mb-0">
                <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary text-sm">
                  {record.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h5 className="text-sm font-black text-foreground">{record.userName}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-[8px] h-5 px-2 border-none uppercase tracking-widest"
                    >
                      {record.checkType}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                      Issued: {record.issueDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black uppercase tracking-widest">Expiry Date</p>
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                    {record.expiryDate || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      'h-8 rounded-full border-none font-black text-[9px] uppercase tracking-widest px-4',
                      record.status === 'cleared'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : record.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-red-500/10 text-red-600'
                    )}
                  >
                    {record.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={actionsDisabled}
                    aria-label={`Advance status for ${record.userName}`}
                    onClick={() => handleAdvanceStatus(record.id)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Safeguarding
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Compliance & Vetting Management
          </p>
        </div>
        <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
          {['compliance', 'reports', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={!hasEventContext}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary',
                !hasEventContext && 'cursor-not-allowed opacity-60'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Cleared Staff',
            count: clearedCount,
            status: 'Active',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Pending Checks',
            count: pendingCount,
            status: 'Warning',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Expired',
            count: expiredCount,
            status: 'Critical',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            label: 'Reports',
            count: reportsCount,
            status: 'Good',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="p-4 bg-white rounded-[24px] border border-primary/5 shadow-sm flex items-center gap-4"
          >
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', item.bg)}>
              <ShieldCheck className={cn('h-5 w-5', item.color)} />
            </div>
            <div>
              <h3 className="text-xl font-black">{item.count}</h3>
              <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                {item.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'compliance' && <ComplianceView />}
        {activeTab === 'reports' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <Lock className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Confidential Report Log is locked</p>
            <Button variant="link" className="text-xs">
              Authenticate to view
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New Safeguarding Check</DialogTitle>
            <DialogDescription>
              Add a clearance record for staff or volunteer vetting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            <Input
              aria-label="Staff name"
              placeholder="Staff name"
              value={checkForm.userName}
              onChange={(event) =>
                setCheckForm((prev) => ({ ...prev, userName: event.target.value }))
              }
            />
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Check Type
              </label>
              <select
                aria-label="Check type"
                value={checkForm.checkType}
                onChange={(event) =>
                  setCheckForm((prev) => ({
                    ...prev,
                    checkType: event.target.value as ClearanceRecord['checkType'],
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="DBS">DBS</option>
                <option value="Reference">Reference</option>
                <option value="Training">Training</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Issue Date
              </label>
              <Input
                aria-label="Issue date"
                type="date"
                value={checkForm.issueDate}
                onChange={(event) =>
                  setCheckForm((prev) => ({ ...prev, issueDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Expiry Date
              </label>
              <Input
                aria-label="Expiry date"
                type="date"
                value={checkForm.expiryDate}
                onChange={(event) =>
                  setCheckForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Initial Status
              </label>
              <select
                aria-label="Initial status"
                value={checkForm.status}
                onChange={(event) =>
                  setCheckForm((prev) => ({
                    ...prev,
                    status: event.target.value as ClearanceRecord['status'],
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="cleared">Cleared</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCheckDialog(false);
                resetCheckForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCheck}>Save Check</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
