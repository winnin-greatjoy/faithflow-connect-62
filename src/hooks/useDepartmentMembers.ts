// src/hooks/useDepartmentMembers.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DepartmentMember {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    assignedDate: string;
    status: string;
}

export function useDepartmentMembers(departmentId?: string) {
    const [members, setMembers] = useState<DepartmentMember[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchMembers = async () => {
        if (!departmentId) {
            setMembers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('department_assignments')
                .select(`
          id,
          assigned_date,
          status,
          type,
          member_id,
          members (
            full_name,
            email,
            phone
          )
        `)
                .eq('department_id', departmentId)
                .eq('status', 'approved');

            if (error) throw error;

            const formattedMembers: DepartmentMember[] = (data || []).map((assignment: any) => ({
                id: assignment.member_id,
                name: assignment.members?.full_name || 'Unknown',
                email: assignment.members?.email || null,
                phone: assignment.members?.phone || null,
                role: assignment.type === 'leadership' ? 'Leader' : 'Member',
                assignedDate: assignment.assigned_date,
                status: assignment.status,
            }));

            setMembers(formattedMembers);
        } catch (error: any) {
            console.error('Error fetching department members:', error);
            toast({
                title: 'Error',
                description: 'Failed to load department members',
                variant: 'destructive',
            });
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId]);

    return {
        members,
        loading,
        reload: fetchMembers,
    };
}
