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
import { Calendar, Clock, MapPin, Users, Plus, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import eventsApi from '@/services/eventsApi';

// Try to load FullCalendar (optional)
let FullCalendar: any = null;
let dayGridPlugin: any = null;
try {
  // dynamic import will be used in useEffect because SSR may fail; this try is just to silence TS/IDE warnings
  // actual dynamic import happens in useEffect below
} catch (err) {
  /* noop */
}

// -----------------------------
// Types
// -----------------------------
type EventType = 'General' | 'Registration' | 'Departmental';
type Scope = 'Local' | 'District' | 'National';
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
}

interface RecurrencePattern {
  // depending on frequency:
  // Weekly: { weekdays: number[] } (0=Sun..6=Sat)
  // Monthly: { dom: number | 'last' }
  // Yearly: { month: number (1-12), day: number }
  // One-time: {}
  weekdays?: number[];
  dom?: number | 'last';
  month?: number; // 1-12
  day?: number;
}

interface EventItem {
  id: string | number;
  title: string;
  description?: string;
  date: string; // base date (YYYY-MM-DD)
  time: string; // human readable
  location?: string;
  capacity?: number;
  status: Status;
  type: EventType;
  frequency: Frequency;
  scope: Scope;
  requiresRegistration?: boolean;
  attendeesList?: Attendee[]; // per-event attendee records
  recurrencePattern?: RecurrencePattern;
}

// -----------------------------
// Utility: date helpers (lightweight)
// -----------------------------
const parseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const formatDateISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};
const addYears = (d: Date, n: number) => {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + n);
  return x;
};

// -----------------------------
// Recurrence: next occurrence and occurrences generator
// - supports weekly (weekdays), monthly (day-of-month), yearly (month/day).
// -----------------------------
const getNextOccurrenceWithPattern = (ev: EventItem, fromDate = new Date()): string | null => {
  const base = parseDate(ev.date);
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  if (ev.frequency === 'One-time') {
    return base >= today ? formatDateISO(base) : null;
  }

  // Weekly with weekdays array
  if (ev.frequency === 'Weekly') {
    const weekdays = ev.recurrencePattern?.weekdays ?? [base.getDay()]; // use base day if none provided
    // search this week + next N weeks until we find >= today
    for (let offset = 0; offset < 7 * 52; offset++) {
      const candidate = addDays(today, offset);
      if (weekdays.includes(candidate.getDay())) {
        // candidate is a matching weekday — ensure it's >= base occurrence date
        const firstValid = parseDate(ev.date);
        if (candidate >= firstValid) return formatDateISO(candidate);
      }
    }
    return null;
  }

  // Monthly: by day-of-month (dom) or 'last'
  if (ev.frequency === 'Monthly') {
    const dom = ev.recurrencePattern?.dom ?? base.getDate();
    let candidate = new Date(
      today.getFullYear(),
      today.getMonth(),
      dom === 'last' ? 1 : Number(dom)
    );
    if (dom === 'last') {
      // set to last day of month
      candidate = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0);
    } else {
      // ensure valid day (e.g., Feb 30 -> skip)
      const check = new Date(candidate.getFullYear(), candidate.getMonth(), Number(dom));
      if (check.getMonth() !== candidate.getMonth()) {
        // invalid this month; move to next month
        candidate = new Date(candidate.getFullYear(), candidate.getMonth() + 1, Number(dom));
      } else candidate = check;
    }
    // if candidate < today, bump month until >= today
    let attempts = 0;
    while (candidate < today && attempts < 120) {
      candidate = addMonths(candidate, 1);
      if (dom === 'last')
        candidate = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0);
      attempts++;
    }
    // ensure >= base
    if (candidate >= parseDate(ev.date)) return formatDateISO(candidate);
    return null;
  }

  // Yearly: month/day pattern
  if (ev.frequency === 'Yearly') {
    const month = ev.recurrencePattern?.month ?? base.getMonth() + 1; // 1-12
    const day = ev.recurrencePattern?.day ?? base.getDate();
    let candidate = new Date(today.getFullYear(), (month as number) - 1, day as number);
    if (candidate < today) candidate = addYears(candidate, 1);
    if (candidate >= parseDate(ev.date)) return formatDateISO(candidate);
    return null;
  }

  return null;
};

