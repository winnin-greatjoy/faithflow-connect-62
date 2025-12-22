import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ArrowRightLeft, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface TransferRecord {
  id: string;
  from_branch: { name: string } | null;
  to_branch: { name: string } | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  notes: string | null;
  created_at: string;
  requested_at: string;
  processed_at: string | null;
}

export const MemberTransfersPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('member_transfers')
        .select(
          `
          id,
          status,
          reason,
          notes,
          created_at,
          requested_at,
          processed_at,
          from_branch:from_branch_id(name),
          to_branch:to_branch_id(name)
        `
        )
        .eq('member_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Need to cast the data since Supabase types inference might not be perfect with nested joins aliases
      setTransfers(data as unknown as TransferRecord[]);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/portal/profile')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">My Transfer Requests</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your branch transfer requests
          </p>
        </div>
        <Button onClick={() => navigate('/portal/profile')} variant="outline">
          New Request
        </Button>
      </div>

      <div className="space-y-4">
        {transfers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Transfer History</h3>
              <p className="text-muted-foreground max-w-sm mt-1 mb-4">
                You haven't submitted any transfer requests yet.
              </p>
              <Button onClick={() => navigate('/portal/profile')}>Request Transfer</Button>
            </CardContent>
          </Card>
        ) : (
          transfers.map((transfer) => (
            <Card key={transfer.id} className="overflow-hidden transition-all hover:shadow-md">
              <div
                className={`h-1.5 w-full ${
                  transfer.status === 'approved'
                    ? 'bg-green-500'
                    : transfer.status === 'rejected'
                      ? 'bg-red-500'
                      : transfer.status === 'pending'
                        ? 'bg-yellow-500'
                        : 'bg-gray-300'
                }`}
              />
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Transfer to {transfer.to_branch?.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Requested on{' '}
                      {format(
                        new Date(transfer.created_at || transfer.requested_at),
                        'MMM d, yyyy h:mm a'
                      )}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(transfer.status)} px-3 py-1 capitalize`}
                  >
                    {transfer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" /> Route
                    </h4>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          From
                        </p>
                        <p className="font-medium">{transfer.from_branch?.name}</p>
                      </div>
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">To</p>
                        <p className="font-medium">{transfer.to_branch?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {transfer.notes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Your Notes</p>
                        <p className="text-sm border-l-2 pl-3 py-1 border-muted-foreground/20 italic">
                          "{transfer.notes}"
                        </p>
                      </div>
                    )}

                    {transfer.status === 'rejected' && transfer.reason && (
                      <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-100 dark:border-red-900/30">
                        <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">
                          Rejection Reason
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">{transfer.reason}</p>
                      </div>
                    )}

                    {transfer.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Processed on {format(new Date(transfer.processed_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
