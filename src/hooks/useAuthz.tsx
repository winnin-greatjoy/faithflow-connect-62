import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Enums } from '@/integrations/supabase/types';

export type AppRole = Enums<'app_role'>;
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'manage';

type ModulePermission = {
  role: AppRole;
  scope_type: 'global' | 'branch' | 'department' | 'ministry';
  allowed_actions: PermissionAction[];
  branch_id: string | null;
  module: { slug: string } | null;
};

type UseAuthzResult = {
  loading: boolean;
  userId: string | null;
  branchId: string | null;
  roles: AppRole[];
  hasRole: (...roles: AppRole[]) => boolean;
  can: (moduleSlug: string, action?: PermissionAction) => boolean;
};

export function useAuthz(): UseAuthzResult {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [perms, setPerms] = useState<ModulePermission[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id || null;
      setUserId(uid);

      if (!uid) {
        setBranchId(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: userRoles }, { data: dbPerms }] = await Promise.all([
        supabase.from('profiles').select('branch_id, role').eq('id', uid).maybeSingle(),
        supabase
          .from('user_roles')
          .select('role, branch_id, department_id, ministry_id')
          .eq('user_id', uid),
        supabase
          .from('module_role_permissions')
          .select('role, scope_type, branch_id, allowed_actions, module:modules(slug)')
      ]);

      if (!active) return;

      setBranchId((profile as any)?.branch_id ?? null);

      const mapped: AppRole[] = [];
      if ((profile as any)?.role) mapped.push((profile as any).role as AppRole);
      (userRoles || []).forEach((r: any) => {
        if (r?.role && !mapped.includes(r.role as AppRole)) mapped.push(r.role as AppRole);
      });
      setRoles(mapped);
      setPerms((dbPerms as any) || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const hasRole = (...check: AppRole[]) => check.some(r => roles.includes(r));

  const can = (moduleSlug: string, action: PermissionAction = 'view') => {
    if (!userId) return false;

    // Admin shortcut
    if (hasRole('super_admin', 'admin')) return true;

    // Dynamic permission check
    const relevant = perms.filter(p => p.module?.slug === moduleSlug);
    if (relevant.length > 0) {
      return relevant.some(p =>
        roles.includes(p.role) &&
        (p.scope_type === 'global' || (p.scope_type === 'branch' && p.branch_id && p.branch_id === branchId)) &&
        (p.allowed_actions?.includes(action) || p.allowed_actions?.includes('manage' as PermissionAction))
      );
    }

    // Fallback when no DB permissions exist
    switch (moduleSlug) {
      case 'finance':
        if (hasRole('pastor', 'leader')) return action === 'view' || action === 'update';
        return false;
      case 'choir':
      case 'ushering':
      case 'evangelism':
      case 'prayer':
        if (hasRole('pastor', 'leader')) return true;
        if (hasRole('worker')) return action === 'view' || action === 'create';
        return action === 'view';
      case 'admin':
        return hasRole('super_admin', 'admin');
      default:
        return action === 'view';
    }
  };

  return useMemo(
    () => ({ loading, userId, branchId, roles, hasRole, can }),
    [loading, userId, branchId, roles]
  );
}
