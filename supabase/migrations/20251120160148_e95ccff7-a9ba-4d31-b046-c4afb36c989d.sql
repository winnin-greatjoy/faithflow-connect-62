-- Fix 1: Enable RLS on features table and add admin-only policies
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "features_admin_read" ON features
FOR SELECT TO authenticated
USING (
  has_role('admin'::text, auth.uid()) 
  OR has_role('super_admin'::text, auth.uid())
);

CREATE POLICY "features_admin_write" ON features
FOR ALL TO authenticated
USING (
  has_role('admin'::text, auth.uid()) 
  OR has_role('super_admin'::text, auth.uid())
)
WITH CHECK (
  has_role('admin'::text, auth.uid()) 
  OR has_role('super_admin'::text, auth.uid())
);

-- Fix 2: Restrict members table to authenticated users only
-- Drop existing public policies
DROP POLICY IF EXISTS "Baptized users can view members in their branch" ON members;

-- Create authenticated-only policy for members
CREATE POLICY "members_branch_read_authenticated" ON members
FOR SELECT TO authenticated
USING (
  has_role('admin'::text, auth.uid()) 
  OR (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.branch_id = members.branch_id
      AND p.is_baptized = true
    )
  )
);