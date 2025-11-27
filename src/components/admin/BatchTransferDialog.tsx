import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Users } from 'lucide-react';

interface BatchTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMembers: { memberId: string; currentBranchId: string }[];
  onSuccess?: () => void;
}

interface Branch {
  id: string;
  name: string;
}

export const BatchTransferDialog: React.FC<BatchTransferDialogProps> = ({
  open,
  onOpenChange,
  selectedMembers,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const { data: branchesData, error: branchesError } = await supabase
          .from('church_branches')
          .select('id, name')
          .order('name');

        if (branchesError) throw branchesError;

        setBranches(branchesData || []);
      } catch (error) {
        console.error('Error loading branches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load branches',
          variant: 'destructive',
        });
      }
    };

    if (open) {
      loadBranches();
      setSelectedBranch('');
      setReason('');
      setNotes('');
    }
  }, [open, toast]);

  const handleSubmit = async () => {
    if (!selectedBranch || !reason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select a branch and provide a reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const transferRequests = selectedMembers.map(({ memberId, currentBranchId }) => ({
        member_id: memberId,
        from_branch_id: currentBranchId,
        to_branch_id: selectedBranch,
        requested_by: user.id,
        reason: reason.trim(),
        notes: notes.trim() || null,
        status: 'pending',
      }));

      const { error } = await supabase.from('member_transfers').insert(transferRequests);

      if (error) throw error;

      toast({
        title: 'Batch Transfer Requested',
        description: `Transfer requests for ${selectedMembers.length} members have been submitted for approval`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error requesting batch transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to request batch transfer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Batch Transfer Members</DialogTitle>
          <DialogDescription>
            Request to transfer {selectedMembers.length} selected members to another branch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg mb-4">
            <Users className="h-6 w-6 mr-2 text-primary" />
            <span className="font-medium text-lg">{selectedMembers.length} Members Selected</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Transfer To *</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch">
                <SelectValue placeholder="Select destination branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Transfer *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why these members are being transferred..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{reason.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedBranch || !reason.trim()}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Request Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
