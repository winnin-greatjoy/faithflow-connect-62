import { useMemo } from 'react';
import { eachDayOfInterval, formatISO, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { LEVEL_META, SIERRA_LEONE_VALS } from './calendar.constants';
import { RawEvent, CalendarType } from './calendar.types';

export function useCalendarEvents(
  events: RawEvent[],
  selectedCalendars: CalendarType[] = ['national', 'district', 'branch', 'holiday']
) {
  return useMemo(() => {
    const maxRankByDate = new Map<string, number>();

    // 1. Resolve hierarchy per day (Pass 1)
    events.forEach((ev) => {
      // Skip recurring events for rank calculation as they are usually baseline
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

      // Recurring Events
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

    // 3. Add Holidays
    const holidayEvents = SIERRA_LEONE_VALS.flatMap((h, i) => [
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
        extendedProps: { isHoliday: true, title: h.title },
      },
    ]);

    return [...calendarEvents, ...holidayEvents].filter((ev) => {
      const isH = ev.extendedProps?.isHoliday || ev.display === 'background';
      if (isH) return selectedCalendars.includes('holiday');

      const level = ev.extendedProps?.event_level?.toLowerCase();
      return selectedCalendars.includes(level as CalendarType);
    });
  }, [events, selectedCalendars]);
}
