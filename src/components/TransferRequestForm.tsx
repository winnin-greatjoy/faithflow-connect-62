import React, { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthz } from '@/hooks/useAuthz';
import { useBranches } from '@/hooks/useBranches';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

type Branch = {
  id: string;
  name: string;
};

export interface TransferRequestFormProps {
  currentBranchId?: string | null;
  onSubmitted?: () => void;
}

export const TransferRequestForm: React.FC<TransferRequestFormProps> = ({
  currentBranchId,
  onSubmitted,
}) => {
  const { toast } = useToast();
  const { branchId: authBranchId } = useAuthz();
  const { branches, isLoading: branchesLoading } = useBranches();

  const resolvedCurrentBranchId = currentBranchId ?? authBranchId;

  const availableBranches = useMemo(() => {
    const items = (branches || []) as Branch[];
    if (!resolvedCurrentBranchId) return items;
    return items.filter((b) => b.id !== resolvedCurrentBranchId);
  }, [branches, resolvedCurrentBranchId]);

  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(targetBranchId) && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!targetBranchId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a target branch.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        toast({
          title: 'Not signed in',
          description: 'Please sign in to submit a transfer request.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await (supabase as any).rpc('submit_transfer_request', {
        target_branch_id: targetBranchId,
        notes: notes.trim() ? notes.trim() : null,
      });

      if (error) throw error;

      toast({
        title: 'Transfer request submitted',
        description: 'Your request has been sent for review.',
      });

      setTargetBranchId('');
      setNotes('');
      onSubmitted?.();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to submit transfer request.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Transfer</CardTitle>
        <CardDescription>Request a transfer to another branch.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="target-branch">Target Branch</Label>
            <Select
              value={targetBranchId}
              onValueChange={setTargetBranchId}
              disabled={branchesLoading}
            >
              <SelectTrigger id="target-branch">
                <SelectValue
                  placeholder={branchesLoading ? 'Loading branches...' : 'Select a branch'}
                />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!branchesLoading && availableBranches.length === 0 && (
              <p className="text-sm text-muted-foreground">No other branches available.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-notes">Notes (Optional)</Label>
            <Textarea
              id="transfer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the admins reviewing your request..."
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
