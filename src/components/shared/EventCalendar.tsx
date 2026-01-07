'use client';

import React, { Suspense, lazy, useState, useRef, useCallback } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Plus, Check } from 'lucide-react';

// Inner Imports
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { CalendarLayout } from './calendar/CalendarLayout';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarSidebar } from './calendar/CalendarSidebar';
import {
  CalendarType,
  RawEvent,
  CalendarEventProps as BaseCalendarEventProps,
} from './calendar/calendar.types';
import { CalendarCreateButton } from './calendar/CalendarCreateButton';
import './calendar/calendar.css';

// Lazy load FullCalendar
const FullCalendar = lazy(() => import('@fullcalendar/react'));

import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/modules/events/hooks/useEvents';

interface CalendarEventProps {
  events?: RawEvent[];
  onEventClick?: (ev: RawEvent) => void;
  title?: string;
  showCard?: boolean;
  onCreateEvent?: () => void; // Assuming this is part of CalendarEventProps based on instruction
}

export interface EventCalendarProps extends CalendarEventProps {
  onCreateTask?: () => void;
  onCreateAppointment?: () => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events: propEvents,
  onEventClick,
  title: initialTitle,
  showCard = true,
  onCreateEvent,
  onCreateTask,
  onCreateAppointment,
}) => {
  const navigate = useNavigate();
  const { events: allEvents } = useEvents();

  // Use provided events or map all events from hook
  const events =
    propEvents ||
    (allEvents?.map((e) => {
      const isRecurring = e.daysOfWeek && e.daysOfWeek.length > 0;
      return {
        ...e,
        id: e.id,
        title: e.title,
        // Recurring properties
        daysOfWeek: isRecurring ? e.daysOfWeek : undefined,
        startTime: isRecurring ? e.time || '10:00' : undefined,
        endTime: isRecurring ? e.time || '11:00' : undefined, // Fallback end time
        // Static properties
        start: isRecurring ? undefined : `${e.date}T${e.time}`,
        start_at: `${e.date}T${e.time}`,
        end_at: `${e.end_date || e.date}T${e.time}`,
        event_level: e.event_level,
        type: 'event',
      };
    }) as any) ||
    [];

  const handleEventClickNative = useCallback(
    (ev: RawEvent) => {
      if (onEventClick) {
        onEventClick(ev);
      } else if (ev.id) {
        // Default to portal view if no handler provided
        navigate(`/portal/events/${ev.id}`);
      }
    },
    [onEventClick, navigate]
  );

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
  const calendarEvents = useCalendarEvents(events, selectedCalendars, currentDate);

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
            const props = info.event.extendedProps;
            if (props.type === 'task') {
              // TODO: Handle Task Click (Edit/Toggle)
              console.log('Task clicked', props);
            } else if (props.type === 'appointment') {
              // TODO: Handle Appointment Click
              console.log('Appointment clicked', props);
            } else {
              // Standard Event Click
              handleEventClickNative(props as RawEvent);
            }
          }}
          height="100%"
          dayMaxEvents={4}
          handleWindowResize={true}
          eventContent={(eventInfo) => {
            const props = eventInfo.event.extendedProps;
            const isHoliday = props?.isHoliday;
            const isTask = props?.type === 'task';
            const isAppt = props?.type === 'appointment';

            if (isTask) {
              return (
                <div
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 w-full overflow-hidden text-xs rounded-sm border-l-2 ${props.is_completed ? 'opacity-60 line-through' : ''
                    }`}
                  style={{
                    backgroundColor: eventInfo.backgroundColor,
                    borderColor: eventInfo.borderColor,
                    color: eventInfo.textColor,
                  }}
                >
                  <div
                    className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${props.is_completed
                      ? 'bg-slate-400 border-slate-400'
                      : 'bg-white border-blue-500'
                      }`}
                  >
                    {props.is_completed && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span className="truncate">{eventInfo.event.title}</span>
                </div>
              );
            }

            // Default Event / Holiday / Appointment Pill
            return (
              <div
                className="calendar-event-pill"
                style={{
                  backgroundColor: eventInfo.backgroundColor,
                  border: isHoliday ? 'none' : `1px solid ${eventInfo.borderColor}`,
                  color: eventInfo.textColor,
                }}
              >
                {isHoliday && <span className="mr-1">✨</span>}
                {isAppt && <span className="mr-1">🤝</span>}
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
          onCreateEvent={onCreateEvent || (() => { })}
          onCreateTask={onCreateTask}
          onCreateAppointment={onCreateAppointment}
        />
      }
    >
      {calendarMain}

      {/* Floating Create Button for Collapsed Sidebar */}
      {!showSidebar && (
        <div className="absolute bottom-8 right-8 z-30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <CalendarCreateButton
            onCreateEvent={onCreateEvent || (() => { })}
            onCreateTask={onCreateTask || (() => { })}
            onCreateAppointment={onCreateAppointment || (() => { })}
            showLabel={false}
          />
        </div>
      )}
    </CalendarLayout>
  );

  if (!showCard) return <div className="h-full w-full">{layout}</div>;

  return (
    <div className="h-full w-full min-h-[600px] overflow-hidden rounded-xl border shadow-sm">
      {layout}
    </div>
  );
};

export default EventCalendar;
