-- CHECK constraints for scope targets consistency

-- module_role_permissions: scope_type must match exactly one target (or none for global)
DO $$ BEGIN
  ALTER TABLE public.module_role_permissions
  ADD CONSTRAINT mrp_scope_targets_check
  CHECK (
    (scope_type = 'global' AND branch_id IS NULL AND department_id IS NULL AND ministry_id IS NULL)
    OR (scope_type = 'branch' AND branch_id IS NOT NULL AND department_id IS NULL AND ministry_id IS NULL)
    OR (scope_type = 'department' AND branch_id IS NULL AND department_id IS NOT NULL AND ministry_id IS NULL)
    OR (scope_type = 'ministry' AND branch_id IS NULL AND department_id IS NULL AND ministry_id IS NOT NULL)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_roles: at most one target may be set; allow all NULL for global assignment
DO $$ BEGIN
  ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_scope_exclusive_check
  CHECK (
    ((branch_id IS NOT NULL)::int + (department_id IS NOT NULL)::int + (ministry_id IS NOT NULL)::int) <= 1
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