// generate occurrences within next `days` days using recurrence rules (returns ISO date strings)
const generateOccurrencesWithinWithPattern = (
  ev: EventItem,
  days: number,
  fromDate = new Date()
): string[] => {
  const out: string[] = [];
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const limitDate = addDays(start, days);

  if (ev.frequency === 'One-time') {
    const base = parseDate(ev.date);
    if (base >= start && base <= limitDate) out.push(formatDateISO(base));
    return out;
  }

  if (ev.frequency === 'Weekly') {
    const weekdays = ev.recurrencePattern?.weekdays ?? [parseDate(ev.date).getDay()];
    // iterate each day from start to limit (safe for moderate days like 365)
    let cur = new Date(start);
    while (cur <= limitDate) {
      if (weekdays.includes(cur.getDay()) && cur >= parseDate(ev.date))
        out.push(formatDateISO(cur));
      cur = addDays(cur, 1);
    }
    return out;
  }

  if (ev.frequency === 'Monthly') {
    const dom = ev.recurrencePattern?.dom ?? parseDate(ev.date).getDate();
    // iterate months from start to months covering "days" range (approx)
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= limitDate) {
      let candidate: Date;
      if (dom === 'last') {
        candidate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      } else {
        candidate = new Date(cursor.getFullYear(), cursor.getMonth(), Number(dom));
      }
      if (candidate >= start && candidate <= limitDate && candidate >= parseDate(ev.date))
        out.push(formatDateISO(candidate));
      cursor = addMonths(cursor, 1);
    }
    return out;
  }

  if (ev.frequency === 'Yearly') {
    const month = ev.recurrencePattern?.month ?? parseDate(ev.date).getMonth() + 1;
    const day = ev.recurrencePattern?.day ?? parseDate(ev.date).getDate();
    let cursor = new Date(start.getFullYear(), (month as number) - 1, day as number);
    // if before start, try next year
    if (cursor < start) cursor = addYears(cursor, 1);
    while (cursor <= limitDate) {
      if (cursor >= parseDate(ev.date)) out.push(formatDateISO(cursor));
      cursor = addYears(cursor, 1);
    }
    return out;
  }

  return out;
};

// -----------------------------
// CSV / PDF helpers
// -----------------------------
const downloadCSV = (filename: string, rows: string[][]) => {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  a.click();
  URL.revokeObjectURL(url);
};

