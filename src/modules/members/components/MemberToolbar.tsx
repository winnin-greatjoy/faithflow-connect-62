import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Mail, ArrowRightLeft, Upload, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MemberToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddMember: () => void;
  onAddConvert: () => void;
  onAddFirstTimer: () => void;
  onSendMessage?: () => void;
  onBatchTransfer?: () => void;
  onImport?: () => void;
  activeTab: string;
  selectedCount: number;
  totalRecipients: number;
}

export const MemberToolbar: React.FC<MemberToolbarProps> = ({
  search,
  onSearchChange,
  onAddMember,
  onAddConvert,
  onAddFirstTimer,
  onSendMessage,
  onBatchTransfer,
  onImport,
  activeTab,
  selectedCount,
  totalRecipients,
}) => {
  const getAddButtonText = () => {
    if (activeTab === 'converts') return 'Enlist Convert';
    if (activeTab === 'first_timers') return 'Add First Timer';
    return 'Enlist Member';
  };

  const getAddHandler = () => {
    if (activeTab === 'converts') return onAddConvert;
    if (activeTab === 'first_timers') return onAddFirstTimer;
    return onAddMember;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative group flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search personnel matrix..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="glass pl-11 h-12 rounded-xl border-primary/5 focus:ring-primary/20 focus:border-primary/20 transition-all font-medium text-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-widest">Active Search</span>
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {onSendMessage && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onSendMessage}
              disabled={totalRecipients === 0}
              variant="outline"
              className="glass h-12 px-5 rounded-xl font-semibold border-primary/10 hover:bg-primary/5 transition-all text-xs disabled:opacity-30"
            >
              <Mail className="h-4 w-4 mr-2 text-primary" />
              Dispatch Notification {totalRecipients > 0 ? `(${totalRecipients})` : ''}
            </Button>
          </motion.div>
        )}

        {onBatchTransfer && selectedCount > 0 && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={onBatchTransfer}
              className="glass h-12 px-5 rounded-xl font-semibold border-amber-500/20 text-amber-600 hover:bg-amber-500/5 transition-all text-xs"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Relocate ({selectedCount})
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
