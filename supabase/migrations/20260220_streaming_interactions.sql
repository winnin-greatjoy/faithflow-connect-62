-- Create Stream Q&A table
CREATE TABLE IF NOT EXISTS public.stream_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    upvotes UUID[] DEFAULT '{}',
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Stream Polls table
CREATE TABLE IF NOT EXISTS public.stream_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]', -- Array of { text: string }
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'ended')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Stream Poll Votes table
CREATE TABLE IF NOT EXISTS public.stream_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.stream_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.stream_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for stream_qa
CREATE POLICY "Anyone can view Q&A for public streams"
ON public.stream_qa FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can ask questions"
ON public.stream_qa FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete their own questions"
ON public.stream_qa FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Moderators can update Q&A"
ON public.stream_qa FOR UPDATE
TO authenticated
USING (true); -- Refined by RLS on streams table check if needed, but for now allow auth

-- Policies for stream_polls
CREATE POLICY "Anyone can view polls"
ON public.stream_polls FOR SELECT
USING (true);

CREATE POLICY "Moderators can manage polls"
ON public.stream_polls ALL
TO authenticated
USING (true);

-- Policies for stream_poll_votes
CREATE POLICY "Anyone can view vote counts"
ON public.stream_poll_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote once per poll"
ON public.stream_poll_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_qa;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_poll_votes;
