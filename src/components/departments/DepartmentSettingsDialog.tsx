import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';

interface DepartmentMember {
  id: string;
  full_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  departmentName: string;
  members: DepartmentMember[];
  onUpdated?: (name: string) => void;
  onDeleted?: () => void;
  onMembersChanged?: () => void;
}

export const DepartmentSettingsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  departmentId,
  departmentName,
  members,
  onUpdated,
  onDeleted,
  onMembersChanged,
}) => {
  const [name, setName] = useState(departmentName || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('departments').update({ name }).eq('id', departmentId);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Department updated.' });
      onUpdated?.(name);
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Save failed',
        description: msg || 'Failed to update department',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the department?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ assigned_department: null })
        .eq('id', memberId);
      if (error) throw error;
      toast({ title: 'Removed', description: 'Member removed from department' });
      onMembersChanged?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: 'Remove failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this department? This will remove assignments but not member records.'))
      return;
    setLoading(true);
    try {
      const { error } = await supabase.from('departments').delete().eq('id', departmentId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Department removed.' });
      onDeleted?.();
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Delete failed',
        description: msg || 'Failed to delete department',
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
          <DialogTitle>Department Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Department Members ({members.length})</h3>
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
                <h3 className="text-sm font-semibold text-destructive mb-1">Delete Department</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will remove the department and unassign all members. Member records will not
                  be deleted. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                  Delete Department
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentSettingsDialog;
