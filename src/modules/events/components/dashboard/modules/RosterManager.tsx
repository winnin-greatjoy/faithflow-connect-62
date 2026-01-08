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

  const ScheduleView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-4">
          {MOCK_SHIFTS.map((shift) => (
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
                        title={MOCK_STAFF.find((u) => u.id === id)?.name}
                      >
                        {MOCK_STAFF.find((u) => u.id === id)?.name.charAt(0)}
                      </div>
                    ))}
                    {Array.from({ length: shift.requiredCount - shift.assignedIds.length }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="h-10 w-10 rounded-full border-2 border-white bg-muted/30 border-dashed border-muted-foreground/30 flex items-center justify-center"
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
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-bold text-red-900">Ushering Team</span>
                </div>
                <p className="text-xs text-red-700 leading-snug">
                  Short 7 members for Auditorium Seating shift (9am).
                </p>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border-none"
                >
                  Request Backup
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-serif font-black">Coverage</h5>
              <span className="text-2xl font-black text-emerald-600">85%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[85%]" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 text-center">
              32 / 45 Positions Filled
            </p>
          </Card>
        </div>
      </div>
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
          />
        </div>
        <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest">
          <Plus className="h-4 w-4 mr-2" /> Add Volunteer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_STAFF.map((staff) => (
          <Card
            key={staff.id}
            className="p-6 rounded-[24px] border border-primary/5 bg-white hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary text-lg">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-lg">{staff.name}</h5>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[9px] font-black uppercase tracking-widest border-none px-2 h-5"
                  >
                    {staff.role}
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
                <span className="text-xs font-medium">{staff.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 opacity-60" />
                <span className="text-xs font-medium">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 opacity-60" />
                <span className="text-xs font-medium">{staff.availability.join(', ')}</span>
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
          <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Add Shift
          </Button>
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
