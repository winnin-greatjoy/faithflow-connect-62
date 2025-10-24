import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Enums, Tables } from '@/integrations/supabase/types';

export type AppRole = Enums<'app_role'>;
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'manage';

type UserRole = Tables<'user_roles'>;

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

      const [{ data: profile }, { data: userRoles }] = await Promise.all([
        supabase.from('profiles').select('branch_id, role').eq('id', uid).maybeSingle(),
        supabase
          .from('user_roles')
          .select('role, branch_id, department_id, ministry_id')
          .eq('user_id', uid),
      ]);

      if (!active) return;

      setBranchId((profile as any)?.branch_id ?? null);

      const mapped: AppRole[] = [];
      if ((profile as any)?.role) mapped.push((profile as any).role as AppRole);
      (userRoles || []).forEach((r: any) => {
        if (r?.role && !mapped.includes(r.role as AppRole)) mapped.push(r.role as AppRole);
      });
      setRoles(mapped);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const hasRole = (...check: AppRole[]) => check.some(r => roles.includes(r));

  const can = (moduleSlug: string, action: PermissionAction = 'view') => {
    if (!userId) return false;

    // Simple defaults until module_role_permissions are populated in DB
    // Priority: admin > pastor > leader > worker > member
    if (hasRole('super_admin', 'admin')) return true;

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
