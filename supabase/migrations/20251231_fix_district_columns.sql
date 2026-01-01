-- Add district_id to profiles and user_roles to support District Admin functionality
-- This fixes the 403 error where Edge Functions fail to fetch profiles because of missing columns

DO $$ 
BEGIN 
    -- Add district_id to profiles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'district_id') THEN
        ALTER TABLE public.profiles ADD COLUMN district_id uuid REFERENCES public.districts(id);
    END IF;

    -- Add district_id to user_roles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'district_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN district_id uuid REFERENCES public.districts(id);
    END IF;
END $$;
