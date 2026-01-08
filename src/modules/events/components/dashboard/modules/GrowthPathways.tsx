import React, { useState } from 'react';
import {
  Target,
  Users,
  MapPin,
  CheckCircle2,
  Star,
  Timer,
  ChevronRight,
  GraduationCap,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Milestone } from '@/modules/events/types/engagement';

// Mock Data
const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: "Believer's Foundation",
    description: 'Core doctrines class',
    targetCount: 100,
    currentCount: 75,
    stage: 'new_believer',
  },
  {
    id: 'm2',
    name: 'Water Baptism',
    description: 'Public declaration of faith',
    targetCount: 50,
    currentCount: 12,
    stage: 'convert',
  },
  {
    id: 'm3',
    name: 'Workforce Induction',
    description: 'Volunteer training',
    targetCount: 30,
    currentCount: 24,
    stage: 'worker',
  },
  {
    id: 'm4',
    name: 'Leadership Summit',
    description: 'Strategic training for leaders',
    targetCount: 20,
    currentCount: 8,
    stage: 'leader',
  },
];

export const GrowthPathwaysModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const FunnelView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        {MOCK_MILESTONES.map((milestone, i) => {
          const progress = (milestone.currentCount / milestone.targetCount) * 100;
          return (
            <div key={milestone.id} className="relative">
              <div className="flex items-center gap-6 p-5 rounded-2xl bg-white border border-primary/5 shadow-sm z-10 relative group hover:shadow-md transition-all">
                <div
                  className={cn(
                    'h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg',
                    milestone.stage === 'new_believer'
                      ? 'bg-blue-500'
                      : milestone.stage === 'convert'
                        ? 'bg-emerald-500'
                        : milestone.stage === 'worker'
                          ? 'bg-amber-500'
                          : 'bg-primary'
                  )}
                >
                  {milestone.stage === 'leader' ? (
                    <Star className="h-6 w-6" />
                  ) : milestone.stage === 'convert' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Users className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h5 className="font-black text-foreground text-sm">{milestone.name}</h5>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {milestone.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/10 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest"
                    >
                      {milestone.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={progress}
                      className="h-2 flex-1"
                      indicatorClassName={cn(
                        milestone.stage === 'new_believer'
                          ? 'bg-blue-500'
                          : milestone.stage === 'convert'
                            ? 'bg-emerald-500'
                            : milestone.stage === 'worker'
                              ? 'bg-amber-500'
                              : 'bg-primary'
                      )}
                    />
                    <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">
                      {milestone.currentCount} / {milestone.targetCount}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {i < MOCK_MILESTONES.length - 1 && (
                <div className="absolute left-11 top-12 bottom-0 w-0.5 h-12 bg-muted-foreground/20 -z-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Growth Pathways
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Discipleship & Member Maturity
          </p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {['overview', 'members', 'curriculum'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrolled', count: 189, icon: Users, color: 'text-primary' },
          { label: 'Graduated', count: 42, icon: GraduationCap, color: 'text-emerald-500' },
          { label: 'At Risk', count: 15, icon: Timer, color: 'text-destructive' },
          { label: 'Conversion Rate', count: '68%', icon: ArrowUpRight, color: 'text-blue-500' },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-4 bg-white rounded-[24px] border border-primary/5 shadow-sm flex items-center gap-4"
          >
            <div
              className={cn(
                'h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center',
                stat.color
              )}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black">{stat.count}</h3>
              <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && <FunnelView />}
        {activeTab === 'members' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Member roster view</p>
            <Button variant="link" className="text-xs">
              Manage Enrollments
            </Button>
          </div>
        )}
        {activeTab === 'curriculum' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <GraduationCap className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Class materials & Resources</p>
          </div>
        )}
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
