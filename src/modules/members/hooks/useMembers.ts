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
                .select('*');  // Fetch all fields

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

            // Map database response to Member type (snake_case to camelCase)
            const mappedMembers: Member[] = (data || []).map((row: any) => {
                return {
                    id: row.id,
                    fullName: row.full_name,
                    profilePhoto: row.profile_photo || '',
                    dateOfBirth: row.date_of_birth || '',
                    gender: row.gender || 'male',
                    maritalStatus: row.marital_status || 'single',
                    spouseName: row.spouse_name || '',
                    numberOfChildren: row.number_of_children || 0,
                    children: [],  // Children are fetched separately if needed
                    email: row.email || '',
                    phone: row.phone || '',
                    community: row.community || '',
                    area: row.area || '',
                    street: row.street || '',
                    publicLandmark: row.public_landmark || '',
                    branchId: row.branch_id,
                    dateJoined: row.date_joined || '',
                    membershipLevel: row.membership_level || 'visitor',
                    baptizedSubLevel: row.baptized_sub_level || undefined,
                    leaderRole: row.leader_role || undefined,
                    baptismDate: row.baptism_date || '',
                    joinDate: row.date_joined || '',
                    lastVisit: row.updated_at || row.last_attendance || '',
                    progress: 0,
                    baptismOfficiator: row.baptism_officiator || '',
                    spiritualMentor: row.spiritual_mentor || '',
                    discipleshipClass1: row.discipleship_class_1 || false,
                    discipleshipClass2: row.discipleship_class_2 || false,
                    discipleshipClass3: row.discipleship_class_3 || false,
                    assignedDepartment: row.assigned_department || '',
                    status: row.status || 'active',
                    ministry: row.ministry || '',
                    prayerNeeds: row.prayer_needs || '',
                    pastoralNotes: row.pastoral_notes || '',
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
