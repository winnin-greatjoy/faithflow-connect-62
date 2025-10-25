-- Seed 'provisioning' module and permissions
INSERT INTO public.modules (slug, name, category)
VALUES ('provisioning', 'Provisioning', 'admin')
ON CONFLICT (slug) DO NOTHING;

-- Grant admin manage on provisioning (global)
INSERT INTO public.module_role_permissions (module_id, role, scope_type, allowed_actions)
SELECT m.id, 'admin'::public.app_role, 'global', ARRAY['manage']::public.permission_action[]
FROM public.modules m
WHERE m.slug = 'provisioning'
  AND NOT EXISTS (
    SELECT 1 FROM public.module_role_permissions mrp
    WHERE mrp.module_id = m.id AND mrp.role = 'admin'::public.app_role AND mrp.scope_type = 'global'
  );

-- Grant pastor view on provisioning (global)
INSERT INTO public.module_role_permissions (module_id, role, scope_type, allowed_actions)
SELECT m.id, 'pastor'::public.app_role, 'global', ARRAY['view']::public.permission_action[]
FROM public.modules m
WHERE m.slug = 'provisioning'
  AND NOT EXISTS (
    SELECT 1 FROM public.module_role_permissions mrp
    WHERE mrp.module_id = m.id AND mrp.role = 'pastor'::public.app_role AND mrp.scope_type = 'global'
  );
