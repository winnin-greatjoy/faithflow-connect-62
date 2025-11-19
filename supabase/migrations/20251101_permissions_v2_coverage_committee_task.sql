-- Extend Permissions v2: add committee/task coverage, update constraints and indexes, seed features, add RLS for features

-- Add new coverage_type enum values
DO $$ BEGIN
  ALTER TYPE public.coverage_type ADD VALUE IF NOT EXISTS 'committee';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE public.coverage_type ADD VALUE IF NOT EXISTS 'task';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add committee/task target columns to role_permissions
DO $$ BEGIN
  ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS committee_id uuid NULL REFERENCES public.committees(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS task_id uuid NULL REFERENCES public.committee_tasks(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Update coverage check constraint to include committee/task
DO $$ BEGIN
  ALTER TABLE public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_coverage_check;
  ALTER TABLE public.role_permissions
  ADD CONSTRAINT role_permissions_coverage_check CHECK (
    (coverage_type = 'global' AND department_id IS NULL AND ministry_id IS NULL AND committee_id IS NULL AND task_id IS NULL)
    OR (coverage_type = 'department' AND department_id IS NOT NULL AND ministry_id IS NULL AND committee_id IS NULL AND task_id IS NULL)
    OR (coverage_type = 'ministry' AND ministry_id IS NOT NULL AND department_id IS NULL AND committee_id IS NULL AND task_id IS NULL)
    OR (coverage_type = 'committee' AND committee_id IS NOT NULL AND department_id IS NULL AND ministry_id IS NULL AND task_id IS NULL)
    OR (coverage_type = 'task' AND task_id IS NOT NULL AND department_id IS NULL AND ministry_id IS NULL AND committee_id IS NULL)
  );
END $$;

-- Rebuild unique composite index to include committee_id and task_id
DO $$ BEGIN
  DROP INDEX IF EXISTS uniq_role_permissions_all;
  CREATE UNIQUE INDEX uniq_role_permissions_all
  ON public.role_permissions (
    role_id,
    module_id,
    COALESCE(feature_id, '00000000-0000-0000-0000-000000000000'::uuid),
    scope_type,
    COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coverage_type,
    COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(ministry_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(committee_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(task_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful lookup indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_committee ON public.role_permissions(committee_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_task ON public.role_permissions(task_id);

-- RLS for features table (authenticated read, admin manage)
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY features_read_auth ON public.features FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY features_admin_write ON public.features FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed initial features if modules exist (safe no-ops if modules missing)
-- Settings
INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'settings.manage_roles', 'Manage Roles', 'Create, edit and assign roles'
FROM public.modules m WHERE m.slug = 'settings'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'settings.manage_users', 'Manage Users', 'Invite and manage users'
FROM public.modules m WHERE m.slug = 'settings'
ON CONFLICT (slug) DO NOTHING;

-- Finance
INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'finance.export', 'Export Records', 'Export finance records to CSV'
FROM public.modules m WHERE m.slug = 'finance'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'finance.record', 'Record Transaction', 'Record income/expense entries'
FROM public.modules m WHERE m.slug = 'finance'
ON CONFLICT (slug) DO NOTHING;

-- Choir
INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'choir.manage_members', 'Manage Choir Members', 'Add and manage choir members'
FROM public.modules m WHERE m.slug = 'choir'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'choir.plan_rehearsals', 'Plan Rehearsals', 'Create and schedule rehearsals'
FROM public.modules m WHERE m.slug = 'choir'
ON CONFLICT (slug) DO NOTHING;

-- Committees
INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'committees.manage_tasks', 'Manage Committee Tasks', 'Create and track committee tasks'
FROM public.modules m WHERE m.slug = 'committees'
ON CONFLICT (slug) DO NOTHING;

-- Streaming
INSERT INTO public.features (module_id, slug, name, description)
SELECT m.id, 'streaming.view_private', 'View Private Streams', 'Access to private stream playback'
FROM public.modules m WHERE m.slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;
