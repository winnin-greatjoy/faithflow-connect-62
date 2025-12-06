-- SIMPLE SUPERADMIN ACCOUNT CREATION
-- Run this ONCE in Supabase SQL Editor to create your first superadmin account
-- After running this, you can login with the credentials below

-- ============================================================================
-- STEP 1: Configure your superadmin email here
-- ============================================================================
DO $$
DECLARE
  v_email TEXT := 'admin@faithhealing.org';  -- CHANGE THIS to your email
  v_password TEXT := 'ChangeMe123!';          -- CHANGE THIS to secure password
  v_full_name TEXT := 'System Administrator'; -- CHANGE THIS to your name
  v_user_id UUID;
  v_branch_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Get the main branch ID
  SELECT id INTO v_branch_id
  FROM public.church_branches
  WHERE is_main = true
  LIMIT 1;

  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'No main branch found. Create a church branch first.';
  END IF;

  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User with email % already exists with ID: %', v_email, v_user_id;
  ELSE
    -- Create user in auth.users
    v_user_id := gen_random_uuid();
    v_encrypted_password := crypt(v_password, gen_salt('bf'));

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_password,
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', v_full_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    RAISE NOTICE 'Created user % with ID: %', v_email, v_user_id;
  END IF;

  -- Create or update profile
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    branch_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_full_name,
    v_email,
    'super_admin',
    v_branch_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      full_name = v_full_name,
      updated_at = NOW();

  RAISE NOTICE 'Created/updated profile for %', v_email;

  -- Add super_admin role
  INSERT INTO public.user_roles (
    user_id,
    role,
    branch_id,
    created_at
  ) VALUES (
    v_user_id,
    'super_admin',
    v_branch_id,
    NOW()
  )
  ON CONFLICT (user_id, role, branch_id) DO NOTHING;

  RAISE NOTICE 'Added super_admin role';

  -- Output success message
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUPERADMIN ACCOUNT CREATED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'Password: %', v_password;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Branch: %', (SELECT name FROM public.church_branches WHERE id = v_branch_id);
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Change your password after first login!';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- STEP 2: Verify the superadmin was created
-- ============================================================================
SELECT 
  au.email,
  au.email_confirmed_at,
  p.full_name,
  p.role as profile_role,
  ur.role as user_role,
  cb.name as branch_name,
  cb.is_main as is_main_branch
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
LEFT JOIN public.church_branches cb ON cb.id = ur.branch_id
WHERE p.role = 'super_admin'
ORDER BY au.created_at DESC;

-- You should see your superadmin account listed above
-- Now you can login with the email and password you configured!
