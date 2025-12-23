import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MinistryMember {
  id: string;
  full_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministryId: string;
  ministryName: string;
  ministryDescription: string;
  currentLeaderId: string | null;
  onUpdated?: (name: string, description: string) => void;
  onDeleted?: () => void;
  onMembersChanged?: () => void;
}

export const MinistrySettingsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  ministryId,
  ministryName,
  ministryDescription,
  currentLeaderId,
  onUpdated,
  onDeleted,
  onMembersChanged,
}) => {
  const [name, setName] = useState(ministryName || '');
  const [description, setDescription] = useState(ministryDescription || '');
  const [leaderId, setLeaderId] = useState(currentLeaderId || '');
  const [members, setMembers] = useState<MinistryMember[]>([]);
  const [availableLeaders, setAvailableLeaders] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setName(ministryName || '');
    setDescription(ministryDescription || '');
    setLeaderId(currentLeaderId || '');
  }, [ministryName, ministryDescription, currentLeaderId]);

  // Load ministry members
  useEffect(() => {
    if (open && ministryId) {
      loadMinistryMembers();
      loadAvailableLeaders();
    }
  }, [open, ministryId]);

  const loadMinistryMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('ministry_members')
        .select('member_id, members(id, full_name)')
        .eq('ministry_id', ministryId);

      if (error) throw error;

      const membersList = (data || [])
        .map((mm: any) => mm.members)
        .filter(Boolean)
        .map((m: any) => ({ id: m.id, full_name: m.full_name }));

      setMembers(membersList);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Failed to load ministry members:', msg);
    }
  };

  const loadAvailableLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name')
        .eq('membership_level', 'baptized')
        .order('full_name');

      if (error) throw error;
      setAvailableLeaders(data || []);
    } catch (e: unknown) {
      console.error('Failed to load available leaders');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ministries')
        .update({
          name,
          description: description || null,
          head_id: leaderId || null,
        })
        .eq('id', ministryId);

      if (error) throw error;
      toast({ title: 'Saved', description: 'Ministry updated successfully.' });
      onUpdated?.(name, description);
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Save failed',
        description: msg || 'Failed to update ministry',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the ministry?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ministry_members')
        .delete()
        .eq('ministry_id', ministryId)
        .eq('member_id', memberId);

      if (error) throw error;
      toast({ title: 'Removed', description: 'Member removed from ministry' });
      await loadMinistryMembers();
      onMembersChanged?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: 'Remove failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Delete this ministry? This will remove all member associations. This action cannot be undone.'
      )
    )
      return;
    setLoading(true);
    try {
      // Delete ministry members first
      await supabase.from('ministry_members').delete().eq('ministry_id', ministryId);

      // Then delete the ministry
      const { error } = await supabase.from('ministries').delete().eq('id', ministryId);
      if (error) throw error;

      toast({ title: 'Deleted', description: 'Ministry removed successfully.' });
      onDeleted?.();
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Delete failed',
        description: msg || 'Failed to delete ministry',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ministry Settings</DialogTitle>
          <DialogDescription>
            Manage settings, members, and advanced options for this ministry.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ministry-name">Ministry Name</Label>
              <Input id="ministry-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministry-description">Description</Label>
              <Textarea
                id="ministry-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the ministry..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministry-leader">Ministry Leader</Label>
              <Select
                value={leaderId || 'none'}
                onValueChange={(v) => setLeaderId(v === 'none' ? '' : v)}
              >
                <SelectTrigger id="ministry-leader">
                  <SelectValue placeholder="Select a leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Leader</SelectItem>
                  {availableLeaders.map((leader) => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !name.trim()}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Ministry Members ({members.length})</h3>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No members assigned
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <span className="font-medium">{member.full_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <div className="border border-destructive/50 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-destructive mb-1">Delete Ministry</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently remove the ministry and unassign all members. This action
                  cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                  Delete Ministry
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MinistrySettingsDialog;
