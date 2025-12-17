-- Migration: create events and event_participants tables
-- Date: 2025-12-17

-- NOTE: Adjust schema/table names if your DB uses different names for branches/districts/profiles

-- Create enums (if not already present)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_scope') THEN
    CREATE TYPE event_scope AS ENUM ('local','district','national');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE event_status AS ENUM ('draft','published','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_visibility') THEN
    CREATE TYPE event_visibility AS ENUM ('public','private');
  END IF;
END$$;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scope event_scope NOT NULL DEFAULT 'local', -- local|district|national
  branch_id uuid REFERENCES church_branches(id) ON DELETE SET NULL,
  district_id uuid REFERENCES districts(id) ON DELETE SET NULL,
  organizer_id uuid NOT NULL,
  organizer_role text,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  capacity integer,
  status event_status DEFAULT 'draft',
  visibility event_visibility DEFAULT 'public',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  status text DEFAULT 'registered', -- registered|attended|cancelled
  role text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current user's profile values more efficiently
-- (optional; queries below will use subselects against profiles)

-- SELECT policy: allow viewing events according to scope
CREATE POLICY events_select_scope ON events
  FOR SELECT
  USING (
    (
      scope = 'national'
      OR (scope = 'district' AND district_id IS NOT NULL AND district_id = (
        SELECT district_id FROM profiles WHERE id = auth.uid()
      ))
      OR (scope = 'local' AND branch_id IS NOT NULL AND branch_id = (
        SELECT branch_id FROM profiles WHERE id = auth.uid()
      ))
    )
    -- allow the event organizer to view their own events
    OR (organizer_id = auth.uid())
  );

-- INSERT policies
-- Branch admin may INSERT local events for their branch
CREATE POLICY events_insert_local_admin ON events
  FOR INSERT
  WITH CHECK (
    scope = 'local'
    AND branch_id IS NOT NULL
    AND branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'branch_admin'
  );

-- District admin may INSERT district events for their district
CREATE POLICY events_insert_district_admin ON events
  FOR INSERT
  WITH CHECK (
    scope = 'district'
    AND district_id IS NOT NULL
    AND district_id = (
      SELECT district_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'district_admin'
  );

-- Super admin may INSERT national events
CREATE POLICY events_insert_super_admin ON events
  FOR INSERT
  WITH CHECK (
    scope = 'national'
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'super_admin'
  );

-- UPDATE policies
-- Branch admins may UPDATE events that are local and belong to their branch
CREATE POLICY events_update_local_admin ON events
  FOR UPDATE
  USING (
    scope = 'local'
    AND branch_id IS NOT NULL
    AND branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'branch_admin'
  )
  WITH CHECK (
    scope = 'local'
    AND branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
  );

-- District admins may UPDATE district events in their district
CREATE POLICY events_update_district_admin ON events
  FOR UPDATE
  USING (
    scope = 'district'
    AND district_id IS NOT NULL
    AND district_id = (
      SELECT district_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'district_admin'
  )
  WITH CHECK (
    scope = 'district'
    AND district_id = (
      SELECT district_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Super admin may UPDATE national events
CREATE POLICY events_update_super_admin ON events
  FOR UPDATE
  USING (
    scope = 'national'
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'super_admin'
  )
  WITH CHECK (
    scope = 'national'
  );

-- DELETE policies (same semantics as update)
CREATE POLICY events_delete_local_admin ON events
  FOR DELETE
  USING (
    scope = 'local'
    AND branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'branch_admin'
  );

CREATE POLICY events_delete_district_admin ON events
  FOR DELETE
  USING (
    scope = 'district'
    AND district_id = (
      SELECT district_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'district_admin'
  );

CREATE POLICY events_delete_super_admin ON events
  FOR DELETE
  USING (
    scope = 'national'
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'super_admin'
  );

-- Allow organizers to manage their own events regardless of role
CREATE POLICY events_organizer_manage ON events
  FOR ALL
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- For event_participants table, allow authenticated users to INSERT (register)
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

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
