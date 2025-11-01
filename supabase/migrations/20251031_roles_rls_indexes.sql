-- RLS and indexes for module_role_permissions and user_roles; uniqueness to prevent duplicates

-- module_role_permissions RLS
ALTER TABLE public.module_role_permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY mrp_read_auth ON public.module_role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY mrp_admin_write ON public.module_role_permissions
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

-- Unique composite index for module_role_permissions to prevent duplicates when role_id is used
-- Use COALESCE with a zero UUID so NULLs compare equal per scope type
DO $$ BEGIN
  CREATE UNIQUE INDEX uniq_mrp_roleid_module_scope_targets
  ON public.module_role_permissions (
    role_id,
    module_id,
    scope_type,
    COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(ministry_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WHERE role_id IS NOT NULL;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- Helpful lookup indexes
CREATE INDEX IF NOT EXISTS idx_mrp_role_module ON public.module_role_permissions(role_id, module_id);
CREATE INDEX IF NOT EXISTS idx_mrp_scope_type ON public.module_role_permissions(scope_type);

-- user_roles RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY user_roles_read_self_or_admin ON public.user_roles
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_roles_admin_write ON public.user_roles
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

-- Unique composite index to prevent duplicate assignments per scope
DO $$ BEGIN
  CREATE UNIQUE INDEX uniq_user_roles_assignment
  ON public.user_roles (
    user_id,
    role_id,
    COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(ministry_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WHERE role_id IS NOT NULL;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- Helpful lookup indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON public.user_roles(branch_id, department_id, ministry_id);
