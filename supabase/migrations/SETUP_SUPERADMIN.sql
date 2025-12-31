-- SUPERADMIN BOOTSTRAP SCRIPT
-- Run this ONCE in Supabase SQL Editor to create your first superadmin
-- Superadmin has GLOBAL access and does NOT need to be linked to a branch
-- After login, superadmin can create branches and other users

-- ============================================================================
-- Configure your superadmin settings here
-- ============================================================================
DO $$
DECLARE
  v_email TEXT := 'superadmin@faithhealing.org';  -- CHANGE THIS to your email
  v_password TEXT := 'ChangeMe123!';              -- CHANGE THIS to secure password
  v_full_name TEXT := 'Super Admin';              -- CHANGE THIS to your name
  
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
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
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated', v_email, v_encrypted_password,
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', v_full_name),
      NOW(), NOW(), '', '', '', ''
    );

    RAISE NOTICE 'Created auth user: % (ID: %)', v_email, v_user_id;
  END IF;

  -- Create or update profile (NO branch_id for superadmin - global access)
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    branch_id,  -- NULL for superadmin = global access
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    SPLIT_PART(v_full_name, ' ', 1),
    COALESCE(NULLIF(TRIM(SUBSTRING(v_full_name FROM POSITION(' ' IN v_full_name) + 1)), ''), ''),
    'super_admin',
    NULL,  -- Superadmin is NOT linked to any specific branch
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      first_name = SPLIT_PART(v_full_name, ' ', 1),
      updated_at = NOW();

  RAISE NOTICE 'Created/updated profile for %', v_email;

  -- Add super_admin role to user_roles (also without branch_id)
  INSERT INTO public.user_roles (
    user_id,
    role,
    branch_id,  -- NULL for global role
    created_at
  ) VALUES (
    v_user_id,
    'super_admin',
    NULL,  -- No branch restriction
    NOW()
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Added super_admin role';

  -- Output success message
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUPERADMIN ACCOUNT CREATED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'Password: %', v_password;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Change your password after first login!';
  RAISE NOTICE 'You can now login and create branches.';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- Verify the superadmin was created
-- ============================================================================
SELECT 
  au.email,
  au.email_confirmed_at,
  p.first_name || ' ' || COALESCE(p.last_name, '') as full_name,
  p.role as profile_role,
  ur.role as user_role,
  COALESCE(cb.name, '(Global - No Branch)') as branch_name
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
LEFT JOIN public.church_branches cb ON cb.id = ur.branch_id
WHERE p.role = 'super_admin'
ORDER BY au.created_at DESC;
