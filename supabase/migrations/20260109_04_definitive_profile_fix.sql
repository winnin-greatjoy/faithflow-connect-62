-- FINAL DEFINITIVE FIX FOR PROFILES RECURSION AND MISSING FIELDS
-- This migration:
-- 1. Adds middle_name and nickname columns to profiles
-- 2. Programmatically nuke ALL policies on profiles table
-- 3. Recreates safe, non-recursive policies
-- 4. Updates has_branch_access to be safer

-- 1. Add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- 2. Nuke all policies on profiles
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 3. Create simple, safe policies
-- Owners can do everything with their own profile
CREATE POLICY "profiles_owner_all"
ON public.profiles FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can view and update all
CREATE POLICY "profiles_admin_all"
ON public.profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- District admins can view
CREATE POLICY "profiles_district_admin_select"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.districts 
    WHERE head_admin_id = auth.uid()
  )
);

-- 4. Refine has_branch_access to avoid profiles table entirely
CREATE OR REPLACE FUNCTION public.has_branch_access(p_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role public.app_role;
    user_branch_id UUID;
BEGIN
    -- Query user_roles directly to avoid circular dependency with profiles
    SELECT role, branch_id INTO user_role, user_branch_id
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN user_role = 'super_admin' OR 
           user_role = 'admin' OR
           (user_role IN ('pastor', 'leader', 'worker') AND user_branch_id = p_branch_id);
END;
$$;

-- 5. Refine is_user_baptized to be stable and avoid recursion
CREATE OR REPLACE FUNCTION public.is_user_baptized()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- This is safe as it's a direct ID lookup which is allowed by the profiles_owner_all policy
  SELECT is_baptized FROM public.profiles WHERE id = auth.uid();
$$;
