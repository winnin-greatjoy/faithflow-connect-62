import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBranches = () => {
  const { data: branches = [], isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('church_branches')
        .select('*')
        .order('is_main', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return {
    branches,
    isLoading,
    error,
  };
};
