import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMembers = (branchId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['members', branchId],
    queryFn: async () => {
      let query = supabase.from('members').select('*');
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMember = useMutation({
    mutationFn: async (memberData: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('admin-create-member', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        },
        body: {
          action: 'insert',
          data: memberData
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member added successfully',
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

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member updated successfully',
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

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
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
    members,
    isLoading,
    error,
    createMember: createMember.mutate,
    updateMember: updateMember.mutate,
    deleteMember: deleteMember.mutate,
  };
};
