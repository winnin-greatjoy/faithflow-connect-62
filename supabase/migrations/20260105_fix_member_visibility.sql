-- Migration: Fix Member & First Timer Visibility (Direct SQL)
-- Created: 2026-01-05

-- 1. Correct has_branch_access function (as a backup)
CREATE OR REPLACE FUNCTION public.has_branch_access(p_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_branch_id UUID;
BEGIN
    SELECT role, branch_id INTO user_role, user_branch_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    IF user_role = 'super_admin' THEN RETURN TRUE; END IF;
    IF user_role = 'district_admin' THEN RETURN public.is_district_admin_for_branch(p_branch_id); END IF;
    IF user_role IN ('admin', 'pastor', 'leader', 'branch_admin') THEN RETURN user_branch_id = p_branch_id; END IF;
    RETURN FALSE;
END;
$$;

-- 2. Update Members Read Policy with robust checks
DROP POLICY IF EXISTS "members_read_policy" ON members;
CREATE POLICY "members_read_policy" ON members
  FOR SELECT
  USING (
    -- Superadmins
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
    OR
    -- Direct branch match
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR
    -- District Admin check
    EXISTS (
        SELECT 1 FROM districts d
        JOIN church_branches cb ON cb.district_id = d.id
        WHERE d.head_admin_id = auth.uid()
        AND cb.id = members.branch_id
    )
    OR
    -- Self-service
    auth.uid() = id
  );

-- 3. Update First Timers Read Policy
DROP POLICY IF EXISTS "first_timers_read_policy" ON first_timers;
CREATE POLICY "first_timers_read_policy" ON first_timers
  FOR SELECT
  USING (
    -- Superadmins
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
    OR
    -- Direct branch match
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR
    -- District Admin check
    EXISTS (
        SELECT 1 FROM districts d
        JOIN church_branches cb ON cb.district_id = d.id
        WHERE d.head_admin_id = auth.uid()
        AND cb.id = first_timers.branch_id
    )
  );
