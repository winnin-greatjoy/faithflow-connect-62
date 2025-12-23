import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import eventsApi from '@/services/eventsApi';
import { Loader2, Plus, Trash2, Building, Network } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventQuotasDialogProps {
  eventId: string;
  eventTitle: string;
  isOpen?: boolean;
  onClose: () => void;
}

export const EventQuotasDialog: React.FC<EventQuotasDialogProps> = ({
  eventId,
  eventTitle,
  isOpen = true,
  onClose,
}) => {
  const [quotas, setQuotas] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state for new quota
  const [targetType, setTargetType] = useState<'district' | 'branch'>('district');
  const [targetId, setTargetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quotasRes, districtsRes, branchesRes] = await Promise.all([
        eventsApi.getEventQuotas(eventId),
        supabase.from('districts').select('id, name').order('name'),
        supabase.from('church_branches').select('id, name').order('name'),
      ]);

      if (quotasRes.error) throw quotasRes.error;
      setQuotas(quotasRes.data || []);
      setDistricts(districtsRes.data || []);
      setBranches(branchesRes.data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load quotas data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !amount) {
      toast({ title: 'Error', description: 'Please select a target and amount' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        event_id: eventId,
        district_id: targetType === 'district' ? targetId : null,
        branch_id: targetType === 'branch' ? targetId : null,
        target_amount: parseFloat(amount),
        notes: notes,
      };

      const { error } = await eventsApi.upsertEventQuota(payload);
      if (error) throw error;

      toast({ title: 'Success', description: 'Quota added/updated' });
      setAmount('');
      setNotes('');
      setTargetId('');
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save quota',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuota = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quota?')) return;

    try {
      const { error } = await eventsApi.deleteEventQuota(id);
      if (error) throw error;
      toast({ title: 'Deleted' });
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete quota',
        variant: 'destructive',
      });
    }
  };

  const getTargetName = (quota: any) => {
    if (quota.district_id) {
      return districts.find((d) => d.id === quota.district_id)?.name || 'Unknown District';
    }
    return branches.find((b) => b.id === quota.branch_id)?.name || 'Unknown Branch';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Event Quotas - {eventTitle}</DialogTitle>
          <DialogDescription>
            Set financial contribution targets for districts and branches.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 flex-1 overflow-hidden">
          {/* Quota List */}
          <div className="md:col-span-2 space-y-4 flex flex-col overflow-hidden">
            <Label className="text-sm font-semibold">Current Quotas</Label>
            <ScrollArea className="flex-1 border rounded-md p-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : quotas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic">
                  No quotas set for this event.
                </div>
              ) : (
                <div className="space-y-3">
                  {quotas.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {q.district_id ? (
                            <Network className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Building className="h-3 w-3 text-green-500" />
                          )}
                          <span className="font-medium text-sm">{getTargetName(q)}</span>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {q.district_id ? 'District' : 'Branch'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Target:{' '}
                          <span className="text-foreground font-semibold">
                            GHS {q.target_amount.toFixed(2)}
                          </span>
                          {q.collected_amount > 0 && (
                            <span className="ml-2">
                              Collected:{' '}
                              <span className="text-green-600 font-semibold">
                                GHS {q.collected_amount.toFixed(2)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteQuota(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Add Form */}
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <h4 className="font-semibold text-sm mb-4">Add Target</h4>
              <form onSubmit={handleAddQuota} className="space-y-4">
                <div>
                  <Label>Target Type</Label>
                  <Select
                    value={targetType}
                    onValueChange={(v: any) => {
                      setTargetType(v);
                      setTargetId('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{targetType === 'district' ? 'District' : 'Branch'}</Label>
                  <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${targetType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(targetType === 'district' ? districts : branches).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Amount (GHS)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Special allocation"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? 'Saving...' : 'Add Quota'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
