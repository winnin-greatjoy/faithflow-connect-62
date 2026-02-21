import React, { useState } from 'react';
import {
  Heart,
  Activity,
  ShieldAlert,
  UserCheck,
  Bell,
  Clock,
  MoreHorizontal,
  Search,
  Filter,
  QrCode,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ChildCheckIn } from '@/modules/events/types/safety';

// Mock Data
const MOCK_CHECKINS: ChildCheckIn[] = [
  {
    id: 'c1',
    childName: 'Elias Mensah',
    age: 4,
    parentName: 'Abena M.',
    parentPhone: '055-123-4567',
    pickupCode: '8291',
    allergies: ['Peanuts'],
    status: 'checked_in',
    location: 'Nursery A',
    checkInTime: '09:15 AM',
  },
  {
    id: 'c2',
    childName: 'Kofi Owusu',
    age: 6,
    parentName: 'Isaac O.',
    parentPhone: '024-987-6543',
    pickupCode: '1102',
    status: 'checked_out',
    location: 'Kings Kids',
    checkInTime: '09:00 AM',
    checkOutTime: '11:45 AM',
  },
  {
    id: 'c3',
    childName: 'Sarah Wilson',
    age: 3,
    parentName: 'James W.',
    parentPhone: '020-555-1212',
    pickupCode: '0098',
    specialNeeds: 'Sensitive to loud noise',
    status: 'checked_in',
    location: 'Creche',
    checkInTime: '09:30 AM',
  },
  {
    id: 'c4',
    childName: 'Alice Boateng',
    age: 5,
    parentName: 'Rose B.',
    parentPhone: '050-444-3322',
    pickupCode: '7741',
    status: 'checked_in',
    location: 'Nursery B',
    checkInTime: '09:10 AM',
  },
];

export const ChildSafetyManagerModule = () => {
  const [activeTab, setActiveTab] = useState('active');

  const ActiveListView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            placeholder="Search child by name, parent, or code..."
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
          <Button className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest">
            New Check-In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CHECKINS.filter((c) => c.status === 'checked_in').map((checkin, i) => (
          <Card
            key={i}
            className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5 group hover:shadow-primary/10 transition-all relative overflow-hidden"
          >
            {(checkin.allergies || checkin.specialNeeds) && (
              <div className="absolute top-0 right-0 p-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary text-lg">
                {checkin.childName.charAt(0)}
              </div>
              <div>
                <h5 className="font-black text-foreground text-lg leading-none">
                  {checkin.childName}
                </h5>
                <p className="text-xs font-bold text-muted-foreground mt-1">
                  Age: {checkin.age} • {checkin.location}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest bg-muted/30 p-2 rounded-lg">
                <span className="font-bold text-muted-foreground">Pickup Code</span>
                <span className="font-black text-primary bg-white px-2 py-0.5 rounded shadow-sm">
                  {checkin.pickupCode}
                </span>
              </div>

              {checkin.allergies && checkin.allergies.length > 0 && (
                <Badge
                  variant="destructive"
                  className="w-full justify-center text-[9px] uppercase tracking-widest font-black"
                >
                  Allergy: {checkin.allergies.join(', ')}
                </Badge>
              )}

              {checkin.specialNeeds && (
                <Badge
                  variant="secondary"
                  className="w-full justify-center text-[9px] uppercase tracking-widest font-black text-amber-600 bg-amber-50"
                >
                  Needs: {checkin.specialNeeds}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-primary/5 pt-4">
              <div className="text-[10px] font-bold text-muted-foreground">
                <span className="opacity-60">Parent: </span>
                <span className="text-foreground">{checkin.parentName}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Child Safety
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Guardian Check-in & Security
          </p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {['active', 'history', 'kiosk-mode'].map((tab) => (
            <button
              key={tab}
              onClick={() => tab !== 'kiosk-mode' && setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary',
                tab === 'kiosk-mode' && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab === 'kiosk-mode' ? (
                <span className="flex items-center gap-1">
                  <QrCode className="h-3 w-3" /> Kiosk
                </span>
              ) : (
                tab
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-primary text-white rounded-[28px] border-none shadow-xl shadow-primary/20">
          <div className="flex items-center gap-3 mb-2 opacity-80">
            <Activity className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Checked In</span>
          </div>
          <h3 className="text-4xl font-black mb-1">128</h3>
          <p className="text-xs font-medium opacity-60">85% Capacity</p>
        </Card>

        <Card className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-2 text-amber-500">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Medical Flags</span>
          </div>
          <h3 className="text-4xl font-black text-foreground mb-1">05</h3>
          <p className="text-xs font-medium text-muted-foreground opacity-60">Requires attention</p>
        </Card>

        <Card className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Bell className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pickup Queue</span>
          </div>
          <h3 className="text-4xl font-black text-foreground mb-1">12</h3>
          <p className="text-xs font-medium text-muted-foreground opacity-60">Parents waiting</p>
        </Card>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'active' && <ActiveListView />}
        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <Clock className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Recent check-out history</p>
          </div>
        )}
      </div>
    </div>
  );
};
