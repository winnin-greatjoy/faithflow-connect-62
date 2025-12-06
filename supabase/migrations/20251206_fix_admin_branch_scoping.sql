-- Fix RLS Policies: Restrict Admin to Their Branch Only
-- Only Superadmin should have access to all branches
-- Admins, Pastors, Leaders, Workers should only access their assigned branch

-- ============================================================================
-- CORRECT ACCESS MODEL:
-- - Superadmin: Access ALL branches (system-wide)
-- - Admin: Access ONLY their assigned branch
-- - Pastor/Leader/Worker: Access ONLY their assigned branch
-- ============================================================================

-- Drop and recreate policies for proper branch scoping

-- 1. MEMBERS TABLE - Fix branch scoping
-- ============================================================================
DROP POLICY IF EXISTS members_select ON public.members;
CREATE POLICY members_select ON public.members
  FOR SELECT
  USING (
    -- Superadmin: sees all members
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    -- Others: only members from their branch
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS members_insert ON public.members;
CREATE POLICY members_insert ON public.members
  FOR INSERT
  WITH CHECK (
    -- Superadmin: can add members to any branch
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    -- Others: can only add members to their branch
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS members_update ON public.members;
CREATE POLICY members_update ON public.members
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

-- 2. EVENTS TABLE - Fix branch scoping
-- ============================================================================
DROP POLICY IF EXISTS events_select ON public.events;
CREATE POLICY events_select ON public.events
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS events_insert ON public.events;
CREATE POLICY events_insert ON public.events
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS events_update ON public.events;
CREATE POLICY events_update ON public.events
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

-- 3. DEPARTMENTS TABLE - Fix branch scoping
-- ============================================================================
DROP POLICY IF EXISTS departments_select ON public.departments;
CREATE POLICY departments_select ON public.departments
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS departments_insert ON public.departments;
CREATE POLICY departments_insert ON public.departments
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    (public.has_role(auth.uid(), 'admin'::public.app_role) AND public.has_branch_access(branch_id))
  );

DROP POLICY IF EXISTS departments_update ON public.departments;
CREATE POLICY departments_update ON public.departments
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    (public.has_role(auth.uid(), 'admin'::public.app_role) AND public.has_branch_access(branch_id))
  );

-- 4. ATTENDANCE TABLE - Fix branch scoping
-- ============================================================================
DROP POLICY IF EXISTS attendance_select ON public.attendance;
CREATE POLICY attendance_select ON public.attendance
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS attendance_insert ON public.attendance;
CREATE POLICY attendance_insert ON public.attendance
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

-- 5. MINISTRIES TABLE - Fix branch scoping
-- ============================================================================
DROP POLICY IF EXISTS ministries_select ON public.ministries;
CREATE POLICY ministries_select ON public.ministries
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_branch_access(branch_id)
  );

DROP POLICY IF EXISTS ministries_insert ON public.ministries;
CREATE POLICY ministries_insert ON public.ministries
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    (public.has_role(auth.uid(), 'admin'::public.app_role) AND public.has_branch_access(branch_id))
  );

-- 6. CHURCH_BRANCHES TABLE - Superadmin can see all, others see only theirs
-- ============================================================================
DROP POLICY IF EXISTS church_branches_select ON public.church_branches;
CREATE POLICY church_branches_select ON public.church_branches
  FOR SELECT
  USING (
    -- Superadmin: sees all branches
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    -- Others: only see their own branch
    id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
  );

-- Only superadmin can modify branches
DROP POLICY IF EXISTS church_branches_insert ON public.church_branches;
CREATE POLICY church_branches_insert ON public.church_branches
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

DROP POLICY IF EXISTS church_branches_update ON public.church_branches;
CREATE POLICY church_branches_update ON public.church_branches
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- 7. EVANGELISM_EVENTS TABLE - Branch scoped
-- ============================================================================
DROP POLICY IF EXISTS evangelism_events_view ON public.evangelism_events;
CREATE POLICY evangelism_events_view ON public.evangelism_events
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    -- Event must be from user's branch (derive from creator's branch)
    created_by IN (
      SELECT id FROM public.profiles WHERE branch_id = (
        SELECT branch_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS evangelism_events_create ON public.evangelism_events;
CREATE POLICY evangelism_events_create ON public.evangelism_events
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  );

-- 8. USER_ROLES TABLE - Important for branch admin assignment
-- ============================================================================
DROP POLICY IF EXISTS user_roles_select ON public.user_roles;
CREATE POLICY user_roles_select ON public.user_roles
  FOR SELECT
  USING (
    -- Superadmin: sees all role assignments
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    -- Users see their own roles
    user_id = auth.uid() OR
    -- Admins see roles within their branch only
    (public.has_role(auth.uid(), 'admin'::public.app_role) AND 
     branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()))
  );

-- Only superadmin can assign roles
DROP POLICY IF EXISTS user_roles_insert ON public.user_roles;
CREATE POLICY user_roles_insert ON public.user_roles
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

DROP POLICY IF EXISTS user_roles_update ON public.user_roles;
CREATE POLICY user_roles_update ON public.user_roles
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

DROP POLICY IF EXISTS user_roles_delete ON public.user_roles;
CREATE POLICY user_roles_delete ON public.user_roles
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify proper branch scoping:

/*
-- 1. Check current user's branch and role
SELECT 
  p.full_name,
  p.role,
  cb.name as branch_name,
  cb.is_main
FROM public.profiles p
LEFT JOIN public.church_branches cb ON cb.id = p.branch_id
WHERE p.id = auth.uid();

-- 2. Test member visibility for current user
SELECT 
  m.full_name,
  cb.name as member_branch
FROM public.members m
JOIN public.church_branches cb ON cb.id = m.branch_id
LIMIT 10;
-- Admin should ONLY see members from their branch
-- Superadmin should see members from ALL branches

-- 3. Test branch visibility
SELECT 
  name,
  is_main,
  address
FROM public.church_branches;
-- Admin should ONLY see their branch
-- Superadmin should see ALL branches

-- 4. Test has_branch_access function
SELECT 
  cb.name as branch_name,
  public.has_branch_access(cb.id) as can_access
FROM public.church_branches cb;
-- Should return true ONLY for user's branch (false for superadmin who uses different check)
*/

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY members_select ON public.members IS 
'Superadmin sees all members. Others see only members from their branch.';

COMMENT ON POLICY church_branches_select ON public.church_branches IS 
'Superadmin sees all branches. Others see only their assigned branch.';

COMMENT ON POLICY user_roles_insert ON public.user_roles IS 
'Only superadmin can assign roles to maintain security and prevent privilege escalation.';
