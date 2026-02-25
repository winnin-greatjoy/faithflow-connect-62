import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormBuilder } from '@/modules/events/components/registration/FormBuilder';
import registrationsApi, { EventRegistration } from '@/services/registrationsApi';
import { useToast } from '@/hooks/use-toast';
import { useAuthz } from '@/hooks/useAuthz';

interface RegistrationManagerModuleProps {
  eventId?: string | null;
  eventTitle?: string;
  capacity?: number | null;
}

export const RegistrationManagerModule: React.FC<RegistrationManagerModuleProps> = ({
  eventId,
  eventTitle,
  capacity,
}) => {
  const { toast } = useToast();
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const [view, setView] = useState<'registrants' | 'reports'>('registrants');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
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
    if (!q) return registrations;
    return registrations.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [registrations, searchTerm]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
    const pending = registrations.filter((r) => r.status === 'waitlist').length;
    const cancelled = registrations.filter((r) => r.status === 'cancelled').length;
    const revenue = registrations.reduce((sum, r) => sum + (r.amount_paid || 0), 0);
    return { total, confirmed, pending, cancelled, revenue };
  }, [registrations]);

  const capacityPct = capacity ? Math.min((stats.confirmed / capacity) * 100, 100) : null;

  const updateStatus = async (
    registrationId: string,
    status: 'confirmed' | 'cancelled' | 'waitlist'
  ) => {
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
      r.payment_status,
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
              : 'Manage capacity, forms, and attendee lists.'}
          </p>
        </div>
        <div className="flex gap-3">
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
            <span className="text-3xl font-black">{stats.pending}</span>
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
            <input
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 rounded-md border text-sm px-3 bg-muted/30 focus:bg-white transition-colors"
            />
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
                      <div>{reg.payment_status}</div>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />{' '}
                            {new Date(reg.registered_at).toLocaleString()}
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
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <FileText className="h-16 w-16 opacity-20 mb-2" />
            <h3 className="text-lg font-semibold">Live Summary</h3>
            <p className="text-sm opacity-70">Confirmed: {stats.confirmed}</p>
            <p className="text-sm opacity-70">Waitlist: {stats.pending}</p>
            <p className="text-sm opacity-70">Cancelled: {stats.cancelled}</p>
            <p className="text-sm opacity-70">Revenue: GHS {stats.revenue.toFixed(2)}</p>
          </div>
        )}
      </Card>

      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/20">
            <DialogTitle>Form Designer</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-background overflow-hidden">
            <FormBuilder />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
