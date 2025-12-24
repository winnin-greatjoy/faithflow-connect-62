'use client';

import React, { Suspense, lazy, useState, useRef, useCallback } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

// Inner Imports
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { RawEvent, CalendarType } from './calendar/calendar.types';
import { CalendarLayout } from './calendar/CalendarLayout';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarSidebar } from './calendar/CalendarSidebar';
import './calendar/calendar.css';

// Lazy load FullCalendar
const FullCalendar = lazy(() => import('@fullcalendar/react'));

export const EventCalendar: React.FC<{
  events: RawEvent[];
  onEventClick?: (ev: RawEvent) => void;
  title?: string;
  showCard?: boolean;
}> = ({ events, onEventClick, showCard = true }) => {
  // State
  const [view, setView] = useState('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedCalendars, setSelectedCalendars] = useState<CalendarType[]>([
    'national',
    'district',
    'branch',
    'holiday',
  ]);
  const [title, setTitle] = useState(format(new Date(), 'MMMM yyyy'));

  // Refs
  const calendarRef = useRef<any>(null);

  // Responsive: auto-hide sidebar on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force calendar size update when sidebar toggles
  React.useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      // Small delay to allow CSS transitions to finish
      const timer = setTimeout(() => {
        api.updateSize();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showSidebar]);

  // Hooks
  const calendarEvents = useCalendarEvents(events, selectedCalendars);

  // Handlers
  const handlePrev = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setTitle(api.view.title);
      setCurrentDate(api.getDate());
    }
  }, []);

  const handleNext = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setTitle(api.view.title);
      setCurrentDate(api.getDate());
    }
  }, []);

  const handleToday = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setTitle(api.view.title);
      setCurrentDate(new Date());
    }
  }, []);

  const handleViewChange = useCallback((newView: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(newView);
      setView(newView);
      setTitle(api.view.title);
    }
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(date);
      setCurrentDate(date);
      setTitle(api.view.title);
    }
  }, []);

  const handleToggleCalendar = useCallback((type: CalendarType) => {
    setSelectedCalendars((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleMenuToggle = () => setShowSidebar((prev) => !prev);

  const calendarMain = (
    <div className="h-full w-full relative bg-white dark:bg-slate-950">
      <Suspense fallback={<Skeleton className="w-full h-full" />}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false} // Custom header
          events={calendarEvents}
          eventClick={(info) => {
            if (onEventClick) onEventClick(info.event.extendedProps as RawEvent);
          }}
          height="100%"
          dayMaxEvents={4}
          handleWindowResize={true}
          eventContent={(eventInfo) => {
            const isHoliday = eventInfo.event.extendedProps?.isHoliday;
            return (
              <div
                className="calendar-event-pill"
                style={{
                  backgroundColor: eventInfo.backgroundColor,
                  border: isHoliday ? 'none' : `1px solid ${eventInfo.borderColor}`,
                }}
              >
                {isHoliday && <span className="mr-1">✨</span>}
                {eventInfo.event.title}
              </div>
            );
          }}
          datesSet={(arg) => {
            // Sync mini calendar when month changes via prev/next
            setCurrentDate(arg.view.currentStart);
            setTitle(arg.view.title);
          }}
        />
      </Suspense>
    </div>
  );

  const layout = (
    <CalendarLayout
      showSidebar={showSidebar}
      header={
        <CalendarHeader
          title={title}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          view={view}
          onViewChange={handleViewChange}
          onMenuClick={handleMenuToggle}
        />
      }
      sidebar={
        <CalendarSidebar
          currentDate={currentDate}
          onDateSelect={handleDateSelect}
          selectedCalendars={selectedCalendars}
          onToggleCalendar={handleToggleCalendar}
          onCreateEvent={() => {}} // Placeholder
        />
      }
    >
      {calendarMain}

      {/* Floating Create Button for Collapsed Sidebar */}
      {!showSidebar && (
        <div className="absolute bottom-8 right-8 z-30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <Button
            onClick={() => {}} // Placeholder
            className="h-14 w-14 md:w-auto md:px-6 rounded-full shadow-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex gap-3 items-center group dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800"
          >
            <Plus className="w-6 h-6 text-blue-600 stroke-[3px]" />
            <span className="text-sm hidden md:inline uppercase tracking-wide">Create</span>
          </Button>
        </div>
      )}
    </CalendarLayout>
  );

  if (!showCard) return <div className="h-full w-full min-h-[600px]">{layout}</div>;

  return (
    <div className="h-[850px] w-full overflow-hidden rounded-xl border shadow-sm">{layout}</div>
  );
};

export default EventCalendar;
