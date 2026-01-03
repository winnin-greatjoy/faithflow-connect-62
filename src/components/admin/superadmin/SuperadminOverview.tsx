import React from 'react';
import { motion } from 'framer-motion';
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
  Zap,
  ChevronRight,
  Globe,
  FileBarChart,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

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
        supabase
          .from('districts')
          .select('id, name, head_admin_id, overseer_id', { count: 'exact' }),
        supabase
          .from('church_branches')
          .select('id, name, district_id, is_district_hq', { count: 'exact' }),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('*', { count: 'exact', head: true }),
      ]);

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
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50 relative z-10" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse relative z-10">
          Aggregating Global Data...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[2rem] bg-vibrant-gradient flex items-center justify-center relative shadow-xl shadow-primary/20 group hover:rotate-6 transition-transform">
            <Globe className="h-8 w-8 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-serif tracking-tight">
              System <span className="text-primary">Stewardship</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge
                variant="outline"
                className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10 text-[10px] font-black uppercase tracking-widest px-2"
              >
                Live Nodes
              </Badge>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-500" /> Decentralized network sync
                active
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="glass border-primary/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] h-12 px-8 hover:bg-primary/5"
            asChild
          >
            <Link to="/superadmin/audit">Security Audit</Link>
          </Button>
          <Button
            className="bg-primary hover:primary/90 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] h-12 px-8 shadow-xl shadow-primary/20"
            asChild
          >
            <Link to="/superadmin/districts">Global Protocol</Link>
          </Button>
        </div>
      </motion.div>

      {/* Global KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Districts"
          value={data.stats.districts}
          icon={Network}
          color="text-primary"
          gradient="from-primary/10 to-indigo-500/10"
          subtitle="Regional Zones"
          link="/superadmin/districts"
        />
        <KPICard
          title="Establishments"
          value={data.stats.branches}
          icon={Building}
          color="text-blue-600"
          gradient="from-blue-500/10 to-cyan-500/10"
          subtitle="Active Branches"
          link="/superadmin/districts"
        />
        <KPICard
          title="Total Reach"
          value={data.stats.members.toLocaleString()}
          icon={Users}
          color="text-emerald-600"
          gradient="from-emerald-500/10 to-teal-500/10"
          subtitle="Verified Profiles"
          link="/superadmin/users"
        />
        <KPICard
          title="Admin Staff"
          value={data.stats.users.toLocaleString()}
          icon={Shield}
          color="text-amber-600"
          gradient="from-amber-500/10 to-orange-500/10"
          subtitle="Privileged Access"
          link="/superadmin/users"
        />
        <KPICard
          title="Signals"
          value={data.stats.monthlyAttendance.toLocaleString()}
          icon={Zap}
          color="text-rose-600"
          gradient="from-rose-500/10 to-orange-500/10"
          subtitle="Real-time Events"
          link="/superadmin/reports"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* District Health Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass dark:bg-black/20 border-primary/5 shadow-xl overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-serif">Network Integrity</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 text-primary opacity-60">
                  Compliance & Governance Protocol
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-primary/5">
                {data.districtHealth.length === 0 ? (
                  <div className="p-20 text-center opacity-40">
                    <p className="text-sm font-bold uppercase tracking-widest leading-loose">
                      No active districts detected in the network.
                    </p>
                  </div>
                ) : (
                  data.districtHealth.map((district) => (
                    <DistrictHealthRow key={district.id} district={district} />
                  ))
                )}
              </div>
              <div className="p-10 bg-black/[0.02] dark:bg-black/20">
                <Button
                  variant="ghost"
                  className="w-full h-16 group font-black text-[10px] uppercase tracking-[0.3em] text-primary hover:bg-primary/5 rounded-2xl border-2 border-dashed border-primary/10"
                  asChild
                >
                  <Link
                    to="/superadmin/districts"
                    className="flex items-center justify-center gap-3"
                  >
                    Initialize Management Layer{' '}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Intelligence Side Column */}
        <motion.div variants={itemVariants} className="space-y-10">
          {/* Alerts Card */}
          <Card
            className={cn(
              'glass transition-all shadow-xl overflow-hidden border-primary/5 rounded-[2rem]',
              data.alerts.length > 0 ? 'ring-2 ring-amber-500/20' : ''
            )}
          >
            <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="text-xl font-serif flex items-center gap-4">
                <AlertTriangle
                  className={cn(
                    'h-7 w-7',
                    data.alerts.length > 0 ? 'text-amber-500' : 'text-emerald-500'
                  )}
                />
                Alert Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {data.alerts.length === 0 ? (
                <div className="bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/10 text-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-tight text-emerald-700">
                    Shield Initialized
                  </p>
                  <p className="text-[10px] uppercase font-bold text-emerald-600/60 mt-2">
                    All protocols operational
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 group hover:bg-amber-500/10 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold leading-relaxed">{alert.message}</p>
                          {alert.action && (
                            <Link
                              to={alert.link || '#'}
                              className="text-[10px] font-black uppercase tracking-widest text-primary mt-3 flex items-center hover:gap-3 transition-all"
                            >
                              {alert.action} <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Core Handlers */}
          <Card className="glass border-primary/5 shadow-xl rounded-[2rem]">
            <CardHeader className="p-8 border-b border-primary/5">
              <CardTitle className="text-xl font-serif">Quick Protocols</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {[
                { label: 'Network Expansion', icon: Network, link: '/superadmin/districts' },
                { label: 'Metric Aggregation', icon: FileBarChart, link: '/superadmin/reports' },
                { label: 'Privilege Control', icon: Users, link: '/superadmin/users' },
                { label: 'Governance Logs', icon: Shield, link: '/superadmin/audit' },
              ].map((tool, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start h-16 rounded-2xl hover:bg-primary/5 group"
                  asChild
                >
                  <Link to={tool.link}>
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:rotate-6 transition-all mr-4">
                      <tool.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{tool.label}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, gradient, subtitle, link }: any) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
    <Link to={link}>
      <Card className="glass border-primary/5 hover-glow overflow-hidden relative group h-full cursor-pointer transition-all rounded-3xl">
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity',
            gradient
          )}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2 relative z-10">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">
            {title}
          </CardTitle>
          <div
            className={cn(
              'p-2.5 rounded-xl bg-white/50 dark:bg-black/30 border border-white/20 shadow-sm',
              color
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2 relative z-10">
          <div className={cn('text-4xl font-bold font-serif mb-1.5 tracking-tighter', color)}>
            {value}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
            {subtitle}
          </p>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const DistrictHealthRow = ({ district }: { district: DistrictHealth }) => {
  const statusConfig = {
    healthy: { badge: 'bg-emerald-500/5 text-emerald-600', dot: 'bg-emerald-500' },
    warning: { badge: 'bg-amber-500/5 text-amber-600', dot: 'bg-amber-500' },
    critical: { badge: 'bg-rose-500/5 text-rose-600', dot: 'bg-rose-500' },
  };
  const config = statusConfig[district.status];

  return (
    <Link
      to={`/superadmin/districts/${district.id}`}
      className="flex flex-col sm:flex-row items-center justify-between p-8 hover:bg-primary/[0.02] transition-colors group"
    >
      <div className="flex items-center gap-6">
        <div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl shadow-black/5 bg-background',
            district.status === 'healthy'
              ? 'border-emerald-500/20 group-hover:border-emerald-500/40'
              : district.status === 'warning'
                ? 'border-amber-500/20 group-hover:border-amber-500/40'
                : 'border-rose-500/20 group-hover:border-rose-500/40'
          )}
        >
          <Network
            className={cn(
              'w-8 h-8',
              district.status === 'healthy'
                ? 'text-emerald-500'
                : district.status === 'warning'
                  ? 'text-amber-500'
                  : 'text-rose-500'
            )}
          />
        </div>
        <div>
          <h4 className="font-bold font-serif text-xl group-hover:text-primary transition-colors leading-tight">
            {district.name}
          </h4>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Building className="w-3.5 h-3.5 text-primary opacity-50" /> {district.branchCount}{' '}
              Neural Nodes
            </span>
            <div className={cn('w-2 h-2 rounded-full animate-pulse', config.dot)} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-5 mt-6 sm:mt-0">
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={cn(
              'rounded-xl px-4 py-1.5 font-black text-[9px] uppercase border tracking-widest',
              district.hasHeadAdmin
                ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                : 'bg-rose-500/5 text-rose-600 border-rose-500/10'
            )}
          >
            {district.hasHeadAdmin ? 'Admin Sync ✓' : 'Admin Missing'}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'rounded-xl px-4 py-1.5 font-black text-[9px] uppercase border tracking-widest',
              district.hasHQ
                ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                : 'bg-amber-500/5 text-amber-600 border-amber-500/10'
            )}
          >
            {district.hasHQ ? 'Center Estab ✓' : 'Center Required'}
          </Badge>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
