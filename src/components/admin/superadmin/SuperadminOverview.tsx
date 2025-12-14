import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Network,
  Building,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DistrictHealth {
  id: string;
  name: string;
  branchCount: number;
  hasHeadAdmin: boolean;
  hasHQ: boolean;
  status: 'healthy' | 'warning' | 'critical';
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  action?: string;
  link?: string;
}

export const SuperadminOverview: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['superadmin-overview'],
    queryFn: async () => {
      const [
        { count: districtCount, data: districts },
        { count: branchCount, data: branches },
        { count: memberCount },
        { count: userCount },
        { count: attendanceThisMonth },
      ] = await Promise.all([
        supabase.from('districts').select('id, name, head_admin_id, overseer_id', { count: 'exact' }),
        supabase.from('church_branches').select('id, name, district_id, is_district_hq', { count: 'exact' }),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('*', { count: 'exact', head: true }),
      ]);

      // Process district health
      const districtHealth: DistrictHealth[] = (districts || []).map((d) => {
        const districtBranches = (branches || []).filter((b) => b.district_id === d.id);
        const hasHQ = districtBranches.some((b) => b.is_district_hq);
        const hasHeadAdmin = !!d.head_admin_id;
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (!hasHeadAdmin && !hasHQ) status = 'critical';
        else if (!hasHeadAdmin || !hasHQ || districtBranches.length === 0) status = 'warning';

        return {
          id: d.id,
          name: d.name,
          branchCount: districtBranches.length,
          hasHeadAdmin,
          hasHQ,
          status,
        };
      });

      // Generate system alerts
      const alerts: SystemAlert[] = [];
      
      const districtsWithoutAdmin = districtHealth.filter((d) => !d.hasHeadAdmin);
      if (districtsWithoutAdmin.length > 0) {
        alerts.push({
          id: 'no-admin',
          type: 'error',
          message: `${districtsWithoutAdmin.length} district(s) without a Head Admin`,
          action: 'Assign Admin',
          link: '/superadmin/districts',
        });
      }

      const districtsWithoutHQ = districtHealth.filter((d) => !d.hasHQ);
      if (districtsWithoutHQ.length > 0) {
        alerts.push({
          id: 'no-hq',
          type: 'warning',
          message: `${districtsWithoutHQ.length} district(s) without a designated HQ`,
          action: 'Set HQ',
          link: '/superadmin/districts',
        });
      }

      const unassignedBranches = (branches || []).filter((b) => !b.district_id);
      if (unassignedBranches.length > 0) {
        alerts.push({
          id: 'unassigned',
          type: 'warning',
          message: `${unassignedBranches.length} branch(es) not assigned to any district`,
          action: 'Assign District',
          link: '/superadmin/branches',
        });
      }

      const emptyDistricts = districtHealth.filter((d) => d.branchCount === 0);
      if (emptyDistricts.length > 0) {
        alerts.push({
          id: 'empty-districts',
          type: 'info',
          message: `${emptyDistricts.length} district(s) have no branches`,
          action: 'View Districts',
          link: '/superadmin/districts',
        });
      }

      return {
        stats: {
          districts: districtCount || 0,
          branches: branchCount || 0,
          members: memberCount || 0,
          users: userCount || 0,
          monthlyAttendance: attendanceThisMonth || 0,
        },
        districtHealth,
        alerts,
        unassignedBranchCount: unassignedBranches.length,
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const healthyCounts = {
    healthy: data.districtHealth.filter((d) => d.status === 'healthy').length,
    warning: data.districtHealth.filter((d) => d.status === 'warning').length,
    critical: data.districtHealth.filter((d) => d.status === 'critical').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Global Overview</h1>
          <p className="text-muted-foreground mt-1">
            System health, compliance monitoring, and governance status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/superadmin/reports">View Reports</Link>
          </Button>
          <Button asChild>
            <Link to="/superadmin/audit">Audit Logs</Link>
          </Button>
        </div>
      </div>

      {/* Global KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Districts"
          value={data.stats.districts}
          icon={Network}
          color="purple"
          subtitle="Governance Zones"
          link="/superadmin/districts"
        />
        <KPICard
          title="Total Branches"
          value={data.stats.branches}
          icon={Building}
          color="blue"
          subtitle={data.unassignedBranchCount > 0 ? `${data.unassignedBranchCount} unassigned` : 'All assigned'}
          subtitleType={data.unassignedBranchCount > 0 ? 'warning' : 'normal'}
          link="/superadmin/branches"
        />
        <KPICard
          title="Total Members"
          value={data.stats.members.toLocaleString()}
          icon={Users}
          color="green"
          subtitle="Registered Profiles"
          link="/superadmin/users"
        />
        <KPICard
          title="Active Users"
          value={data.stats.users.toLocaleString()}
          icon={Activity}
          color="amber"
          subtitle="System Access"
          link="/superadmin/users"
        />
        <KPICard
          title="Monthly Attendance"
          value={data.stats.monthlyAttendance.toLocaleString()}
          icon={Calendar}
          color="teal"
          subtitle="This Month"
          link="/superadmin/reports"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Health Overview - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">District Health Overview</CardTitle>
                <CardDescription>Compliance and governance status by district</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {healthyCounts.healthy} Healthy
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {healthyCounts.warning} Warning
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {healthyCounts.critical} Critical
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.districtHealth.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Network className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No districts configured yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/superadmin/districts">Create First District</Link>
                  </Button>
                </div>
              ) : (
                data.districtHealth.map((district) => (
                  <DistrictHealthRow key={district.id} district={district} />
                ))
              )}
            </div>
            {data.districtHealth.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/superadmin/districts" className="flex items-center justify-center gap-2">
                    View All Districts <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Alerts & Quick Stats */}
        <div className="space-y-6">
          {/* System Alerts */}
          <Card className={data.alerts.length > 0 ? 'border-yellow-200 bg-yellow-50/30' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${data.alerts.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.alerts.length === 0 ? (
                <div className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">All systems operational</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.alerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Global Financials Placeholder */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-muted-foreground">Global Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                <span>Aggregated data coming soon</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/superadmin/districts">
                  <Network className="mr-2 h-4 w-4" /> Create District
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/superadmin/branches">
                  <Building className="mr-2 h-4 w-4" /> Manage Branches
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/superadmin/users">
                  <Users className="mr-2 h-4 w-4" /> Assign Roles
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'purple' | 'blue' | 'green' | 'amber' | 'teal';
  subtitle: string;
  subtitleType?: 'normal' | 'warning';
  link: string;
}

const colorClasses = {
  purple: 'border-l-purple-500 text-purple-500',
  blue: 'border-l-blue-500 text-blue-500',
  green: 'border-l-green-500 text-green-500',
  amber: 'border-l-amber-500 text-amber-500',
  teal: 'border-l-teal-500 text-teal-500',
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, color, subtitle, subtitleType = 'normal', link }) => (
  <Link to={link}>
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${colorClasses[color]} cursor-pointer`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color].split(' ')[1]}`} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${subtitleType === 'warning' ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  </Link>
);

// District Health Row Component
const DistrictHealthRow: React.FC<{ district: DistrictHealth }> = ({ district }) => {
  const statusConfig = {
    healthy: { color: 'bg-green-500', icon: CheckCircle, iconColor: 'text-green-600' },
    warning: { color: 'bg-yellow-500', icon: AlertTriangle, iconColor: 'text-yellow-600' },
    critical: { color: 'bg-red-500', icon: XCircle, iconColor: 'text-red-600' },
  };

  const config = statusConfig[district.status];
  const StatusIcon = config.icon;

  return (
    <Link
      to={`/superadmin/districts/${district.id}`}
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <div>
          <p className="font-medium text-sm group-hover:text-primary transition-colors">{district.name}</p>
          <p className="text-xs text-muted-foreground">
            {district.branchCount} branch{district.branchCount !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Badge variant="outline" className={district.hasHeadAdmin ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
            {district.hasHeadAdmin ? 'Admin ✓' : 'No Admin'}
          </Badge>
          <Badge variant="outline" className={district.hasHQ ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
            {district.hasHQ ? 'HQ ✓' : 'No HQ'}
          </Badge>
        </div>
        <StatusIcon className={`h-4 w-4 ${config.iconColor}`} />
      </div>
    </Link>
  );
};

// Alert Item Component
const AlertItem: React.FC<{ alert: SystemAlert }> = ({ alert }) => {
  const typeConfig = {
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, iconColor: 'text-red-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Activity, iconColor: 'text-blue-600' },
  };

  const config = typeConfig[alert.type];
  const AlertIcon = config.icon;

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <AlertIcon className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{alert.message}</p>
          {alert.action && alert.link && (
            <Link to={alert.link} className="text-xs text-primary hover:underline mt-1 inline-block">
              {alert.action} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
