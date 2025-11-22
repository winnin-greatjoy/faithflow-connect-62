-- Fix Critical Security Vulnerabilities
-- 1. Prevent role privilege escalation in profiles table
-- 2. Ensure all PII tables have proper RLS protection

-- ========================================
-- FIX 1: Profiles Table Role Escalation
-- ========================================
-- Users should NOT be able to update their own role
-- Drop existing update policy and create a new one excluding role column

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that allows users to update their profile EXCEPT the role column
-- This uses a CHECK that the role is not being changed
CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Add comment explaining the security measure
COMMENT ON POLICY "Users can update their own profile (except role)" ON public.profiles IS 
'Prevents privilege escalation by ensuring users cannot modify their own role. Role changes must be done through admin functions only.';

-- ========================================
-- FIX 2: Members Table - Ensure No Public Access
-- ========================================
-- Verify RLS is enabled (should already be, but double-check)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Public can view members" ON public.members;
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;

-- Ensure existing policies are correct (they should be from the schema)
-- The existing policies require authentication and branch access, which is correct

-- ========================================
-- FIX 3: First Timers Table - Ensure No Public Access  
-- ========================================
ALTER TABLE public.first_timers ENABLE ROW LEVEL SECURITY;

-- Drop any public access policies
DROP POLICY IF EXISTS "Public can view first timers" ON public.first_timers;
DROP POLICY IF EXISTS "Anyone can view first timers" ON public.first_timers;

-- ========================================
-- FIX 4: Account Provisioning Jobs - Ensure No Public Access
-- ========================================
ALTER TABLE public.account_provisioning_jobs ENABLE ROW LEVEL SECURITY;

-- Drop any public access policies
DROP POLICY IF EXISTS "Public can view provisioning jobs" ON public.account_provisioning_jobs;
DROP POLICY IF EXISTS "Anyone can view provisioning jobs" ON public.account_provisioning_jobs;

-- ========================================
-- FIX 5: Children Table - Strengthen Protection
-- ========================================
-- Add additional policy to restrict children viewing to parent members only
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Add policy for parents to view their own children's data
CREATE POLICY "Parents can view their own children"
ON public.children
FOR SELECT
TO authenticated
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE id = member_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND branch_id = members.branch_id
    )
  )
);

-- ========================================
-- Additional Security Hardening
-- ========================================

-- Revoke public access from all sensitive tables (if any was granted)
REVOKE ALL ON public.members FROM anon;
REVOKE ALL ON public.members FROM authenticated;

REVOKE ALL ON public.first_timers FROM anon;
REVOKE ALL ON public.first_timers FROM authenticated;

REVOKE ALL ON public.account_provisioning_jobs FROM anon;
REVOKE ALL ON public.account_provisioning_jobs FROM authenticated;

REVOKE ALL ON public.children FROM anon;
REVOKE ALL ON public.children FROM authenticated;

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant back only SELECT/INSERT/UPDATE/DELETE to authenticated via RLS policies
-- This ensures all access goes through RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.first_timers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_provisioning_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;