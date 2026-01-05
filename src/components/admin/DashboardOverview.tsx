import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportToPDF } from '@/utils/reportExportUtils';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  DollarSign,
  Calendar,
  UserCheck,
  Plus,
  MessageSquare,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfWeek, addDays, parseISO, isAfter } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
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

export const DashboardOverview = () => {
  const { selectedBranchId } = useAdminContext();
  const { branchId: authBranchId, hasRole } = useAuthz();
  const navigate = useNavigate();
  const isSuperadmin = hasRole('super_admin');
  const effectiveBranchId = isSuperadmin ? selectedBranchId : authBranchId;

  const [stats, setStats] = useState({
    members: 0,
    departments: 0,
    ministries: 0,
    firstTimers: 0,
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [branchName, setBranchName] = useState('your church');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (effectiveBranchId === undefined && !isSuperadmin) {
          setLoading(false);
          return;
        }

        // 1. Fetch Basic Stats
        let mQuery = supabase.from('members').select('*', { count: 'exact', head: true });
        let dQuery = supabase.from('departments').select('*', { count: 'exact', head: true });
        let minQuery = supabase.from('ministries').select('*', { count: 'exact', head: true });
        let ftQuery = supabase.from('first_timers').select('*', { count: 'exact', head: true });

        if (effectiveBranchId) {
          mQuery = mQuery.eq('branch_id', effectiveBranchId);
          dQuery = dQuery.eq('branch_id', effectiveBranchId);
          minQuery = minQuery.eq('branch_id', effectiveBranchId);
          ftQuery = ftQuery.eq('branch_id', effectiveBranchId);

          const { data: bData } = await supabase
            .from('church_branches')
            .select('name')
            .eq('id', effectiveBranchId)
            .maybeSingle();
          if (bData) setBranchName(bData.name);
        } else {
          setBranchName('Global System');
        }

        const [mRes, dRes, minRes, ftRes] = await Promise.all([mQuery, dQuery, minQuery, ftQuery]);

        setStats({
          members: mRes.count || 0,
          departments: dRes.count || 0,
          ministries: minRes.count || 0,
          firstTimers: ftRes.count || 0,
        });

        // 2. Fetch Recent Activities (Members & Finance)
        let rmQuery = supabase.from('members').select('full_name, created_at');
        let rfQuery = supabase.from('finance_records').select('category, amount, type, created_at');

        if (effectiveBranchId) {
          rmQuery = rmQuery.eq('branch_id', effectiveBranchId);
          rfQuery = rfQuery.eq('branch_id', effectiveBranchId);
        }

        const [recentMembers, recentFinance] = await Promise.all([
          rmQuery.order('created_at', { ascending: false }).limit(5),
          rfQuery.order('created_at', { ascending: false }).limit(5),
        ]);

        const formattedActivities = [
          ...(recentMembers.data || []).map((m) => ({
            type: 'member',
            title: 'New Member Joined',
            desc: `${m.full_name} registered.`,
            time: m.created_at,
            icon: Users,
          })),
          ...(recentFinance.data || []).map((f) => ({
            type: 'finance',
            title: f.type === 'income' ? 'Donation Received' : 'Expense Recorded',
            desc: `${f.category}: $${f.amount.toLocaleString()}`,
            time: f.created_at,
            icon: DollarSign,
          })),
        ]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5);

        setActivities(formattedActivities);

        // 3. Fetch Attendance Trend (Last 8 Weeks)
        const { data: attendance } = await supabase
          .from('attendance')
          .select('attendance_date')
          .eq('branch_id', effectiveBranchId);

        const trend = Array.from({ length: 8 }).map((_, i) => {
          const weekStart = startOfWeek(addDays(new Date(), -(7 - i) * 7));
          const nextWeekStart = addDays(weekStart, 7);
          const count =
            attendance?.filter((a) => {
              const d = parseISO(a.attendance_date);
              return (
                (isAfter(d, weekStart) || d.getTime() === weekStart.getTime()) &&
                !isAfter(d, nextWeekStart)
              );
            }).length || 0;
          return { name: format(weekStart, 'MMM dd'), attendance: count };
        });

        setAttendanceData(trend);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [effectiveBranchId]);

  const statItems = [
    {
      label: 'Total Members',
      value: stats.members,
      icon: Users,
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      color: 'text-blue-600',
      sub: 'Verified members',
      module: 'members',
    },
    {
      label: 'Departments',
      value: stats.departments,
      icon: DollarSign,
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      color: 'text-emerald-600',
      sub: 'Service units',
      module: 'departments',
    },
    {
      label: 'Ministries',
      value: stats.ministries,
      icon: Calendar,
      bg: 'bg-purple-50 dark:bg-purple-900/10',
      color: 'text-purple-600',
      sub: 'Outreach teams',
      module: 'ministries',
    },
    {
      label: 'First Timers',
      value: stats.firstTimers,
      icon: UserCheck,
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      color: 'text-orange-600',
      sub: 'New visitors',
      module: 'members',
      state: { activeTab: 'first_timers' },
    },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast({
        title: 'Initializing Export',
        description: 'Preparing your branch overview PDF...',
      });

      await exportToPDF(
        'dashboard-overview-content',
        `Branch_Overview_${format(new Date(), 'yyyy-MM-dd')}`
      );

      toast({
        title: 'Export Complete',
        description: 'Your report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'There was an error generating your PDF. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Add Member':
        navigate('/admin/members', { state: { openAddMember: true } });
        break;
      case 'Send Message':
        navigate('/admin/communication');
        break;
      case 'Create Event':
        navigate('/admin/events', { state: { openCreateEvent: true } });
        break;
      case 'Donation':
        navigate('/admin/finance', { state: { openRecordTransaction: true } });
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      id="dashboard-overview-content"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-4 md:p-0 bg-background"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground">
            Administrative <span className="text-primary">Overview</span>
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            Insights and management for{' '}
            <span className="font-semibold text-foreground px-2 py-0.5 rounded-md bg-primary/5">
              {branchName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-card h-11 px-5 rounded-xl font-semibold border border-primary/10 shadow-sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export Data'
            )}
          </Button>
          <Button
            onClick={() => navigate('/admin/ai-reports')}
            className="bg-primary h-11 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-white"
          >
            Generate Report
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/admin/${item.module}`, { state: item.state })}
            className="cursor-pointer"
          >
            <Card className="bg-card border border-primary/10 hover:shadow-md transition-shadow overflow-hidden relative group h-full">
              <div
                className={cn(
                  'absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity',
                  item.bg
                )}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2 relative z-10">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </CardTitle>
                <div className={cn('p-2 rounded-xl bg-white/50 dark:bg-black/30', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 relative z-10">
                <div className={cn('text-3xl sm:text-4xl font-bold font-serif my-1', item.color)}>
                  {loading ? '...' : item.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {item.sub}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Member', icon: Plus },
          { label: 'Send Message', icon: MessageSquare },
          { label: 'Create Event', icon: FileText },
          { label: 'Donation', icon: DollarSign },
        ].map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => handleQuickAction(action.label)}
            className="h-24 bg-card border border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center gap-3 p-4 transition-all hover:bg-primary/5 rounded-2xl group shadow-sm"
          >
            <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <action.icon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground">{action.label}</span>
          </Button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="bg-card border border-primary/10 h-full flex flex-col shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-primary"
                  onClick={() => navigate('/admin/reports')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-primary/5">
                {activities.length > 0 ? (
                  activities.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-5 hover:bg-primary/[0.01] transition-colors group cursor-default"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-background border border-primary/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold truncate">{item.title}</p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                              {format(new Date(item.time), 'MMM dd')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Chart */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="bg-card border border-primary/10 h-full shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Attendance Overview</CardTitle>
                  <CardDescription>Visual stats for the past month</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-8 rounded-full bg-primary/20" />
                  <div className="h-2 w-2 rounded-full bg-primary/10" />
                  <div className="h-2 w-2 rounded-full bg-primary/10" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[300px] w-full mt-4">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
                  </div>
                ) : attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceData}>
                      <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--primary)/0.05)"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 700,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderRadius: '12px',
                          border: '1px solid hsl(var(--primary)/0.1)',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        }}
                        itemStyle={{
                          color: 'hsl(var(--primary))',
                          fontWeight: 800,
                          fontSize: '12px',
                        }}
                        labelStyle={{
                          fontWeight: 800,
                          fontSize: '10px',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="attendance"
                        stroke="hsl(var(--primary))"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorAttendance)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card border-dashed border-2 border-primary/10 rounded-3xl">
                    <TrendingUp className="h-10 w-10 text-primary/20 mb-4" />
                    <h3 className="text-sm font-bold">No Attendance Data</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start recording attendance to see trends.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  variant="link"
                  className="text-primary font-bold gap-2"
                  onClick={() => navigate('/admin/reports/1')}
                >
                  Open detailed analytics <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
