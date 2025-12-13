import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  Calendar,
  Activity,
  Shield,
  Building,
  Globe,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DistrictHealthTable, DistrictHealthData } from './DistrictHealthTable';
import { SystemAlertsWidget } from './SystemAlertsWidget';

export const SuperAdminDashboardOverview = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['superadmin-governance-dashboard'],
    queryFn: async () => {
      // Parallel data fetching
      const [
        { count: districtCount, data: districts },
        { count: branchCount, data: branches },
        { count: memberCount },
        { count: userCount },
      ] = await Promise.all([
        supabase.from('districts').select('id, name, overseer_id', { count: 'exact' }),
        supabase
          .from('church_branches')
          .select('id, district_id, is_district_hq, branch_type', { count: 'exact' }),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      return {
        districtCount: districtCount || 0,
        districts: districts || [],
        branchCount: branchCount || 0,
        branches: branches || [],
        memberCount: memberCount || 0,
        userCount: userCount || 0,
      };
    },
  });

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Process data for widgets
  const districtsHealth: DistrictHealthData[] = dashboardData.districts.map((d) => {
    const districtBranches = dashboardData.branches.filter((b) => b.district_id === d.id);
    const hasHQ = districtBranches.some((b) => b.is_district_hq);
    return {
      id: d.id,
      name: d.name,
      branchCount: districtBranches.length,
      hasOverseer: !!d.overseer_id,
      hasHQ,
    };
  });

  const orphanedBranchesCount = dashboardData.branches.filter((b) => !b.district_id).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Governance Command Center</h1>
          <p className="text-gray-600 mt-2">
            Global oversight, compliance monitoring, and system health.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/system-config">System Config</Link>
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Shield className="w-4 h-4 mr-2" />
            System Audit
          </Button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Districts
            </CardTitle>
            <NetworkIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{dashboardData.districtCount}</div>
            <p className="text-xs text-muted-foreground">Governance Zones</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Branches
            </CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{dashboardData.branchCount}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {orphanedBranchesCount > 0 ? (
                  <span className="text-yellow-600 font-medium">
                    {orphanedBranchesCount} Unassigned
                  </span>
                ) : (
                  'All assigned'
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{dashboardData.memberCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered Profiles</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{dashboardData.userCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">System Access</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Governance View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: District Health Matrix */}
        <div className="lg:col-span-2">
          <DistrictHealthTable districts={districtsHealth} />
        </div>

        {/* Right Column: System Alerts */}
        <div>
          <SystemAlertsWidget
            districts={districtsHealth}
            orphanedBranchesCount={orphanedBranchesCount}
          />

          {/* Placeholder for future financial/global summary */}
          <Card className="mt-4 border-gray-100 bg-gray-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-600">Global Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                <span>Aggregated data coming soon</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper Icon
function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H6l3-11" />
    </svg>
  );
}
