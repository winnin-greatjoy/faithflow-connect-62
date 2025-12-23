-- Migration: Event Registration System
-- Date: 2025-12-23
-- Description: Add event_registrations table with RLS policies

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Contact information (for both members and guests)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Registration details
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  
  -- Optional metadata for custom fields
  metadata JSONB,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate registrations per email per event
  UNIQUE(event_id, email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member ON public.event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(email);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS registrations_insert_public ON public.event_registrations;
DROP POLICY IF EXISTS registrations_select_own ON public.event_registrations;
DROP POLICY IF EXISTS registrations_select_organizers ON public.event_registrations;
DROP POLICY IF EXISTS registrations_update_own ON public.event_registrations;

-- Policy: Anyone can register (INSERT)
CREATE POLICY registrations_insert_public ON public.event_registrations
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own registrations (SELECT)
CREATE POLICY registrations_select_own ON public.event_registrations
FOR SELECT
USING (
  member_id = auth.uid()
);

-- Policy: Event organizers and admins can view all registrations for their events (SELECT)
CREATE POLICY registrations_select_organizers ON public.event_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND (
      e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'pastor')
    )
  )
);

-- Policy: Users can update/cancel their own registrations (UPDATE)
CREATE POLICY registrations_update_own ON public.event_registrations
FOR UPDATE
USING (
  member_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND (
      e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'pastor')
    )
  )
);

-- Policy: Organizers and admins can delete registrations
CREATE POLICY registrations_delete_organizers ON public.event_registrations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND (
      e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'pastor')
    )
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_registration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_registration_updated_at();

-- Add comment
COMMENT ON TABLE public.event_registrations IS 'Stores event registrations for both members and guests';
