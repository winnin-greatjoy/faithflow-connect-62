-- =============================================
-- District Admin RLS Policies Enhancement
-- =============================================

-- Create helper function to check if user is district admin for a given branch
CREATE OR REPLACE FUNCTION public.is_district_admin_for_branch(p_branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM districts d
    JOIN church_branches cb ON cb.district_id = d.id
    WHERE cb.id = p_branch_id 
    AND d.head_admin_id = auth.uid()
  )
$$;

-- Create helper function to check if user is district admin for a given district
CREATE OR REPLACE FUNCTION public.is_district_admin_for_district(p_district_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM districts d
    WHERE d.id = p_district_id 
    AND d.head_admin_id = auth.uid()
  )
$$;

-- =============================================
-- User Roles: Allow district admins to SELECT roles in their district branches
-- =============================================
DROP POLICY IF EXISTS "District admins can view roles in their branches" ON user_roles;
CREATE POLICY "District admins can view roles in their branches"
ON user_roles FOR SELECT
USING (
  is_district_admin_for_branch(branch_id)
);

-- Allow district admins to DELETE roles they assigned
DROP POLICY IF EXISTS "District admins can delete roles in their branches" ON user_roles;
CREATE POLICY "District admins can delete roles in their branches"
ON user_roles FOR DELETE
USING (
  is_district_admin_for_branch(branch_id)
);

-- Allow district admins to UPDATE roles in their branches
DROP POLICY IF EXISTS "District admins can update roles in their branches" ON user_roles;
CREATE POLICY "District admins can update roles in their branches"
ON user_roles FOR UPDATE
USING (
  is_district_admin_for_branch(branch_id)
)
WITH CHECK (
  is_district_admin_for_branch(branch_id)
);

-- =============================================
-- Members: Allow district admins to view members in their district branches
-- =============================================
DROP POLICY IF EXISTS "District admins can view members in their district" ON members;
CREATE POLICY "District admins can view members in their district"
ON members FOR SELECT
USING (
  is_district_admin_for_branch(branch_id)
);

-- =============================================
-- Departments: Allow district admins to view departments in their district
-- =============================================
DROP POLICY IF EXISTS "District admins can view departments in their district" ON departments;
CREATE POLICY "District admins can view departments in their district"
ON departments FOR SELECT
USING (
  is_district_admin_for_branch(branch_id)
);

-- =============================================
-- Events: Allow district admins to view events in their district
-- =============================================
DROP POLICY IF EXISTS "District admins can view events in their district" ON events;
CREATE POLICY "District admins can view events in their district"
ON events FOR SELECT
USING (
  is_district_admin_for_branch(branch_id)
);

-- =============================================
-- Church Branches: Allow district admins to DELETE branches in their district
-- =============================================
DROP POLICY IF EXISTS "Enable delete for district admins in their district" ON church_branches;
CREATE POLICY "Enable delete for district admins in their district"
ON church_branches FOR DELETE
USING (
  is_district_admin_for_district(district_id)
);

-- =============================================
-- Profiles: Allow district admins to view profiles for assignment purposes
-- =============================================
DROP POLICY IF EXISTS "District admins can view profiles for assignment" ON profiles;
CREATE POLICY "District admins can view profiles for assignment"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM districts WHERE head_admin_id = auth.uid()
  )
);