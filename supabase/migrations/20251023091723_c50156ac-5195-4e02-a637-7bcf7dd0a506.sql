-- Fix search_path for trigger functions to prevent security issues

-- Update handle_updated_at function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Update handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, is_baptized)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'member'),
    COALESCE((NEW.raw_user_meta_data->>'is_baptized')::boolean, false)
  );
  RETURN NEW;
END;
$$;

-- Update create_user_with_profile function with proper search_path
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  email TEXT,
  password TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  is_baptized BOOLEAN,
  branch_slug TEXT
)
RETURNS UUID
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

  -- Insert into auth.users (using raw SQL to bypass RLS)
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
    '00000000-0000-0000-0000-000000000000', -- instance_id
    user_id,                                -- id
    'authenticated',                        -- aud
    'authenticated',                        -- role
    email,                                  -- email
    crypt(password, gen_salt('bf')),        -- encrypted_password
    '{"provider":"email","providers":["email"]}',  -- raw_app_meta_data
    user_meta_data::text                    -- raw_user_meta_data
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