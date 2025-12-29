// src/modules/members/hooks/useFirstTimers.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FirstTimer } from '@/types/membership';
import type { MemberFilters } from '../types';

export interface UseFirstTimersResult {
    firstTimers: FirstTimer[];
    loading: boolean;
    error: Error | null;
    reload: () => Promise<void>;
}

/**
 * Hook for fetching and managing first-timer data
 * Automatically refetches when filters change
 */
export function useFirstTimers(filters?: Partial<MemberFilters>): UseFirstTimersResult {
    const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchFirstTimers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('first_timers')
                .select(
                    'id, full_name, phone, email, branch_id, service_date, follow_up_status, status, first_visit, community, area, street, public_landmark, invited_by, follow_up_notes, notes, created_at'
                );

            // Apply branch filter if provided
            if (filters?.branchFilter && filters.branchFilter !== 'all') {
                query = query.eq('branch_id', filters.branchFilter);
            }

            // Apply search filter
            if (filters?.search) {
                query = query.ilike('full_name', `%${filters.search}%`);
            }

            // Order by most recent
            query = query.order('created_at', { ascending: false });

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Map database response to FirstTimer type
            const mappedFirstTimers: FirstTimer[] = (data || []).map((row: any) => ({
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
                followUpStatus: (row.follow_up_status as any) || 'pending',
                branchId: row.branch_id,
                firstVisit: row.first_visit || row.service_date || new Date().toISOString(),
                visitDate: row.service_date || new Date().toISOString(),
                status: (row.status as any) || 'new',
                followUpNotes: row.follow_up_notes || '',
                notes: row.notes || '',
                createdAt: row.created_at || new Date().toISOString(),
            } as FirstTimer));

            setFirstTimers(mappedFirstTimers);
        } catch (err) {
            console.error('Error fetching first timers:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [filters?.branchFilter, filters?.search]);

    // Initial fetch
    useEffect(() => {
        fetchFirstTimers();
    }, [fetchFirstTimers]);

    return {
        firstTimers,
        loading,
        error,
        reload: fetchFirstTimers,
    };
}
