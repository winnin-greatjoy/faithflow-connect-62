-- Fix remaining SECURITY DEFINER functions with mutable search_path

-- Fix create_user_with_profile function
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  email text, 
  password text, 
  first_name text, 
  last_name text, 
  role text, 
  is_baptized boolean, 
  branch_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  branch_id UUID;
  user_meta_data JSONB;
  full_name TEXT;
BEGIN
  -- Get branch ID
  SELECT id INTO branch_id FROM public.church_branches WHERE slug = branch_slug LIMIT 1;
  
  -- Create auth user
  user_id := extensions.uuid_generate_v4();
  full_name := first_name || ' ' || last_name;
  
  -- Prepare user_meta_data
  user_meta_data := jsonb_build_object(
    'first_name', first_name,
    'last_name', last_name,
    'avatar_url', '',
    'full_name', full_name,
    'role', role,
    'is_baptized', is_baptized,
    'branch_slug', branch_slug
  );

  -- Insert into auth.users
  EXECUTE format('
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      %L, %L, %L, %L, %L, %L,
      NOW(), NOW(), NOW(),
      %L::jsonb, %L::jsonb, NOW(), NOW()
    )',
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    '{"provider":"email","providers":["email"]}',
    user_meta_data::text
  );

  -- Insert profile
  INSERT INTO public.profiles (
    id, first_name, last_name, branch_id, role, is_baptized
  ) VALUES (
    user_id, first_name, last_name, branch_id, role, is_baptized
  );

  RETURN user_id;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;