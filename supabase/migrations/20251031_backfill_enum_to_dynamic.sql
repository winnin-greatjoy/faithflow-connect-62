-- Backfill: translate enum-role permissions/assignments to dynamic roles (role_id)

-- 1) Ensure dynamic role rows exist for legacy enum roles
INSERT INTO public.roles (name, slug, role_type, description)
VALUES
  ('Super Admin','super-admin','admin','Legacy enum role backfilled'),
  ('Admin','admin','admin','Legacy enum role backfilled'),
  ('Pastor','pastor','pastor','Legacy enum role backfilled'),
  ('Leader','leader','leader','Legacy enum role backfilled'),
  ('Worker','worker','worker','Legacy enum role backfilled'),
  ('Member','member','member','Legacy enum role backfilled')
ON CONFLICT (slug) DO NOTHING;

-- 2) Map enum role -> slug helper
CREATE OR REPLACE FUNCTION public._enum_role_to_slug(_r public.app_role)
RETURNS text
LANGUAGE sql
AS $$
  SELECT CASE _r
    WHEN 'super_admin' THEN 'super-admin'
    WHEN 'admin' THEN 'admin'
    WHEN 'pastor' THEN 'pastor'
    WHEN 'leader' THEN 'leader'
    WHEN 'worker' THEN 'worker'
    WHEN 'member' THEN 'member'
  END;
$$;

-- 3) Backfill module_role_permissions.role_id where missing
UPDATE public.module_role_permissions mrp
SET role_id = r.id
FROM public.roles r
WHERE mrp.role_id IS NULL
  AND mrp.role IS NOT NULL
  AND r.slug = public._enum_role_to_slug(mrp.role);

-- 4) Merge duplicate permission rows (same role_id/module/scope/targets): union actions, keep lowest id
-- 4a) Update allowed_actions on keeper rows to union of all duplicates
WITH groups AS (
  SELECT DISTINCT
    role_id, module_id, scope_type,
    COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid) AS department_id,
    COALESCE(ministry_id, '00000000-0000-0000-0000-000000000000'::uuid) AS ministry_id
  FROM public.module_role_permissions
  WHERE role_id IS NOT NULL
)
UPDATE public.module_role_permissions m
SET allowed_actions = (
  SELECT ARRAY(SELECT DISTINCT a
               FROM public.module_role_permissions m2,
                    UNNEST(m2.allowed_actions) AS a
               WHERE m2.role_id = m.role_id
                 AND m2.module_id = m.module_id
                 AND m2.scope_type = m.scope_type
                 AND COALESCE(m2.branch_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(m.branch_id,'00000000-0000-0000-0000-000000000000'::uuid)
                 AND COALESCE(m2.department_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(m.department_id,'00000000-0000-0000-0000-000000000000'::uuid)
                 AND COALESCE(m2.ministry_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(m.ministry_id,'00000000-0000-0000-0000-000000000000'::uuid)
  )
)
WHERE m.role_id IS NOT NULL;

-- 4b) Delete duplicates, keep lowest id
DELETE FROM public.module_role_permissions a
USING public.module_role_permissions b
WHERE a.id > b.id
  AND a.role_id IS NOT NULL AND b.role_id IS NOT NULL
  AND a.role_id = b.role_id
  AND a.module_id = b.module_id
  AND a.scope_type = b.scope_type
  AND COALESCE(a.branch_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.branch_id,'00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(a.department_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.department_id,'00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(a.ministry_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.ministry_id,'00000000-0000-0000-0000-000000000000'::uuid);

-- 5) Backfill user_roles.role_id where missing
UPDATE public.user_roles ur
SET role_id = r.id
FROM public.roles r
WHERE ur.role_id IS NULL
  AND ur.role IS NOT NULL
  AND r.slug = public._enum_role_to_slug(ur.role);

-- 6) Deduplicate user_roles after backfill (keep lowest id)
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.id > b.id
  AND a.role_id IS NOT NULL AND b.role_id IS NOT NULL
  AND a.user_id = b.user_id
  AND COALESCE(a.branch_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.branch_id,'00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(a.department_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.department_id,'00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(a.ministry_id,'00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.ministry_id,'00000000-0000-0000-0000-000000000000'::uuid)
  AND a.role_id = b.role_id;
