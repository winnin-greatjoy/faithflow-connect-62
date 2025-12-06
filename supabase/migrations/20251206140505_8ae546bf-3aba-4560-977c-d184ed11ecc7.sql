-- ============================================================================
-- SETUP SUPERADMIN - Initial superadmin account setup
-- Run this once to create the initial superadmin user
-- ============================================================================

-- First, ensure there's at least one church branch (main branch)
INSERT INTO public.church_branches (name, slug, address, is_main)
SELECT 'Main Branch', 'main', 'Main Church Address', true
WHERE NOT EXISTS (SELECT 1 FROM public.church_branches WHERE is_main = true);

-- Create a superadmin role entry for the first authenticated user if none exists
-- Note: You need to first sign up a user via the app, then run this to make them superadmin
-- Replace 'your-admin@email.com' with the actual email after signing up

-- This creates a helper function to setup superadmin by email
CREATE OR REPLACE FUNCTION public.setup_superadmin(admin_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  branch_uuid uuid;
BEGIN
  -- Get user ID from auth.users by email
  SELECT id INTO user_uuid FROM auth.users WHERE email = admin_email LIMIT 1;
  
  IF user_uuid IS NULL THEN
    RETURN 'Error: User with email ' || admin_email || ' not found. Please sign up first.';
  END IF;
  
  -- Get main branch ID
  SELECT id INTO branch_uuid FROM public.church_branches WHERE is_main = true LIMIT 1;
  
  IF branch_uuid IS NULL THEN
    -- Create main branch if not exists
    INSERT INTO public.church_branches (name, slug, address, is_main)
    VALUES ('Main Branch', 'main', 'Main Church Address', true)
    RETURNING id INTO branch_uuid;
  END IF;
  
  -- Update profile to super_admin role
  UPDATE public.profiles 
  SET role = 'super_admin', branch_id = branch_uuid
  WHERE id = user_uuid;
  
  -- Insert into user_roles if not exists
  INSERT INTO public.user_roles (user_id, role, branch_id)
  VALUES (user_uuid, 'super_admin', branch_uuid)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN 'Success: ' || admin_email || ' is now a superadmin for branch: ' || branch_uuid;
END;
$$;

-- Grant execute permission to authenticated users (for initial setup)
GRANT EXECUTE ON FUNCTION public.setup_superadmin(text) TO authenticated;

-- USAGE: After signing up, run this in SQL Editor:
-- SELECT setup_superadmin('your-admin@email.com');