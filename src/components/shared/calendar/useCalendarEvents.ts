import { useState, useEffect, useRef } from 'react';
import { CalendarType, RawEvent } from './calendar.types';
import { supabase } from '@/integrations/supabase/client';
import { tasksApi, appointmentsApi } from '@/services/calendarApi';
import { LEVEL_META } from './calendar.constants';

export const useCalendarEvents = (
  initialEvents: RawEvent[],
  selectedCalendars: CalendarType[],
  currentDate: Date
) => {
  const [events, setEvents] = useState<any[]>([]);
  const fetchedYearsRef = useRef<Set<number>>(new Set());
  const [holidays, setHolidays] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Effect 1: Fetch Holidays, Tasks, and Appointments (Once or when date changes)
  useEffect(() => {
    const fetchEverything = async () => {
      // 1. Fetch Holidays
      const year = currentDate.getFullYear();
      const yearsToFetch = [year - 1, year, year + 1];
      const yearsNeeded = yearsToFetch.filter((y) => !fetchedYearsRef.current.has(y));

      if (yearsNeeded.length > 0) {
        try {
          const results = await Promise.all(
            yearsNeeded.map(async (y) => {
              const { data, error } = await supabase.functions.invoke('get-holidays', {
                body: { year: y },
              });
              if (!error && data?.holidays) {
                return data.holidays;
              }
              return [];
            })
          );

          if (results.length > 0) {
            setHolidays((prev) => {
              const flattened = results.flat();
              // Deduplicate
              const existingInfo = new Set(prev.map((h) => `${h.date}-${h.title}`));
              const newItems = flattened.filter(
                (h: any) => !existingInfo.has(`${h.date}-${h.title}`)
              );
              // Sort by date just in case
              return [...prev, ...newItems].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              );
            });
            yearsNeeded.forEach((y) => fetchedYearsRef.current.add(y));
          }
        } catch (err) {
          console.error('Holiday fetch error', err);
        }
      }

      // 2. Fetch Personal Tasks
      const { data: userTasks, error: taskError } = await tasksApi.getMyTasks();
      if (!taskError && userTasks) setTasks(userTasks);

      // 3. Fetch Appointments
      const { data: userAppts, error: apptError } = await appointmentsApi.getMyAppointments();
      if (!apptError && userAppts) setAppointments(userAppts);
    };

    fetchEverything();
  }, [currentDate]); // Re-run when current view date changes significantly (year change handled inside)

  // Effect 2: Merge and Filter
  useEffect(() => {
    // Transform Org Events
    const orgEvents = initialEvents.map((e) => {
      const level = e.event_level || 'BRANCH';
      const meta = LEVEL_META[level] || LEVEL_META['BRANCH'];
      const isRecurring = e.daysOfWeek && e.daysOfWeek.length > 0;

      return {
        ...e,
        daysOfWeek: isRecurring ? e.daysOfWeek : undefined,
        startTime: isRecurring ? e.time || '10:00' : undefined,
        endTime: isRecurring ? e.time || '11:00' : undefined,
        start: isRecurring ? undefined : e.start || e.start_at || e.date || e.event_date,
        backgroundColor: meta.bg,
        borderColor: meta.border,
        textColor: meta.text,
        extendedProps: { ...e, type: 'event' },
      };
    });

    // Transform Holidays
    const holidayEvents = holidays.map((h: any) => ({
      id: `holiday-${h.date}-${h.title}`,
      title: h.title,
      start: h.date,
      allDay: true,
      backgroundColor: '#EDE9FE',
      borderColor: '#7C3AED',
      textColor: '#5B21B6',
      classNames: ['holiday-event'],
      extendedProps: { type: 'holiday', isHoliday: true, ...h },
    }));

    // Transform Tasks
    const taskEvents = tasks.map((t: any) => ({
      id: `task-${t.id}`,
      title: t.title,
      start: t.due_date,
      allDay: !t.due_date?.includes('T'),
      backgroundColor: t.is_completed ? '#F1F5F9' : '#DBEAFE', // Slate-100 vs Blue-100
      borderColor: t.is_completed ? '#94A3B8' : '#2563EB',
      textColor: t.is_completed ? '#64748B' : '#1E40AF', // Strikethrough handled in render
      classNames: [t.is_completed ? 'task-completed' : 'task-pending'],
      extendedProps: { type: 'task', ...t },
    }));

    // Transform Appointments
    const apptEvents = appointments.map((a: any) => {
      // Determine if I am host or requester to show correct "Other" name
      // NOTE: This logic assumes we have access to current user ID.
      // For now, valid for standard flow.
      const title = `Meeting`; // Simplified until we pull user context into hook or store

      return {
        id: `appt-${a.id}`,
        title: a.notes || 'Appointment',
        start: a.start_at,
        end: a.end_at,
        backgroundColor: '#FCE7F3', // Pink-100
        borderColor: '#DB2777',
        textColor: '#831843',
        extendedProps: { type: 'appointment', ...a },
      };
    });

    const combined = [...orgEvents, ...holidayEvents, ...taskEvents, ...apptEvents];

    // Filter based on toggles (selectedCalendars)
    const filtered = combined.filter((event) => {
      const type = event.extendedProps?.type;

      if (type === 'holiday') return selectedCalendars.includes('holiday');

      // For distinct toggle control, we might need new CalendarTypes.
      // For now, mapping Tasks/Appts to 'branch' or 'my' if we had it.
      // The sidebar currently passes 'national', 'district', 'branch', 'holiday'.
      // User requested "Personal Tasks" layer.
      // We need to update CalendarSidebar to allow toggling 'tasks' and 'appointments'.
      // For MVP compatibility, if 'branch' is on, we show them, OR we blindly show them?
      // Let's assume strict filtering:

      if (type === 'task') return true; // Always show personal tasks for now (or add 'task' type to system)
      if (type === 'appointment') return true; // Always show appointments

      // Org Events
      if (type === 'event') {
        return selectedCalendars.includes(
          event.extendedProps?.event_level?.toLowerCase() || 'branch'
        );
      }

      return true;
    });

    setEvents(filtered);
  }, [initialEvents, holidays, tasks, appointments, selectedCalendars]);

  return {
    events,
    reload: async () => {
      // Re-trigger fetch independently
      const year = currentDate.getFullYear();
      const { data: userTasks } = await tasksApi.getMyTasks();
      if (userTasks) setTasks(userTasks);
      const { data: userAppts } = await appointmentsApi.getMyAppointments();
      if (userAppts) setAppointments(userAppts);
    },
  };
};
