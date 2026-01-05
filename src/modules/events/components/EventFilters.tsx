import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { EventLevel, EventType } from '../types';

interface EventFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  scopeFilter: EventLevel | 'All';
  onScopeChange: (value: EventLevel | 'All') => void;
  typeFilter: EventType | 'All';
  onTypeChange: (value: EventType | 'All') => void;
  sortBy: 'date' | 'name';
  onSortByChange: (value: 'date' | 'name') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  scopeFilter,
  onScopeChange,
  typeFilter,
  onTypeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            placeholder="Scan Digital Protocols..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-card pl-11 h-12 rounded-2xl border border-primary/10 focus:border-primary/20 focus:ring-primary/5 transition-all text-sm font-bold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="bg-card w-[140px] h-12 rounded-2xl border border-primary/10 font-bold text-xs uppercase tracking-wider">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-primary/10 rounded-2xl">
              <SelectItem value="date" className="font-bold text-xs py-3">
                CHRONOLOGY
              </SelectItem>
              <SelectItem value="name" className="font-bold text-xs py-3">
                NOMENCLATURE
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-card h-12 w-12 rounded-2xl border border-primary/10 hover:bg-primary/5"
          >
            {sortOrder === 'asc' ? (
              <Filter className="h-4 w-4 rotate-180" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Tabs value={scopeFilter} onValueChange={(v: any) => onScopeChange(v)}>
          <TabsList className="bg-muted/30 p-1 h-auto flex-wrap justify-start border border-primary/5 rounded-2xl shadow-sm">
            {['All', 'NATIONAL', 'DISTRICT', 'BRANCH'].map((scope) => (
              <TabsTrigger
                key={scope}
                value={scope}
                className="rounded-xl px-6 py-2.5 text-[10px] font-black tracking-[0.2em] uppercase data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none data-[state=active]:shadow-md"
              >
                {scope}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={typeFilter} onValueChange={(v: any) => onTypeChange(v)}>
          <TabsList className="bg-muted/30 p-1 h-auto flex-wrap justify-start border border-primary/5 rounded-2xl shadow-sm">
            {['All', 'General', 'Registration', 'Conference', 'Crusade', 'Retreat'].map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="rounded-xl px-5 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all shadow-none"
              >
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
