import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('first_timers')
        .insert([firstTimerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['first_timers'] });
      toast({
        title: 'Success',
        description: 'First timer added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateFirstTimer = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('first_timers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['first_timers'] });
      toast({
        title: 'Success',
        description: 'First timer updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFirstTimer = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from('first_timers').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['first_timers'] });
      toast({
        title: 'Success',
        description: 'First timer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
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
    createFirstTimer: createFirstTimer.mutate,
    updateFirstTimer: updateFirstTimer.mutate,
    deleteFirstTimer: deleteFirstTimer.mutate,
  };
};
