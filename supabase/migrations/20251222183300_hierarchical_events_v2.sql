-- Migration: Hierarchical Event Management System
-- Date: 2025-12-22

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_level_type') THEN
    CREATE TYPE public.event_level_type AS ENUM ('NATIONAL', 'DISTRICT', 'BRANCH');
  END IF;
END$$;

-- Add columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_level public.event_level_type DEFAULT 'BRANCH',
ADD COLUMN IF NOT EXISTS owner_scope_id UUID,
ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id);

-- Backfill existing events
-- If 'scope' exists from previous partial implementation, map it
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='scope') THEN
    UPDATE public.events 
    SET event_level = CASE 
      WHEN scope = 'national' THEN 'NATIONAL'::public.event_level_type
      WHEN scope = 'district' THEN 'DISTRICT'::public.event_level_type
      ELSE 'BRANCH'::public.event_level_type
    END,
    owner_scope_id = COALESCE(branch_id, district_id);
  ELSE
    UPDATE public.events SET event_level = 'BRANCH', owner_scope_id = branch_id WHERE event_level IS NULL;
  END IF;
END $$;

-- Enforce RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS events_select_hierarchical ON public.events;
DROP POLICY IF EXISTS events_insert_hierarchical ON public.events;
DROP POLICY IF EXISTS events_update_hierarchical ON public.events;
DROP POLICY IF EXISTS events_delete_hierarchical ON public.events;

-- 1. Visibility Rules (SELECT)
-- National: Visible to everyone
-- District: Visible only to branches in the same district or the district admin
-- Branch: Visible only within the branch
CREATE POLICY events_select_hierarchical ON public.events
FOR SELECT
USING (
  event_level = 'NATIONAL'
  OR (
    event_level = 'DISTRICT'
    AND (
      public.has_role(auth.uid(), 'super_admin')
      OR public.is_district_admin_for_district(district_id)
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        JOIN public.church_branches cb ON p.branch_id = cb.id
        WHERE p.id = auth.uid() AND cb.district_id = public.events.district_id
      )
    )
  )
  OR (
    event_level = 'BRANCH'
    AND (
      public.has_role(auth.uid(), 'super_admin')
      OR public.is_district_admin_for_branch(branch_id)
      OR branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
    )
  )
);

-- 2. Creation Rules (INSERT)
-- Super Admins -> NATIONAL
-- District Admins -> DISTRICT (restricted to their district)
-- Branch Admins -> BRANCH (restricted to their branch)
CREATE POLICY events_insert_hierarchical ON public.events
FOR INSERT
WITH CHECK (
  (event_level = 'NATIONAL' AND public.has_role(auth.uid(), 'super_admin'))
  OR (
    event_level = 'DISTRICT' 
    AND public.has_role(auth.uid(), 'district_admin') 
    AND public.is_district_admin_for_district(owner_scope_id)
  )
  OR (
    event_level = 'BRANCH' 
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
    AND owner_scope_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- 3. Management Rules (UPDATE/DELETE)
-- Only creators/admins of the respective level can modify
CREATE POLICY events_update_hierarchical ON public.events
FOR UPDATE
USING (
  (event_level = 'NATIONAL' AND public.has_role(auth.uid(), 'super_admin'))
  OR (
    event_level = 'DISTRICT' 
    AND public.has_role(auth.uid(), 'district_admin') 
    AND public.is_district_admin_for_district(owner_scope_id)
  )
  OR (
    event_level = 'BRANCH' 
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
    AND owner_scope_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY events_delete_hierarchical ON public.events
FOR DELETE
USING (
  (event_level = 'NATIONAL' AND public.has_role(auth.uid(), 'super_admin'))
  OR (
    event_level = 'DISTRICT' 
    AND public.has_role(auth.uid(), 'district_admin') 
    AND public.is_district_admin_for_district(owner_scope_id)
  )
  OR (
    event_level = 'BRANCH' 
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
    AND owner_scope_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
  )
);
