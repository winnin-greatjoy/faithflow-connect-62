import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building,
  Users,
  Activity,
  UserCog,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Target,
} from 'lucide-react';
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

interface DistrictStats {
  totalMembers: number;
  totalBranches: number;
  totalDepartments: number;
  totalStaff: number;
}

interface DistrictOverviewProps {
  stats: DistrictStats;
  recentActivity?: any[];
}

export const DistrictOverview: React.FC<DistrictOverviewProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Branches',
      value: stats.totalBranches,
      icon: Building,
      gradient: 'from-blue-500/10 to-indigo-500/10',
      color: 'text-blue-600',
      sub: 'Active units',
    },
    {
      label: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      color: 'text-emerald-600',
      sub: 'Verified across district',
    },
    {
      label: 'Active Staff',
      value: stats.totalStaff,
      icon: UserCog,
      gradient: 'from-purple-500/10 to-pink-500/10',
      color: 'text-purple-600',
      sub: 'Leadership team',
    },
    {
      label: 'Avg. Attendance',
      value: '--',
      icon: TrendingUp,
      gradient: 'from-orange-500/10 to-amber-500/10',
      color: 'text-orange-600',
      sub: 'Growth index',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* KPI Cards */}
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
                <div className={cn('text-3xl font-bold font-serif my-1', item.color)}>
                  {item.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {item.sub}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass dark:bg-black/20 border-primary/5 h-full flex flex-col shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  District Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                  History
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-50">
              <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold">Waiting for Data</h3>
              <p className="text-sm max-w-xs mx-auto mt-1">
                Once branches begin submitting their weekly telemetry, your live district feed will
                appear here.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts / Warnings */}
        <motion.div variants={itemVariants}>
          <Card className="glass dark:bg-black/20 border-primary/5 h-full shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Management Focus
              </CardTitle>
              <CardDescription>Items requires administrative oversight</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="group p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                      Branch Compliance
                    </h4>
                    <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-1 leading-relaxed">
                      3 branches are currently 48h overdue on their monthly operational reports.
                      Please follow up.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground">District Sync</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      The Quarterly Leadership Alignment meeting is scheduled in 5 days at the HQ
                      Pavilion.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-2 font-bold text-xs uppercase tracking-widest text-primary hover:bg-primary/5 group"
              >
                View All Tasks{' '}
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
