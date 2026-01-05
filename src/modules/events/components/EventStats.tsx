import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EventStatsProps {
  stats: {
    total: number;
    national: number;
    district: number;
    branch: number;
    upcoming: number;
  };
}

export const EventStats: React.FC<EventStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Scheduled Protocols',
      value: stats.total,
      icon: Calendar,
      color: 'bg-primary',
      description: 'Total Active Records',
    },
    {
      label: 'National Reach',
      value: stats.national,
      icon: Globe,
      color: 'bg-rose-600',
      description: 'System-wide events',
    },
    {
      label: 'District Networks',
      value: stats.district,
      icon: MapPin,
      color: 'bg-amber-600',
      description: 'Regional activations',
    },
    {
      label: 'Branch Operations',
      value: stats.branch,
      icon: TrendingUp,
      color: 'bg-emerald-600',
      description: 'Local unit activities',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="bg-card border border-primary/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-serif font-black tracking-tight text-foreground">
                    {stat.value}
                  </h3>
                </div>
                <div className={cn('p-3 rounded-2xl shadow-md', stat.color)}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground italic">
                  {stat.description}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-black text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3 w-3" />
                  PROCESSED
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
