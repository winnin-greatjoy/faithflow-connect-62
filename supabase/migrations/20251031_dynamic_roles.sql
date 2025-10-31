-- Dynamic roles and role types
-- 1) role_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
    CREATE TYPE public.role_type AS ENUM ('account','member','leader','admin','pastor','worker');
  END IF;
END$$;

-- 2) roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  role_type public.role_type NOT NULL DEFAULT 'account',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_roles_updated_at'
  ) THEN
    CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS: read active roles by authenticated users
DO $$ BEGIN
  CREATE POLICY roles_read ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS: admin can manage roles
DO $$ BEGIN
  CREATE POLICY roles_admin_write ON public.roles
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

-- 3) Extend user_roles to support dynamic roles
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.roles(id);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Allow dynamic-only rows by relaxing NOT NULL constraint on legacy enum column
DO $$ BEGIN
  ALTER TABLE public.user_roles ALTER COLUMN role DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- 4) Extend module_role_permissions to support dynamic roles
DO $$ BEGIN
  ALTER TABLE public.module_role_permissions ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_mrp_role_id ON public.module_role_permissions(role_id);

-- 5) No seed roles; roles will be created via the UI

-- 6) Relax NOT NULL on module_role_permissions.role to support dynamic roles using role_id only
DO $$ BEGIN
  ALTER TABLE public.module_role_permissions ALTER COLUMN role DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
