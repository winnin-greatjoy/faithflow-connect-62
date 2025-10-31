-- Harden chat insert policy to only allow posting to streams the user can access
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can send chat messages" ON public.stream_chats;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Insert allowed only if user owns the inserted row and has access to the parent stream
DROP POLICY IF EXISTS "Users can send chat if they can access stream" ON public.stream_chats;
DO $$ BEGIN
  CREATE POLICY "Users can send chat if they can access stream"
    ON public.stream_chats FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1 FROM public.streams s
        WHERE s.id = stream_id
          AND (
            s.privacy = 'public'
            OR (s.privacy = 'members_only' AND auth.uid() IS NOT NULL)
            OR (
              s.privacy = 'private' AND (
                has_role(auth.uid(), 'super_admin'::app_role) OR
                has_role(auth.uid(), 'admin'::app_role) OR
                has_role(auth.uid(), 'pastor'::app_role) OR
                has_role(auth.uid(), 'leader'::app_role)
              )
            )
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow privileged users to view chats for private streams
DO $$ BEGIN
  CREATE POLICY "Privileged users can view private stream chats"
    ON public.stream_chats FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.streams s
        WHERE s.id = stream_id
          AND s.privacy = 'private'
          AND (
            has_role(auth.uid(), 'super_admin'::app_role) OR
            has_role(auth.uid(), 'admin'::app_role) OR
            has_role(auth.uid(), 'pastor'::app_role) OR
            has_role(auth.uid(), 'leader'::app_role)
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
