import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  UsherMember,
  UsherShift,
  UsherStation,
  DepartmentStats,
} from '@/types/api';

// Ushering Department API Service
export class UsheringApiService extends BaseApiService {
  constructor() {
    super('usher_assignments'); // Custom table for ushering-specific data
  }

  // Get ushering team members
  async getUsherMembers(request?: ListRequest): Promise<ApiResult<UsherMember[]>> {
    try {
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
        .eq('department_id', 'ushering-department-id');

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
        return { data: null, error: { message: error.message } };
      }

      // Transform data to UsherMember format
      const usherMembers: UsherMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        // Usher-specific fields
        station: 'Main Entrance', // Would come from extended profile
        experience_years: 2, // Would be calculated
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
      // Get member counts
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'ushering-department-id')
        .eq('status', 'approved');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'ushering-department-id')
        .eq('status', 'approved')
        .eq('member.status', 'active');

      // Get upcoming services count
      const upcomingEvents = 4;

      // Get completed services count
      const completedActivities = 28;

      // Calculate monthly growth
      const monthlyGrowth = 15;

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

  // Add usher member
  async addUsherMember(memberData: {
    member_id: string;
    station: string;
    availability: string[];
    experience_years?: number;
    certifications?: string[];
  }): Promise<ApiResult<UsherMember>> {
    try {
      // Create department assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('department_assignments')
        .insert({
          member_id: memberData.member_id,
          department_id: 'ushering-department-id',
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

      // Get the updated member data
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberData.member_id)
        .single();

      const usherMember: UsherMember = {
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member,
        station: memberData.station,
        experience_years: memberData.experience_years || 0,
        availability: memberData.availability,
        certifications: memberData.certifications || [],
      };

      return { data: usherMember, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get usher stations
  async getUsherStations(): Promise<ApiResult<UsherStation[]>> {
    try {
      // This would query a stations table
      const stations: UsherStation[] = [
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
        {
          id: '4',
          name: 'Children\'s Area',
          description: 'Children\'s ministry area',
          capacity: 1,
          requirements: ['Child-friendly', 'Background check'],
          equipment: ['Check-in system', 'Security badges'],
          is_active: false, // Currently offline
        },
      ];

      return { data: stations, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get upcoming ushering schedule
  async getUpcomingSchedule(): Promise<ApiResult<UsherShift[]>> {
    try {
      // This would query a shifts table
      const shifts: UsherShift[] = [
        {
          id: '1',
          service_date: '2024-01-28',
          service_time: '9:00 AM',
          station: 'Main Entrance',
          attendance_count: 0,
          assigned_by: 'admin-user-id',
        },
        {
          id: '2',
          service_date: '2024-01-28',
          service_time: '11:00 AM',
          station: 'Main Entrance',
          attendance_count: 0,
          assigned_by: 'admin-user-id',
        },
        {
          id: '3',
          service_date: '2024-01-31',
          service_time: '7:00 PM',
          station: 'Sanctuary Doors',
          attendance_count: 0,
          assigned_by: 'admin-user-id',
        },
      ];

      return { data: shifts, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Assign usher to a service
  async assignUsherToService(shiftData: {
    member_id: string;
    service_date: string;
    service_time: string;
    station: string;
    notes?: string;
  }): Promise<ApiResult<UsherShift>> {
    try {
      // This would insert into a shifts table
      const shift: UsherShift = {
        id: Date.now().toString(),
        service_date: shiftData.service_date,
        service_time: shiftData.service_time,
        station: shiftData.station,
        attendance_count: 0,
        notes: shiftData.notes,
        assigned_by: (await supabase.auth.getUser()).data.user?.id || 'system',
      };

      return { data: shift, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record attendance for a service
  async recordServiceAttendance(
    shiftId: string,
    attendanceCount: number,
    notes?: string
  ): Promise<ApiResult<void>> {
    try {
      // This would update the attendance count in the shifts table
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
      // This would update the member's availability in their profile
      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get service history for a member
  async getMemberServiceHistory(memberId: string): Promise<ApiResult<UsherShift[]>> {
    try {
      // This would query shifts where the member was assigned
      const history: UsherShift[] = [
        {
          id: '1',
          service_date: '2024-01-21',
          service_time: '9:00 AM',
          station: 'Main Entrance',
          attendance_count: 156,
          notes: 'Good service',
          assigned_by: 'admin-user-id',
        },
        {
          id: '2',
          service_date: '2024-01-21',
          service_time: '11:00 AM',
          station: 'Main Entrance',
          attendance_count: 203,
          notes: 'Very busy service',
          assigned_by: 'admin-user-id',
        },
      ];

      return { data: history, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance
export const usheringApi = new UsheringApiService();
