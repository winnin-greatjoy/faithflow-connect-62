import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  DepartmentMember,
  DepartmentStats,
} from '@/types/api';

// Choir Department API Service
export class ChoirApiService extends BaseApiService {
  constructor() {
    super('choir_members'); // Using department_assignments as base since choir_members doesn't exist yet
  }

  // Get choir members with detailed information
  async getChoirMembers(request?: ListRequest): Promise<ApiResult<DepartmentMember[]>> {
    try {
      // Get members assigned to choir department using existing tables
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
            status,
            assigned_department
          )
        `);

      // Apply filters
      if (request?.filters?.search) {
        // Note: Search filtering on joined tables is complex in PostgREST
        // For now, we'll filter after the query
        const searchTerm = request.filters.search.toLowerCase();
        query = query; // Keep the base query
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status as 'pending' | 'approved' | 'rejected');
      }

      // Apply sorting - avoid sorting on joined table fields
      if (request?.sort) {
        // For now, only sort on department_assignments fields
        if (request.sort.field.startsWith('member.')) {
          query = query.order('assigned_date', { ascending: false });
        } else {
          query = query.order(request.sort.field, { ascending: request.sort.direction === 'asc' });
        }
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
        return { data: null, error: { message: error.message } };
      }

      // Filter results to only include members assigned to choir department
      let filteredData = (data || []).filter(assignment =>
        assignment.member?.assigned_department === 'choir'
      );

      // Apply search filtering on client side
      if (request?.filters?.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredData = filteredData.filter(assignment =>
          assignment.member?.full_name?.toLowerCase().includes(searchTerm) ||
          assignment.member?.email?.toLowerCase().includes(searchTerm)
        );
      }

      // Transform the data to match DepartmentMember interface
      const choirMembers: DepartmentMember[] = filteredData.map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        // Include all required fields from DepartmentAssignmentRow
        approved_by: assignment.approved_by,
        approved_date: assignment.approved_date,
        assigned_by: assignment.assigned_by,
        created_at: assignment.created_at,
        reason: assignment.reason,
        type: assignment.type,
        updated_at: assignment.updated_at,
        // Add choir-specific fields that would be stored in extended schema
        // For now, using placeholder values
        voice_part: 'soprano' as any, // Would come from extended profile
        years_experience: 3, // Would be calculated from join date
        attendance_rate: 85, // Would be calculated from attendance records
      }));

      return { data: choirMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get choir statistics
  async getChoirStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts directly from members table using assigned_department field
      // This avoids any issues with the departments table
      const { data: totalMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'choir');

      const { data: activeMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'choir')
        .eq('status', 'active');

      // Get upcoming events count (using events table)
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .gte('event_date', new Date().toISOString().split('T')[0]);

      // Get completed events count (using events table)
      const { data: completedEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .lt('event_date', new Date().toISOString().split('T')[0]);

      // Calculate monthly growth (placeholder - would need historical data)
      const monthlyGrowth = 8;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: upcomingEvents?.length || 0,
        completedActivities: completedEvents?.length || 0,
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
    voice_part?: 'soprano' | 'alto' | 'tenor' | 'bass';
    years_experience?: number;
    notes?: string;
  }): Promise<ApiResult<DepartmentMember>> {
    try {
      // Create department assignment directly without needing departments table
      const { data: assignment, error: assignmentError } = await supabase
        .from('department_assignments')
        .insert({
          member_id: memberData.member_id,
          department_id: 'choir-dept', // Use a simple identifier since departments table may not exist
          assigned_by: (await supabase.auth.getUser()).data.user?.id || 'system',
          assigned_date: new Date().toISOString(),
          status: 'approved' as 'pending' | 'approved' | 'rejected',
          type: 'assignment' as 'assignment' | 'transfer' | 'suspension',
          reason: 'Choir member registration',
        })
        .select()
        .single();

      if (assignmentError) {
        return { data: null, error: { message: assignmentError.message } };
      }

      // Update member profile with choir assignment
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

      // Get the updated member data with department assignment
      const { data: updatedAssignment } = await supabase
        .from('department_assignments')
        .select(`
          *,
          member:members!department_assignments_member_id_fkey(*)
        `)
        .eq('id', assignment.id)
        .single();

      if (updatedAssignment) {
        return {
          data: {
            id: updatedAssignment.id,
            member_id: updatedAssignment.member_id,
            department_id: updatedAssignment.department_id,
            assigned_date: updatedAssignment.assigned_date,
            status: updatedAssignment.status,
            member: updatedAssignment.member,
            // Include all required fields from DepartmentAssignmentRow
            approved_by: updatedAssignment.approved_by,
            approved_date: updatedAssignment.approved_date,
            assigned_by: updatedAssignment.assigned_by,
            created_at: updatedAssignment.created_at,
            reason: updatedAssignment.reason,
            type: updatedAssignment.type,
            updated_at: updatedAssignment.updated_at,
            voice_part: memberData.voice_part || 'soprano',
            years_experience: memberData.years_experience || 0,
            attendance_rate: 0, // New member starts with 0
          },
          error: null
        };
      }

      return { data: null, error: { message: 'Failed to retrieve updated member data' } };
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
  ): Promise<ApiResult<DepartmentMember>> {
    try {
      // Update department assignment status if provided
      if (updates.status) {
        await supabase
          .from('department_assignments')
          .update({ status: updates.status as 'pending' | 'approved' | 'rejected' })
          .eq('id', memberId);
      }

      // Get updated member data
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

      if (data) {
        return {
          data: {
            id: data.id,
            member_id: data.member_id,
            department_id: data.department_id,
            assigned_date: data.assigned_date,
            status: data.status,
            member: data.member,
            // Include all required fields from DepartmentAssignmentRow
            approved_by: data.approved_by,
            approved_date: data.approved_date,
            assigned_by: data.assigned_by,
            created_at: data.created_at,
            reason: data.reason,
            type: data.type,
            updated_at: data.updated_at,
            voice_part: updates.voice_part || 'soprano',
            years_experience: updates.years_experience || 0,
            attendance_rate: 85, // Would be calculated from attendance records
          },
          error: null
        };
      }

      return { data: null, error: { message: 'Member not found' } };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get specific choir member by ID
  async getChoirMemberById(memberId: string): Promise<ApiResult<DepartmentMember>> {
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

      if (data) {
        return {
          data: {
            id: data.id,
            member_id: data.member_id,
            department_id: data.department_id,
            assigned_date: data.assigned_date,
            status: data.status,
            member: data.member,
            // Include all required fields from DepartmentAssignmentRow
            approved_by: data.approved_by,
            approved_date: data.approved_date,
            assigned_by: data.assigned_by,
            created_at: data.created_at,
            reason: data.reason,
            type: data.type,
            updated_at: data.updated_at,
            voice_part: 'soprano', // Would come from extended profile
            years_experience: 3, // Would come from extended profile
            attendance_rate: 85, // Would be calculated from attendance records
          },
          error: null
        };
      }

      return { data: null, error: { message: 'Member not found' } };
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
          status: 'rejected' as 'pending' | 'approved' | 'rejected',
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

  // Get choir performance history (using events table)
  async getPerformanceHistory(memberId?: string): Promise<ApiResult<any[]>> {
    try {
      // Get events that could be choir performances
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
        .limit(10);

      if (memberId) {
        // If memberId provided, could filter by attendance records
        query = query.eq('created_by', memberId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform events to performance format
      const performances = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        date: event.event_date,
        type: 'service', // Default type
        songs: [], // Would need separate song tracking
        attendance: 0, // Would need attendance counting
        notes: event.description,
      }));

      return { data: performances, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record attendance for a performance
  async recordAttendance(
    eventId: string,
    memberId: string,
    status: 'present' | 'absent' | 'late'
  ): Promise<ApiResult<void>> {
    try {
      // Record attendance in the attendance table
      const { error } = await supabase
        .from('attendance')
        .insert({
          member_id: memberId,
          event_id: eventId,
          attendance_date: new Date().toISOString().split('T')[0],
          branch_id: 'main-branch-id', // TODO: Get actual branch ID from context
          notes: `Attendance status: ${status}`,
        });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance
export const choirApi = new ChoirApiService();
