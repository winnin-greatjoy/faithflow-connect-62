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
  Phone,
  Mail,
  Users,
  Eye,
  MoreHorizontal,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Member } from '@/types/membership';

interface MemberTableProps {
  members: Member[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onIdCard: (member: Member) => void;
  getBranchName: (branchId: string) => string;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onIdCard,
  getBranchName,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(members.map((m) => m.id));
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

  const getMembershipBadge = (member: Member) => {
    const badgeBaseClass =
      'rounded-lg px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest border-none';

    if (member.membershipLevel === 'convert') {
      return (
        <Badge className={cn(badgeBaseClass, 'bg-indigo-500/10 text-indigo-600')}>
          Regen Status: Convert
        </Badge>
      );
    }
    if (member.baptizedSubLevel === 'worker') {
      return (
        <Badge className={cn(badgeBaseClass, 'bg-emerald-500/10 text-emerald-600')}>
          Protocol: Worker
        </Badge>
      );
    }
    if (member.baptizedSubLevel === 'disciple') {
      return (
        <Badge className={cn(badgeBaseClass, 'bg-purple-500/10 text-purple-600')}>
          Tier: Disciple
        </Badge>
      );
    }
    if (member.baptizedSubLevel === 'leader') {
      return (
        <Badge className={cn(badgeBaseClass, 'bg-orange-500/10 text-orange-600')}>
          Hierarchy: Leader
        </Badge>
      );
    }
    if (member.leaderRole === 'pastor' || member.leaderRole === 'assistant_pastor') {
      return (
        <Badge className={cn(badgeBaseClass, 'bg-blue-500/10 text-blue-600')}>
          Authority: Pastor
        </Badge>
      );
    }
    return <Badge className={cn(badgeBaseClass, 'bg-primary/10 text-primary')}>Member</Badge>;
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-24 bg-card border border-primary/10 rounded-3xl shadow-sm">
        <div className="relative inline-block mb-4">
          <Users className="h-16 w-16 text-primary opacity-20" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary opacity-40 animate-pulse" />
        </div>
        <h3 className="text-xl font-serif font-bold text-foreground opacity-60">
          Roster Data Unavailable
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2 opacity-40">
          No personnel detected in the current matrix
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
                checked={selectedIds.length === members.length && members.length > 0}
                onCheckedChange={handleSelectAll}
                className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Name
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Contact
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Branch
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Category
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Status
            </TableHead>
            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <motion.tr
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group hover:bg-primary/5 transition-colors border-primary/5 cursor-default"
            >
              <TableCell className="pl-6">
                <Checkbox
                  checked={selectedIds.includes(member.id)}
                  onCheckedChange={(checked) => handleSelectOne(member.id, checked as boolean)}
                  className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="relative group/photo flex-shrink-0">
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt={member.fullName}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-primary/5 group-hover/photo:ring-primary/20 transition-all"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/5 group-hover/photo:ring-primary/20 transition-all">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                      {member.fullName}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 leading-none mt-1">
                      {member.community || 'Zone Unknown'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                      <Phone className="h-3 w-3 text-primary opacity-60" />
                      {member.phone}
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground opacity-70">
                      <Mail className="h-3 w-3 text-primary opacity-40" />
                      <span className="truncate max-w-[150px]">{member.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs font-bold text-foreground/70">
                  {getBranchName(member.branchId)}
                </div>
                <div className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-30">
                  Operational Unit
                </div>
              </TableCell>
              <TableCell>{getMembershipBadge(member)}</TableCell>
              <TableCell>
                <div
                  className={cn(
                    'inline-flex items-center h-6 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border',
                    member.status === 'active'
                      ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                      : 'bg-muted text-muted-foreground border-primary/5'
                  )}
                >
                  <span
                    className={cn(
                      'w-1 h-1 rounded-full mr-1.5 animate-pulse',
                      member.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                    )}
                  />
                  {member.status}
                </div>
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onIdCard(member)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"
                    title="Digital ID Card"
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(member)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"
                    title="Examine Profile"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(member)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"
                    title="Modify Records"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(member.id)}
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
