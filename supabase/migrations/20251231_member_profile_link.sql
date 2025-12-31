-- Member-Profile Architecture Reform
-- Links baptized members to their auth profiles

-- 1. Add profile_id column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create unique index (a profile can only link to one member)
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_profile_unique ON public.members(profile_id) WHERE profile_id IS NOT NULL;

-- 2. Update handle_new_user trigger to auto-link member_id if provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile entry for new auth user
  INSERT INTO public.profiles (id, first_name, last_name, phone, branch_id, role)
  VALUES (
    NEW.id,
    COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1), NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(
      NULLIF(TRIM(SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1)), ''),
      NEW.raw_user_meta_data->>'last_name', 
      ''
    ),
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'branch_id')::UUID,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'member')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- If member_id was provided in metadata, link the member to this profile
  IF NEW.raw_user_meta_data->>'member_id' IS NOT NULL THEN
    UPDATE public.members 
    SET profile_id = NEW.id 
    WHERE id = (NEW.raw_user_meta_data->>'member_id')::UUID
      AND profile_id IS NULL;  -- Only if not already linked
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Add function to upgrade member to baptized and create account
CREATE OR REPLACE FUNCTION public.upgrade_member_to_baptized(
  p_member_id UUID,
  p_email TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_member RECORD;
  v_auth_user_id UUID;
  v_result JSON;
BEGIN
  -- Get member details
  SELECT * INTO v_member FROM public.members WHERE id = p_member_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Member not found');
  END IF;
  
  IF v_member.profile_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Member already has an account');
  END IF;
  
  -- Update membership level
  UPDATE public.members 
  SET 
    membership_level = 'baptized',
    updated_at = NOW()
  WHERE id = p_member_id;
  
  -- Return success - account creation will be handled by Edge Function
  -- (Supabase auth.admin functions cannot be called from database functions)
  RETURN json_build_object(
    'success', true, 
    'member_id', p_member_id,
    'email', p_email,
    'requires_account_creation', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
