import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TabType)}
      className="w-full"
    >
      <TabsList className="bg-muted/30 p-1 h-12 rounded-xl border border-primary/5 gap-1 mb-2">
        <TabsTrigger
          value="all"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          All Members
        </TabsTrigger>
        <TabsTrigger
          value="workers"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          Workers
        </TabsTrigger>
        <TabsTrigger
          value="disciples"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          Disciples
        </TabsTrigger>
        <TabsTrigger
          value="leaders"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          Leaders
        </TabsTrigger>
        <TabsTrigger
          value="pastors"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          Pastors
        </TabsTrigger>
        <TabsTrigger
          value="visitors"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          Visitors
        </TabsTrigger>
        <TabsTrigger
          value="converts"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          Converts
        </TabsTrigger>
        <TabsTrigger
          value="first_timers"
          className="rounded-lg px-4 h-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
        >
          First Timers
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
