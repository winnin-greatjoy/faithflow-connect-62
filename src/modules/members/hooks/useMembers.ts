// src/modules/members/hooks/useMembers.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Member } from '@/types/membership';
import type { MemberFilters } from '../types';

export interface UseMembersResult {
    members: Member[];
    loading: boolean;
    error: Error | null;
    reload: () => Promise<void>;
}

/**
 * Hook for fetching and managing member data
 * Automatically refetches when filters change
 */
export function useMembers(filters?: Partial<MemberFilters>): UseMembersResult {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('members')
                .select(
                    'id, full_name, phone, email, branch_id, membership_level, baptized_sub_level, status, last_attendance, date_joined, created_at, updated_at'
                );

            // Apply branch filter if provided
            if (filters?.branchFilter && filters.branchFilter !== 'all') {
                query = query.eq('branch_id', filters.branchFilter);
            }

            // Apply search filter
            if (filters?.search) {
                query = query.ilike('full_name', `%${filters.search}%`);
            }

            // Order by name
            query = query.order('full_name');

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Map database response to Member type
            const mappedMembers: Member[] = (data || []).map((row: any) => {
                const baptizedSubLevel = row.membership_level === 'baptized'
                    ? (row.baptized_sub_level as any)
                    : null;
                const membershipLevel = row.membership_level as any;

                return {
                    id: row.id,
                    fullName: row.full_name,
                    profilePhoto: '',
                    dateOfBirth: '2000-01-01', // Default value
                    gender: 'male',
                    maritalStatus: 'single',
                    spouseName: '',
                    numberOfChildren: 0,
                    children: [],
                    email: row.email || '',
                    phone: row.phone,
                    community: '',
                    area: '',
                    street: '',
                    publicLandmark: '',
                    branchId: row.branch_id,
                    dateJoined: row.date_joined || '',
                    membershipLevel,
                    baptizedSubLevel,
                    leaderRole: undefined,
                    baptismDate: '',
                    joinDate: row.date_joined || '',
                    lastVisit: row.updated_at || row.last_attendance || '',
                    progress: 0,
                    baptismOfficiator: '',
                    spiritualMentor: '',
                    discipleshipClass1: false,
                    discipleshipClass2: false,
                    discipleshipClass3: false,
                    assignedDepartment: '',
                    status: (row.status as any) || 'active',
                    ministry: '',
                    prayerNeeds: '',
                    pastoralNotes: '',
                    lastAttendance: row.last_attendance || '',
                    createdAt: row.created_at || '',
                    updatedAt: row.updated_at || '',
                } as Member;
            });

            setMembers(mappedMembers);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [filters?.branchFilter, filters?.search]);

    // Initial fetch
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        loading,
        error,
        reload: fetchMembers,
    };
}
