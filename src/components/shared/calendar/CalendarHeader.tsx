'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Settings,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarHeaderProps } from './calendar.types';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  onPrev,
  onNext,
  onToday,
  view,
  onViewChange,
  onMenuClick,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>

        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">24</span>
          </div>
          <span className="text-xl font-medium text-slate-700 dark:text-slate-200">Calendar</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="px-4 font-medium border-slate-200 dark:border-slate-800"
        >
          Today
        </Button>

        <div className="flex items-center ml-2">
          <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} className="rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <h1 className="text-xl font-medium text-slate-700 dark:text-slate-200 ml-2">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
          <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
          <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>

        <div className="mx-2 h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-[110px] bg-transparent border-slate-200 dark:border-slate-800 h-9 font-medium">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dayGridMonth">Month</SelectItem>
            <SelectItem value="dayGridWeek">Week</SelectItem>
            <SelectItem value="dayGridDay">Day</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-2 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">FF</span>
        </div>
      </div>
    </header>
  );
};
