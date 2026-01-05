export type EventLevel = 'NATIONAL' | 'DISTRICT' | 'BRANCH';

export type EventType =
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

export type EventStatus = 'Open' | 'Upcoming' | 'Active' | 'Ended' | 'Cancelled';
export type Frequency = 'One-time' | 'Weekly' | 'Monthly' | 'Yearly';

export interface RecurrencePattern {
  weekdays?: number[];
  dom?: number | 'last';
  month?: number;
  day?: number;
}

export interface Attendee {
  id: number;
  name: string;
  memberLink?: string;
  contact?: string;
  role?: string;
  checkedIn?: boolean;
  registeredAt?: string;
  status?: 'invited' | 'confirmed' | 'registered' | 'removed';
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  capacity?: number;
  status: EventStatus;
  type: EventType;
  frequency: Frequency;
  event_level: EventLevel;
  owner_scope_id?: string | null;
  district_id?: string | null;
  branch_id?: string | null;
  requires_registration?: boolean;
  is_paid?: boolean;
  registration_fee?: number;
  target_audience?: string;
  visibility?: 'public' | 'private';
  daysOfWeek?: number[];
  end_date?: string;
  numberOfDays?: number;
}
