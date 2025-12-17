ALTER TABLE public.districts
ADD COLUMN IF NOT EXISTS default_branch_id uuid REFERENCES public.church_branches(id),
ADD COLUMN IF NOT EXISTS branding_logo_path text,
ADD COLUMN IF NOT EXISTS branding_color text,
ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;
