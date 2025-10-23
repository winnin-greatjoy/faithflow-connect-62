import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFirstTimers = (branchId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: firstTimers = [], isLoading, error } = useQuery({
    queryKey: ['first_timers', branchId],
    queryFn: async () => {
      let query = supabase.from('first_timers').select('*');
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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

  return {
    firstTimers,
    isLoading,
    error,
    createFirstTimer: createFirstTimer.mutate,
    updateFirstTimer: updateFirstTimer.mutate,
  };
};
