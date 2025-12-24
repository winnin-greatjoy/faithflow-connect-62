'use client';

import React, { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EventCalendarProps {
  events: any[];
  onEventClick?: (ev: any) => void;
  title?: string;
  showCard?: boolean;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  onEventClick,
  title = 'Event Calendar',
  showCard = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure styles are loaded
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const formattedEvents = useMemo(() => {
    return events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      start: ev.start_at || ev.event_date || ev.date,
      end: ev.end_at,
      backgroundColor: ev.backgroundColor || '#3b82f6',
      borderColor: ev.borderColor || '#2563eb',
      extendedProps: { ...ev },
    }));
  }, [events]);

  const calendarContent = (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        events={formattedEvents}
        eventClick={(info) => {
          if (onEventClick) onEventClick(info.event.extendedProps);
        }}
        height="650px"
        contentHeight="auto"
        handleWindowResize={true}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .fc { font-family: inherit; font-size: 0.85rem; background: white; }
          .fc .fc-button-primary { background-color: #3b82f6; border-color: #2563eb; }
          .fc .fc-button-primary:hover { background-color: #2563eb; }
          .fc .fc-toolbar-title { font-size: 1.1rem; font-weight: 600; }
          .fc-event { cursor: pointer; border-radius: 4px; padding: 2px 4px; border: none !important; }
          .fc-daygrid-event { white-space: normal !important; align-items: center; }
          .fc-daygrid-event-dot { border-color: #3b82f6; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: #e5e7eb; }
          .fc-col-header-cell { background: #f9fafb; padding: 8px 0 !important; }
          .fc-daygrid-day-number { padding: 8px !important; font-weight: 500; }
          .calendar-container { width: 100%; height: 100%; }
        `,
        }}
      />
    </div>
  );

  if (!isLoaded) {
    if (!showCard) {
      return (
        <div className="h-[500px] flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-md" />
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!showCard) {
    return <>{calendarContent}</>;
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{calendarContent}</CardContent>
    </Card>
  );
};

export default EventCalendar;
