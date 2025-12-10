import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';

/**
 * Hook to get the effective branch ID for data queries in admin modules.
 * 
 * - For superadmins: Uses the selected branch from AdminContext (null = global view)
 * - For branch admins: Always returns their assigned branch ID (cannot be changed)
 * 
 * This ensures branch admins can only access data from their branch.
 */
export function useBranchScope() {
  const { selectedBranchId } = useAdminContext();
  const { branchId: authBranchId, hasRole, loading } = useAuthz();
  
  const isSuperadmin = hasRole('super_admin');
  
  // Branch admins are ALWAYS locked to their assigned branch
  // Superadmins can view any branch or global (null)
  const effectiveBranchId = isSuperadmin ? selectedBranchId : authBranchId;
  
  // For display purposes
  const isGlobalView = isSuperadmin && !selectedBranchId;
  
  return {
    branchId: effectiveBranchId,
    isSuperadmin,
    isGlobalView,
    loading,
  };
}
