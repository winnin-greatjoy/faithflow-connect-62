import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type { ApiResult, ListRequest, DepartmentMember, DepartmentStats } from '@/types/api';

// Ushering Department API Service
export class UsheringApiService extends BaseApiService {
  constructor() {
    super('department_assignments'); // Using existing table for assignments
  }

  // Get ushering team members
  async getUsherMembers(request?: ListRequest): Promise<ApiResult<DepartmentMember[]>> {
    try {
      // Get members assigned to ushering department using existing tables
      let query = supabase.from('department_assignments').select(`
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
        // query = query; // Keep the base query
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

      // Filter results to only include members assigned to ushering department
      let filteredData = (data || []).filter(
        (assignment) => assignment.member?.assigned_department === 'ushering'
      );

      // Apply search filtering on client side
      if (request?.filters?.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (assignment) =>
            assignment.member?.full_name?.toLowerCase().includes(searchTerm) ||
            assignment.member?.email?.toLowerCase().includes(searchTerm)
        );
      }

      // Transform data to UsherMember format
      const usherMembers: DepartmentMember[] = filteredData.map((assignment) => ({
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
        // Usher-specific fields
        station: 'Main Entrance', // Would come from extended profile
        years_experience: 2, // Would be calculated
        availability: ['Sunday 9AM', 'Sunday 11AM'], // Would come from profile
        certifications: ['Basic Usher Training'], // Would come from certifications table
      }));

      return { data: usherMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get ushering statistics
  async getUsheringStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts directly from members table using assigned_department field
      // This avoids any issues with the departments table
      const { data: totalMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'ushering');

      const { data: activeMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'ushering')
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
      const monthlyGrowth = 15;

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

  // Add usher member
  async addUsherMember(memberData: {
    member_id: string;
    station: string;
    availability: string[];
    experience_years?: number;
    certifications?: string[];
  }): Promise<ApiResult<DepartmentMember>> {
    try {
      // Create department assignment directly without needing departments table
      const { data: assignment, error: assignmentError } = await supabase
        .from('department_assignments')
        .insert({
          member_id: memberData.member_id,
          department_id: 'ushering-dept', // Use a simple identifier
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_date: new Date().toISOString(),
          status: 'approved',
          type: 'assignment',
          reason: 'Usher team assignment',
        })
        .select()
        .single();

      if (assignmentError) {
        return { data: null, error: { message: assignmentError.message } };
      }

      // Update member profile with ushering information
      await supabase
        .from('members')
        .update({
          assigned_department: 'ushering',
        })
        .eq('id', memberData.member_id);

      // Get the updated member data with department assignment
      const { data: updatedAssignment } = await supabase
        .from('department_assignments')
        .select(
          `
          *,
          member:members!department_assignments_member_id_fkey(*)
        `
        )
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
            // Usher-specific fields
            station: memberData.station,
            years_experience: memberData.experience_years || 0,
            availability: memberData.availability,
            certifications: memberData.certifications || [],
          },
          error: null,
        };
      }

      return { data: null, error: { message: 'Failed to retrieve updated member data' } };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get usher stations (mock data for now)
  async getUsherStations(): Promise<ApiResult<any[]>> {
    try {
      // Return mock stations data since we don't have a stations table yet
      const stations = [
        {
          id: '1',
          name: 'Main Entrance',
          description: 'Primary church entrance',
          capacity: 2,
          requirements: ['Friendly demeanor', 'Good communication skills'],
          equipment: ['Welcome materials', 'Information desk'],
          is_active: true,
        },
        {
          id: '2',
          name: 'Sanctuary Doors',
          description: 'Main sanctuary entrance',
          capacity: 2,
          requirements: ['Professional appearance', 'Quiet demeanor'],
          equipment: ['Offering baskets', 'Programs'],
          is_active: true,
        },
        {
          id: '3',
          name: 'Parking Lot',
          description: 'Parking assistance',
          capacity: 1,
          requirements: ['Safety vest', 'Good visibility'],
          equipment: ['Flashlight', 'Safety vest'],
          is_active: true,
        },
      ];

      return { data: stations, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get upcoming ushering schedule (using events table)
  async getUpcomingSchedule(): Promise<ApiResult<any[]>> {
    try {
      // Get upcoming events that could need ushering
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5);

      // Transform events to shift format
      const shifts = (upcomingEvents || []).map((event) => ({
        id: event.id,
        service_date: event.event_date,
        service_time: event.start_time || '9:00 AM',
        station: 'Main Entrance', // Default station
        attendance_count: 0,
        notes: event.description,
        assigned_by: event.created_by,
      }));

      return { data: shifts, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Assign usher to a service (using attendance table)
  async assignUsherToService(shiftData: {
    member_id: string;
    service_date: string;
    service_time: string;
    station: string;
    notes?: string;
  }): Promise<ApiResult<any>> {
    try {
      // Find or create an event for this service
      let { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('event_date', shiftData.service_date)
        .eq('start_time', shiftData.service_time)
        .single();

      if (!event) {
        // Create a new event if it doesn't exist
        const { data: newEvent, error: eventError } = await supabase
          .from('events')
          .insert({
            title: `Service - ${shiftData.service_date}`,
            event_date: shiftData.service_date,
            start_time: shiftData.service_time,
            branch_id: 'main-branch-id', // Should be actual branch ID
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (eventError) {
          return { data: null, error: { message: eventError.message } };
        }
        event = newEvent;
      }

      // Record the assignment in attendance table
      const { error: attendanceError } = await supabase.from('attendance').insert({
        member_id: shiftData.member_id,
        event_id: event.id,
        attendance_date: shiftData.service_date,
        branch_id: 'main-branch-id', // Required field
        notes: `Assigned to ${shiftData.station}. ${shiftData.notes || ''}`,
      });

      if (attendanceError) {
        return { data: null, error: { message: attendanceError.message } };
      }

      return {
        data: {
          id: Date.now().toString(),
          service_date: shiftData.service_date,
          service_time: shiftData.service_time,
          station: shiftData.station,
          attendance_count: 0,
          notes: shiftData.notes,
          assigned_by: (await supabase.auth.getUser()).data.user?.id || 'system',
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record attendance for a service
  async recordServiceAttendance(
    eventId: string,
    attendanceCount: number,
    notes?: string
  ): Promise<ApiResult<void>> {
    try {
      // Update the event with attendance count
      await supabase
        .from('events')
        .update({ description: `Attendance: ${attendanceCount}. ${notes || ''}` })
        .eq('id', eventId);

      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update usher availability
  async updateUsherAvailability(
    memberId: string,
    availability: string[]
  ): Promise<ApiResult<void>> {
    try {
      // Update member profile with availability (would need extended profile table)
      // For now, just return success
      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get service history for a member (using attendance table)
  async getMemberServiceHistory(memberId: string): Promise<ApiResult<any[]>> {
    try {
      // Get attendance records for this member
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select(
          `
          *,
          event:events!attendance_event_id_fkey(*)
        `
        )
        .eq('member_id', memberId)
        .order('attendance_date', { ascending: false })
        .limit(10);

      // Transform to shift history format
      const history = (attendanceRecords || []).map((record) => ({
        id: record.id,
        service_date: record.event?.event_date || record.attendance_date,
        service_time: record.event?.start_time || '9:00 AM',
        station: 'Main Entrance', // Would need to be stored in attendance notes
        attendance_count: 0, // Would need to be calculated
        notes: record.notes,
        assigned_by: 'system',
      }));

      return { data: history, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance
export const usheringApi = new UsheringApiService();
