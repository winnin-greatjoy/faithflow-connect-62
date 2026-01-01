// src/modules/bible-school/hooks/useCohorts.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BibleCohort } from '../types';

interface UseCohortsOptions {
  programId?: string;
  branchId?: string;
  status?: string;
}

export function useCohorts(options: UseCohortsOptions = {}) {
  const [cohorts, setCohorts] = useState<BibleCohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('bible_cohorts').select('*');

      if (options.programId) {
        query = query.eq('program_id', options.programId);
      }
      if (options.branchId) {
        query = query.eq('branch_id', options.branchId);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error: fetchError } = await query.order('start_date', { ascending: false });

      if (fetchError) throw fetchError;
      setCohorts((data || []) as unknown as BibleCohort[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cohorts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, [options.programId, options.branchId, options.status]);

  return {
    cohorts,
    loading,
    error,
    reload: fetchCohorts,
  };
}
