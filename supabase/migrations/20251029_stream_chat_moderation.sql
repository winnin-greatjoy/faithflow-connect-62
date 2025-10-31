-- Allow privileged users to delete chat messages
DO $$ BEGIN
  CREATE POLICY "Privileged can delete stream chats"
    ON public.stream_chats FOR DELETE
    USING (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'pastor'::app_role) OR
      has_role(auth.uid(), 'leader'::app_role)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
