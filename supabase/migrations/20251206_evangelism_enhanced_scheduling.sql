-- Add enhanced scheduling fields to evangelism_events table
-- Supports: duration (start/end time), date ranges, recurrence options

-- Add new columns for enhanced scheduling
ALTER TABLE public.evangelism_events
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS estimated_attendees INTEGER,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN public.evangelism_events.end_date IS 'For multi-day events, the last date of the event';
COMMENT ON COLUMN public.evangelism_events.end_time IS 'Event end time for duration tracking';
COMMENT ON COLUMN public.evangelism_events.estimated_attendees IS 'Estimated number of team members for the event';
COMMENT ON COLUMN public.evangelism_events.is_recurring IS 'Whether this event recurs';
COMMENT ON COLUMN public.evangelism_events.recurrence_type IS 'Frequency of recurrence: daily, weekly, or monthly';
COMMENT ON COLUMN public.evangelism_events.recurrence_end_date IS 'Last date for recurring events';

-- Create index for recurrence queries
CREATE INDEX IF NOT EXISTS idx_evangelism_events_recurrence 
ON public.evangelism_events(is_recurring, recurrence_end_date) 
WHERE is_recurring = true;

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_evangelism_events_date_range 
ON public.evangelism_events(event_date, end_date);
