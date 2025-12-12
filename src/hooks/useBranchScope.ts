// src/hooks/useBranchScope.ts
import { useAuthz } from '@/hooks/useAuthz';
import { useAdminContext } from '@/context/AdminContext';

/**
 * Returns the effective branch ID for data operations.
 * - For branch admins: always returns their assigned branch
 * - For superadmins: returns selected branch or null (global view)
 */
export function useBranchScope() {
  const { branchId: authBranchId, hasRole, loading: authLoading } = useAuthz();
  const { selectedBranchId, setSelectedBranchId, branchName, loading: contextLoading } = useAdminContext();

  const isSuperadmin = hasRole('super_admin');
  const isAdmin = hasRole('admin');
  
  // For branch admins, always use their assigned branch
  // For superadmins, use selected branch (can be null for global view)
  const effectiveBranchId = isSuperadmin ? selectedBranchId : authBranchId;
  
  // Branch admin can only see their branch, superadmin can switch
  const canSwitchBranch = isSuperadmin;
  
  // Is this a global view (superadmin with no branch selected)?
  const isGlobalView = isSuperadmin && !selectedBranchId;

  return {
    effectiveBranchId,
    canSwitchBranch,
    isGlobalView,
    isSuperadmin,
    isAdmin,
    branchName,
    setSelectedBranchId,
    loading: authLoading || contextLoading,
  };
}
