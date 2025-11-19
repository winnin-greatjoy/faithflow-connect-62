-- Permissions v2: features + role_permissions with branch scope and coverage levels

-- Ensure helper updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enums for v2
DO $$ BEGIN
  CREATE TYPE public.scope_type_v2 AS ENUM ('global','branch');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.coverage_type AS ENUM ('global','department','ministry');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Features registry per module (optional granularity)
DO $$ BEGIN
  CREATE TABLE public.features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.features
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Role permissions v2
DO $$ BEGIN
  CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    feature_id uuid NULL REFERENCES public.features(id) ON DELETE SET NULL,
    actions public.permission_action[] NOT NULL,
    scope_type public.scope_type_v2 NOT NULL,
    branch_id uuid NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
    coverage_type public.coverage_type NOT NULL,
    department_id uuid NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    ministry_id uuid NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Basic integrity
    CONSTRAINT role_permissions_actions_not_empty CHECK (array_length(actions, 1) IS NOT NULL),
    -- Scope: branch id required only when scope_type = 'branch'
    CONSTRAINT role_permissions_scope_check CHECK (
      (scope_type = 'global' AND branch_id IS NULL)
      OR (scope_type = 'branch' AND branch_id IS NOT NULL)
    ),
    -- Coverage: target id required based on coverage type
    CONSTRAINT role_permissions_coverage_check CHECK (
      (coverage_type = 'global' AND department_id IS NULL AND ministry_id IS NULL)
      OR (coverage_type = 'department' AND department_id IS NOT NULL AND ministry_id IS NULL)
      OR (coverage_type = 'ministry' AND ministry_id IS NOT NULL AND department_id IS NULL)
    )
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY role_permissions_read_auth ON public.role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY role_permissions_admin_write ON public.role_permissions
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

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module ON public.role_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_feature ON public.role_permissions(feature_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_scope ON public.role_permissions(scope_type, branch_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_coverage ON public.role_permissions(coverage_type, department_id, ministry_id);

-- Backfill v1 -> v2 (no unique until after)
INSERT INTO public.role_permissions (
  role_id, module_id, feature_id, actions, scope_type, branch_id, coverage_type, department_id, ministry_id
)
SELECT
  mrp.role_id,
  mrp.module_id,
  NULL::uuid AS feature_id,
  mrp.allowed_actions AS actions,
  CASE WHEN mrp.scope_type = 'branch' THEN 'branch' ELSE 'global' END::public.scope_type_v2 AS scope_type,
  mrp.branch_id,
  CASE
    WHEN mrp.scope_type = 'department' THEN 'department'
    WHEN mrp.scope_type = 'ministry' THEN 'ministry'
    ELSE 'global'
  END::public.coverage_type AS coverage_type,
  mrp.department_id,
  mrp.ministry_id
FROM public.module_role_permissions mrp
WHERE mrp.role_id IS NOT NULL;

-- Deduplicate role_permissions rows (keep lowest id)
DELETE FROM public.role_permissions a
USING public.role_permissions b
WHERE a.id > b.id
  AND a.role_id = b.role_id
  AND a.module_id = b.module_id
  AND COALESCE(a.feature_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.feature_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND a.scope_type = b.scope_type
  AND COALESCE(a.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND a.coverage_type = b.coverage_type
  AND COALESCE(a.department_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.department_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(a.ministry_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.ministry_id, '00000000-0000-0000-0000-000000000000'::uuid);

-- Unique composite index AFTER backfill to prevent duplicates
DO $$ BEGIN
  CREATE UNIQUE INDEX uniq_role_permissions_all
  ON public.role_permissions (
    role_id,
    module_id,
    COALESCE(feature_id, '00000000-0000-0000-0000-000000000000'::uuid),
    scope_type,
    COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coverage_type,
    COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(ministry_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
