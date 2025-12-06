-- Create Superadmin Account Setup
-- Run this migration to create the evangelism_events table and set up a superadmin account

-- 1. Create evangelism_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.evangelism_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  end_date DATE,
  estimated_attendees INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
  recurrence_end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.evangelism_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evangelism_events
CREATE POLICY evangelism_events_view ON public.evangelism_events
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  );

CREATE POLICY evangelism_events_create ON public.evangelism_events
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  );

CREATE POLICY evangelism_events_update ON public.evangelism_events
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 2. SUPERADMIN ACCOUNT SETUP INSTRUCTIONS
-- ==========================================
-- Run these SQL commands manually in Supabase SQL Editor after migration:

/*
-- Step 1: Create a superadmin user in auth.users (replace with your email/password)
-- You must do this in the Supabase Dashboard > Authentication > Users
-- OR use this SQL (replace email and encrypted_password):

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'superadmin@faithhealing.org', -- CHANGE THIS
  crypt('YourSecurePassword123', gen_salt('bf')), -- CHANGE THIS
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Step 2: Get the user ID from the inserted user
-- SELECT id FROM auth.users WHERE email = 'superadmin@faithhealing.org';

-- Step 3: Create profile for superadmin (use the ID from step 2)
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  branch_id
) VALUES (
  'USER_ID_FROM_STEP_2', -- Replace with actual user ID
  'System Superadmin',
  'superadmin@faithhealing.org',
  'super_admin',
  (SELECT id FROM public.church_branches WHERE is_main = true LIMIT 1) -- Assign to main branch
);

-- Step 4: Add super_admin role
INSERT INTO public.user_roles (
  user_id,
  role,
  branch_id
) VALUES (
  'USER_ID_FROM_STEP_2', -- Replace with actual user ID
  'super_admin',
  (SELECT id FROM public.church_branches WHERE is_main = true LIMIT 1)
);
*/

-- 3. EASIER METHOD: Use Supabase Dashboard
-- ==========================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" or "Invite User"
-- 3. Create user with email: superadmin@faithhealing.org
-- 4. After user is created, run this SQL to add superadmin role:
/*
INSERT INTO public.user_roles (user_id, role, branch_id)
SELECT 
  au.id,
  'super_admin'::public.app_role,
  (SELECT id FROM public.church_branches WHERE is_main = true LIMIT 1)
FROM auth.users au
WHERE au.email = 'superadmin@faithhealing.org'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'super_admin'
);

-- Also update profile
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'superadmin@faithhealing.org');
*/

-- 4. Verify superadmin was created correctly
/*
SELECT 
  au.email,
  p.full_name,
  p.role as profile_role,
  ur.role as user_role,
  cb.name as branch_name
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
LEFT JOIN public.church_branches cb ON cb.id = ur.branch_id
WHERE au.email = 'superadmin@faithhealing.org';
*/

-- Add updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_evangelism_events_updated_at'
  ) THEN
    CREATE TRIGGER update_evangelism_events_updated_at
    BEFORE UPDATE ON public.evangelism_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evangelism_events_date ON public.evangelism_events(event_date);
CREATE INDEX IF NOT EXISTS idx_evangelism_events_created_by ON public.evangelism_events(created_by);
