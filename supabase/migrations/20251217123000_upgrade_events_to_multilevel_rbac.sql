-- Upgrade events to support branch/district/national scoping with strict RBAC

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

-- Ensure helper functions exist (safe to re-run)
CREATE OR REPLACE FUNCTION public.is_district_admin_for_branch(p_branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = p_branch_id
    AND d.head_admin_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_district_admin_for_district(p_district_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.districts d
    WHERE d.id = p_district_id
    AND d.head_admin_id = auth.uid()
  )
$$;

-- Add new columns (idempotent)
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

-- Allow district/national events with no branch
DO $$ BEGIN
  ALTER TABLE public.events ALTER COLUMN branch_id DROP NOT NULL;
EXCEPTION WHEN others THEN
  -- ignore if already nullable
  NULL;
END $$;

-- Backfill start/end timestamps from legacy date/time columns if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_date'
  ) THEN
    UPDATE public.events
    SET start_at = COALESCE(start_at, (event_date::timestamptz + COALESCE(start_time, '00:00'::time))),
        end_at = COALESCE(end_at, (event_date::timestamptz + COALESCE(end_time, '23:59'::time)))
    WHERE start_at IS NULL;
  END IF;
END $$;

-- Backfill organizer_id from created_by if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'created_by'
  ) THEN
    UPDATE public.events
    SET organizer_id = COALESCE(organizer_id, created_by)
    WHERE organizer_id IS NULL;
  END IF;
END $$;

-- Backfill district_id for local events based on branch linkage
UPDATE public.events e
SET district_id = cb.district_id
FROM public.church_branches cb
WHERE e.district_id IS NULL
  AND e.branch_id IS NOT NULL
  AND cb.id = e.branch_id;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_events_scope ON public.events(scope);
CREATE INDEX IF NOT EXISTS idx_events_branch_id ON public.events(branch_id);
CREATE INDEX IF NOT EXISTS idx_events_district_id ON public.events(district_id);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop legacy/conflicting policies
DROP POLICY IF EXISTS events_select ON public.events;
DROP POLICY IF EXISTS events_insert ON public.events;
DROP POLICY IF EXISTS events_update ON public.events;

DROP POLICY IF EXISTS events_select_scope ON public.events;
DROP POLICY IF EXISTS events_insert_local_admin ON public.events;
DROP POLICY IF EXISTS events_insert_district_admin ON public.events;
DROP POLICY IF EXISTS events_insert_super_admin ON public.events;
DROP POLICY IF EXISTS events_update_local_admin ON public.events;
DROP POLICY IF EXISTS events_update_district_admin ON public.events;
DROP POLICY IF EXISTS events_update_super_admin ON public.events;
DROP POLICY IF EXISTS events_delete_local_admin ON public.events;
DROP POLICY IF EXISTS events_delete_district_admin ON public.events;
DROP POLICY IF EXISTS events_delete_super_admin ON public.events;
DROP POLICY IF EXISTS events_organizer_manage ON public.events;

DROP POLICY IF EXISTS events_select_multilevel ON public.events;

DROP POLICY IF EXISTS "District admins can view events in their district" ON public.events;

-- SELECT: national visible to everyone, district visible to branches in district + district admin, local visible to branch + district admin of that branch
CREATE POLICY events_select_multilevel ON public.events
FOR SELECT
USING (
  scope = 'national'
  OR (
    scope = 'district'
    AND district_id IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'super_admin'::public.app_role)
      OR public.is_district_admin_for_district(district_id)
      OR EXISTS (
        SELECT 1
        FROM public.church_branches cb
        WHERE cb.id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
        AND cb.district_id = public.events.district_id
      )
    )
  )
  OR (
    scope = 'local'
    AND branch_id IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'super_admin'::public.app_role)
      OR public.is_district_admin_for_branch(branch_id)
      OR public.has_branch_access(branch_id)
    )
  )
);

-- INSERT: admins create local (branch-scoped), district_admin creates district, super_admin creates national
CREATE POLICY events_insert_local_admin ON public.events
FOR INSERT
WITH CHECK (
  scope = 'local'
  AND branch_id IS NOT NULL
  AND district_id IS NULL
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
  AND branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY events_insert_district_admin ON public.events
FOR INSERT
WITH CHECK (
  scope = 'district'
  AND branch_id IS NULL
  AND district_id IS NOT NULL
  AND public.has_role(auth.uid(), 'district_admin'::public.app_role)
  AND public.is_district_admin_for_district(district_id)
);

CREATE POLICY events_insert_super_admin ON public.events
FOR INSERT
WITH CHECK (
  scope = 'national'
  AND branch_id IS NULL
  AND district_id IS NULL
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- UPDATE: same scope rules; prevent changing scope/ownership
CREATE POLICY events_update_local_admin ON public.events
FOR UPDATE
USING (
  scope = 'local'
  AND branch_id IS NOT NULL
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
  AND branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  scope = 'local'
  AND branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
  AND district_id IS NULL
);

CREATE POLICY events_update_district_admin ON public.events
FOR UPDATE
USING (
  scope = 'district'
  AND district_id IS NOT NULL
  AND public.has_role(auth.uid(), 'district_admin'::public.app_role)
  AND public.is_district_admin_for_district(district_id)
)
WITH CHECK (
  scope = 'district'
  AND district_id IS NOT NULL
  AND public.is_district_admin_for_district(district_id)
  AND branch_id IS NULL
);

CREATE POLICY events_update_super_admin ON public.events
FOR UPDATE
USING (
  scope = 'national'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
)
WITH CHECK (
  scope = 'national'
  AND branch_id IS NULL
  AND district_id IS NULL
);

-- DELETE: same semantics
CREATE POLICY events_delete_local_admin ON public.events
FOR DELETE
USING (
  scope = 'local'
  AND branch_id IS NOT NULL
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
  AND branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY events_delete_district_admin ON public.events
FOR DELETE
USING (
  scope = 'district'
  AND district_id IS NOT NULL
  AND public.has_role(auth.uid(), 'district_admin'::public.app_role)
  AND public.is_district_admin_for_district(district_id)
);

CREATE POLICY events_delete_super_admin ON public.events
FOR DELETE
USING (
  scope = 'national'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);
