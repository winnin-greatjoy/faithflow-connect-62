-- Streaming moderation policies
-- Enable RLS (no-op if already enabled)
ALTER TABLE public.stream_chats ENABLE ROW LEVEL SECURITY;

-- Allow users to delete their own chat messages
DO $$ BEGIN
  CREATE POLICY "Users can delete own chat messages"
  ON public.stream_chats
  FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow privileged roles to delete any chat message
DO $$ BEGIN
  CREATE POLICY "Privileged can delete any chat message"
  ON public.stream_chats
  FOR DELETE
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'pastor'::app_role) OR 
    has_role(auth.uid(), 'leader'::app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
