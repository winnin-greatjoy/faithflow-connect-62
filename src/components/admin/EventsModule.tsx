'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuthz } from '@/hooks/useAuthz';
import { useAdminContext } from '@/context/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, MapPin, Users, Plus, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import eventsApi from '@/services/eventsApi';
import EventCalendar from '@/components/shared/EventCalendar';

// -----------------------------
// Types
// -----------------------------
type EventType =
  | 'General'
  | 'Retreat'
  | 'Crusade'
  | 'Conference'
  | 'Leadership Meeting'
  | 'Youth Meeting'
  | 'Women Meeting'
  | 'Men Meeting'
  | 'Day With the Lord'
  | 'Outreach'
  | 'Combined Service'
  | 'Marriage'
  | 'Burial'
  | 'Departmental'
  | 'Registration';

type EventLevel = 'NATIONAL' | 'DISTRICT' | 'BRANCH';
type Frequency = 'One-time' | 'Weekly' | 'Monthly' | 'Yearly';
type Status = 'Open' | 'Registration Required' | 'Full' | 'Cancelled';

interface Attendee {
  id: number;
  name: string;
  memberLink?: string;
  contact?: string;
  role?: string;
  checkedIn?: boolean;
  registeredAt?: string;
  status?: 'invited' | 'confirmed' | 'registered' | 'removed';
}

interface RecurrencePattern {
  weekdays?: number[];
  dom?: number | 'last';
  month?: number;
  day?: number;
}

interface EventItem {
  id: string | number;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  capacity?: number;
  status: Status;
  type: EventType;
  frequency: Frequency;
  event_level: EventLevel;
  owner_scope_id?: string | null;
  district_id?: string | null;
  branch_id?: string | null;
  requiresRegistration?: boolean;
  attendeesList?: Attendee[];
  recurrencePattern?: RecurrencePattern;
  end_date?: string;
  end_time?: string;
  numberOfDays?: number;
}

// -----------------------------
// Utility Helpers
// -----------------------------
const parseDate = (iso: string) => {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d || 1);
};

const formatDateISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getNextOccurrenceWithPattern = (ev: EventItem) => {
  return ev.date; // Simplified for this implementation
};

const generateOccurrencesWithinWithPattern = (ev: EventItem, days: number) => {
  return [ev.date]; // Simplified
};

