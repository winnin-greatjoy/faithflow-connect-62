import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  branchId?: string;
  onMembersAdded?: () => void;
}

interface BaptizedMember {
  id: string;
  full_name: string;
  email: string;
  assigned_department: string | null;
}

export const AddMemberToDepartmentDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  departmentId,
  branchId,
  onMembersAdded,
}) => {
  const [members, setMembers] = useState<BaptizedMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadBaptizedMembers();
    }
  }, [open, departmentId]);

  const loadBaptizedMembers = async () => {
    try {
      let query = supabase
        .from('members')
        .select('id, full_name, email, assigned_department')
        .eq('membership_level', 'baptized')
        .or(`assigned_department.is.null,assigned_department.neq.${departmentId}`);

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Load failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handleToggleMember = (memberId: string) => {
    const newSet = new Set(selectedMembers);
    if (newSet.has(memberId)) {
      newSet.delete(memberId);
    } else {
      newSet.add(memberId);
    }
    setSelectedMembers(newSet);
  };

  const handleAddMembers = async () => {
    if (selectedMembers.size === 0) {
      toast({ title: 'No members selected', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updates = Array.from(selectedMembers).map((memberId) => ({
        id: memberId,
        assigned_department: departmentId,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('members')
          .update({ assigned_department: update.assigned_department })
          .eq('id', update.id);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `${selectedMembers.size} member(s) added to department`,
      });
      setSelectedMembers(new Set());
      onMembersAdded?.();
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Add failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Members to Department</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <ScrollArea className="h-[400px] border rounded-md p-4">
            {filteredMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No baptized members available
              </p>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleToggleMember(member.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onCheckedChange={() => handleToggleMember(member.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.assigned_department && (
                        <p className="text-xs text-orange-600">Currently in another department</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="text-sm text-muted-foreground">
            {selectedMembers.size} member(s) selected
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddMembers} disabled={loading || selectedMembers.size === 0}>
            {loading ? 'Adding...' : `Add ${selectedMembers.size} Member(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
