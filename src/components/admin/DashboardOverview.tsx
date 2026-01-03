import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const [branchName, setBranchName] = useState('your church');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
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
            .single();
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
      } catch (error) {
        console.error('Error fetching stats:', error);
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
      gradient: 'from-blue-500/10 to-indigo-500/10',
      color: 'text-blue-600',
      sub: 'Verified members',
    },
    {
      label: 'Departments',
      value: stats.departments,
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      color: 'text-emerald-600',
      sub: 'Service units',
    },
    {
      label: 'Ministries',
      value: stats.ministries,
      icon: Calendar,
      gradient: 'from-purple-500/10 to-pink-500/10',
      color: 'text-purple-600',
      sub: 'Outreach teams',
    },
    {
      label: 'First Timers',
      value: stats.firstTimers,
      icon: UserCheck,
      gradient: 'from-orange-500/10 to-amber-500/10',
      color: 'text-orange-600',
      sub: 'New visitors',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
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
            className="glass h-11 px-5 rounded-xl font-semibold border-primary/20"
          >
            Export Data
          </Button>
          <Button
            onClick={() => navigate('/admin/ai-reports')}
            className="bg-vibrant-gradient h-11 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            Generate Report
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5 }}>
            <Card className="glass border-primary/5 hover-glow overflow-hidden relative group h-full">
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity',
                  item.gradient
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
            className="h-24 glass border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center gap-3 p-4 transition-all hover:bg-primary/5 rounded-2xl group"
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
          <Card className="glass dark:bg-black/20 border-primary/5 h-full flex flex-col shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-primary/5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="px-6 py-5 hover:bg-primary/[0.01] transition-colors group cursor-default"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-10 w-10 btn-glass bg-primary/5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold truncate">New member joined</p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                            2h ago
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          John Doe has been registered successfully.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Chart */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="glass dark:bg-black/20 border-primary/5 h-full shadow-xl overflow-hidden">
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
              <div className="h-[300px] flex items-center justify-center glass border-dashed border-2 border-primary/10 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                <div className="text-center p-8 relative z-10">
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Metrics Processing</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Analyzing sunday service patterns and small-group engagement for the current
                    quarter.
                  </p>
                  <Button variant="link" className="mt-4 text-primary font-bold gap-2">
                    Open detailed analytics <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
