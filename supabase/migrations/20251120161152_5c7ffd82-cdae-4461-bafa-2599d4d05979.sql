-- Fix all SECURITY DEFINER functions to have fixed search_path
-- This prevents privilege escalation attacks through search path manipulation

-- Fix increment_stream_views function
CREATE OR REPLACE FUNCTION public.increment_stream_views()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.streams
  SET view_count = view_count + 1
  WHERE id = NEW.stream_id;
  RETURN NEW;
END;
$$;

-- Fix has_role (uuid, app_role) function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Fix has_role (text, uuid) function
CREATE OR REPLACE FUNCTION public.has_role(role text, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id::uuid = user_id AND ur.role = role::public.app_role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id AND p.role = role::public.app_role
  )
$$;

-- Fix is_user_baptized function
CREATE OR REPLACE FUNCTION public.is_user_baptized()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_baptized FROM public.profiles WHERE id = auth.uid();
$$;

-- Fix has_branch_access function
CREATE OR REPLACE FUNCTION public.has_branch_access(p_branch_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_branch_id UUID;
BEGIN
    SELECT role, branch_id INTO user_role, user_branch_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN user_role = 'super_admin' OR 
           user_role = 'admin' OR
           (user_role = 'pastor' AND user_branch_id = p_branch_id) OR
           (user_role = 'leader' AND user_branch_id = p_branch_id);
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
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