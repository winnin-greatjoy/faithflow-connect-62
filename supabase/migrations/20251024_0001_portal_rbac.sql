-- Portal RBAC and provisioning migrations
-- Run with Supabase CLI or apply in your database

-- 0) RBAC helper function compatible with current schema (no roles table)
create or replace function public.has_role(role text, user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id::uuid = user_id
      and ur.role = role::public.app_role
  );
$$;

-- Overload for enum app_role + uuid
create or replace function public.has_role(role public.app_role, user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id::uuid = user_id
      and ur.role = role
  );
$$;

-- 1) Enum: permission_action (safe create)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_action') THEN
    CREATE TYPE public.permission_action AS ENUM ('view','create','update','delete','manage');
  END IF;
END$$;

-- 2) modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- RLS: read active modules by authenticated users
DO $$ BEGIN
  CREATE POLICY modules_read ON public.modules
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS: admin can manage modules
DO $$ BEGIN
  CREATE POLICY modules_admin_write ON public.modules
  FOR ALL
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) module_role_permissions table
CREATE TABLE IF NOT EXISTS public.module_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  scope_type text NOT NULL CHECK (scope_type IN ('global','branch','department','ministry')),
  allowed_actions public.permission_action[] NOT NULL,
  branch_id uuid,
  department_id uuid,
  ministry_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.module_role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS: read for authenticated users
DO $$ BEGIN
  CREATE POLICY mrp_read ON public.module_role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS: admin can manage
DO $$ BEGIN
  CREATE POLICY mrp_admin_write ON public.module_role_permissions
  FOR ALL
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Extend user_roles with department/ministry scopes
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS department_id uuid,
  ADD COLUMN IF NOT EXISTS ministry_id uuid;

-- 5) Provisioning queue
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provision_type') THEN
    CREATE TYPE public.provision_type AS ENUM ('auto_baptized','admin_initiated');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE public.job_status AS ENUM ('pending','processing','done','error');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.account_provisioning_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type public.provision_type NOT NULL,
  status public.job_status NOT NULL DEFAULT 'pending',
  reason text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);
ALTER TABLE public.account_provisioning_jobs ENABLE ROW LEVEL SECURITY;

-- RLS: admins read/write queue
DO $$ BEGIN
  CREATE POLICY apj_read ON public.account_provisioning_jobs
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR public.has_role('pastor', auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY apj_admin_write ON public.account_provisioning_jobs
  FOR INSERT WITH CHECK (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Optional seed modules
INSERT INTO public.modules (slug, name, category) VALUES
  ('choir', 'Choir', 'department'),
  ('finance', 'Finance', 'department'),
  ('ushering', 'Ushering', 'department'),
  ('prayer', 'Prayer', 'department'),
  ('evangelism', 'Evangelism', 'department')
ON CONFLICT (slug) DO NOTHING;
