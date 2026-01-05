export type EventLevel = 'NATIONAL' | 'DISTRICT' | 'BRANCH';
export type CalendarType = 'national' | 'district' | 'branch' | 'holiday';

export interface RawEvent {
  id: string | number;
  title: string;
  description?: string;
  event_level?: EventLevel;
  start_at?: string;
  end_at?: string;
  event_date?: string;
  date?: string;
  time?: string;
  daysOfWeek?: number[];
  isHoliday?: boolean;
  [key: string]: any;
}

export interface CalendarEventProps {
  events?: RawEvent[];
  onEventClick?: (ev: RawEvent) => void;
  title?: string;
  showCard?: boolean;
}

export interface CalendarSidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedCalendars: CalendarType[];
  onToggleCalendar: (type: CalendarType) => void;
  onCreateEvent: () => void;
  onCreateTask?: () => void;
  onCreateAppointment?: () => void;
}

export interface CalendarHeaderProps {
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  view: string;
  onViewChange: (view: string) => void;
  onMenuClick: () => void;
}