// PDF export: try to use jsPDF + html2canvas if available; otherwise fallback to open printable window
const exportEventPDF = async (eventTitle: string, htmlElement: HTMLElement | null) => {
  if (!htmlElement) {
    alert('Nothing to export');
    return;
  }

  try {
    // dynamic import
    const { default: jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(htmlElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = (pdf as any).getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${eventTitle.replace(/\s+/g, '_')}-attendees.pdf`);
    return;
  } catch (err) {
    // fallback: open printable window
    const popup = window.open('', '_blank');
    if (!popup) {
      alert('Please allow popups to export PDF.');
      return;
    }
    popup.document.write('<html><head><title>Export</title></head><body>');
    popup.document.write(htmlElement.outerHTML);
    popup.document.write('</body></html>');
    popup.document.close();
    popup.focus();
    popup.print();
  }
};

// -----------------------------
// Mock initial data (kept small)
// -----------------------------
const nowIso = formatDateISO(new Date());

// -----------------------------
// Component
// -----------------------------
export const EventsModule: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tab, setTab] = useState<'All' | EventType>('All');
  const [scopeFilter, setScopeFilter] = useState<'All' | Scope>('All');
  const [dialog, setDialog] = useState<'create' | 'edit' | 'view' | 'calendar' | null>(null);
  const [form, setForm] = useState<Partial<EventItem> | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [weekdaySelection, setWeekdaySelection] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const { hasRole, branchId: userBranchId, userId } = useAuthz();
  const { selectedBranchId, branchName } = useAdminContext();
  const { toast } = useToast();

  // district id for district admins (fetched once)
  const [adminDistrictId, setAdminDistrictId] = useState<string | null>(null);

  // Determine allowed scope for current user:
  // - super_admin -> National only (per requirement)
  // - district_admin -> District only
  // - branch-level admins -> Local only
  const allowedScope = useMemo<Scope>(() => {
    if (hasRole('super_admin')) return 'National';
    if (hasRole('district_admin')) return 'District';
    return 'Local';
  }, [hasRole]);

  const canManageEvents = useMemo(() => {
    return hasRole('super_admin') || hasRole('district_admin') || hasRole('admin');
  }, [hasRole]);

  // dynamic load FullCalendar to avoid SSR issues
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fc = await import('@fullcalendar/react');
        const dayGrid = await import('@fullcalendar/daygrid');
        if (!mounted) return;
        FullCalendar = fc.default;
        dayGridPlugin = dayGrid.default;
        setCalendarLoaded(true);
      } catch (err) {
        // FullCalendar not installed; keep placeholder
        setCalendarLoaded(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch events from DB (RLS will scope results)
  const fetchEvents = async () => {
    try {
      const { data, error } = await eventsApi.getEvents({ limit: 500 });
      if (error) throw error;
      const rows = (data || []) as any[];
      const mapped: EventItem[] = rows.map((r) => {
        // map DB record to UI EventItem; fallbacks provided
        const start = r.start_at || r.created_at || null;
        const date = start ? start.split('T')[0] : nowIso;
        const time = start
          ? (start.split('T')[1]?.replace('Z', '')?.split('.')[0] ?? '00:00:00')
          : '00:00:00';
        return {
          id: r.id,
          title: r.title || 'Untitled',
          description: r.description || '',
          date,
          time: time.includes(':') ? time : '00:00:00',
          location: r.location || '',
          capacity: r.capacity || 0,
          status: (r.status === 'cancelled'
            ? 'Cancelled'
            : r.status === 'published'
              ? 'Open'
              : 'Open') as Status,
          type: 'General',
          frequency: 'One-time',
          scope: (r.scope === 'national'
            ? 'National'
            : r.scope === 'district'
              ? 'District'
              : 'Local') as Scope,
          requiresRegistration: false,
          attendeesList: r.attendeesList || [],
          recurrencePattern: r.recurrencePattern || {},
        } as EventItem;
      });
      setEvents(mapped);
    } catch (err: any) {
      console.error('Failed to load events', err);
      toast({
        title: 'Load failed',
        description: err.message || 'Could not fetch events',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If current user is district admin, resolve their district id so created events can be tagged
  useEffect(() => {
    let active = true;
    if (!hasRole('district_admin')) return;
    (async () => {
      try {
        const { data: district } = await supabase
          .from('districts')
          .select('id')
          .eq('head_admin_id', userId)
          .maybeSingle();
        if (!active) return;
        setAdminDistrictId(district?.id ?? null);
      } catch (err) {
        console.error('Failed to resolve district for district admin', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [hasRole, userId]);

  // filters
  const filteredEvents = events.filter(
    (e) => (tab === 'All' || e.type === tab) && (scopeFilter === 'All' || e.scope === scopeFilter)
  );

  // sync calendar events whenever filtered events change
  useEffect(() => {
    // generate occurrences for next 90 days for calendar plotting
    const items: any[] = [];
    for (const ev of filteredEvents) {
      const occs = generateOccurrencesWithinWithPattern(ev, 90);
      if (occs.length === 0) continue;
      const attendeeCount = (ev.attendeesList ?? []).length || 0;
      const capacity = ev.capacity || 0;
      const capacityLabel = capacity > 0 ? ` ${attendeeCount}/${capacity}` : ` ${attendeeCount}`;

      // compute color based on fullness
      let backgroundColor = '#06b6d4'; // cyan (default)
      if (capacity > 0 && attendeeCount >= capacity)
        backgroundColor = '#ef4444'; // red
      else if (capacity > 0 && attendeeCount >= Math.ceil(capacity * 0.8))
        backgroundColor = '#f59e0b'; // amber

      for (const iso of occs) {
        // include time if available (ev.time may be 'HH:MM:SS' or human like '10:00 AM')
        let start = iso;
        if (ev.time && typeof ev.time === 'string' && ev.time.includes(':')) {
          // if already ISO-like (HH:MM:SS), append directly
          const hhmm = ev.time.split(' ')[0];
          start = `${iso}T${hhmm}`;
        }

        items.push({
          title: `${ev.title} —${capacityLabel}`,
          start,
          allDay: false,
          backgroundColor,
          borderColor: backgroundColor,
          textColor: '#ffffff',
          extendedProps: {
            eventId: ev.id,
            capacity,
            attendeeCount,
            scope: ev.scope,
            status: ev.status,
          },
        });
      }
    }
    setCalendarEvents(items);
  }, [filteredEvents]);

  const canEditEvent = useCallback(
    (e: EventItem) => {
      if (!canManageEvents) return false;
      if (allowedScope === 'National') return e.scope === 'National';
      if (allowedScope === 'District') return e.scope === 'District';
      return e.scope === 'Local';
    },
    [allowedScope, canManageEvents]
  );

  // CRUD handlers
  const openCreate = () => {
    const todayIso = formatDateISO(new Date());
    setForm({
      title: '',
      description: '',
      date: todayIso,
      time: '10:00 AM',
      location: '',
      capacity: 100,
      status: 'Open',
      type: 'General',
      frequency: 'One-time',
      scope: allowedScope,
      requiresRegistration: false,
      attendeesList: [],
      recurrencePattern: {},
    });
    setWeekdaySelection({ 0: true, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
    setDialog('create');
  };

  const openEdit = (ev: EventItem) => {
    if (!canManageEvents) return;
    setForm({ ...ev });
    // if weekly, prefill weekdays
    const pattern = ev.recurrencePattern ?? {};
    if (ev.frequency === 'Weekly') {
      const sel: Record<number, boolean> = {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
      };
      (pattern.weekdays ?? [parseDate(ev.date).getDay()]).forEach((wd) => {
        sel[wd] = true;
      });
      setWeekdaySelection(sel);
    }
    setDialog('edit');
  };

  const openView = (ev: EventItem) => {
    setActiveEvent(ev);
    setDialog('view');
  };

  const saveCreate = async () => {
    if (!canManageEvents) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to create events.',
        variant: 'destructive',
      });
      return;
    }
    if (!form || !form.title || !form.date) {
      toast({
        title: 'Validation',
        description: 'Title and date required',
        variant: 'destructive',
      });
      return;
    }
    // persist recurrencePattern from weekdaySelection if weekly
    const rec: RecurrencePattern = form.recurrencePattern ?? {};
    if (form.frequency === 'Weekly') {
      rec.weekdays = Object.entries(weekdaySelection)
        .filter(([, v]) => v)
        .map(([k]) => Number(k));
    } else if (form.frequency === 'Monthly') {
      // if dom stored in form.recurrencePattern.dom else use date day
      rec.dom = form.recurrencePattern?.dom ?? parseDate(form.date).getDate();
    } else if (form.frequency === 'Yearly') {
      rec.month = form.recurrencePattern?.month ?? parseDate(form.date).getMonth() + 1;
      rec.day = form.recurrencePattern?.day ?? parseDate(form.date).getDate();
    }

    try {
      const payload: any = {
        title: String(form.title),
        description: String(form.description ?? ''),
        scope: (form.scope as Scope) ?? allowedScope,
        start_at: `${String(form.date)}T${String(form.time ?? '00:00:00')}`,
        end_at: (form as any).end_at ?? null,
        location: String(form.location ?? ''),
        capacity: Number(form.capacity ?? 100),
        status: 'published',
        visibility: 'public',
        metadata: rec,
      };

      if (String(payload.scope).toLowerCase() === 'local')
        payload.branch_id = selectedBranchId || userBranchId || null;
      if (String(payload.scope).toLowerCase() === 'district')
        payload.district_id = adminDistrictId || null;

      const { data, error } = await eventsApi.createEvent(payload);
      if (error) throw error;
      toast({ title: 'Created', description: 'Event created successfully' });
      await fetchEvents();
      setDialog(null);
      setForm(null);
    } catch (err: any) {
      console.error('Create event failed', err);
      toast({
        title: 'Create failed',
        description: err.message || 'Unable to create event',
        variant: 'destructive',
      });
    }
  };

  const saveEdit = () => {
    if (!canManageEvents) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to edit events.',
        variant: 'destructive',
      });
      return;
    }
    if (!form || !form.id) return;
    const rec: RecurrencePattern = form.recurrencePattern ?? {};
    if (form.frequency === 'Weekly') {
      rec.weekdays = Object.entries(weekdaySelection)
        .filter(([, v]) => v)
        .map(([k]) => Number(k));
    }
    if (form.frequency === 'Monthly') {
      rec.dom = form.recurrencePattern?.dom ?? parseDate(form.date!).getDate();
    }
    if (form.frequency === 'Yearly') {
      rec.month = form.recurrencePattern?.month ?? parseDate(form.date!).getMonth() + 1;
      rec.day = form.recurrencePattern?.day ?? parseDate(form.date!).getDate();
    }
    // enforce scope restrictions for non-superadmins
    const enforcedScope = hasRole('super_admin') ? (form.scope as Scope) : allowedScope;
    if (enforcedScope !== (form.scope as Scope)) {
      // if user attempted to change scope but isn't allowed, force it back
      form.scope = enforcedScope;
    }

    // ensure scope-specific ids are set
    if (form.scope === 'Local') {
      (form as any).branch_id = selectedBranchId || userBranchId || null;
    } else if (form.scope === 'District') {
      (form as any).district_id = adminDistrictId || null;
    }

    (async () => {
      try {
        const payload: any = { ...form };
        payload.recurrencePattern = rec;
        if (payload.scope === 'Local') payload.branch_id = selectedBranchId || userBranchId || null;
        if (payload.scope === 'District') payload.district_id = adminDistrictId || null;
        const { data, error } = await eventsApi.updateEvent(String(form.id), payload);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Event updated successfully' });
        await fetchEvents();
        setDialog(null);
        setForm(null);
      } catch (err: any) {
        console.error('Update failed', err);
        toast({
          title: 'Update failed',
          description: err.message || 'Unable to update event',
          variant: 'destructive',
        });
      }
    })();
  };

  const deleteEvent = (id: string | number) => {
    if (!canManageEvents) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to delete events.',
        variant: 'destructive',
      });
      return;
    }
    if (!confirm('Delete event?')) return;
    (async () => {
      try {
        const { error } = await eventsApi.deleteEvent(String(id));
        if (error) throw error;
        toast({ title: 'Deleted', description: 'Event deleted successfully' });
        await fetchEvents();
      } catch (err: any) {
        console.error('Delete failed', err);
        toast({
          title: 'Delete failed',
          description: err.message || 'Unable to delete event',
          variant: 'destructive',
        });
      }
    })();
  };

  // Attendee management for the active event
  const registerAttendee = (eventId: string | number, a: Partial<Attendee>) => {
    if (!a.name || !a.name.trim()) {
      alert('Provide name');
      return;
    }
    (async () => {
      try {
        // Current API supports registering the authenticated user (or a known member_id).
        // For now we register the current user; name/contact fields remain UI-only.
        const { data, error } = await eventsApi.registerToEvent(String(eventId));
        if (error) throw error;
        toast({ title: 'Registered', description: 'Attendee registered successfully' });
        await fetchEvents();
      } catch (err: any) {
        console.error('Registration failed', err);
        toast({
          title: 'Registration failed',
          description: err.message || 'Unable to register attendee',
          variant: 'destructive',
        });
      }
    })();
  };
  const unregisterAttendee = (eventId: string | number, attendeeId: number) => {
    if (!confirm('Remove attendee?')) return;
    (async () => {
      try {
        const { error } = await eventsApi.unregisterFromEvent(String(eventId), String(attendeeId));
        if (error) throw error;
        toast({ title: 'Unregistered', description: 'Attendee removed successfully' });
        await fetchEvents();
      } catch (err: any) {
        console.error('Unregistration failed', err);
        toast({
          title: 'Unregistration failed',
          description: err.message || 'Unable to remove attendee',
          variant: 'destructive',
        });
      }
    })();
  };
  const toggleCheckIn = (eventId: string | number, attendeeId: number) => {
    // For now, this remains local-state only (no DB persistence for check-in status)
    // To add DB persistence, we'd need an updateParticipant method in eventsApi
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          attendeesList: (ev.attendeesList ?? []).map((a) =>
            a.id === attendeeId ? { ...a, checkedIn: !a.checkedIn } : a
          ),
        };
      })
    );
  };

  // Export functions
  const exportAllRegistrationsCSV = () => {
    const rows: string[][] = [
      [
        'Event ID',
        'Event Title',
        'Attendee ID',
        'Name',
        'MemberLink',
        'Contact',
        'Role',
        'CheckedIn',
        'RegisteredAt',
      ],
    ];
    for (const ev of events) {
      for (const a of ev.attendeesList ?? []) {
        rows.push([
          String(ev.id),
          ev.title,
          String(a.id),
          a.name,
          a.memberLink ?? '',
          a.contact ?? '',
          a.role ?? '',
          String(!!a.checkedIn),
          a.registeredAt ?? '',
        ]);
      }
    }
    downloadCSV('all_registrations.csv', rows);
  };

  const exportEventRegistrationsCSV = (ev: EventItem) => {
    const rows: string[][] = [
      ['Attendee ID', 'Name', 'MemberLink', 'Contact', 'Role', 'CheckedIn', 'RegisteredAt'],
    ];
    for (const a of ev.attendeesList ?? [])
      rows.push([
        String(a.id),
        a.name,
        a.memberLink ?? '',
        a.contact ?? '',
        a.role ?? '',
        String(!!a.checkedIn),
        a.registeredAt ?? '',
      ]);
    downloadCSV(`${ev.title.replace(/\s+/g, '_')}_registrations.csv`, rows);
  };

  const exportEventPDFHandler = async (ev: EventItem) => {
    // create a temporary element with attendee table
    const container = document.createElement('div');
    container.style.padding = '12px';
    container.style.fontFamily = 'sans-serif';

    // Use textContent to safely set title (prevents XSS)
    const titleH2 = document.createElement('h2');
    titleH2.textContent = `${ev.title} — Attendees`;
    container.appendChild(titleH2);

    const tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.style.borderCollapse = 'collapse';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Name', 'MemberLink', 'Role', 'CheckedIn'].forEach((header) => {
      const th = document.createElement('th');
      th.style.border = '1px solid #ccc';
      th.style.padding = '6px';
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tbl.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const a of ev.attendeesList ?? []) {
      const tr = document.createElement('tr');

      // Use textContent instead of innerHTML to prevent XSS
      const nameCell = document.createElement('td');
      nameCell.style.border = '1px solid #ccc';
      nameCell.style.padding = '6px';
      nameCell.textContent = a.name;
      tr.appendChild(nameCell);

      const memberLinkCell = document.createElement('td');
      memberLinkCell.style.border = '1px solid #ccc';
      memberLinkCell.style.padding = '6px';
      memberLinkCell.textContent = a.memberLink ?? '';
      tr.appendChild(memberLinkCell);

      const roleCell = document.createElement('td');
      roleCell.style.border = '1px solid #ccc';
      roleCell.style.padding = '6px';
      roleCell.textContent = a.role ?? '';
      tr.appendChild(roleCell);

      const checkedInCell = document.createElement('td');
      checkedInCell.style.border = '1px solid #ccc';
      checkedInCell.style.padding = '6px';
      checkedInCell.textContent = a.checkedIn ? 'Yes' : 'No';
      tr.appendChild(checkedInCell);

      tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);
    container.appendChild(tbl);
    document.body.appendChild(container);
    await exportEventPDF(ev.title || 'event', container);
    document.body.removeChild(container);
  };

  // Calendar click handler
  const onCalendarDateClick = (info: any) => {
    // info has dateStr and maybe extendedProps.eventId
    const evId = info.event?.extendedProps?.eventId ?? info.extendedProps?.eventId ?? null;
    if (evId) {
      const ev = events.find((e) => e.id === evId) ?? null;
      if (ev) openView(ev);
    }
  };

  // UI helpers
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Registration Required':
        return 'bg-blue-100 text-blue-800';
      case 'Full':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
    }
  };

  // UI: weekday toggles for weekly recurrence
  const toggleWeekday = (i: number) => {
    setWeekdaySelection((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  // small helper to display recurrence pattern human-friendly
  const recurrenceLabel = (ev: EventItem) => {
    if (ev.frequency === 'One-time') return 'One-time';
    if (ev.frequency === 'Weekly') {
      const days = (ev.recurrencePattern?.weekdays ?? [parseDate(ev.date).getDay()]).map(
        (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
      );
      return `Weekly (${days.join(',')})`;
    }
    if (ev.frequency === 'Monthly') {
      const dom = ev.recurrencePattern?.dom ?? parseDate(ev.date).getDate();
      return `Monthly (day ${dom})`;
    }
    if (ev.frequency === 'Yearly') {
      const m = ev.recurrencePattern?.month ?? parseDate(ev.date).getMonth() + 1;
      const d = ev.recurrencePattern?.day ?? parseDate(ev.date).getDate();
      return `Yearly (${m}/${d})`;
    }
    return ev.frequency;
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header + Quick exports */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-gray-600 mt-1">Recurrence rules, calendar, and export included.</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => setDialog('calendar')}>
            <Calendar className="mr-2" /> Calendar
          </Button>
          <Button size="sm" onClick={exportAllRegistrationsCSV}>
            <FileText className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Tabs value={tab} onValueChange={(v: any) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="General">General</TabsTrigger>
            <TabsTrigger value="Registration">Registration</TabsTrigger>
            <TabsTrigger value="Departmental">Departmental</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={scopeFilter} onValueChange={(v) => setScopeFilter(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Local">Local</SelectItem>
              <SelectItem value="District">District</SelectItem>
              <SelectItem value="National">National</SelectItem>
            </SelectContent>
          </Select>
          {canManageEvents && (
            <Button onClick={openCreate}>
              <Plus className="mr-2" />
              Create Event
            </Button>
          )}
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {filteredEvents.map((ev) => {
          const regs = ev.attendeesList?.length ?? 0;
          const checked = (ev.attendeesList ?? []).filter((a) => a.checkedIn).length;
          const checkRate = regs === 0 ? 0 : Math.round((checked / regs) * 100);
          const upcoming = generateOccurrencesWithinWithPattern(ev, 30);
          return (
            <Card key={ev.id}>
              <CardContent>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">{ev.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{ev.description}</p>
                    <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-3">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {getNextOccurrenceWithPattern(ev) ?? '—'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {ev.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {ev.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {regs}/{ev.capacity ?? '—'}
                      </div>
                      <Badge className="text-xs">{recurrenceLabel(ev)}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-2 py-1 rounded text-xs ${getStatusColor(ev.status)}`}>
                      {ev.status}
                    </div>
                    <div className="flex gap-2">
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
                        disabled={!canEditEvent(ev)}
                        onClick={() => deleteEvent(ev.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{checkRate}% checked in</div>
                    <div className="flex gap-1 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportEventRegistrationsCSV(ev)}
                      >
                        <Download className="mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportEventPDFHandler(ev)}>
                        <Download className="mr-1" />
                        PDF
                      </Button>
                    </div>
                    {upcoming.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">Next: {upcoming[0]}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Calendar dialog */}
      <Dialog open={dialog === 'calendar'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Calendar View</DialogTitle>
          </DialogHeader>
          {calendarLoaded && FullCalendar ? (
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={(arg: any) => {
                const evId = arg.event.extendedProps?.eventId;
                if (evId) {
                  const ev = events.find((e) => e.id === evId);
                  if (ev) {
                    setDialog('view');
                    setActiveEvent(ev);
                  }
                }
              }}
            />
          ) : (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded text-gray-500">
              <div>
                <div className="font-medium mb-2">Calendar unavailable</div>
                <div className="text-xs">
                  Install <code>@fullcalendar/react</code> and <code>@fullcalendar/daygrid</code> to
                  enable calendar plotting.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit dialog */}
      <Dialog
        open={dialog === 'create' || dialog === 'edit'}
        onOpenChange={() => {
          setDialog(null);
          setForm(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialog === 'create' ? 'Create Event' : 'Edit Event'}</DialogTitle>
          </DialogHeader>

          {form && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date ?? ''}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  value={form.time ?? ''}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location ?? ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  value={form.type ?? 'General'}
                  onValueChange={(v) => setForm({ ...form, type: v as EventType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Registration">Registration</SelectItem>
                    <SelectItem value="Departmental">Departmental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scope</Label>
                {/**
                 * Scope selection is restricted by role:
                 * - super_admin: National only
                 * - district_admin: District only
                 * - others (branch admins): Local only
                 * The UI surface here either shows a static label or a restricted select.
                 */}
                {allowedScope === 'National' ? (
                  <div className="px-3 py-2 border rounded text-sm">National</div>
                ) : allowedScope === 'District' ? (
                  <div className="px-3 py-2 border rounded text-sm">District</div>
                ) : (
                  <div className="px-3 py-2 border rounded text-sm">Local</div>
                )}
              </div>

              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.frequency ?? 'One-time'}
                  onValueChange={(v) => setForm({ ...form, frequency: v as Frequency })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One-time">One-time</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* dynamic recurrence UI */}
              {form.frequency === 'Weekly' && (
                <div className="col-span-1 sm:col-span-2">
                  <Label>Weekdays</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleWeekday(i)}
                        className={`px-3 py-1 rounded text-sm ${weekdaySelection[i] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.frequency === 'Monthly' && (
                <div>
                  <Label>Day of month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={String(
                      form.recurrencePattern?.dom ?? parseDate(form.date ?? nowIso).getDate()
                    )}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrencePattern: {
                          ...(form.recurrencePattern ?? {}),
                          dom: e.target.value === 'last' ? 'last' : Number(e.target.value),
                        },
                      })
                    }
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Enter day number or type "last" in the field to use month last day.
                  </div>
                </div>
              )}

              {form.frequency === 'Yearly' && (
                <>
                  <div>
                    <Label>Month (1-12)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={String(
                        form.recurrencePattern?.month ??
                          parseDate(form.date ?? nowIso).getMonth() + 1
                      )}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          recurrencePattern: {
                            ...(form.recurrencePattern ?? {}),
                            month: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Day</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={String(
                        form.recurrencePattern?.day ?? parseDate(form.date ?? nowIso).getDate()
                      )}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          recurrencePattern: {
                            ...(form.recurrencePattern ?? {}),
                            day: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {form.type === 'Registration' && (
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={String(form.capacity ?? '')}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  />
                </div>
              )}

              <div className="col-span-1 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialog(null);
                    setForm(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => (dialog === 'create' ? saveCreate() : saveEdit())}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog
        open={dialog === 'view'}
        onOpenChange={() => {
          setDialog(null);
          setActiveEvent(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>

          {activeEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Title:</strong> {activeEvent.title}
                </div>
                <div>
                  <strong>Scope:</strong> {activeEvent.scope}
                </div>
                <div>
                  <strong>Date:</strong> {activeEvent.date}
                </div>
                <div>
                  <strong>Frequency:</strong> {activeEvent.frequency} (
                  {recurrenceLabel(activeEvent)})
                </div>
                <div>
                  <strong>Time:</strong> {activeEvent.time}
                </div>
                <div>
                  <strong>Location:</strong> {activeEvent.location}
                </div>
              </div>

              <div className="text-sm text-gray-600">{activeEvent.description}</div>

              {/* Attendees */}
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    Attendees ({(activeEvent.attendeesList ?? []).length})
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportEventRegistrationsCSV(activeEvent)}
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportEventPDFHandler(activeEvent)}
                    >
                      PDF
                    </Button>
                  </div>
                </div>

                <div className="mt-2 max-h-56 overflow-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">MemberLink</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Checked in</th>
                        <th className="p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeEvent.attendeesList ?? []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-2 text-xs text-gray-500">
                            No attendees
                          </td>
                        </tr>
                      )}
                      {(activeEvent.attendeesList ?? []).map((a) => (
                        <tr key={a.id} className="border-t">
                          <td className="p-2">{a.name}</td>
                          <td className="p-2">{a.memberLink ?? '—'}</td>
                          <td className="p-2">{a.role ?? 'Visitor'}</td>
                          <td className="p-2">{a.checkedIn ? 'Checked in' : 'Absent'}</td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant={a.checkedIn ? 'outline' : 'default'}
                                onClick={() => toggleCheckIn(activeEvent.id, a.id)}
                              >
                                {a.checkedIn ? 'Undo' : 'Check in'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => unregisterAttendee(activeEvent.id, a.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Small register form */}
                <div className="mt-3 border rounded p-3">
                  <div className="text-xs font-medium mb-2">Register attendee</div>
                  <AttendeeRegisterForm
                    onRegister={(payload) => registerAttendee(activeEvent.id, payload)}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Small component for attendee registration inside view modal (keeps parent simpler)
const AttendeeRegisterForm: React.FC<{ onRegister: (a: Partial<Attendee>) => void }> = ({
  onRegister,
}) => {
  const [payload, setPayload] = useState<Partial<Attendee>>({
    name: '',
    memberLink: '',
    contact: '',
    role: 'Visitor',
  });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <Label>Name</Label>
        <Input
          value={payload.name ?? ''}
          onChange={(e) => setPayload({ ...payload, name: e.target.value })}
        />
      </div>
      <div>
        <Label>MemberLink / ID</Label>
        <Input
          value={payload.memberLink ?? ''}
          onChange={(e) => setPayload({ ...payload, memberLink: e.target.value })}
        />
      </div>
      <div>
        <Label>Contact</Label>
        <Input
          value={payload.contact ?? ''}
          onChange={(e) => setPayload({ ...payload, contact: e.target.value })}
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select
          value={payload.role ?? 'Visitor'}
          onValueChange={(v) => setPayload({ ...payload, role: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Visitor">Visitor</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
            <SelectItem value="Volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          onClick={() => setPayload({ name: '', memberLink: '', contact: '', role: 'Visitor' })}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            onRegister(payload);
            setPayload({ name: '', memberLink: '', contact: '', role: 'Visitor' });
          }}
        >
          Register
        </Button>
      </div>
    </div>
  );
};

export default EventsModule;
