-- Ministries table and policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ministries'
  ) THEN
    CREATE TABLE public.ministries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      description text,
      branch_id uuid REFERENCES public.church_branches(id),
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_ministries_updated_at'
  ) THEN
    CREATE TRIGGER update_ministries_updated_at
    BEFORE UPDATE ON public.ministries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

-- Ensure required columns exist even if table pre-existed
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ministries' AND column_name = 'is_active'
  ) THEN
    -- ok
    NULL;
  ELSE
    ALTER TABLE public.ministries ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Read policy
DO $$ BEGIN
  CREATE POLICY ministries_read ON public.ministries
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin manage policy
DO $$ BEGIN
  CREATE POLICY ministries_admin_write ON public.ministries
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_ministries_branch_id ON public.ministries(branch_id);
