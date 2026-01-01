// src/modules/bible-school/hooks/usePrograms.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BibleProgram } from '../types';

export function usePrograms() {
  const [programs, setPrograms] = useState<BibleProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('bible_programs')
        .select('*')
        .eq('is_active', true)
        .order('level_order');

      if (fetchError) throw fetchError;
      setPrograms((data || []) as unknown as BibleProgram[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching programs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return {
    programs,
    loading,
    error,
    reload: fetchPrograms,
  };
}
