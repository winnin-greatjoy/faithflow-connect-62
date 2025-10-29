-- Fix RLS policies for streams table to check profiles.role
DROP POLICY IF EXISTS "Admins and pastors can manage streams" ON streams;

CREATE POLICY "Admins and pastors can manage streams"
ON streams
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'pastor', 'leader')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'pastor', 'leader')
  )
);

-- Fix RLS policies for members table to allow inserts
DROP POLICY IF EXISTS "Leaders can manage members in their branch" ON members;

CREATE POLICY "Leaders can manage members in their branch"
ON members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'pastor', 'leader')
    AND (profiles.branch_id = members.branch_id OR profiles.branch_id IS NULL)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'pastor', 'leader')
    AND (profiles.branch_id = members.branch_id OR profiles.branch_id IS NULL)
  )
);