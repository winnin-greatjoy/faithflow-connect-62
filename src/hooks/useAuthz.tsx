import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Enums } from '@/integrations/supabase/types';

export type AppRole = Enums<'app_role'>;
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'manage';

type ModulePermission = {
  role?: AppRole;
  scope_type: 'global' | 'branch' | 'department' | 'ministry';
  allowed_actions?: PermissionAction[]; // v1
  actions?: PermissionAction[];         // v2
  coverage_type?: 'global' | 'department' | 'ministry';
  branch_id: string | null;
  department_id?: string | null;
  ministry_id?: string | null;
  role_id?: string | null;
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
  const [dynRoleIds, setDynRoleIds] = useState<string[]>([]);
  const [deptIds, setDeptIds] = useState<string[]>([]);
  const [ministryIds, setMinistryIds] = useState<string[]>([]);

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

      const { data: profile } = await supabase.from('profiles').select('branch_id, role').eq('id', uid).maybeSingle();
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, role_id, branch_id, department_id, ministry_id')
        .eq('user_id', uid);

      // Fetch v2 permissions for current user role_ids
      const dynIds = ((userRoles as any[]) || [])
        .map((r: any) => r.role_id)
        .filter((id: any) => typeof id === 'string');
      let v2Perms: any[] = [];
      if (dynIds.length > 0) {
        const { data: rp } = await supabase
          .from('role_permissions')
          .select('role_id, actions, scope_type, branch_id, coverage_type, department_id, ministry_id, module:modules(slug)')
          .in('role_id', dynIds);
        v2Perms = (rp as any[]) || [];
      }
      // Load v1 permissions as fallback (legacy)
      const { data: v1 } = await supabase
        .from('module_role_permissions')
        .select('role, role_id, scope_type, branch_id, department_id, ministry_id, allowed_actions, module:modules(slug)');
      const dbPerms = v2Perms.length > 0 ? v2Perms : ((v1 as any[]) || []);

      if (!active) return;

      setBranchId((profile as any)?.branch_id ?? null);

      const mapped: AppRole[] = [];
      if ((profile as any)?.role) mapped.push((profile as any).role as AppRole);
      (userRoles || []).forEach((r: any) => {
        if (r?.role && !mapped.includes(r.role as AppRole)) mapped.push(r.role as AppRole);
      });
      setRoles(mapped);
      setPerms((dbPerms as any) || []);

      // dynamic role ids and scope assignments
      setDynRoleIds(dynIds);

      const dIds = ((userRoles as any[]) || [])
        .map((r: any) => r.department_id)
        .filter((id: any) => typeof id === 'string');
      setDeptIds(dIds);

      const mIds = ((userRoles as any[]) || [])
        .map((r: any) => r.ministry_id)
        .filter((id: any) => typeof id === 'string');
      setMinistryIds(mIds);
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

    const relevant = perms.filter(p => p.module?.slug === moduleSlug);
    if (relevant.length > 0) {
      const scopeMatch = (p: ModulePermission) => {
        // v2: scope_type is only global/branch
        if (p.scope_type === 'global') return true;
        if (p.scope_type === 'branch') return Boolean(p.branch_id && branchId && p.branch_id === branchId);
        // v1 legacy support had department/ministry in scope_type
        if ((p as any).coverage_type == null) {
          if (p.scope_type === 'department') return Boolean(p.department_id && deptIds.includes(p.department_id));
          if (p.scope_type === 'ministry') return Boolean(p.ministry_id && ministryIds.includes(p.ministry_id));
        }
        return false;
      };
      const coverageMatch = (p: ModulePermission) => {
        // v2 coverage: global/department/ministry
        const cov = p.coverage_type;
        if (!cov || cov === 'global') return true;
        if (cov === 'department') return Boolean(p.department_id && deptIds.includes(p.department_id));
        if (cov === 'ministry') return Boolean(p.ministry_id && ministryIds.includes(p.ministry_id));
        return false;
      };
      const actionMatch = (p: ModulePermission) => {
        const acts = (p.allowed_actions || p.actions || []) as PermissionAction[];
        return Boolean(acts.includes(action) || acts.includes('manage'));
      };

      const allowedByDynamic = relevant.some(p => p.role_id && dynRoleIds.includes(p.role_id) && scopeMatch(p) && coverageMatch(p) && actionMatch(p));
      const allowedByEnum = relevant.some(p => p.role && roles.includes(p.role) && scopeMatch(p) && coverageMatch(p) && actionMatch(p));
      if (allowedByDynamic || allowedByEnum) return true;
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
