-- Migration: create events and event_participants tables
-- Date: 2025-12-17

-- NOTE: Adjust schema/table names if your DB uses different names for branches/districts/profiles

-- Create enums (if not already present)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_scope') THEN
    CREATE TYPE public.event_scope AS ENUM ('local','district','national');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE public.event_status AS ENUM ('draft','published','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_visibility') THEN
    CREATE TYPE public.event_visibility AS ENUM ('public','private');
  END IF;
END$$;

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scope public.event_scope NOT NULL DEFAULT 'local', -- local|district|national
  branch_id uuid REFERENCES public.church_branches(id) ON DELETE SET NULL,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  organizer_id uuid NOT NULL,
  organizer_role text,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  capacity integer,
  status public.event_status DEFAULT 'draft',
  visibility public.event_visibility DEFAULT 'public',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- If events table already existed (legacy), ensure required columns exist
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS scope public.event_scope NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organizer_role text,
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS status public.event_status DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS visibility public.event_visibility DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS metadata jsonb;

DO $$ BEGIN
  ALTER TABLE public.events ALTER COLUMN branch_id DROP NOT NULL;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Participants table
CREATE TABLE IF NOT EXISTS public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  status text DEFAULT 'registered', -- registered|attended|cancelled
  role text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current user's profile values more efficiently
-- (optional; queries below will use subselects against profiles)

-- SELECT policy: allow viewing events according to scope
DROP POLICY IF EXISTS events_select_scope ON public.events;
CREATE POLICY events_select_scope ON public.events
  FOR SELECT
  USING (
    (
      scope = 'national'
      OR (
        scope = 'district'
        AND district_id IS NOT NULL
        AND (
          public.has_role(auth.uid(), 'super_admin'::public.app_role)
          OR EXISTS (SELECT 1 FROM public.districts d WHERE d.id = district_id AND d.head_admin_id = auth.uid())
          OR EXISTS (
            SELECT 1
            FROM public.church_branches cb
            WHERE cb.id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
            AND cb.district_id = public.events.district_id
          )
        )
      )
      OR (scope = 'local' AND branch_id IS NOT NULL AND branch_id = (
        SELECT branch_id FROM public.profiles WHERE id = auth.uid()
      ))
    )
    -- allow the event organizer to view their own events
    OR (organizer_id = auth.uid())
  );

-- INSERT policies
-- Branch admin may INSERT local events for their branch
DROP POLICY IF EXISTS events_insert_local_admin ON public.events;
CREATE POLICY events_insert_local_admin ON public.events
  FOR INSERT
  WITH CHECK (
    scope = 'local'
    AND branch_id IS NOT NULL
    AND branch_id = (
      SELECT branch_id FROM public.profiles WHERE id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- District admin may INSERT district events for their district
DROP POLICY IF EXISTS events_insert_district_admin ON public.events;
CREATE POLICY events_insert_district_admin ON public.events
  FOR INSERT
  WITH CHECK (
    scope = 'district'
    AND district_id IS NOT NULL
    AND public.has_role(auth.uid(), 'district_admin'::public.app_role)
    AND EXISTS (SELECT 1 FROM public.districts d WHERE d.id = district_id AND d.head_admin_id = auth.uid())
  );

-- Super admin may INSERT national events
DROP POLICY IF EXISTS events_insert_super_admin ON public.events;
CREATE POLICY events_insert_super_admin ON public.events
  FOR INSERT
  WITH CHECK (
    scope = 'national'
    AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- UPDATE policies
-- Branch admins may UPDATE events that are local and belong to their branch
DROP POLICY IF EXISTS events_update_local_admin ON public.events;
CREATE POLICY events_update_local_admin ON public.events
  FOR UPDATE
  USING (
    scope = 'local'
    AND branch_id IS NOT NULL
    AND branch_id = (
      SELECT branch_id FROM public.profiles WHERE id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    scope = 'local'
    AND branch_id = (
      SELECT branch_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- District admins may UPDATE district events in their district
DROP POLICY IF EXISTS events_update_district_admin ON public.events;
CREATE POLICY events_update_district_admin ON public.events
  FOR UPDATE
  USING (
    scope = 'district'
    AND district_id IS NOT NULL
    AND public.has_role(auth.uid(), 'district_admin'::public.app_role)
    AND EXISTS (SELECT 1 FROM public.districts d WHERE d.id = district_id AND d.head_admin_id = auth.uid())
  )
  WITH CHECK (
    scope = 'district'
    AND district_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.districts d WHERE d.id = district_id AND d.head_admin_id = auth.uid())
  );

-- Super admin may UPDATE national events
DROP POLICY IF EXISTS events_update_super_admin ON public.events;
CREATE POLICY events_update_super_admin ON public.events
  FOR UPDATE
  USING (
    scope = 'national'
    AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
  WITH CHECK (
    scope = 'national'
  );

-- DELETE policies (same semantics as update)
DROP POLICY IF EXISTS events_delete_local_admin ON public.events;
CREATE POLICY events_delete_local_admin ON public.events
  FOR DELETE
  USING (
    scope = 'local'
    AND branch_id = (
      SELECT branch_id FROM public.profiles WHERE id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS events_delete_district_admin ON public.events;
CREATE POLICY events_delete_district_admin ON public.events
  FOR DELETE
  USING (
    scope = 'district'
    AND district_id IS NOT NULL
    AND public.has_role(auth.uid(), 'district_admin'::public.app_role)
    AND EXISTS (SELECT 1 FROM public.districts d WHERE d.id = district_id AND d.head_admin_id = auth.uid())
  );

DROP POLICY IF EXISTS events_delete_super_admin ON public.events;
CREATE POLICY events_delete_super_admin ON public.events
  FOR DELETE
  USING (
    scope = 'national'
    AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- For event_participants table, allow authenticated users to INSERT (register)
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY participants_insert_auth ON event_participants
  FOR INSERT
  WITH CHECK (
    member_id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    ) OR member_id IS NOT NULL
  );

-- Allow users to view their own participant records
CREATE POLICY participants_select_own ON event_participants
  FOR SELECT
  USING (member_id = (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

-- Allow event organizers (in events table) to view participants for their events
CREATE POLICY participants_select_by_organizer ON event_participants
  FOR SELECT
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- Update timestamps trigger for events
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- End of migration
