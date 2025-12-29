-- Phase 3: Security Hardening - RLS Policies
-- Created: 2025-12-29
-- Purpose: Strengthen Row Level Security for members and first_timers tables

-- ============================================================================
-- 1. CREATE AUDIT LOGS TABLE  
-- ============================================================================

-- Drop existing audit_logs table if it exists (clean slate)
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster audit log queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admins can read audit logs  
CREATE POLICY "super_admin_audit_logs_read" ON audit_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- Edge functions can insert audit logs (using service role)
CREATE POLICY "service_role_audit_logs_insert" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. DROP EXISTING POLICIES (Clean Slate)
-- ============================================================================

-- Drop existing policies on members table
DROP POLICY IF EXISTS "admin_members_select" ON members;
DROP POLICY IF EXISTS "super_admin_members_all" ON members;
DROP POLICY IF EXISTS "members_select_policy" ON members;
DROP POLICY IF EXISTS "members_insert_policy" ON members;
DROP POLICY IF EXISTS "members_update_policy" ON members;
DROP POLICY IF EXISTS "members_delete_policy" ON members;

-- Drop existing policies on first_timers table
DROP POLICY IF EXISTS "admin_first_timers_select" ON first_timers;
DROP POLICY IF EXISTS "super_admin_first_timers_all" ON first_timers;
DROP POLICY IF EXISTS "first_timers_select_policy" ON first_timers;
DROP POLICY IF EXISTS "first_timers_insert_policy" ON first_timers;
DROP POLICY IF EXISTS "first_timers_update_policy" ON first_timers;
DROP POLICY IF EXISTS "first_timers_delete_policy" ON first_timers;

-- ============================================================================
-- 3. MEMBERS TABLE - NEW RLS POLICIES
-- ============================================================================

-- Enable RLS on members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- READ POLICY: Branch admins see their branch, super_admins see all
CREATE POLICY "members_read_policy" ON members
  FOR SELECT
  USING (
    -- Superadmins can see all members
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
    OR
    -- Branch admins can only see members in their branch
    (
      auth.uid() IN (
        SELECT id FROM profiles 
        WHERE role = 'admin' 
        AND branch_id = members.branch_id
      )
    )
    OR
    -- Members can see their own record
    auth.uid() = members.id
  );

-- WRITE POLICIES: Block direct writes, must use Edge Function
-- Note: Edge Function uses service role key which bypasses RLS

CREATE POLICY "members_insert_via_function" ON members
  FOR INSERT
  WITH CHECK (false);  -- Blocks all client-side inserts

CREATE POLICY "members_update_via_function" ON members
  FOR UPDATE
  USING (false)  -- Blocks all client-side updates
  WITH CHECK (false);

CREATE POLICY "members_delete_via_function" ON members
  FOR DELETE
  USING (false);  -- Blocks all client-side deletes

-- ============================================================================
-- 4. FIRST_TIMERS TABLE - NEW RLS POLICIES
-- ============================================================================

-- Enable RLS on first_timers table
ALTER TABLE first_timers ENABLE ROW LEVEL SECURITY;

-- READ POLICY: Branch admins see their branch, super_admins see all
CREATE POLICY "first_timers_read_policy" ON first_timers
  FOR SELECT
  USING (
    -- Superadmins can see all first timers
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
    OR
    -- Branch admins can only see first timers in their branch
    (
      auth.uid() IN (
        SELECT id FROM profiles 
        WHERE role = 'admin' 
        AND branch_id = first_timers.branch_id
      )
    )
  );

-- WRITE POLICIES: Block direct writes, must use Edge Function

CREATE POLICY "first_timers_insert_via_function" ON first_timers
  FOR INSERT
  WITH CHECK (false);  -- Blocks all client-side inserts

CREATE POLICY "first_timers_update_via_function" ON first_timers
  FOR UPDATE
  USING (false)  -- Blocks all client-side updates
  WITH CHECK (false);

CREATE POLICY "first_timers_delete_via_function" ON first_timers
  FOR DELETE
  USING (false);  -- Blocks all client-side deletes

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Grant authenticated users permission to read
GRANT SELECT ON members TO authenticated;
GRANT SELECT ON first_timers TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Grant service role permission to write (for Edge Functions)
GRANT ALL ON members TO service_role;
GRANT ALL ON first_timers TO service_role;
GRANT ALL ON audit_logs TO service_role;

-- ============================================================================
-- NOTES
-- ============================================================================

-- After this migration:
-- 1. All client-side writes to members/first_timers will fail
-- 2. Writes must go through the member-operations Edge Function
-- 3. Edge Function enforces role-based permissions
-- 4. All operations are logged to audit_logs table
-- 5. Branch admins are isolated to their branch
-- 6. Superadmins have full access

-- To rollback: Drop these policies and recreate permissive ones
-- To test: Try direct insert/update/delete from client (should fail)
