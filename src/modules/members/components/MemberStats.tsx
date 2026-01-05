// src/modules/members/components/MemberStats.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Award, Crown, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MemberStats as StatsType } from '../types';

interface MemberStatsProps {
  stats: StatsType;
  loading?: boolean;
  onCardClick?: (type: string) => void;
}

export const MemberStats: React.FC<MemberStatsProps> = ({ stats, loading, onCardClick }) => {
  const statCards = [
    {
      type: 'members',
      icon: Users,
      label: 'Total Members',
      value: stats.totalMembers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'workers',
      icon: UserCheck,
      label: 'Workers',
      value: stats.workers,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      type: 'disciples',
      icon: Award,
      label: 'Disciples',
      value: stats.disciples,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      type: 'leaders',
      icon: Crown,
      label: 'Leaders',
      value: stats.leaders,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      type: 'converts',
      icon: User,
      label: 'Converts',
      value: stats.converts,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      type: 'first_timers',
      icon: Users,
      label: 'First Timers',
      value: stats.firstTimers,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-2">
        {[...Array(6)].map((_, index) => (
          <Card
            key={index}
            className="bg-card animate-pulse border border-primary/10 rounded-2xl overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="h-10 bg-gray-200/20 rounded-xl"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card
            onClick={() => onCardClick?.(stat.type)}
            className="bg-card border border-primary/10 rounded-2xl overflow-hidden group hover:border-primary/20 transition-all hover:shadow-md cursor-pointer"
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3',
                    stat.bgColor.replace('bg-', 'bg-').replace('50', '500/10'),
                    stat.color
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-0.5">
                    {stat.label}
                  </div>
                  <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
