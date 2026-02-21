-- DEFINITIVE FIX FOR PROFILES RLS RECURSION
-- This migration programmatically drops ALL policies on the profiles table 
-- and recreates them using safe, non-recursive methods.

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. BASE SELECT POLICY
-- Extremely simple: Users can see their own profile, and anyone authenticated can see basic info?
-- Actually, let's keep it to self-view and admin-view for maximum security.
CREATE POLICY "profiles_self_select"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 2. ADMIN SELECT POLICY
-- Use a subquery on user_roles, which does not query profiles.
CREATE POLICY "profiles_admin_select"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- 3. SELF UPDATE POLICY
-- Simple check. Role protection should be handled by triggers, not RLS recursion.
CREATE POLICY "profiles_self_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. ADMIN UPDATE POLICY
CREATE POLICY "profiles_admin_update"
ON public.profiles FOR UPDATE
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

-- 5. Helper Function Updates (Breaking the circular dependency)
-- has_branch_access should NEVER query profiles.
CREATE OR REPLACE FUNCTION public.has_branch_access(p_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role public.app_role;
    user_branch_id UUID;
BEGIN
    -- Query user_roles ONLY
    SELECT role, branch_id INTO user_role, user_branch_id
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN user_role = 'super_admin' OR 
           user_role = 'admin' OR
           (user_role = 'pastor' AND user_branch_id = p_branch_id) OR
           (user_role = 'leader' AND user_branch_id = p_branch_id);
END;
$$;

-- is_user_baptized should be safe if profiles select is simple, 
-- but let's make it security definer and set search path.
CREATE OR REPLACE FUNCTION public.is_user_baptized()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_baptized FROM public.profiles WHERE id = auth.uid();
$$;
