import React from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { useAuthz } from '@/hooks/useAuthz';
import { supabase } from '@/integrations/supabase/client';

export const FinanceModule = () => {
  const { selectedBranchId } = useAdminContext();
  const { hasRole, userId, branchId: userBranchId } = useAuthz();
  const [districtId, setDistrictId] = React.useState<string | null>(null);
  const [districtLoading, setDistrictLoading] = React.useState(false);

  const effectiveBranchId = selectedBranchId ?? userBranchId ?? null;

  React.useEffect(() => {
    let active = true;
    if (!hasRole('district_admin') || hasRole('super_admin')) {
      setDistrictId(null);
      return;
    }
    if (selectedBranchId) return;
    if (!userId) return;

    (async () => {
      setDistrictLoading(true);
      try {
        const { data, error } = await supabase
          .from('districts')
          .select('id')
          .eq('head_admin_id', userId)
          .maybeSingle();
        if (!active) return;
        if (error) throw error;
        setDistrictId((data as any)?.id ?? null);
      } finally {
        if (active) setDistrictLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [hasRole, selectedBranchId, userId]);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      {/* Financial Overview Cards */}
      {/* Charts Section */}
      {/* Recent Donations */}
      {hasRole('super_admin') && !effectiveBranchId ? (
        <FinanceDashboard mode="global" />
      ) : hasRole('district_admin') && !hasRole('super_admin') && !effectiveBranchId ? (
        districtLoading ? (
          <div className="p-8 rounded-lg border bg-muted/20 text-muted-foreground">Loading…</div>
        ) : (
          <FinanceDashboard mode="district" districtId={districtId ?? undefined} />
        )
      ) : effectiveBranchId ? (
        <FinanceDashboard mode="branch" branchId={effectiveBranchId} />
      ) : (
        <div className="p-8 rounded-lg border bg-muted/20 text-muted-foreground">
          Missing branch assignment for this account. Please set <code>profiles.branch_id</code> for
          this user.
        </div>
      )}
    </div>
  );
};
