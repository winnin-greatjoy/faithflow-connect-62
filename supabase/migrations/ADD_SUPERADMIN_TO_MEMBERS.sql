-- ADD SUPERADMIN TO MEMBERS TABLE
-- Run this AFTER you have created at least one branch

DO $$
DECLARE
  v_email TEXT := 'sahrbsesay@gmail.com';  -- Same email as superadmin
  v_user_id UUID;
  v_profile_id UUID;
  v_branch_id UUID;
  v_member_id UUID;
BEGIN
  -- Get the superadmin's profile
  SELECT p.id INTO v_profile_id
  FROM public.profiles p
  WHERE p.role = 'super_admin'
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Superadmin profile not found. Run SETUP_SUPERADMIN.sql first.';
  END IF;

  -- Get the first/main branch
  SELECT id INTO v_branch_id
  FROM public.church_branches
  WHERE is_main = true
  LIMIT 1;

  IF v_branch_id IS NULL THEN
    -- Get any branch if no main branch
    SELECT id INTO v_branch_id FROM public.church_branches LIMIT 1;
  END IF;

  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'No branch found. Create a branch first via the admin dashboard.';
  END IF;

  -- Check if member already exists with this profile_id
  SELECT id INTO v_member_id
  FROM public.members
  WHERE profile_id = v_profile_id;

  IF v_member_id IS NOT NULL THEN
    RAISE NOTICE 'Member already exists for this profile (ID: %)', v_member_id;
  ELSE
    -- Create member record
    INSERT INTO public.members (
      id,
      full_name,
      email,
      phone,
      date_of_birth,
      gender,
      marital_status,
      community,
      area,
      street,
      branch_id,
      date_joined,
      membership_level,
      baptized_sub_level,
      leader_role,
      status,
      profile_id,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'Winnin GreatJoy',           -- Full name
      v_email,                      -- Email
      '+233000000000',              -- Phone (change this)
      '1990-01-01',                 -- Date of birth (change this)
      'male',                       -- Gender
      'single',                     -- Marital status
      'Community',                  -- Community
      'Area',                       -- Area
      'Street',                     -- Street
      v_branch_id,                  -- Branch
      CURRENT_DATE,                 -- Join date
      'baptized',                   -- Membership level (baptized = can have account)
      'leader',                     -- Sub-level (leader since superadmin)
      'pastor',                     -- Leader role
      'active',                     -- Status
      v_profile_id,                 -- Links to profile (and therefore auth)
      NOW(),
      NOW()
    ) RETURNING id INTO v_member_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPERADMIN ADDED TO MEMBERS TABLE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Member ID: %', v_member_id;
    RAISE NOTICE 'Profile ID: %', v_profile_id;
    RAISE NOTICE 'Branch ID: %', v_branch_id;
    RAISE NOTICE '';
    RAISE NOTICE 'You can now update your member details via the admin dashboard.';
    RAISE NOTICE '========================================';
  END IF;
END $$;

-- Verify
SELECT 
  m.id as member_id,
  m.full_name,
  m.email,
  m.membership_level,
  m.leader_role,
  p.role as profile_role,
  b.name as branch_name
FROM public.members m
JOIN public.profiles p ON p.id = m.profile_id
LEFT JOIN public.church_branches b ON b.id = m.branch_id
WHERE p.role = 'super_admin';
