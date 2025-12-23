-- Migration: Advanced Event Features (Fees, Audience, Quotas)
-- Date: 2025-12-23

-- 1. Add columns to events table for fees and audience
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'everyone'; 
-- Common values: 'everyone', 'baptized_members', 'workers_and_leaders', 'pastors_and_leaders', 'youth'

-- 2. Create event_quotas table for district/branch financial targets
CREATE TABLE IF NOT EXISTS public.event_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.church_branches(id) ON DELETE CASCADE,
  target_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  collected_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique quota per event per branch/district
  CONSTRAINT unique_event_branch_quota UNIQUE(event_id, branch_id),
  CONSTRAINT unique_event_district_quota UNIQUE(event_id, district_id),
  
  -- Ensure at least one of branch or district is set, but not both at the same time for the same record
  CONSTRAINT one_of_branch_or_district CHECK (
    (branch_id IS NOT NULL AND district_id IS NULL) OR
    (branch_id IS NULL AND district_id IS NOT NULL)
  )
);

-- 3. Add payment tracking to event_registrations
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required';

/* Add check constraint for payment_status */
DO $do$ 
BEGIN
  ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'not_required', 'partially_paid', 'refunded'));
EXCEPTION 
  WHEN duplicate_object THEN NULL; 
END $do$;

-- 4. Enable RLS on event_quotas
ALTER TABLE public.event_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_quotas
-- Organizers and admins can view and manage quotas
CREATE POLICY event_quotas_select_all ON public.event_quotas
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin')
  OR (public.has_role(auth.uid(), 'district_admin') AND district_id IS NOT NULL AND public.is_district_admin_for_district(district_id))
  OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
);

CREATE POLICY event_quotas_manage_admin ON public.event_quotas
FOR ALL USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin')
  OR (public.has_role(auth.uid(), 'district_admin') AND district_id IS NOT NULL AND public.is_district_admin_for_district(district_id))
);

-- 5. Updated_at trigger for event_quotas
DO $do$ 
BEGIN
  BEGIN
    CREATE TRIGGER trg_event_quotas_updated_at
      BEFORE UPDATE ON public.event_quotas
      FOR EACH ROW
      EXECUTE FUNCTION public.update_timestamp();
  EXCEPTION 
    WHEN undefined_function THEN
      /* Fallback if update_timestamp doesn't exist */
      EXECUTE 'CREATE TRIGGER trg_event_quotas_updated_at BEFORE UPDATE ON public.event_quotas FOR EACH ROW EXECUTE FUNCTION public.update_registration_updated_at();';
    WHEN others THEN 
      NULL; 
  END;
END $do$;
