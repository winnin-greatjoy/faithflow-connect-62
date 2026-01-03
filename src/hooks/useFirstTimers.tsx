import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  createFirstTimer as apiCreateFirstTimer,
  updateFirstTimer as apiUpdateFirstTimer,
  deleteFirstTimer as apiDeleteFirstTimer,
} from '@/utils/memberOperations';

export const useFirstTimers = (branchId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: firstTimers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['first_timers', branchId],
    queryFn: async () => {
      let query = supabase.from('first_timers').select('*');

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map snake_case to camelCase to match FirstTimer type
      return (data || []).map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        community: row.community || '',
        area: row.area || '',
        street: row.street || '',
        publicLandmark: row.public_landmark || '',
        phone: row.phone || '',
        email: row.email || '',
        serviceDate: row.service_date || new Date().toISOString(),
        invitedBy: row.invited_by || '',
        followUpStatus: row.follow_up_status || 'pending',
        branchId: row.branch_id,
        firstVisit: row.first_visit || row.service_date || new Date().toISOString(),
        visitDate: row.service_date || new Date().toISOString(),
        status: row.status || 'new',
        followUpNotes: row.follow_up_notes || '',
        notes: row.notes || '',
        createdAt: row.created_at || new Date().toISOString(),
      }));
    },
  });

  const createFirstTimer = useMutation({
    mutationFn: async (firstTimerData: any) => {
      const result = await apiCreateFirstTimer(firstTimerData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['first_timers'] });
      toast({
        title: 'Encounter Recorded',
        description: 'The visitor has been captured in the orchestration matrix.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Orchestration Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateFirstTimer = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const result = await apiUpdateFirstTimer(id, updates);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['first_timers'] });
      toast({
        title: 'Prospect Synchronized',
        description: 'Visitor intelligence has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failure',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFirstTimer = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const result = await apiDeleteFirstTimer(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['first_timers'] });
      toast({
        title: 'Record Purged',
        description: 'The first-timer entry has been removed from the system.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    firstTimers,
    isLoading,
    loading: isLoading,
    error,
    createFirstTimer: (data: any) => createFirstTimer.mutateAsync(data),
    updateFirstTimer: (data: any) => updateFirstTimer.mutateAsync(data),
    deleteFirstTimer: (data: { id: string }) => deleteFirstTimer.mutateAsync(data),
  };
};
