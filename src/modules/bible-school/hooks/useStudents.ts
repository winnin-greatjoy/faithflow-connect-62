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
            let query: any = supabase.from('bible_student_progress').select('*');

            if (options.cohortId) {
                query = query.eq('cohort_id', options.cohortId);
            }
            if (options.programId) {
                query = query.eq('current_program_id', options.programId);
            }
            if (options.status) {
                query = query.eq('status', options.status);
            }

            const { data, error: fetchError } = await query.order('member_name');

            if (fetchError) throw fetchError;
            
            // Map view columns to StudentProgress interface
            const mappedData: StudentProgress[] = ((data || []) as any[]).map((row) => ({
                student_id: row.student_id,
                member_id: row.member_id,
                student_name: row.member_name || '',
                current_program: row.current_program || null,
                level_order: row.level_order || null,
                cohort_name: row.cohort_name || null,
                start_date: row.start_date || null,
                end_date: row.end_date || null,
                highest_completed_level: row.highest_completed_level || 0,
                status: row.status || 'enrolled',
                attendance_percentage: row.attendance_percentage || 0,
                exam_average: row.exam_average || 0,
            }));
            
            setStudents(mappedData);
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
