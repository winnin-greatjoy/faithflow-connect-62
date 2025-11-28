-- Create choir_repertoire table for managing choir songs
CREATE TABLE IF NOT EXISTS public.choir_repertoire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  composer TEXT,
  key_signature TEXT,
  tempo TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  category TEXT,
  lyrics TEXT,
  notes TEXT,
  duration INTEGER, -- duration in seconds
  last_performed DATE,
  performance_count INTEGER DEFAULT 0,
  audio_url TEXT,
  sheet_music_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.choir_repertoire ENABLE ROW LEVEL SECURITY;

-- RLS Policies for choir_repertoire
CREATE POLICY "Authenticated users can view choir repertoire"
  ON public.choir_repertoire
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Leaders can manage choir repertoire"
  ON public.choir_repertoire
  FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'pastor') OR 
    has_role(auth.uid(), 'leader')
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'pastor') OR 
    has_role(auth.uid(), 'leader')
  );

-- Create trigger for updated_at
CREATE TRIGGER choir_repertoire_updated_at
  BEFORE UPDATE ON public.choir_repertoire
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();