-- ============================================================================
-- FIX: Allow public access to active ministries for landing page
-- FIX: Set search_path on functions missing it
-- ============================================================================

-- 1. Add public read access for active ministries (for landing page display)
DROP POLICY IF EXISTS "Public can view active ministries" ON public.ministries;
CREATE POLICY "Public can view active ministries"
  ON public.ministries
  FOR SELECT
  USING (is_active = true);

-- 2. Fix functions missing search_path (security best practice)

-- Fix trigger_set_timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$;

-- Fix _enum_role_to_slug
CREATE OR REPLACE FUNCTION public._enum_role_to_slug(_r app_role)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _r
    WHEN 'super_admin' THEN 'super-admin'
    WHEN 'admin' THEN 'admin'
    WHEN 'pastor' THEN 'pastor'
    WHEN 'leader' THEN 'leader'
    WHEN 'worker' THEN 'worker'
    WHEN 'member' THEN 'member'
  END;
$$;