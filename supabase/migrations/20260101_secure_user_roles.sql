
-- Secure user_roles table
-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can view their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Admins can manage roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Authenticated users can read user_roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Admins can perform all actions on user_roles" ON "public"."user_roles";

-- Make sure RLS is enabled
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

-- 1. READ ACCESS: Allow authenticated users to read roles (needed for frontend UI to show roles)
CREATE POLICY "Allow read access for authenticated users"
ON "public"."user_roles"
FOR SELECT
TO authenticated
USING (true);

-- 2. WRITE ACCESS: DENY ALL for standard users.
-- Since we are not creating any FOR INSERT/UPDATE/DELETE policies, they are implicitly denied for 'public' and 'authenticated' roles.
-- Writes must be performed by the 'service_role' (which bypasses RLS) via Edge Functions.

-- Note: We do NOT create policies for service_role as it bypasses RLS automatically.

