import React, { useMemo, useState } from 'react';
import { Activity, ShieldAlert, Bell, Search, Filter, QrCode } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChildCheckIn } from '@/modules/events/types/safety';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

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
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('active');
  const [checkIns, setCheckIns] = useState<ChildCheckIn[]>(MOCK_CHECKINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    parentName: '',
    parentPhone: '',
    location: '',
    allergies: '',
    specialNeeds: '',
  });
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageChildSafety = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageChildSafety || !hasEventContext;

  const ensureActionAllowed = (deniedMessage: string) => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Child Safety from an event dashboard.');
      return false;
    }
    if (actionsDisabled) {
      toast.error(deniedMessage);
      return false;
    }
    return true;
  };

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const generatePickupCode = () => String(Math.floor(1000 + Math.random() * 9000));

  const resetForm = () => {
    setFormData({
      childName: '',
      age: '',
      parentName: '',
      parentPhone: '',
      location: '',
      allergies: '',
      specialNeeds: '',
    });
  };

  const handleNewCheckIn = () => {
    if (!ensureActionAllowed('You do not have permission to create child check-ins.')) {
      return;
    }
    setShowCheckInDialog(true);
  };

  const handleCreateCheckIn = () => {
    if (!ensureActionAllowed('You do not have permission to create child check-ins.')) {
      return;
    }

    if (!formData.childName || !formData.age || !formData.parentName || !formData.parentPhone) {
      toast.error('Child name, age, parent name, and parent phone are required.');
      return;
    }

    const pickupCode = generatePickupCode();
    const allergies = formData.allergies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const newCheckIn: ChildCheckIn = {
      id: `checkin-${Date.now()}`,
      childName: formData.childName.trim(),
      age: Number(formData.age),
      parentName: formData.parentName.trim(),
      parentPhone: formData.parentPhone.trim(),
      pickupCode,
      allergies: allergies.length > 0 ? allergies : undefined,
      specialNeeds: formData.specialNeeds.trim() || undefined,
      status: 'checked_in',
      location: formData.location.trim() || 'Nursery A',
      checkInTime: formatTime(),
    };

    setCheckIns((prev) => [newCheckIn, ...prev]);
    setShowCheckInDialog(false);
    resetForm();
    toast.success('Child checked in successfully', {
      description: `Pickup code: ${pickupCode}`,
    });
  };

  const handleCheckOut = (checkIn: ChildCheckIn) => {
    if (!ensureActionAllowed('You do not have permission to complete child check-outs.')) {
      return;
    }

    const enteredCode = window.prompt(`Enter pickup code for ${checkIn.childName}`);
    if (!enteredCode) return;

    if (enteredCode.trim() !== checkIn.pickupCode) {
      toast.error('Pickup code does not match. Check-out blocked.');
      return;
    }

    setCheckIns((prev) =>
      prev.map((item) =>
        item.id === checkIn.id
          ? {
              ...item,
              status: 'checked_out',
              checkOutTime: formatTime(),
            }
          : item
      )
    );

    toast.success(`${checkIn.childName} checked out safely.`);
  };

  const filteredCheckIns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return checkIns;

    return checkIns.filter((checkIn) =>
      [
        checkIn.childName,
        checkIn.parentName,
        checkIn.parentPhone,
        checkIn.pickupCode,
        checkIn.location,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [checkIns, searchQuery]);

  const activeCheckIns = filteredCheckIns.filter((checkIn) => checkIn.status === 'checked_in');
  const historyCheckIns = filteredCheckIns.filter((checkIn) => checkIn.status === 'checked_out');
  const checkedInCount = checkIns.filter((checkIn) => checkIn.status === 'checked_in').length;
  const medicalFlagsCount = checkIns.filter(
    (checkIn) =>
      checkIn.status === 'checked_in' &&
      ((checkIn.allergies && checkIn.allergies.length > 0) || Boolean(checkIn.specialNeeds))
  ).length;
  const completedPickupsCount = checkIns.filter(
    (checkIn) => checkIn.status === 'checked_out'
  ).length;

  const ActiveListView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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
          <Button
            onClick={handleNewCheckIn}
            disabled={actionsDisabled}
            className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest"
          >
            New Check-In
          </Button>
        </div>
      </div>

      {activeCheckIns.length === 0 ? (
        <Card className="p-10 rounded-[28px] border-primary/10 bg-white text-center shadow-sm">
          <p className="font-bold text-muted-foreground">No active child check-ins found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCheckIns.map((checkin) => (
            <Card
              key={checkin.id}
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
                    Age: {checkin.age} - {checkin.location}
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

              <div className="flex items-center justify-between border-t border-primary/5 pt-4 gap-3">
                <div className="text-[10px] font-bold text-muted-foreground">
                  <span className="opacity-60">Parent: </span>
                  <span className="text-foreground">{checkin.parentName}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCheckOut(checkin)}
                  disabled={actionsDisabled}
                  className="h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest"
                >
                  Check Out
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const HistoryListView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search checkout history..."
          className="pl-12 h-12 rounded-2xl border-primary/5 bg-white shadow-sm font-medium"
        />
      </div>

      {historyCheckIns.length === 0 ? (
        <Card className="p-10 rounded-[28px] border-primary/10 bg-white text-center shadow-sm">
          <p className="font-bold text-muted-foreground">No completed check-outs found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {historyCheckIns.map((checkin) => (
            <Card
              key={checkin.id}
              className="p-4 bg-white rounded-2xl border border-primary/5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-black text-foreground">{checkin.childName}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  Parent: {checkin.parentName} - Pickup Code: {checkin.pickupCode}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Badge variant="outline" className="font-black">
                  Checked In: {checkin.checkInTime}
                </Badge>
                <Badge variant="outline" className="font-black">
                  Checked Out: {checkin.checkOutTime || '-'}
                </Badge>
              </div>
            </Card>
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
            Child Safety
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Guardian Check-in & Security
          </p>
        </div>
        <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
          {['active', 'history', 'kiosk-mode'].map((tab) => (
            <button
              key={tab}
              onClick={() => tab !== 'kiosk-mode' && hasEventContext && setActiveTab(tab)}
              disabled={!hasEventContext || tab === 'kiosk-mode'}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary',
                (!hasEventContext || tab === 'kiosk-mode') && 'opacity-50 cursor-not-allowed'
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
          <h3 className="text-4xl font-black mb-1">{checkedInCount}</h3>
          <p className="text-xs font-medium opacity-60">Currently in children zones</p>
        </Card>

        <Card className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-2 text-amber-500">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Medical Flags</span>
          </div>
          <h3 className="text-4xl font-black text-foreground mb-1">{medicalFlagsCount}</h3>
          <p className="text-xs font-medium text-muted-foreground opacity-60">Requires attention</p>
        </Card>

        <Card className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Bell className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pickup Queue</span>
          </div>
          <h3 className="text-4xl font-black text-foreground mb-1">{completedPickupsCount}</h3>
          <p className="text-xs font-medium text-muted-foreground opacity-60">Completed pickups</p>
        </Card>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'active' && <ActiveListView />}
        {activeTab === 'history' && <HistoryListView />}
      </div>

      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New Child Check-In</DialogTitle>
            <DialogDescription>
              Capture child and guardian details before generating pickup code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            <Input
              aria-label="Child name"
              placeholder="Child name"
              value={formData.childName}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, childName: event.target.value }))
              }
            />
            <Input
              aria-label="Age"
              type="number"
              min={0}
              placeholder="Age"
              value={formData.age}
              onChange={(event) => setFormData((prev) => ({ ...prev, age: event.target.value }))}
            />
            <Input
              aria-label="Parent name"
              placeholder="Parent name"
              value={formData.parentName}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, parentName: event.target.value }))
              }
            />
            <Input
              aria-label="Parent phone"
              placeholder="Parent phone"
              value={formData.parentPhone}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, parentPhone: event.target.value }))
              }
            />
            <Input
              aria-label="Location"
              placeholder="Location (e.g., Nursery A)"
              value={formData.location}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, location: event.target.value }))
              }
            />
            <Input
              aria-label="Allergies"
              placeholder="Allergies (comma-separated)"
              value={formData.allergies}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, allergies: event.target.value }))
              }
            />
          </div>
          <Textarea
            aria-label="Special needs"
            placeholder="Special needs (optional)"
            value={formData.specialNeeds}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, specialNeeds: event.target.value }))
            }
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCheckInDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCheckIn}>Create Check-In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
