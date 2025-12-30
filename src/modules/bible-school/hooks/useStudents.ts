// src/modules/bible-school/hooks/useStudents.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { StudentProgress } from '../types';

interface UseStudentsOptions {
    cohortId?: string;
    programId?: string;
    status?: string;
}

export function useStudents(options: UseStudentsOptions = {}) {
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            let query = supabase.from('bible_student_progress').select('*');

            if (options.cohortId) {
                query = query.eq('cohort_id', options.cohortId);
            }
            if (options.programId) {
                query = query.eq('current_program_id', options.programId);
            }
            if (options.status) {
                query = query.eq('status', options.status);
            }

            const { data, error: fetchError } = await query.order('student_name');

            if (fetchError) throw fetchError;
            setStudents(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching students:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [options.cohortId, options.programId, options.status]);

    return {
        students,
        loading,
        error,
        reload: fetchStudents,
    };
}
