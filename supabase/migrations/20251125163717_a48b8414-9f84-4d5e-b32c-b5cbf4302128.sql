-- Fix deletion issues by adding CASCADE to foreign keys

-- Drop existing foreign key constraints that might block deletion
ALTER TABLE children DROP CONSTRAINT IF EXISTS children_member_id_fkey;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_member_id_fkey;
ALTER TABLE department_assignments DROP CONSTRAINT IF EXISTS department_assignments_member_id_fkey;
ALTER TABLE ministry_members DROP CONSTRAINT IF EXISTS ministry_members_member_id_fkey;
ALTER TABLE committee_members DROP CONSTRAINT IF EXISTS committee_members_member_id_fkey;

-- Recreate with CASCADE delete
ALTER TABLE children 
  ADD CONSTRAINT children_member_id_fkey 
  FOREIGN KEY (member_id) 
  REFERENCES members(id) 
  ON DELETE CASCADE;

ALTER TABLE attendance 
  ADD CONSTRAINT attendance_member_id_fkey 
  FOREIGN KEY (member_id) 
  REFERENCES members(id) 
  ON DELETE CASCADE;

ALTER TABLE department_assignments 
  ADD CONSTRAINT department_assignments_member_id_fkey 
  FOREIGN KEY (member_id) 
  REFERENCES members(id) 
  ON DELETE CASCADE;

ALTER TABLE ministry_members 
  ADD CONSTRAINT ministry_members_member_id_fkey 
  FOREIGN KEY (member_id) 
  REFERENCES members(id) 
  ON DELETE CASCADE;

ALTER TABLE committee_members 
  ADD CONSTRAINT committee_members_member_id_fkey 
  FOREIGN KEY (member_id) 
  REFERENCES members(id) 
  ON DELETE CASCADE;

-- Add RLS policy to allow admins to delete members
DROP POLICY IF EXISTS "Admins can delete members" ON members;
CREATE POLICY "Admins can delete members"
  ON members
  FOR DELETE
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'pastor'::app_role)
  );