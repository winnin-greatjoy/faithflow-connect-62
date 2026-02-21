-- Migration: 20260210_create_groups_and_streaming_access.sql

-- 1. Create groups and members (if not already exists from other modules)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  branch_id UUID REFERENCES public.church_branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Streaming Access Control Tables
CREATE TABLE IF NOT EXISTS public.stream_allowed_groups (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stream_allowed_users (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_allowed_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_allowed_users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Groups
DO $$ BEGIN
  CREATE POLICY "everyone_view_groups" ON public.groups FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins_manage_groups" ON public.groups FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Stream access settings
DO $$ BEGIN
  CREATE POLICY "admins_manage_stream_access_groups" ON public.stream_allowed_groups FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'pastor'::app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins_manage_stream_access_users" ON public.stream_allowed_users FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'pastor'::app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Update Streams RLS
DROP POLICY IF EXISTS "Public streams viewable by everyone" ON public.streams;
DROP POLICY IF EXISTS "Streams access policy" ON public.streams;

CREATE POLICY "Streams access policy"
  ON public.streams FOR SELECT
  USING (
    privacy = 'public' OR 
    (privacy = 'members_only' AND auth.uid() IS NOT NULL) OR
    (privacy = 'private' AND (
      created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR 
      has_role(auth.uid(), 'admin'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.stream_allowed_users
        WHERE stream_id = public.streams.id AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.stream_allowed_groups sag
        JOIN public.group_members gm ON gm.group_id = sag.group_id
        WHERE sag.stream_id = public.streams.id AND gm.user_id = auth.uid()
      )
    ))
  );

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_allowed_groups_stream ON public.stream_allowed_groups(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_allowed_users_stream ON public.stream_allowed_users(stream_id);
