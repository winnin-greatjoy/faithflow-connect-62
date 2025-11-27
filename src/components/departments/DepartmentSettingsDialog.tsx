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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  departmentName: string;
  onUpdated?: (name: string) => void;
  onDeleted?: () => void;
}

export const DepartmentSettingsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  departmentId,
  departmentName,
  onUpdated,
  onDeleted,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Department Settings</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-2">
          <label className="text-sm">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentSettingsDialog;
