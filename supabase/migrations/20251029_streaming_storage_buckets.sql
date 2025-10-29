-- Create storage buckets for streaming videos
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('public-videos', 'public-videos', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('private-videos', 'private-videos', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- RLS policies on storage.objects
-- Public read for public-videos bucket
DO $$ BEGIN
  CREATE POLICY "public videos read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'public-videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow privileged roles to upload to both buckets
DO $$ BEGIN
  CREATE POLICY "streaming videos insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id IN ('public-videos','private-videos') AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'pastor'::app_role) OR
        has_role(auth.uid(), 'leader'::app_role)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "streaming videos update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id IN ('public-videos','private-videos') AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'pastor'::app_role) OR
        has_role(auth.uid(), 'leader'::app_role)
      )
    )
    WITH CHECK (
      bucket_id IN ('public-videos','private-videos') AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'pastor'::app_role) OR
        has_role(auth.uid(), 'leader'::app_role)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "streaming videos delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id IN ('public-videos','private-videos') AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'pastor'::app_role) OR
        has_role(auth.uid(), 'leader'::app_role)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
