// src/modules/bible-school/hooks/useApplications.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BibleApplication } from '../types';

interface UseApplicationsOptions {
  status?: string;
  branchId?: string;
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const [applications, setApplications] = useState<BibleApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let query = supabase.from('bible_applications').select('*');

      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.branchId) {
        query = query.eq('branch_id', options.branchId);
      }

      const { data, error: fetchError } = await query.order('submitted_at', { ascending: false });

      if (fetchError) throw fetchError;
      setApplications((data || []) as unknown as BibleApplication[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [options.status, options.branchId]);

  return {
    applications,
    loading,
    error,
    reload: fetchApplications,
  };
}
