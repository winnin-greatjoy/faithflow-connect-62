-- Create enum for stream status
DO $$ BEGIN
  CREATE TYPE stream_status AS ENUM ('scheduled', 'live', 'ended', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create enum for stream privacy
DO $$ BEGIN
  CREATE TYPE stream_privacy AS ENUM ('public', 'members_only', 'private');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create enum for stream platform
DO $$ BEGIN
  CREATE TYPE stream_platform AS ENUM ('youtube', 'facebook', 'vimeo', 'custom', 'supabase');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create streams table
CREATE TABLE IF NOT EXISTS public.streams (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  storage_path TEXT,
  platform stream_platform NOT NULL DEFAULT 'youtube',
  embed_url TEXT,
  stream_key TEXT,
  rtmp_server TEXT,
  privacy stream_privacy NOT NULL DEFAULT 'public',
  status stream_status NOT NULL DEFAULT 'scheduled',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  branch_id UUID REFERENCES public.church_branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false
);

-- Create stream_chats table
CREATE TABLE IF NOT EXISTS public.stream_chats (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream_views table (for analytics)
CREATE TABLE IF NOT EXISTS public.stream_views (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for streams
DROP POLICY IF EXISTS "Public streams viewable by everyone" ON public.streams;
CREATE POLICY "Public streams viewable by everyone"
  ON public.streams FOR SELECT
  USING (privacy = 'public' OR (privacy = 'members_only' AND auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "Admins and pastors can manage streams" ON public.streams;
CREATE POLICY "Admins and pastors can manage streams"
  ON public.streams FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'pastor'::app_role) OR
    has_role(auth.uid(), 'leader'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'pastor'::app_role) OR
    has_role(auth.uid(), 'leader'::app_role)
  );

-- RLS Policies for stream_chats
DROP POLICY IF EXISTS "Users can view chats for accessible streams" ON public.stream_chats;
CREATE POLICY "Users can view chats for accessible streams"
  ON public.stream_chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.streams
      WHERE streams.id = stream_chats.stream_id
        AND (streams.privacy = 'public' OR (streams.privacy = 'members_only' AND auth.uid() IS NOT NULL))
    )
  );

DROP POLICY IF EXISTS "Authenticated users can send chat messages" ON public.stream_chats;
CREATE POLICY "Authenticated users can send chat messages"
  ON public.stream_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- RLS Policies for stream_views
DROP POLICY IF EXISTS "Users can view their own watch history" ON public.stream_views;
CREATE POLICY "Users can view their own watch history"
  ON public.stream_views FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can log views" ON public.stream_views;
CREATE POLICY "Authenticated users can log views"
  ON public.stream_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_streams_status ON public.streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_branch_id ON public.streams(branch_id);
CREATE INDEX IF NOT EXISTS idx_streams_created_by ON public.streams(created_by);
CREATE INDEX IF NOT EXISTS idx_streams_start_time ON public.streams(start_time);
CREATE INDEX IF NOT EXISTS idx_stream_chats_stream_id ON public.stream_chats(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chats_created_at ON public.stream_chats(created_at);
CREATE INDEX IF NOT EXISTS idx_stream_views_stream_id ON public.stream_views(stream_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_streams_updated_at ON public.streams;
CREATE TRIGGER update_streams_updated_at
  BEFORE UPDATE ON public.streams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_stream_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.streams
  SET view_count = view_count + 1
  WHERE id = NEW.stream_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for view count
DROP TRIGGER IF EXISTS increment_stream_view_count ON public.stream_views;
CREATE TRIGGER increment_stream_view_count
  AFTER INSERT ON public.stream_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_stream_views();