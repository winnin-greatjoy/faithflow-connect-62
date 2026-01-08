import React, { useState } from 'react';
import {
  Users2,
  Calendar,
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
import { Shift, StaffProfile } from '@/modules/events/types/roster';

// Mock Data
const MOCK_STAFF: StaffProfile[] = [
  {
    id: 'u1',
    name: 'John Doe',
    role: 'Security',
    email: 'john@example.com',
    phone: '+1234567890',
    availability: ['Morning'],
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    role: 'Usher',
    email: 'jane@example.com',
    phone: '+1234567891',
    availability: ['Evening'],
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Mike Johnson',
    role: 'Technical',
    email: 'mike@example.com',
    phone: '+1234567892',
    availability: ['All Day'],
    status: 'active',
  },
  {
    id: 'u4',
    name: 'Sarah Wilson',
    role: 'Medical',
    email: 'sarah@example.com',
    phone: '+1234567893',
    availability: ['Morning'],
    status: 'active',
  },
  {
    id: 'u5',
    name: 'Tom Brown',
    role: 'Parking',
    email: 'tom@example.com',
    phone: '+1234567894',
    availability: ['Evening'],
    status: 'inactive',
  },
];

const MOCK_SHIFTS: Shift[] = [
  {
    id: 'sh1',
    eventId: 'e1',
    role: 'Security',
    name: 'Main Entrance Guard',
    startTime: '08:00',
    endTime: '12:00',
    requiredCount: 4,
    assignedIds: ['u1'],
    location: 'Gate A',
    status: 'confirmed',
  },
  {
    id: 'sh2',
    eventId: 'e1',
    role: 'Usher',
    name: 'Auditorium Seating',
    startTime: '09:00',
    endTime: '13:00',
    requiredCount: 8,
    assignedIds: ['u2'],
    location: 'Main Hall',
    status: 'urgent',
  },
  {
    id: 'sh3',
    eventId: 'e1',
    role: 'Technical',
    name: 'Sound Desk',
    startTime: '08:30',
    endTime: '13:30',
    requiredCount: 3,
    assignedIds: ['u3'],
    location: 'Control Booth',
    status: 'confirmed',
  },
  {
    id: 'sh4',
    eventId: 'e1',
    role: 'Medical',
    name: 'First Aid Station',
    startTime: '08:00',
    endTime: '14:00',
    requiredCount: 2,
    assignedIds: ['u4'],
    location: 'Lobby',
    status: 'pending',
  },
];

export const RosterManagerModule = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  /* State */
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [staff, setStaff] = useState<StaffProfile[]>(MOCK_STAFF);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);

  const handleAddShift = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newShift: Shift = {
      id: `sh${Date.now()}`,
      eventId: 'e1',
      name: formData.get('name') as string,
      role: formData.get('role') as any,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      location: formData.get('location') as string,
      requiredCount: parseInt(formData.get('requiredCount') as string) || 1,
      assignedIds: [],
      status: 'pending',
    };
    setShifts([...shifts, newShift]);
    setIsAddShiftOpen(false);
    toast.success('New shift created');
  };

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const handleAssignStaff = (staffId: string) => {
    if (!selectedShiftId) return;

    setShifts(
      shifts.map((shift) => {
        if (shift.id === selectedShiftId) {
          return {
            ...shift,
            assignedIds: [...shift.assignedIds, staffId],
            // Update status if fully staffed
            status:
              shift.assignedIds.length + 1 >= shift.requiredCount ? 'confirmed' : shift.status,
          };
        }
        return shift;
      })
    );

    setSelectedShiftId(null);
    toast.success('Staff assigned to shift');
  };

  const availableStaff = staff.filter((s) => s.status === 'active');

  /* Stats Calculation */
  const totalRequired = shifts.reduce((acc, shift) => acc + shift.requiredCount, 0);
  const totalFilled = shifts.reduce((acc, shift) => acc + shift.assignedIds.length, 0);
  const coverage = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;

  const gaps = shifts.filter((s) => s.assignedIds.length < s.requiredCount);

  const ScheduleView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Assignment Dialog */}
      <Dialog open={!!selectedShiftId} onOpenChange={(open) => !open && setSelectedShiftId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search staff..." className="pl-9" />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {availableStaff.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleAssignStaff(member.id)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-4">
          {shifts.map((shift) => (
            <Card
              key={shift.id}
              className="p-6 rounded-[28px] border border-primary/5 bg-white shadow-xl shadow-primary/5 hover:border-primary/20 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      'h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner',
                      shift.role === 'Security'
                        ? 'bg-blue-50 text-blue-600'
                        : shift.role === 'Medical'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-primary/5 text-primary'
                    )}
                  >
                    {shift.role === 'Security' ? (
                      <Shield className="h-7 w-7" />
                    ) : shift.role === 'Medical' ? (
                      <AlertCircle className="h-7 w-7" />
                    ) : (
                      <Users2 className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-lg font-serif font-black">{shift.name}</h5>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Clock className="h-3 w-3" /> {shift.startTime} - {shift.endTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <MapPin className="h-3 w-3" /> {shift.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {shift.assignedIds.map((id) => (
                      <div
                        key={id}
                        className="h-10 w-10 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs font-black text-primary"
                        title={staff.find((u) => u.id === id)?.name}
                      >
                        {staff.find((u) => u.id === id)?.name.charAt(0)}
                      </div>
                    ))}
                    {Array.from({
                      length: Math.max(0, shift.requiredCount - shift.assignedIds.length),
                    }).map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedShiftId(shift.id)}
                        className="h-10 w-10 rounded-full border-2 border-white bg-muted/30 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'h-8 rounded-full px-4 border-none text-[9px] font-black uppercase tracking-widest',
                        shift.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : shift.status === 'urgent'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-amber-500/10 text-amber-600'
                      )}
                    >
                      {shift.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
                {gaps.map((gap) => (
                  <div key={gap.id} className="p-4 rounded-2xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-bold text-red-900">{gap.role} Team</span>
                    </div>
                    <p className="text-xs text-red-700 leading-snug">
                      Short {gap.requiredCount - gap.assignedIds.length} members for {gap.name}.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setSelectedShiftId(gap.id)}
                      className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border-none"
                    >
                      Fill Slot
                    </Button>
                  </div>
                ))}
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
    </div>
  );

  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false);

  const handleAddVolunteer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newVolunteer: StaffProfile = {
      id: `u${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as any,
      availability: ['Flexible'],
      status: 'active',
    };
    setStaff([...staff, newVolunteer]);
    setIsAddVolunteerOpen(false);
    toast.success('Volunteer added to directory');
  };

  const DirectoryView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-primary/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search volunteers by name, role, or skills..."
            className="pl-9 bg-muted/30 border-none rounded-xl"
          />
        </div>

        <Dialog open={isAddVolunteerOpen} onOpenChange={setIsAddVolunteerOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest">
              <Plus className="h-4 w-4 mr-2" /> Add Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Volunteer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVolunteer} className="space-y-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input name="name" required placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" required placeholder="john@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input name="phone" placeholder="+1 234..." />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Primary Role</Label>
                <select
                  name="role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Security">Security</option>
                  <option value="Usher">Usher</option>
                  <option value="Medical">Medical</option>
                  <option value="Technical">Technical</option>
                  <option value="Instrument">Music/Band</option>
                  <option value="Vocal">Vocalist</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Add Volunteer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((staffMember) => (
          <Card
            key={staffMember.id}
            className="p-6 rounded-[24px] border border-primary/5 bg-white hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary text-lg">
                  {staffMember.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-lg">{staffMember.name}</h5>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[9px] font-black uppercase tracking-widest border-none px-2 h-5"
                  >
                    {staffMember.role}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4 opacity-50" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 opacity-60" />
                <span className="text-xs font-medium">{staffMember.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 opacity-60" />
                <span className="text-xs font-medium">{staffMember.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 opacity-60" />
                <span className="text-xs font-medium">{staffMember.availability.join(', ')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-primary/5 hover:bg-primary/10 text-primary border-none rounded-xl font-bold text-[10px] uppercase tracking-widest h-9">
                View Profile
              </Button>
              <Button className="flex-1 bg-primary text-white border-none rounded-xl font-bold text-[10px] uppercase tracking-widest h-9">
                Assign Shift
              </Button>
            </div>
          </Card>
        ))}
      </div>
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
            {['schedule', 'directory'].map((tab) => (
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
          <Button variant="outline" className="rounded-xl border-primary/10 font-bold text-xs h-10">
            <Download className="h-4 w-4 mr-2" /> Export Schedule
          </Button>

          <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-primary/20">
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
                    <select
                      name="role"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Security">Security</option>
                      <option value="Usher">Usher</option>
                      <option value="Medical">Medical</option>
                      <option value="Technical">Technical</option>
                      <option value="Parking">Parking</option>
                    </select>
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
                <Button type="submit" className="w-full">
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

// Utility
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
