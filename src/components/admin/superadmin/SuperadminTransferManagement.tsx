import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRightLeft,
  Check,
  X,
  Clock,
  Filter,
  Search,
  Building,
  User,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface TransferRequest {
  id: string;
  member_id: string;
  from_branch_id: string;
  to_branch_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string | null;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface Member {
  id: string;
  full_name: string;
  branch_id: string;
}

/**
 * Superadmin Transfer Management
 * Enhanced transfer system with full superadmin control
 */
export const SuperadminTransferManagement: React.FC = () => {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInitiateOpen, setIsInitiateOpen] = useState(false);

  // Initiate transfer form
  const [newTransfer, setNewTransfer] = useState({
    memberId: '',
    fromBranchId: '',
    toBranchId: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTransfers(), fetchBranches(), fetchMembers()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async () => {
    try {
      // Note: This is mock data structure - adjust based on your actual schema
      const { data, error } = await supabase
        .from('member_transfers')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching transfers:', error);
        // Set mock data for demonstration
        setTransfers([]);
        return;
      }

      setTransfers((data as any) || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('church_branches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, branch_id')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('member_transfers').insert([
        {
          member_id: newTransfer.memberId,
          from_branch_id: newTransfer.fromBranchId,
          to_branch_id: newTransfer.toBranchId,
          reason: newTransfer.reason,
          status: 'approved', // Superadmin can directly approve
          requested_by: user.id,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Update member's branch
      await supabase
        .from('members')
        .update({ branch_id: newTransfer.toBranchId })
        .eq('id', newTransfer.memberId);

      toast({
        title: 'Success',
        description: 'Member transferred successfully',
      });

      setIsInitiateOpen(false);
      setNewTransfer({ memberId: '', fromBranchId: '', toBranchId: '', reason: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error initiating transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate transfer',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (transferId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const transfer = transfers.find((t) => t.id === transferId);
      if (!transfer) return;

      // Update transfer status
      await supabase
        .from('member_transfers')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', transferId);

      // Update member's branch
      await supabase
        .from('members')
        .update({ branch_id: transfer.to_branch_id })
        .eq('id', transfer.member_id);

      toast({
        title: 'Success',
        description: 'Transfer approved and completed',
      });

      fetchData();
    } catch (error: any) {
      console.error('Error approving transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve transfer',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (transferId: string, notes: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('member_transfers')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes,
        })
        .eq('id', transferId);

      toast({
        title: 'Success',
        description: 'Transfer rejected',
      });

      fetchData();
    } catch (error: any) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject transfer',
        variant: 'destructive',
      });
    }
  };

  const filteredTransfers = transfers.filter((transfer) => {
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesSearch =
      searchTerm === '' || transfer.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: transfers.length,
    pending: transfers.filter((t) => t.status === 'pending').length,
    approved: transfers.filter((t) => t.status === 'approved').length,
    rejected: transfers.filter((t) => t.status === 'rejected').length,
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || 'Unknown';
  };

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member?.full_name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100 text-green-800', icon: Check },
      rejected: { bg: 'bg-red-100 text-red-800', icon: X },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.bg} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transfers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6" />
            Member Transfer Management
          </h2>
          <p className="text-gray-600 mt-1">Manage member transfers between branches</p>
        </div>
        <Dialog open={isInitiateOpen} onOpenChange={setIsInitiateOpen}>
          <DialogTrigger asChild>
            <Button>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Initiate Transfer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initiate Member Transfer</DialogTitle>
              <DialogDescription>
                Transfer a member between branches (auto-approved for superadmin)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInitiateTransfer} className="space-y-4">
              <div>
                <Label>Member</Label>
                <Select
                  value={newTransfer.memberId}
                  onValueChange={(value) => {
                    const member = members.find((m) => m.id === value);
                    setNewTransfer((prev) => ({
                      ...prev,
                      memberId: value,
                      fromBranchId: member?.branch_id || '',
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Branch</Label>
                  <Select value={newTransfer.fromBranchId} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-filled" />
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

                <div>
                  <Label>To Branch</Label>
                  <Select
                    value={newTransfer.toBranchId}
                    onValueChange={(value) =>
                      setNewTransfer((prev) => ({ ...prev, toBranchId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches
                        .filter((b) => b.id !== newTransfer.fromBranchId)
                        .map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Reason</Label>
                <Textarea
                  value={newTransfer.reason}
                  onChange={(e) => setNewTransfer((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for transfer..."
                  required
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsInitiateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Initiate & Approve</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {getMemberName(transfer.member_id)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {getBranchName(transfer.from_branch_id)}
                    </span>
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {getBranchName(transfer.to_branch_id)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(transfer.status)}
                  {transfer.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(transfer.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(transfer.id, '')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-gray-600">{transfer.reason}</p>
                </div>
                {transfer.notes && (
                  <div>
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-gray-600">{transfer.notes}</p>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Requested: {new Date(transfer.requested_at).toLocaleDateString()}
                  {transfer.reviewed_at && (
                    <span> • Reviewed: {new Date(transfer.reviewed_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransfers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No transfer requests at this time'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
