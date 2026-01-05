// src/components/departments/FirstTimerTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Sparkles,
  MapPin,
  Calendar,
  MoreHorizontal,
  Phone,
  Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FirstTimer } from '@/types/membership';

interface FirstTimerTableProps {
  firstTimers: FirstTimer[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (firstTimer: FirstTimer) => void;
  onView?: (id: string) => void;
  onDelete: (id: string) => void;
  getBranchName: (branchId: string) => string;
}

export const FirstTimerTable: React.FC<FirstTimerTableProps> = ({
  firstTimers,
  selectedIds,
  onSelectionChange,
  onEdit,
  onView,
  onDelete,
  getBranchName,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(firstTimers.map((ft) => ft.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-600',
      contacted: 'bg-amber-500/10 text-amber-600',
      followed_up: 'bg-emerald-500/10 text-emerald-600',
      converted: 'bg-purple-500/10 text-purple-600',
    };
    return (
      <Badge
        className={cn(
          'rounded-lg px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest border-none',
          variants[status] || 'bg-primary/10 text-primary'
        )}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (firstTimers.length === 0) {
    return (
      <div className="text-center py-24 bg-card border border-primary/10 rounded-[2rem] shadow-sm">
        <div className="relative inline-block mb-4">
          <UserPlus className="h-16 w-16 text-primary opacity-20" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary opacity-40 animate-pulse" />
        </div>
        <h3 className="text-xl font-serif font-bold text-foreground opacity-60">
          No First-Timers Detected
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2 opacity-40">
          The evangelism matrix is currently empty for this sector
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Table className="relative z-10">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-primary/5">
            <TableHead className="w-12 pl-6">
              <Checkbox
                checked={selectedIds.length === firstTimers.length && firstTimers.length > 0}
                onCheckedChange={handleSelectAll}
                className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Visitor Identity
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Encounter Details
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Allocation
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Status
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Lifecycle
            </TableHead>
            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firstTimers.map((ft) => (
            <motion.tr
              key={ft.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group hover:bg-primary/5 transition-colors border-primary/5 cursor-default"
            >
              <TableCell className="pl-6">
                <Checkbox
                  checked={selectedIds.includes(ft.id)}
                  onCheckedChange={(checked) => handleSelectOne(ft.id, checked as boolean)}
                  className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all flex-shrink-0">
                    {ft.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                      {ft.fullName}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {ft.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-tight">
                          <Phone className="h-2.5 w-2.5" />
                          {ft.phone}
                        </div>
                      )}
                      {ft.email && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground opacity-60 lowercase tracking-tight">
                          <Mail className="h-2.5 w-2.5" />
                          {ft.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                    <Calendar className="h-3 w-3 text-primary opacity-60" />
                    {new Date(ft.serviceDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground opacity-70">
                    <MapPin className="h-3 w-3 text-primary opacity-40" />
                    {ft.community || 'Zone Unknown'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs font-bold text-foreground/70">
                  {getBranchName(ft.branchId)}
                </div>
                <div className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-30">
                  Operational Unit
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(ft.status)}</TableCell>
              <TableCell>
                <div
                  className={cn(
                    'inline-flex items-center h-6 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
                    ft.followUpStatus === 'completed'
                      ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                      : 'bg-amber-500/5 text-amber-500 border-amber-500/10'
                  )}
                >
                  <span
                    className={cn(
                      'w-1 h-1 rounded-full mr-1.5',
                      ft.followUpStatus === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500 animate-pulse'
                    )}
                  />
                  {ft.followUpStatus}
                </div>
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView?.(ft.id)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"
                    title="Examine History"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(ft)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"
                    title="Modify Protocol"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(ft.id)}
                    className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-rose-500"
                    title="Purge Entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="group-hover:hidden flex justify-end pr-2 text-muted-foreground opacity-40">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
