-- 1. Add requires_registration and is_paid to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS requires_registration BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- 2. Expand event_status enum
-- Since we can't easily ALTER TYPE ENUM in a transaction sometimes, or if it might exist, we use this pattern
DO $do$ 
BEGIN
  ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'upcoming';
  ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'active';
  ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'ended';
EXCEPTION 
  WHEN duplicate_object THEN NULL; 
END $do$;

-- 3. Update existing entries to follow a sensible default
DO $do$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='registration_fee') THEN
    /* If an event has a registration_fee > 0, it should probably be marked as is_paid */
    UPDATE public.events 
    SET is_paid = TRUE 
    WHERE registration_fee > 0;

    /* If an event has a capacity > 0 or has a registration_fee, it likely requires registration */
    UPDATE public.events 
    SET requires_registration = TRUE 
    WHERE registration_fee > 0 OR capacity IS NOT NULL;
  END IF;
END $do$;
