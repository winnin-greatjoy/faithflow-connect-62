import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  FileText,
  Settings,
  PieChart,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Loader2,
  Plus,
  CreditCard,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormBuilder } from '@/modules/events/components/registration/FormBuilder';
import registrationsApi, {
  EventRegistration,
  RegistrationPaymentStatus,
  RegistrationStatus,
} from '@/services/registrationsApi';
import { useToast } from '@/hooks/use-toast';
import { useAuthz } from '@/hooks/useAuthz';

interface RegistrationManagerModuleProps {
  eventId?: string | null;
  eventTitle?: string;
  capacity?: number | null;
}

interface ManualRegistrationFormState {
  name: string;
  email: string;
  phone: string;
  status: RegistrationStatus;
  payment_status: RegistrationPaymentStatus;
  amount_paid: string;
}

const defaultManualForm: ManualRegistrationFormState = {
  name: '',
  email: '',
  phone: '',
  status: 'confirmed',
  payment_status: 'not_required',
  amount_paid: '0',
};

export const RegistrationManagerModule: React.FC<RegistrationManagerModuleProps> = ({
  eventId,
  eventTitle,
  capacity,
}) => {
  const { toast } = useToast();
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const [view, setView] = useState<'registrants' | 'reports'>('registrants');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RegistrationStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | RegistrationPaymentStatus>('all');
  const [loading, setLoading] = useState(true);
  const [creatingRegistration, setCreatingRegistration] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [manualForm, setManualForm] = useState<ManualRegistrationFormState>(defaultManualForm);
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [detailPaymentStatus, setDetailPaymentStatus] =
    useState<RegistrationPaymentStatus>('pending');
  const [detailAmountPaid, setDetailAmountPaid] = useState('0');
  const canManageRegistrations = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const canDeleteRegistrations = useMemo(
    () => hasRole('super_admin', 'admin') || can('events', 'delete'),
    [can, hasRole]
  );

  const ensureCanManage = (action: string) => {
    if (authzLoading || !canManageRegistrations) {
      toast({
        title: 'Permission denied',
        description: `You do not have permission to ${action}.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const ensureCanDelete = (action: string) => {
    if (authzLoading || !canDeleteRegistrations) {
      toast({
        title: 'Permission denied',
        description: `You do not have permission to ${action}.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const openFormBuilder = () => {
    if (!ensureCanManage('manage registration forms')) return;
    setShowFormBuilder(true);
  };

  const openCreateRegistrationDialog = () => {
    if (!ensureCanManage('add registrations')) return;
    setShowCreateDialog(true);
  };

  const openRegistrationDetails = (registration: EventRegistration) => {
    setSelectedRegistration(registration);
    setDetailPaymentStatus(
      (registration.payment_status || 'not_required') as RegistrationPaymentStatus
    );
    setDetailAmountPaid(String(registration.amount_paid || 0));
    setShowDetailsDialog(true);
  };

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      setRegistrations([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await registrationsApi.getEventRegistrations(eventId);
      if (error) throw error;
      setRegistrations((data || []) as EventRegistration[]);
    } catch (err: any) {
      toast({
        title: 'Failed to load registrations',
        description: err.message || 'Unable to retrieve attendees for this event.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const filteredRegistrations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return registrations.filter((r) => {
      const matchesSearch =
        q.length === 0 ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || r.payment_status === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [registrations, searchTerm, statusFilter, paymentFilter]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
    const waitlist = registrations.filter((r) => r.status === 'waitlist').length;
    const cancelled = registrations.filter((r) => r.status === 'cancelled').length;
    const paid = registrations.filter((r) => r.payment_status === 'paid').length;
    const revenue = registrations.reduce((sum, r) => sum + (r.amount_paid || 0), 0);
    return { total, confirmed, waitlist, cancelled, paid, revenue };
  }, [registrations]);

  const reportSlices = useMemo(() => {
    const emailsByDomain = registrations.reduce<Record<string, number>>((acc, reg) => {
      const domain = reg.email.split('@')[1]?.toLowerCase() || 'unknown';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});
    const topDomains = Object.entries(emailsByDomain)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const recent = [...registrations]
      .sort((a, b) => {
        const t1 = new Date(a.registered_at).getTime();
        const t2 = new Date(b.registered_at).getTime();
        return t2 - t1;
      })
      .slice(0, 5);
    return { topDomains, recent };
  }, [registrations]);

  const capacityPct = capacity ? Math.min((stats.confirmed / capacity) * 100, 100) : null;

  const updateStatus = async (registrationId: string, status: RegistrationStatus) => {
    if (!ensureCanManage('update registration status')) return;
    setActionLoadingId(registrationId);
    try {
      const { error } = await registrationsApi.updateRegistrationStatus(registrationId, status);
      if (error) throw error;
      setRegistrations((prev) => prev.map((r) => (r.id === registrationId ? { ...r, status } : r)));
      toast({ title: 'Registration updated', description: `Status set to ${status}.` });
    } catch (err: any) {
      toast({
        title: 'Status update failed',
        description: err.message || 'Could not update registration status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const updatePaymentStatus = async (
    registrationId: string,
    status: RegistrationPaymentStatus,
    amount?: number
  ) => {
    if (!ensureCanManage('update payment status')) return;
    setActionLoadingId(registrationId);
    try {
      const { data, error } = await registrationsApi.updatePaymentStatus(
        registrationId,
        status,
        amount
      );
      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? ({
                ...r,
                payment_status: status,
                amount_paid:
                  amount !== undefined
                    ? amount
                    : ((data as EventRegistration | null)?.amount_paid ?? r.amount_paid),
              } as EventRegistration)
            : r
        )
      );
      toast({ title: 'Payment updated', description: `Payment marked as ${status}.` });
    } catch (err: any) {
      toast({
        title: 'Payment update failed',
        description: err.message || 'Could not update payment status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const createManualRegistration = async () => {
    if (!ensureCanManage('add registrations')) return;
    if (!eventId) {
      toast({
        title: 'Missing event',
        description: 'No event is selected for this registration.',
        variant: 'destructive',
      });
      return;
    }
    if (!manualForm.name.trim() || !manualForm.email.trim()) {
      toast({
        title: 'Missing details',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    const amount = Number(manualForm.amount_paid || '0');
    if (Number.isNaN(amount) || amount < 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid non-negative amount.',
        variant: 'destructive',
      });
      return;
    }

    setCreatingRegistration(true);
    try {
      const { data, error } = await registrationsApi.createManualRegistration({
        event_id: eventId,
        name: manualForm.name.trim(),
        email: manualForm.email.trim().toLowerCase(),
        phone: manualForm.phone.trim() || undefined,
        status: manualForm.status,
        payment_status: manualForm.payment_status,
        amount_paid: amount,
        metadata: { source: 'admin_manual' },
      });
      if (error) throw error;

      const created = data as EventRegistration;
      setRegistrations((prev) => [created, ...prev]);
      setShowCreateDialog(false);
      setManualForm(defaultManualForm);

      if (manualForm.status === 'confirmed' && created.status === 'waitlist') {
        toast({
          title: 'Added to waitlist',
          description: 'Event capacity is full, so this attendee was placed on waitlist.',
        });
      } else {
        toast({ title: 'Registration created', description: `${created.name} was added.` });
      }
    } catch (err: any) {
      const message =
        err?.message?.toLowerCase().includes('duplicate') ||
        err?.message?.toLowerCase().includes('unique')
          ? 'This email is already registered for the event.'
          : err.message || 'Could not create registration.';
      toast({
        title: 'Create failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setCreatingRegistration(false);
    }
  };

  const saveDetailsPayment = async () => {
    if (!selectedRegistration) return;
    const amount = Number(detailAmountPaid || '0');
    if (Number.isNaN(amount) || amount < 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid non-negative amount.',
        variant: 'destructive',
      });
      return;
    }
    await updatePaymentStatus(selectedRegistration.id, detailPaymentStatus, amount);
  };

  const deleteRegistration = async (registrationId: string) => {
    if (!ensureCanDelete('delete registrations')) return;
    if (!confirm('Delete this registration? This cannot be undone.')) return;
    setActionLoadingId(registrationId);
    try {
      const { error } = await registrationsApi.deleteRegistration(registrationId);
      if (error) throw error;
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      toast({ title: 'Registration deleted' });
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete registration.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const exportCsv = () => {
    const rows = filteredRegistrations.map((r) => [
      r.name,
      r.email,
      r.phone || '',
      r.status,
      r.payment_status || 'not_required',
      (r.amount_paid || 0).toFixed(2),
      new Date(r.registered_at).toISOString(),
    ]);
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Payment Status', 'Amount Paid', 'Registered At'].join(
        ','
      ),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-registrations-${eventId || 'unknown'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registration Manager</h2>
          <p className="text-muted-foreground">
            {eventTitle
              ? `Live registrations for ${eventTitle}`
              : 'Manage capacity, forms, payments, and attendee lists.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={openCreateRegistrationDialog} disabled={authzLoading}>
            <Plus className="h-4 w-4 mr-2" /> Add Registration
          </Button>
          <Button variant="outline" onClick={openFormBuilder} disabled={authzLoading}>
            <Settings className="h-4 w-4 mr-2" /> Form Designer
          </Button>
          <Button variant="outline" onClick={fetchRegistrations} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Total Registrations
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">{stats.total}</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Capacity Used</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">
              {capacityPct !== null ? `${Math.round(capacityPct)}%` : '--'}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {capacity ? `${stats.confirmed}/${capacity}` : `${stats.confirmed} confirmed`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary" style={{ width: `${capacityPct || 0}%` }} />
          </div>
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Pending / Waitlist
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">{stats.waitlist}</span>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-xs text-muted-foreground">{stats.cancelled} cancelled</p>
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Revenue Collected
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">GHS {stats.revenue.toFixed(2)}</span>
            <PieChart className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground">{stats.paid} paid registrations</p>
        </Card>
      </div>

      <Card className="flex-1 border p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={view === 'registrants' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('registrants')}
              className={view === 'registrants' ? 'bg-white shadow-sm' : ''}
            >
              <Users className="h-4 w-4 mr-2" /> Registrants
            </Button>
            <Button
              variant={view === 'reports' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('reports')}
              className={view === 'reports' ? 'bg-white shadow-sm' : ''}
            >
              <FileText className="h-4 w-4 mr-2" /> Reports
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 bg-muted/30"
            />
            {view === 'registrants' && (
              <>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as 'all' | RegistrationStatus)}
                >
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={paymentFilter}
                  onValueChange={(value) =>
                    setPaymentFilter(value as 'all' | RegistrationPaymentStatus)
                  }
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not_required">Not required</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={filteredRegistrations.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        {view === 'registrants' ? (
          <>
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider rounded-t-lg">
              <div className="col-span-4">Name / Contact</div>
              <div className="col-span-2">Registration</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No registrations found.
                </div>
              ) : (
                filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 border-b hover:bg-muted/50 transition-colors items-center text-sm"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {reg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{reg.name}</span>
                        <span className="text-[10px] text-muted-foreground">{reg.email}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="secondary" className="font-normal text-xs">
                        {reg.member_id ? 'Member' : 'Guest'}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {reg.status === 'confirmed' ? (
                        <span className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
                        </span>
                      ) : reg.status === 'waitlist' ? (
                        <span className="flex items-center text-orange-600 text-xs font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                          <AlertCircle className="h-3 w-3 mr-1" /> Waitlist
                        </span>
                      ) : (
                        <span className="flex items-center text-rose-600 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          <AlertCircle className="h-3 w-3 mr-1" /> Cancelled
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-muted-foreground text-xs">
                      <div>{reg.payment_status || 'not_required'}</div>
                      <div>GHS {(reg.amount_paid || 0).toFixed(2)}</div>
                    </div>
                    <div className="col-span-2 text-right flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8"
                            disabled={actionLoadingId === reg.id}
                          >
                            {actionLoadingId === reg.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRegistrationDetails(reg)}>
                            <Eye className="mr-2 h-4 w-4" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateStatus(reg.id, 'confirmed')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Mark
                            Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(reg.id, 'waitlist')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <Clock className="mr-2 h-4 w-4 text-amber-600" /> Move to Waitlist
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(reg.id, 'cancelled')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <AlertCircle className="mr-2 h-4 w-4 text-rose-600" /> Cancel
                            Registration
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updatePaymentStatus(reg.id, 'paid')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-emerald-600" /> Mark Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updatePaymentStatus(reg.id, 'partially_paid')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-amber-600" /> Mark Partially
                            Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updatePaymentStatus(reg.id, 'pending')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-blue-600" /> Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updatePaymentStatus(reg.id, 'refunded')}
                            disabled={authzLoading || !canManageRegistrations}
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-violet-600" /> Mark Refunded
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteRegistration(reg.id)}
                            disabled={authzLoading || !canDeleteRegistrations}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Status Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Confirmed</span>
                  <span className="font-semibold">{stats.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waitlist</span>
                  <span className="font-semibold">{stats.waitlist}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled</span>
                  <span className="font-semibold">{stats.cancelled}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion</span>
                  <span className="font-semibold">
                    {stats.total === 0
                      ? '0%'
                      : `${Math.round((stats.confirmed / stats.total) * 100)}%`}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-semibold">GHS {stats.revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Registrations</span>
                  <span className="font-semibold">{stats.paid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments</span>
                  <span className="font-semibold">
                    {registrations.filter((r) => r.payment_status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Partially Paid</span>
                  <span className="font-semibold">
                    {registrations.filter((r) => r.payment_status === 'partially_paid').length}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Top Email Domains</h3>
              <div className="space-y-2 text-sm">
                {reportSlices.topDomains.length === 0 ? (
                  <p className="text-muted-foreground text-xs">No data yet.</p>
                ) : (
                  reportSlices.topDomains.map(([domain, count]) => (
                    <div key={domain} className="flex justify-between">
                      <span className="truncate">{domain}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
            <Card className="p-4 lg:col-span-3">
              <h3 className="text-sm font-semibold mb-3">Recent Registrations</h3>
              <div className="divide-y">
                {reportSlices.recent.length === 0 ? (
                  <p className="text-muted-foreground text-xs py-2">No recent registrations.</p>
                ) : (
                  reportSlices.recent.map((reg) => (
                    <div key={reg.id} className="py-2 flex justify-between gap-3 text-sm">
                      <div>
                        <div className="font-medium">{reg.name}</div>
                        <div className="text-xs text-muted-foreground">{reg.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium">{reg.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(reg.registered_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Registration</DialogTitle>
            <DialogDescription>
              Add a guest or member registration manually for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-name">Name</Label>
              <Input
                id="manual-name"
                value={manualForm.name}
                onChange={(e) => setManualForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-email">Email</Label>
              <Input
                id="manual-email"
                type="email"
                value={manualForm.email}
                onChange={(e) => setManualForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-phone">Phone</Label>
              <Input
                id="manual-phone"
                value={manualForm.phone}
                onChange={(e) => setManualForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+233..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={manualForm.status}
                  onValueChange={(value) =>
                    setManualForm((prev) => ({ ...prev, status: value as RegistrationStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={manualForm.payment_status}
                  onValueChange={(value) =>
                    setManualForm((prev) => ({
                      ...prev,
                      payment_status: value as RegistrationPaymentStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_required">Not required</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-amount">Amount Paid (GHS)</Label>
              <Input
                id="manual-amount"
                type="number"
                min={0}
                step="0.01"
                value={manualForm.amount_paid}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, amount_paid: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creatingRegistration}
              >
                Cancel
              </Button>
              <Button onClick={createManualRegistration} disabled={creatingRegistration}>
                {creatingRegistration && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Registration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Review attendee details and update payment for this registration.
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Name</p>
                  <p className="font-medium">{selectedRegistration.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Email</p>
                  <p className="font-medium break-all">{selectedRegistration.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Phone</p>
                  <p className="font-medium">{selectedRegistration.phone || '--'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Type</p>
                  <p className="font-medium">
                    {selectedRegistration.member_id ? 'Member' : 'Guest'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Status</p>
                  <p className="font-medium">{selectedRegistration.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Registered</p>
                  <p className="font-medium">
                    {new Date(selectedRegistration.registered_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    value={detailPaymentStatus}
                    onValueChange={(value) =>
                      setDetailPaymentStatus(value as RegistrationPaymentStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_required">Not required</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partially_paid">Partially paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount Paid (GHS)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={detailAmountPaid}
                    onChange={(e) => setDetailAmountPaid(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={saveDetailsPayment}
                  disabled={authzLoading || !canManageRegistrations}
                >
                  Save Payment
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/20">
            <DialogTitle>Form Designer</DialogTitle>
            <DialogDescription>
              Configure registration form fields for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 bg-background overflow-hidden">
            <FormBuilder eventId={eventId} eventTitle={eventTitle} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
