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
import { ArrowRight, Loader2 } from 'lucide-react';

interface MemberTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  currentBranchId: string;
  onTransferRequested?: () => void;
}

interface Branch {
  id: string;
  name: string;
}

export const MemberTransferDialog: React.FC<MemberTransferDialogProps> = ({
  open,
  onOpenChange,
  memberId,
  memberName,
  currentBranchId,
  onTransferRequested,
}) => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState('');

  useEffect(() => {
    if (open) {
      loadBranches();
      setSelectedBranch('');
      setReason('');
      setNotes('');
    }
  }, [open, currentBranchId]);

  const loadBranches = async () => {
    try {
      const { data: branchesData, error: branchesError } = await supabase
        .from('church_branches')
        .select('id, name')
        .neq('id', currentBranchId)
        .order('name');

      if (branchesError) throw branchesError;

      const { data: currentBranch, error: currentError } = await supabase
        .from('church_branches')
        .select('name')
        .eq('id', currentBranchId)
        .single();

      if (!currentError && currentBranch) {
        setCurrentBranchName(currentBranch.name);
      }

      setBranches(branchesData || []);
    } catch (error) {
      console.error('Error loading branches:', error);
      // Try RPC fallback for environments with strict RLS that prevents listing branches
      try {
        const { data: rpcBranches, error: rpcError } = await (supabase as any).rpc(
          'list_transfer_branches'
        );
        if (!rpcError && rpcBranches && Array.isArray(rpcBranches)) {
          // Exclude current branch
          const filtered = rpcBranches.filter((b: any) => b.id !== currentBranchId);
          setBranches(filtered || []);
          return;
        }
      } catch (rpcErr) {
        console.error('RPC fallback failed:', rpcErr);
      }

      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive',
      });
    }
  };

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

      const { error } = await supabase.from('member_transfers').insert({
        member_id: memberId,
        from_branch_id: currentBranchId,
        to_branch_id: selectedBranch,
        requested_by: user.id,
        reason: reason.trim(),
        notes: notes.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Transfer Requested',
        description: 'Member transfer request has been submitted for approval',
      });

      onOpenChange(false);
      onTransferRequested?.();
    } catch (error: any) {
      console.error('Error requesting transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to request transfer',
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
          <DialogTitle>Transfer Member</DialogTitle>
          <DialogDescription>Request to transfer {memberName} to another branch</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Branch</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="font-medium">{currentBranchName}</span>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
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
              placeholder="Explain why this member is being transferred..."
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
