import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  CreateRequest,
  UpdateRequest,
  ChoirMember,
  ChoirPerformance,
  ChoirRepertoire,
  DepartmentStats,
} from '@/types/api';

// Choir Department API Service
export class ChoirApiService extends BaseApiService {
  constructor() {
    super('choir_members'); // This would be a custom table or view
  }

  // Get choir members with detailed information
  async getChoirMembers(request?: ListRequest): Promise<ApiResult<ChoirMember[]>> {
    try {
      // Since we don't have a specific choir_members table in the schema,
      // we'll get members assigned to the choir department
      let query = supabase
        .from('department_assignments')
        .select(`
          *,
          member:members!department_assignments_member_id_fkey(
            id,
            full_name,
            email,
            phone,
            date_joined,
            status
          )
        `)
        .eq('department_id', 'choir-department-id'); // This would be the actual department ID

      // Apply filters
      if (request?.filters?.search) {
        query = query.or(`member.full_name.ilike.%${request.filters.search}%,member.email.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      // Apply sorting
      if (request?.sort) {
        query = query.order(request.sort.field, { ascending: request.sort.direction === 'asc' });
      } else {
        query = query.order('assigned_date', { ascending: false });
      }

      // Apply pagination
      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message, code: error.code } };
      }

      // Transform the data to match ChoirMember interface
      const choirMembers: ChoirMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        // Add choir-specific fields (these would come from extended schema or computed)
        voice_part: 'soprano', // This would be stored in extended member profile
        years_experience: 3, // This would be computed or stored separately
        attendance_rate: 85, // This would be computed from attendance records
      }));

      return { data: choirMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, code: 'UNKNOWN_ERROR' } };
    }
  }

  // Get choir statistics
  async getChoirStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts
      const { data: totalMembers, error: membersError } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'choir-department-id')
        .eq('status', 'approved');

      if (membersError) {
        return { data: null, error: { message: membersError.message } };
      }

      const { data: activeMembers, error: activeError } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'choir-department-id')
        .eq('status', 'approved')
        .eq('member.status', 'active');

      if (activeError) {
        return { data: null, error: { message: activeError.message } };
      }

      // Get upcoming events count (placeholder - would use actual events table)
      const upcomingEvents = 5;

      // Get completed activities count (placeholder - would use actual activities table)
      const completedActivities = 25;

      // Calculate monthly growth (placeholder)
      const monthlyGrowth = 8;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents,
        completedActivities,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Add choir member
  async addChoirMember(memberData: {
    member_id: string;
    voice_part: 'soprano' | 'alto' | 'tenor' | 'bass';
    years_experience: number;
    notes?: string;
  }): Promise<ApiResult<ChoirMember>> {
    try {
      // First, create department assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('department_assignments')
        .insert({
          member_id: memberData.member_id,
          department_id: 'choir-department-id',
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_date: new Date().toISOString(),
          status: 'approved',
          type: 'assignment',
          reason: 'Choir member registration',
        })
        .select()
        .single();

      if (assignmentError) {
        return { data: null, error: { message: assignmentError.message } };
      }

      // Update member profile with choir-specific information
      const { data: member, error: memberError } = await supabase
        .from('members')
        .update({
          assigned_department: 'choir',
          // Note: voice_part and years_experience would be stored in a separate profile extension
        })
        .eq('id', memberData.member_id)
        .select()
        .single();

      if (memberError) {
        return { data: null, error: { message: memberError.message } };
      }

      const choirMember: ChoirMember = {
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member,
        voice_part: memberData.voice_part,
        years_experience: memberData.years_experience,
        attendance_rate: 0, // New member starts with 0
      };

      return { data: choirMember, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update choir member details
  async updateChoirMember(
    memberId: string,
    updates: {
      voice_part?: 'soprano' | 'alto' | 'tenor' | 'bass';
      years_experience?: number;
      status?: string;
      notes?: string;
    }
  ): Promise<ApiResult<ChoirMember>> {
    try {
      // Update department assignment status if provided
      if (updates.status) {
        await supabase
          .from('department_assignments')
          .update({ status: updates.status })
          .eq('id', memberId);
      }

      // Get updated member data
      const { data, error } = await this.getChoirMemberById(memberId);

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get specific choir member by ID
  async getChoirMemberById(memberId: string): Promise<ApiResult<ChoirMember>> {
    try {
      const { data, error } = await supabase
        .from('department_assignments')
        .select(`
          *,
          member:members!department_assignments_member_id_fkey(*)
        `)
        .eq('id', memberId)
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const choirMember: ChoirMember = {
        id: data.id,
        member_id: data.member_id,
        department_id: data.department_id,
        assigned_date: data.assigned_date,
        status: data.status,
        member: data.member,
        voice_part: 'soprano', // Would come from extended profile
        years_experience: 3, // Would come from extended profile
        attendance_rate: 85, // Would be calculated from attendance records
      };

      return { data: choirMember, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Remove choir member
  async removeChoirMember(memberId: string): Promise<ApiResult<void>> {
    try {
      const { error } = await supabase
        .from('department_assignments')
        .update({
          status: 'rejected',
          reason: 'Member removed from choir'
        })
        .eq('id', memberId);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get choir performance history
  async getPerformanceHistory(memberId?: string): Promise<ApiResult<ChoirPerformance[]>> {
    try {
      // This would query a performances table
      // For now, return mock data structure
      const performances: ChoirPerformance[] = [
        {
          id: '1',
          title: 'Sunday Service',
          date: '2024-01-28',
          type: 'service',
          songs: ['Amazing Grace', 'How Great Thou Art'],
          attendance: 22,
          notes: 'Great performance',
        },
        {
          id: '2',
          title: 'Christmas Concert',
          date: '2024-01-25',
          type: 'concert',
          songs: ['Silent Night', 'Joy to the World'],
          attendance: 45,
          notes: 'Excellent audience response',
        },
      ];

      return { data: performances, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get choir repertoire
  async getRepertoire(): Promise<ApiResult<ChoirRepertoire[]>> {
    try {
      // This would query a repertoire table
      // For now, return mock data structure
      const repertoire: ChoirRepertoire[] = [
        {
          id: '1',
          title: 'Amazing Grace',
          composer: 'Traditional',
          category: 'hymn',
          difficulty: 'easy',
          key_signature: 'G Major',
          performance_count: 15,
          last_performed: '2024-01-21',
        },
        {
          id: '2',
          title: 'How Great Thou Art',
          composer: 'Stuart K. Hine',
          category: 'gospel',
          difficulty: 'medium',
          key_signature: 'A Major',
          performance_count: 12,
          last_performed: '2024-01-14',
        },
      ];

      return { data: repertoire, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record attendance for a performance
  async recordAttendance(
    performanceId: string,
    memberId: string,
    status: 'present' | 'absent' | 'late'
  ): Promise<ApiResult<void>> {
    try {
      // This would insert into an attendance table
      // For now, return success
      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance
export const choirApi = new ChoirApiService();
