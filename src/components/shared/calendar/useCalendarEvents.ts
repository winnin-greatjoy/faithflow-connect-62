import { useMemo, useState, useEffect, useRef } from 'react';
import { eachDayOfInterval, formatISO, parseISO, isBefore, getYear } from 'date-fns';
import { LEVEL_META } from './calendar.constants';
import { RawEvent, CalendarType } from './calendar.types';
import { supabase } from '@/integrations/supabase/client';

export function useCalendarEvents(
  events: RawEvent[],
  selectedCalendars: CalendarType[] = ['national', 'district', 'branch', 'holiday'],
  viewDate: Date = new Date()
) {
  const [allHolidays, setAllHolidays] = useState<
    { title: string; date: string; isObserved: boolean }[]
  >([]);
  const fetchedYearsRef = useRef<Set<number>>(new Set());

  // Calculate years to fetch holidays for
  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = viewDate.getFullYear();

    // Always include the visible window years
    yearsSet.add(currentYear);
    yearsSet.add(currentYear - 1);
    yearsSet.add(currentYear + 1);

    events.forEach((ev) => {
      const dateStr = ev.start_at || ev.event_date || ev.date;
      if (dateStr) {
        try {
          yearsSet.add(getYear(parseISO(dateStr.split('T')[0])));
        } catch (e) {
          // ignore invalid dates
        }
      }
    });

    return Array.from(yearsSet);
  }, [events, viewDate]);

  // Fetch holidays from Edge Function (Centralized + Cached)
  useEffect(() => {
    async function fetchAllHolidays() {
      const missingYears = years.filter((y) => !fetchedYearsRef.current.has(y));
      if (missingYears.length === 0) return;

      try {
        const results = await Promise.all(
          missingYears.map(async (year) => {
            const { data, error } = await supabase.functions.invoke('get-holidays', {
              body: { year },
            });

            if (error || !data) {
              console.error(`Edge function error for year ${year}:`, error);
              return [];
            }

            fetchedYearsRef.current.add(year);
            return data.holidays;
          })
        );

        const newHolidays = results.flat();
        if (newHolidays.length > 0) {
          setAllHolidays((prev) => {
            const combined = [...prev, ...newHolidays];
            return combined.filter(
              (h, i, arr) => i === arr.findIndex((x) => x.date === h.date && x.title === h.title)
            );
          });
        }
      } catch (err) {
        console.error('Failed to fetch holidays from edge function:', err);
      }
    }

    fetchAllHolidays();
  }, [years]);

  return useMemo(() => {
    const maxRankByDate = new Map<string, number>();

    // 1. Resolve hierarchy per day (Pass 1)
    events.forEach((ev) => {
      if (ev.daysOfWeek && ev.daysOfWeek.length > 0) return;

      const startStr = ev.start_at || ev.event_date || ev.date;
      if (!startStr) return;

      const endStr = ev.end_at || ev.end_date || startStr;
      const rank = LEVEL_META[ev.event_level || 'BRANCH']?.rank || 1;

      try {
        const start = parseISO(startStr.split('T')[0]);
        const end = parseISO(endStr.split('T')[0]);

        if (isBefore(end, start)) return;

        eachDayOfInterval({ start, end }).forEach((day) => {
          const key = formatISO(day, { representation: 'date' });
          maxRankByDate.set(key, Math.max(maxRankByDate.get(key) || 0, rank));
        });
      } catch (err) {
        console.error('Error parsing date for rank logic:', err, ev);
      }
    });

    // 2. Build FullCalendar events (Pass 2)
    const calendarEvents: any[] = [];
    events.forEach((ev) => {
      const level = ev.event_level || 'BRANCH';
      const meta = LEVEL_META[level];
      const rank = meta.rank;

      if (ev.daysOfWeek && ev.daysOfWeek.length > 0) {
        calendarEvents.push({
          id: String(ev.id),
          title: ev.title,
          daysOfWeek: ev.daysOfWeek,
          startTime: ev.time,
          backgroundColor: meta.bg,
          borderColor: meta.border,
          extendedProps: { ...ev },
        });
        return;
      }

      const startStr = ev.start_at || ev.event_date || ev.date;
      if (!startStr) return;

      const endStr = ev.end_at || ev.end_date || startStr;

      try {
        const start = parseISO(startStr.split('T')[0]);
        const end = parseISO(endStr.split('T')[0]);

        if (isBefore(end, start)) return;

        eachDayOfInterval({ start, end }).forEach((day) => {
          const key = formatISO(day, { representation: 'date' });
          const maxRank = maxRankByDate.get(key) || 0;

          if (rank >= maxRank) {
            calendarEvents.push({
              id: `${ev.id}-${key}`,
              title: ev.title,
              start: `${key}T${ev.time || '00:00'}`,
              allDay: !ev.time,
              backgroundColor: meta.bg,
              borderColor: meta.border,
              extendedProps: { ...ev },
            });
          }
        });
      } catch (err) {
        console.error('Error processing event segments:', err, ev);
      }
    });

    // 3. Add Holidays (Using Edge-Cached data)
    const holidayEvents = allHolidays.flatMap((h, i) => [
      {
        id: `holiday-bg-${i}`,
        start: h.date,
        allDay: true,
        display: 'background',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
      },
      {
        id: `holiday-title-${i}`,
        title: h.title,
        start: h.date,
        allDay: true,
        display: 'block',
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        extendedProps: {
          isHoliday: true,
          title: h.title,
          isObserved: h.isObserved,
        },
      },
    ]);

    return [...calendarEvents, ...holidayEvents].filter((ev) => {
      const isH = ev.extendedProps?.isHoliday === true || ev.display === 'background';
      if (isH) return selectedCalendars.includes('holiday');

      const level = ev.extendedProps?.event_level?.toLowerCase();
      return selectedCalendars.includes(level as CalendarType);
    });
  }, [events, selectedCalendars, allHolidays]);
}
