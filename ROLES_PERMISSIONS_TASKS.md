# Roles & Permissions — Task List

This document tracks progress for the dynamic Roles & Permissions refactor, including schema, UI, RLS, and RBAC integration.

## Status legend
- [x] Completed
- [ ] Pending
- [~] In progress

---

## Database
- [x] Create role_type enum: account, member, leader, admin, pastor, worker
- [x] Create roles table (id, name, slug, role_type, description, is_active, timestamps)
- [x] Extend user_roles with role_id (keep legacy enum role, drop NOT NULL)
- [x] Extend module_role_permissions with role_id (keep legacy enum role, drop NOT NULL)
- [x] Add ministries table with RLS and updated_at trigger
- [x] Add RLS for public.roles (admin/super_admin manage)
- [x] Add RLS for module_role_permissions (authenticated read, admin/super_admin manage)
- [x] Add RLS for user_roles (self read or admin/super_admin manage)
- [x] Add unique composite index on module_role_permissions (role_id, module_id, scope_type, branch_id, department_id, ministry_id)
- [x] Add unique composite index on user_roles (user_id, role_id, branch_id, department_id, ministry_id)
- [x] Add helpful lookup indexes for performance
- [x] Backfill migration: map legacy enum-based permissions (role) to dynamic roles (role_id)
- [x] Add CHECK constraint: exactly one of branch_id/department_id/ministry_id is non-null when scope_type != 'global'
- [ ] (Optional) Enforce ministries.branch_id NOT NULL if organizationally required

## Supabase types
- [ ] Regenerate types after migrations
  - supabase gen types typescript --linked > src/integrations/supabase/types.ts
- [ ] Remove temporary `(supabase as any)` casts in RolesManager, AddEditRoleForm, RolePermissionsDynamicForm

## UI — Roles & Permissions
- [x] Consolidate to a single Roles & Permissions card in Settings (remove separate custom vs enum roles)
- [x] Add/Edit role form with role_type options
- [x] Permissions dialog:
  - [x] Per-module actions
  - [x] Scope selection (global, branch, department, ministry)
  - [x] Target selectors for selected scope
  - [ ] (Optional) Allow multiple scoped entries per module (e.g., multiple branches)
- [x] Assign role to user with scope+target
- [ ] Improve Assign UX: search/filter users, bulk assign, prevent duplicates in UI
- [x] Remove/hide legacy components (RolesPage.tsx, RolePermissionForm.tsx) now superseded by RolesManager

## RBAC / Authz
- [x] Update useAuthz to read role_id-based permissions and honor scopes
- [ ] Add unit tests for can(module, action) across scope combinations and precedence
- [ ] Add integration tests for role assignment lifecycle and permission enforcement

## Settings (Non-RBAC)
- [x] Silence controlled input warnings by marking display-only fields as readOnly
- [ ] (Optional) Make these Settings fields editable and persist to DB (church profile)

## React Router
- [ ] (Optional) Set future flags or plan v7 upgrade to silence console warnings

## How to apply changes locally
1. Apply migrations in supabase/migrations (recommended order):
   - 20251031_dynamic_roles.sql
   - 20251031_ministries.sql
   - 20251031_backfill_enum_to_dynamic.sql
   - 20251031_roles_rls_indexes.sql
   - 20251031_scope_checks.sql
2. Regenerate types:
   - supabase gen types typescript --linked > src/integrations/supabase/types.ts
3. Restart dev server.
4. In the app:
   - Settings > Users & Permissions > Roles & Permissions
   - Create a role (e.g., Leader) and set per-module permissions with scopes
   - Assign the role to a user with scope+target
   - Verify access via useAuthz.can

## Notes
- Legacy enum roles are still supported during transition. Prefer creating dynamic roles and migrating permissions to role_id.
- Consider adding a small Admin page to CRUD Ministries if needed by admins.
