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
  ministryId: string;
  onMembersAdded?: () => void;
}

interface BaptizedMember {
  id: string;
  full_name: string;
  email: string;
}

export const AddMemberToMinistryDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  ministryId,
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
  }, [open, ministryId]);

  const loadBaptizedMembers = async () => {
    try {
      // Get all baptized members
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select('id, full_name, email')
        .eq('membership_level', 'baptized')
        .order('full_name');

      if (membersError) throw membersError;

      // Get members already in this ministry
      const { data: ministryMembers, error: ministryMembersError } = await supabase
        .from('ministry_members')
        .select('member_id')
        .eq('ministry_id', ministryId);

      if (ministryMembersError) throw ministryMembersError;

      // Filter out members already in this ministry
      const existingMemberIds = new Set((ministryMembers || []).map((mm) => mm.member_id));
      const availableMembers = (allMembers || []).filter((m) => !existingMemberIds.has(m.id));

      setMembers(availableMembers);
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
      const inserts = Array.from(selectedMembers).map((memberId) => ({
        ministry_id: ministryId,
        member_id: memberId,
      }));

      const { error } = await supabase.from('ministry_members').insert(inserts);
      if (error) throw error;

      toast({
        title: 'Success',
        description: `${selectedMembers.size} member(s) added to ministry`,
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
          <DialogTitle>Add Members to Ministry</DialogTitle>
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
                {searchQuery
                  ? 'No members found matching your search'
                  : 'No baptized members available'}
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
