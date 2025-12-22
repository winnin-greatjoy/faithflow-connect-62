import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  Building2,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAdminContext } from '@/context/AdminContext';

interface TransferRequest {
  id: string;
  member_id: string;
  from_branch_id: string;
  to_branch_id: string;
  requested_by: string;
  requested_at: string;
  processed_by: string | null;
  processor?: {
    first_name: string;
    last_name: string;
  } | null;
  processed_at: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  notes: string | null;
  member: {
    full_name: string;
    email: string | null;
    phone: string;
  };
  from_branch: {
    name: string;
  };
  to_branch: {
    name: string;
  };
  requester?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const TransferApprovalQueue: React.FC = () => {
  const { toast } = useToast();
  const { selectedBranchId } = useAdminContext();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadTransfers();

    // Set up realtime subscription
    const channel = supabase
      .channel('member-transfers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_transfers',
        },
        () => {
          loadTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('member_transfers')
        .select(
          `
          *,
          member:member_id (full_name, email, phone),
          from_branch:from_branch_id (name),
          to_branch:to_branch_id (name)
        `
        )
        .order('requested_at', { ascending: false });

      if (selectedBranchId) {
        query = query.eq('to_branch_id', selectedBranchId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transfersData = (data as any) || [];

      // Collect profile ids from requested_by and processed_by
      const profileIds = new Set<string>();
      transfersData.forEach((t: any) => {
        if (t.requested_by) profileIds.add(t.requested_by);
        if (t.processed_by) profileIds.add(t.processed_by);
      });

      let profilesMap: Record<string, { first_name?: string; last_name?: string }> = {};
      if (profileIds.size > 0) {
        const ids = Array.from(profileIds);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', ids);

        if (!profilesError && profiles) {
          profilesMap = (profiles as any).reduce(
            (acc: any, p: any) => {
              acc[p.id] = { first_name: p.first_name, last_name: p.last_name };
              return acc;
            },
            {} as Record<string, { first_name?: string; last_name?: string }>
          );
        }
      }

      const enriched = transfersData.map((t: any) => ({
        ...t,
        requester: profilesMap[t.requested_by] || null,
        processor: profilesMap[t.processed_by] || null,
      }));

      setTransfers(enriched as TransferRequest[]);
    } catch (error) {
      console.error('Error loading transfers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transfer requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transfer: TransferRequest) => {
    try {
      setProcessing(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('approve_member_transfer', {
        transfer_id: transfer.id,
        approver_id: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Transfer Approved',
        description: `${transfer.member.full_name} has been transferred to ${transfer.to_branch.name}`,
      });

      loadTransfers();
    } catch (error: any) {
      console.error('Error approving transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve transfer',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer) return;

    try {
      setProcessing(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('reject_member_transfer', {
        transfer_id: selectedTransfer.id,
        rejector_id: user.id,
        rejection_notes: rejectionNotes.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'Transfer Rejected',
        description: 'The transfer request has been rejected',
      });

      setShowRejectDialog(false);
      setSelectedTransfer(null);
      setRejectionNotes('');
      loadTransfers();
    } catch (error: any) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject transfer',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (transfer: TransferRequest) => {
    setSelectedTransfer(transfer);
    setRejectionNotes('');
    setShowRejectDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingTransfers = transfers.filter((t) => t.status === 'pending');
  const approvedTransfers = transfers.filter((t) => t.status === 'approved');
  const rejectedTransfers = transfers.filter((t) => t.status === 'rejected');

  const renderTransferCard = (transfer: TransferRequest, showActions: boolean = false) => (
    <Card key={transfer.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{transfer.member.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                {transfer.member.email || transfer.member.phone}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(transfer.status)}>{transfer.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-medium">{transfer.from_branch.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-medium">{transfer.to_branch.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-muted-foreground">{transfer.reason}</p>
            </div>
          </div>

          {transfer.notes && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Notes:</p>
                <p className="text-sm text-muted-foreground">{transfer.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>
              Requested by {transfer.requester.first_name} {transfer.requester.last_name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(transfer.requested_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>

        {showActions && transfer.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => handleApprove(transfer)}
              disabled={processing}
              className="flex-1"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Approve Transfer
            </Button>
            <Button
              variant="outline"
              onClick={() => openRejectDialog(transfer)}
              disabled={processing}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {transfer.status !== 'pending' && transfer.processed_at && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p>
              {transfer.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
              {format(new Date(transfer.processed_at), 'MMM d, yyyy h:mm a')}
              {transfer.processor && (
                <span className="ml-2 text-sm text-muted-foreground">
                  by {transfer.processor.first_name} {transfer.processor.last_name}
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Member Transfers</h1>
          <p className="text-muted-foreground mt-1">
            Manage member transfer requests between branches
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingTransfers.length > 0 && (
                <Badge variant="secondary">{pendingTransfers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved
              {approvedTransfers.length > 0 && (
                <Badge variant="secondary">{approvedTransfers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
              {rejectedTransfers.length > 0 && (
                <Badge variant="secondary">{rejectedTransfers.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ) : pendingTransfers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Transfers</h3>
                  <p className="text-muted-foreground">
                    There are no transfer requests awaiting approval
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingTransfers.map((transfer) => renderTransferCard(transfer, true))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ) : approvedTransfers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Approved Transfers</h3>
                  <p className="text-muted-foreground">Approved transfers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              approvedTransfers.map((transfer) => renderTransferCard(transfer, false))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ) : rejectedTransfers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Rejected Transfers</h3>
                  <p className="text-muted-foreground">Rejected transfers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              rejectedTransfers.map((transfer) => renderTransferCard(transfer, false))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transfer request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-notes">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejection-notes"
                placeholder="Explain why this transfer is being rejected..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
