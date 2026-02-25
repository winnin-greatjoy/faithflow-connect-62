import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users2,
  Clock,
  Download,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMembers } from '@/modules/members/hooks/useMembers';
import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';
import { useAssignVolunteer, useCreateShift, useEventShifts } from '@/hooks/useEventModules';

type ShiftWithAssignments = {
  id: string;
  event_id: string;
  role: string;
  department: string | null;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  notes: string | null;
  assignments?: Array<{
    id: string;
    member_id: string;
    status: 'confirmed' | 'pending' | 'declined';
    member?: { id: string; full_name: string; avatar_url?: string | null } | null;
  }>;
};

const toTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

const shiftStatus = (assignedCount: number, requiredCount: number) => {
  if (assignedCount >= requiredCount) return 'confirmed';
  if (assignedCount === 0) return 'pending';
  return 'urgent';
};

const buildIsoFromTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return d.toISOString();
};

export const RosterManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { selectedBranchId } = useAdminContext();
  const { hasRole, can, loading: authzLoading } = useAuthz();

  const [activeTab, setActiveTab] = useState<'schedule' | 'directory'>('schedule');
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState('');

  const { data: shiftsData = [], isLoading: shiftsLoading } = useEventShifts(eventId || '');
  const createShift = useCreateShift(eventId || '');
  const assignVolunteer = useAssignVolunteer(eventId || '');
  const canManageRoster = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageRoster;

  const { members, loading: membersLoading } = useMembers({
    search: staffSearch,
    branchFilter: selectedBranchId || 'all',
  });

  const shifts = useMemo(() => (shiftsData || []) as ShiftWithAssignments[], [shiftsData]);

  const selectedShift = useMemo(
    () => shifts.find((s) => s.id === selectedShiftId) || null,
    [shifts, selectedShiftId]
  );

  const selectedAssignedIds = useMemo(
    () => new Set((selectedShift?.assignments || []).map((a) => a.member_id)),
    [selectedShift]
  );

  const availableStaff = useMemo(
    () =>
      members.filter((m) => m.status === 'active').filter((m) => !selectedAssignedIds.has(m.id)),
    [members, selectedAssignedIds]
  );

  const totalRequired = shifts.reduce((acc, shift) => acc + (shift.max_volunteers || 0), 0);
  const totalFilled = shifts.reduce((acc, shift) => acc + (shift.assignments?.length || 0), 0);
  const coverage = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;

  const gaps = useMemo(
    () =>
      shifts.filter((s) => {
        const assigned = s.assignments?.length || 0;
        return assigned < (s.max_volunteers || 0);
      }),
    [shifts]
  );

  const exportScheduleCsv = () => {
    const rows = shifts.map((s) => [
      s.role,
      s.notes || `${s.role} Shift`,
      toTime(s.start_time),
      toTime(s.end_time),
      s.department || '',
      String(s.max_volunteers || 0),
      String(s.assignments?.length || 0),
    ]);
    const csv = [
      ['Role', 'Shift Name', 'Start', 'End', 'Location', 'Required', 'Assigned'].join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-roster-${eventId || 'unknown'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddShift = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (actionsDisabled) {
      toast.error('You do not have permission to create shifts.');
      return;
    }
    if (!eventId) return;
    const formData = new FormData(event.currentTarget);
    try {
      await createShift.mutateAsync({
        event_id: eventId,
        role: String(formData.get('role') || 'General'),
        department: String(formData.get('location') || ''),
        start_time: buildIsoFromTime(String(formData.get('startTime') || '09:00')),
        end_time: buildIsoFromTime(String(formData.get('endTime') || '11:00')),
        max_volunteers: Number(formData.get('requiredCount') || 1),
        notes: String(formData.get('name') || ''),
      });
      setIsAddShiftOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStaff = async (memberId: string) => {
    if (actionsDisabled) {
      toast.error('You do not have permission to assign staff.');
      return;
    }
    if (!selectedShiftId) return;
    try {
      await assignVolunteer.mutateAsync({ shiftId: selectedShiftId, memberId });
      setSelectedShiftId(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not assign volunteer');
    }
  };

  const openAssignDialog = (shiftId: string) => {
    if (actionsDisabled) {
      toast.error('You do not have permission to manage assignments.');
      return false;
    }
    setSelectedShiftId(shiftId);
    return true;
  };

  const ScheduleView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Dialog open={!!selectedShiftId} onOpenChange={(open) => !open && setSelectedShiftId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                className="pl-9"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {membersLoading ? (
                  <div className="py-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : availableStaff.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3">No available staff found.</div>
                ) : (
                  availableStaff.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handleAssignStaff(member.id)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{member.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {member.ministry || 'Member'}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={assignVolunteer.isPending || actionsDisabled}
                      >
                        Assign
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {shiftsLoading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-4">
            {shifts.length === 0 ? (
              <Card className="p-10 rounded-[24px] border border-dashed border-primary/20 text-center text-muted-foreground">
                No shifts yet. Create one to start staffing.
              </Card>
            ) : (
              shifts.map((shift) => {
                const assignedCount = shift.assignments?.length || 0;
                const requiredCount = shift.max_volunteers || 0;
                const status = shiftStatus(assignedCount, requiredCount);
                const name = shift.notes || `${shift.role} Shift`;
                return (
                  <Card
                    key={shift.id}
                    className="p-6 rounded-[28px] border border-primary/5 bg-white shadow-xl shadow-primary/5 hover:border-primary/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div
                          className={cn(
                            'h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner',
                            shift.role.toLowerCase().includes('security')
                              ? 'bg-blue-50 text-blue-600'
                              : shift.role.toLowerCase().includes('medical')
                                ? 'bg-red-50 text-red-600'
                                : 'bg-primary/5 text-primary'
                          )}
                        >
                          {shift.role.toLowerCase().includes('security') ? (
                            <Shield className="h-7 w-7" />
                          ) : shift.role.toLowerCase().includes('medical') ? (
                            <AlertCircle className="h-7 w-7" />
                          ) : (
                            <Users2 className="h-7 w-7" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-lg font-serif font-black">{name}</h5>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              <Clock className="h-3 w-3" /> {toTime(shift.start_time)} -{' '}
                              {toTime(shift.end_time)}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              <MapPin className="h-3 w-3" /> {shift.department || 'TBA'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                          {(shift.assignments || []).map((a) => (
                            <div
                              key={a.id}
                              className="h-10 w-10 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs font-black text-primary"
                              title={a.member?.full_name || 'Assigned'}
                            >
                              {(a.member?.full_name || 'A').charAt(0)}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, requiredCount - assignedCount) }).map(
                            (_, i) => (
                              <div
                                key={i}
                                onClick={() => openAssignDialog(shift.id)}
                                className={cn(
                                  'h-10 w-10 rounded-full border-2 border-white bg-muted/30 border-dashed border-muted-foreground/30 flex items-center justify-center transition-all',
                                  actionsDisabled
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer hover:bg-muted/50 hover:border-primary/30'
                                )}
                              >
                                <Plus className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'h-8 rounded-full px-4 border-none text-[9px] font-black uppercase tracking-widest',
                              status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : status === 'urgent'
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'bg-amber-500/10 text-amber-600'
                            )}
                          >
                            {status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-[10px] font-bold uppercase tracking-widest"
                            onClick={() => openAssignDialog(shift.id)}
                            disabled={actionsDisabled}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5">
              <h5 className="font-serif font-black mb-6">Staffing Gaps</h5>
              {gaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2 opacity-50" />
                  <p className="text-sm font-bold text-emerald-700">All shifts covered!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gaps.map((gap) => {
                    const assigned = gap.assignments?.length || 0;
                    const needed = Math.max(0, (gap.max_volunteers || 0) - assigned);
                    return (
                      <div key={gap.id} className="p-4 rounded-2xl bg-red-50 border border-red-100">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-bold text-red-900">{gap.role} Team</span>
                        </div>
                        <p className="text-xs text-red-700 leading-snug">
                          Short {needed} members for {gap.notes || `${gap.role} Shift`}.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => openAssignDialog(gap.id)}
                          disabled={actionsDisabled}
                          className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border-none"
                        >
                          Fill Slot
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-serif font-black">Coverage</h5>
                <span
                  className={`text-2xl font-black ${coverage >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {coverage}%
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${coverage >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(coverage, 100)}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 text-center">
                {totalFilled} / {totalRequired} Positions Filled
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const DirectoryView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-primary/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search volunteers by name, role, or skills..."
            className="pl-9 bg-muted/30 border-none rounded-xl"
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
          />
        </div>
      </div>

      {membersLoading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((staffMember) => (
            <Card
              key={staffMember.id}
              className="p-6 rounded-[24px] border border-primary/5 bg-white hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary text-lg">
                    {staffMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-lg">{staffMember.fullName}</h5>
                    <Badge
                      variant="secondary"
                      className="mt-1 text-[9px] font-black uppercase tracking-widest border-none px-2 h-5"
                    >
                      {staffMember.membershipLevel || 'member'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 opacity-60" />
                  <span className="text-xs font-medium">{staffMember.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 opacity-60" />
                  <span className="text-xs font-medium">{staffMember.phone || 'No phone'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-primary/5 hover:bg-primary/10 text-primary border-none rounded-xl font-bold text-[10px] uppercase tracking-widest h-9">
                  View Profile
                </Button>
                <Button
                  className="flex-1 bg-primary text-white border-none rounded-xl font-bold text-[10px] uppercase tracking-widest h-9"
                  onClick={() => {
                    if (shifts.length === 0) {
                      toast.info('Create a shift first, then assign staff.');
                      return;
                    }
                    const opened = openAssignDialog(shifts[0].id);
                    if (!opened) return;
                    toast.info('Select staff assignment in the shift dialog.');
                  }}
                  disabled={actionsDisabled}
                >
                  Assign Shift
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-3xl font-serif font-black tracking-tight text-primary">
            Roster Manager
          </h4>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-1">
            Staffing & Volunteer Coordination
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-muted/30 p-1 rounded-xl mr-4">
            {(['schedule', 'directory'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
            className="rounded-xl border-primary/10 font-bold text-xs h-10"
            onClick={exportScheduleCsv}
            disabled={shifts.length === 0}
          >
            <Download className="h-4 w-4 mr-2" /> Export Schedule
          </Button>

          <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-primary/20"
                disabled={actionsDisabled}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddShift} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Shift Name</Label>
                  <Input name="name" required placeholder="e.g. Main Entrance Security" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Role Required</Label>
                    <Input name="role" required placeholder="e.g. Security" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <Input name="location" required placeholder="e.g. Gate A" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input name="startTime" type="time" required defaultValue="09:00" />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input name="endTime" type="time" required defaultValue="11:00" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Required Staff Count</Label>
                  <Input name="requiredCount" type="number" min="1" defaultValue="1" />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createShift.isPending || actionsDisabled}
                >
                  {createShift.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Shift
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'directory' && <DirectoryView />}
      </div>
    </div>
  );
};
