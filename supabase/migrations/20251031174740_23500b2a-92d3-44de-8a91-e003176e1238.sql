-- Update has_role function to check both user_roles and profiles tables
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Also update the text version
CREATE OR REPLACE FUNCTION public.has_role(role text, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id::uuid = user_id AND ur.role = role::public.app_role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id AND p.role = role::public.app_role
  )
$$;