// -----------------------------
// Component
// -----------------------------
export const EventsModule: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tab, setTab] = useState<'All' | EventType>('All');
  const [scopeFilter, setScopeFilter] = useState<'All' | EventLevel>('All');
  const [dialog, setDialog] = useState<'create' | 'edit' | 'view' | 'calendar' | null>(null);
  const [form, setForm] = useState<Partial<EventItem> | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [adminDistrictId, setAdminDistrictId] = useState<string | null>(null);
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const { hasRole, branchId: userBranchId, userId, loading: authzLoading } = useAuthz();
  const { selectedBranchId, loading: contextLoading } = useAdminContext();
  const { toast } = useToast();

  const loading = authzLoading || contextLoading;

  const currentUserLevel = useMemo<EventLevel>(() => {
    if (hasRole('super_admin')) return 'NATIONAL';
    if (hasRole('district_admin')) return 'DISTRICT';
    return 'BRANCH';
  }, [hasRole]);

  const canManageEvents = useMemo(() => {
    return (
      hasRole('super_admin') || hasRole('district_admin') || hasRole('admin') || hasRole('pastor')
    );
  }, [hasRole]);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await eventsApi.getEvents();
      if (error) throw error;
      const mapped: EventItem[] = (data || []).map((r: any) => {
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          date: r.start_at ? r.start_at.split('T')[0] : '',
          time: r.start_at ? r.start_at.split('T')[1]?.substring(0, 5) || '10:00' : '10:00',
          location: r.location,
          capacity: r.capacity,
          status:
            r.status === 'published' ? 'Open' : r.status === 'cancelled' ? 'Cancelled' : 'Open',
          type: r.metadata?.type || 'General',
          frequency: r.metadata?.frequency || 'One-time',
          event_level: r.event_level,
          owner_scope_id: r.owner_scope_id,
          district_id: r.district_id,
          branch_id: r.branch_id,
          attendeesList: [],
          recurrencePattern: r.metadata?.recurrencePattern || {},
          end_date: r.end_at ? r.end_at.split('T')[0] : r.start_at ? r.start_at.split('T')[0] : '',
          end_time: r.end_at ? r.end_at.split('T')[1]?.substring(0, 5) || '12:00' : '12:00',
        };
      });
      setEvents(mapped);
    } catch (err: any) {
      toast({ title: 'Load failed', description: err.message, variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!hasRole('district_admin') || !userId) return;
    (async () => {
      const { data } = await supabase
        .from('districts')
        .select('id')
        .eq('head_admin_id', userId)
        .maybeSingle();
      if (data) setAdminDistrictId(data.id);
    })();
  }, [hasRole, userId]);

  const filteredEvents = useMemo(() => {
    const result = events.filter(
      (e) =>
        (tab === 'All' || e.type === tab) &&
        (scopeFilter === 'All' || e.event_level === scopeFilter)
    );
    result.sort((a, b) => {
      if (sortBy === 'date')
        return sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });
    return result;
  }, [events, tab, scopeFilter, sortBy, sortOrder]);

  const canEditEvent = useCallback(
    (e: EventItem) => {
      if (!canManageEvents) return false;
      if (hasRole('super_admin')) return true;
      if (e.event_level === 'NATIONAL') return false;
      if (e.event_level === 'DISTRICT')
        return hasRole('district_admin') && e.owner_scope_id === adminDistrictId;
      return (
        (hasRole('admin') || hasRole('pastor')) &&
        e.owner_scope_id === (selectedBranchId || userBranchId)
      );
    },
    [canManageEvents, hasRole, adminDistrictId, selectedBranchId, userBranchId]
  );

  const openCreate = () => {
    let owner_id: string | null = selectedBranchId || userBranchId || null;
    if (currentUserLevel === 'NATIONAL') owner_id = null;
    if (currentUserLevel === 'DISTRICT') owner_id = adminDistrictId;

    setForm({
      title: '',
      date: formatDateISO(new Date()),
      time: '10:00',
      location: '',
      capacity: 100,
      status: 'Open',
      type: 'General',
      frequency: 'One-time',
      event_level: currentUserLevel,
      owner_scope_id: owner_id,
      end_date: formatDateISO(new Date()),
      end_time: '12:00',
      numberOfDays: 1,
    });
    setNumberOfDays(1);
    setDialog('create');
  };

  const openEdit = (ev: EventItem) => {
    // Calculate numberOfDays from the date difference
    const startDate = parseDate(ev.date);
    const endDate = parseDate(ev.end_date || ev.date);
    const daysDiff =
      Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setForm({ ...ev, numberOfDays: daysDiff });
    setNumberOfDays(daysDiff);
    setDialog('edit');
  };

  const openView = (ev: EventItem) => {
    setActiveEvent(ev);
    setDialog('view');
  };

  const saveCreate = async () => {
    if (!form?.title || !form?.date) return;

    const mapStatus = (s: string): 'draft' | 'published' | 'cancelled' => {
      if (s === 'Cancelled') return 'cancelled';
      return 'published';
    };

    try {
      const payload = {
        title: form.title,
        description: form.description,
        event_level: form.event_level,
        owner_scope_id: form.owner_scope_id,
        start_at: `${form.date}T${form.time || '10:00:00'}`,
        end_at: `${form.end_date || form.date}T${form.end_time || '12:00:00'}`,
        location: form.location,
        capacity: form.capacity,
        status: mapStatus(form.status || 'Open'),
        metadata: { type: form.type, frequency: form.frequency },
      };
      const { error } = await eventsApi.createEvent(payload as any);
      if (error) throw error;
      toast({ title: 'Created', description: 'Event created successfully' });
      fetchEvents();
      setDialog(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const saveEdit = async () => {
    if (!form?.id) return;

    const mapStatus = (s: string): 'draft' | 'published' | 'cancelled' => {
      if (s === 'Cancelled') return 'cancelled';
      return 'published';
    };

    try {
      const { error } = await eventsApi.updateEvent(String(form.id), {
        title: form.title,
        description: form.description,
        location: form.location,
        capacity: form.capacity,
        start_at: `${form.date}T${form.time || '10:00:00'}`,
        end_at: `${form.end_date || form.date}T${form.end_time || '12:00:00'}`,
        status: mapStatus(form.status || 'Open'),
        metadata: { type: form.type, frequency: form.frequency },
      });
      if (error) throw error;
      toast({ title: 'Updated', description: 'Event updated' });
      fetchEvents();
      setDialog(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteEvent = async (id: string | number) => {
    if (!confirm('Delete event?')) return;
    try {
      const { error } = await eventsApi.deleteEvent(String(id));
      if (error) throw error;
      toast({ title: 'Deleted' });
      fetchEvents();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: Status) => {
    if (status === 'Cancelled') return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const recurrenceLabel = (ev: EventItem) => ev.frequency;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-gray-500">Hierarchical system: National, District, Branch</p>
        </div>
        <Button onClick={() => setDialog('calendar')} variant="outline">
          <Calendar className="mr-2 h-4 w-4" /> Calendar
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs value={scopeFilter} onValueChange={(v: any) => setScopeFilter(v)}>
          <TabsList className="bg-muted w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="All text-xs">All Levels</TabsTrigger>
            <TabsTrigger value="NATIONAL text-xs">National</TabsTrigger>
            <TabsTrigger value="DISTRICT text-xs">District</TabsTrigger>
            <TabsTrigger value="BRANCH text-xs">Branch</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="All">All Categories</TabsTrigger>
              <TabsTrigger value="General">General</TabsTrigger>
              <TabsTrigger value="Registration">Registration</TabsTrigger>
              <TabsTrigger value="Conference">Conferences</TabsTrigger>
              <TabsTrigger value="Crusade">Crusades</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            {canManageEvents && (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Create
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.map((ev) => (
          <Card
            key={ev.id}
            className="border-l-4"
            style={{
              borderLeftColor:
                ev.event_level === 'NATIONAL'
                  ? '#ef4444'
                  : ev.event_level === 'DISTRICT'
                    ? '#3b82f6'
                    : '#10b981',
            }}
          >
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <Badge variant={ev.event_level === 'NATIONAL' ? 'destructive' : 'default'}>
                    {ev.event_level}
                  </Badge>
                  <Badge variant="secondary">{ev.type}</Badge>
                </div>
                <h3 className="text-xl font-bold">{ev.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{ev.description}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" /> {ev.date}
                    {ev.end_date && ev.end_date !== ev.date ? ` - ${ev.end_date}` : ''}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" /> {ev.time}
                    {ev.end_time ? ` - ${ev.end_time}` : ''}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" /> {ev.location || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(ev.status)}`}
                >
                  {ev.status}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" variant="outline" onClick={() => openView(ev)}>
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canEditEvent(ev)}
                    onClick={() => openEdit(ev)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    disabled={!canEditEvent(ev)}
                    onClick={() => deleteEvent(ev.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <Dialog
        open={!!dialog && dialog !== 'view' && dialog !== 'calendar'}
        onOpenChange={() => setDialog(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === 'create' ? 'Create Event' : 'Edit Event'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="col-span-1 sm:col-span-2">
              <Label>Title</Label>
              <Input
                value={form?.title || ''}
                onChange={(e) => setForm((f) => ({ ...f!, title: e.target.value }))}
                placeholder="Event Title"
              />
            </div>
            <div>
              <Label>Number of Days</Label>
              <Input
                type="number"
                min="1"
                value={numberOfDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 1;
                  setNumberOfDays(days);

                  // Auto-calculate end date
                  if (form?.date) {
                    const startDate = parseDate(form.date);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + days - 1);

                    setForm((f) => ({
                      ...f!,
                      numberOfDays: days,
                      end_date: formatDateISO(endDate),
                    }));
                  } else {
                    setForm((f) => ({ ...f!, numberOfDays: days }));
                  }
                }}
                placeholder="1"
              />
            </div>

            {numberOfDays === 1 ? (
              // Single-day event: Show simple Date and Time
              <>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form?.date || ''}
                    onChange={(e) => {
                      setForm((f) => ({
                        ...f!,
                        date: e.target.value,
                        end_date: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={form?.time || '10:00'}
                    onChange={(e) => setForm((f) => ({ ...f!, time: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              // Multi-day event: Show Start/End Date and Time
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form?.date || ''}
                    onChange={(e) => {
                      const startDate = parseDate(e.target.value);
                      const endDate = new Date(startDate);
                      endDate.setDate(startDate.getDate() + numberOfDays - 1);

                      setForm((f) => ({
                        ...f!,
                        date: e.target.value,
                        end_date: formatDateISO(endDate),
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form?.end_date || form?.date || ''}
                    onChange={(e) => setForm((f) => ({ ...f!, end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={form?.time || '10:00'}
                    onChange={(e) => setForm((f) => ({ ...f!, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={form?.end_time || '12:00'}
                    onChange={(e) => setForm((f) => ({ ...f!, end_time: e.target.value }))}
                  />
                </div>
              </>
            )}
            <div>
              <Label>Category</Label>
              <Select
                value={form?.type || 'General'}
                onValueChange={(v: any) => setForm((f) => ({ ...f!, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'General',
                    'Retreat',
                    'Crusade',
                    'Conference',
                    'Leadership Meeting',
                    'Youth Meeting',
                    'Women Meeting',
                    'Men Meeting',
                    'Day With the Lord',
                    'Outreach',
                    'Combined Service',
                    'Marriage',
                    'Burial',
                    'Departmental',
                    'Registration',
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form?.location || ''}
                onChange={(e) => setForm((f) => ({ ...f!, location: e.target.value }))}
                placeholder="Event Location"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={form?.frequency || 'One-time'}
                onValueChange={(v: any) => setForm((f) => ({ ...f!, frequency: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  {['One-time', 'Weekly', 'Monthly', 'Yearly'].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Capacity (Optional)</Label>
              <Input
                type="number"
                value={form?.capacity || ''}
                onChange={(e) => setForm((f) => ({ ...f!, capacity: parseInt(e.target.value) }))}
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form?.status || 'Open'}
                onValueChange={(v: any) => setForm((f) => ({ ...f!, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {['Open', 'Registration Required', 'Full', 'Cancelled'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level: </Label>
              <div className="mt-1">
                <Badge variant="outline">{form?.event_level}</Badge>
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form?.description || ''}
                onChange={(e) => setForm((f) => ({ ...f!, description: e.target.value }))}
                placeholder="Event description..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => (dialog === 'create' ? saveCreate() : saveEdit())}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'view'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activeEvent?.title}</DialogTitle>
          </DialogHeader>
          {activeEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Level:</strong>{' '}
                  <Badge variant="outline" className="ml-1">
                    {activeEvent.event_level}
                  </Badge>
                </div>
                <div>
                  <strong>Category:</strong> {activeEvent.type}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(activeEvent.status)}`}
                  >
                    {activeEvent.status}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <strong>Date & Time Range:</strong>
                  <div className="mt-1 p-2 bg-muted/50 rounded flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {activeEvent.date} {activeEvent.time}
                    </span>
                    <span className="mx-1">→</span>
                    <span>
                      {activeEvent.end_date || activeEvent.date} {activeEvent.end_time || '12:00'}
                    </span>
                  </div>
                </div>
                <div>
                  <strong>Location:</strong> {activeEvent.location || 'N/A'}
                </div>
                <div>
                  <strong>Frequency:</strong> {activeEvent.frequency}
                </div>
                <div>
                  <strong>Capacity:</strong> {activeEvent.capacity || 'Unlimited'}
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-500 uppercase">Description</Label>
                <p className="p-4 bg-muted rounded text-sm mt-1">
                  {activeEvent.description || 'No description provided.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'calendar'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <EventCalendar
            events={
              filteredEvents.map((e) => ({
                ...e,
                start_at: `${e.date}T${e.time.split(' ')[0]}`,
              })) as any
            }
            onEventClick={(ev) => openView(ev as any)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsModule;
