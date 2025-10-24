import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  MinistryMember,
  DepartmentStats,
} from '@/types/api';

// Men's Ministry API Service
export class MensMinistryApiService extends BaseApiService {
  constructor() {
    super('department_assignments'); // Using existing table for assignments
  }

  // Get men's ministry members
  async getMensMembers(request?: ListRequest): Promise<ApiResult<MinistryMember[]>> {
    try {
      // Get members assigned to men's ministry using existing tables
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
        `)
        .eq('members.assigned_department', 'mens'); // Filter by assigned_department field

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

      // Transform data to MinistryMember format with men's ministry-specific fields
      const mensMembers: MinistryMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        ministry_id: 'mens-ministry-id', // Would be stored in departments table
        role: 'member', // Would be stored in extended profile
        joined_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        leadership_role: 'elder', // Would come from extended profile
        mentoring_pairs: 3, // Would be calculated
        discipleship_groups: 2, // Would be calculated
        retreat_attendance: 5, // Would be calculated from attendance
      }));

      return { data: mensMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get men's ministry events (using events table)
  async getMensEvents(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Use events table to represent men's ministry events (filter by title containing "men" or "men's")
      let query = supabase
        .from('events')
        .select('*')
        .or('title.ilike.%men%,title.ilike.%breakfast%,title.ilike.%retreat%,title.ilike.%fellowship%')
        .order('event_date', { ascending: false });

      // Apply filters
      if (request?.filters?.search) {
        query = query.or(`title.ilike.%${request.filters.search}%,description.ilike.%${request.filters.search}%`);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform events to men's event format
      const mensEvents = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        ministry_id: 'mens-ministry-id',
        created_by: event.created_by,
        branch_id: event.branch_id,
        attendance_count: 0, // Would be calculated from attendance records
        status: 'planned', // Would be derived from event state
        speaker: null, // Would be stored in description
        topic: null, // Would be stored in description
        format: 'fellowship', // Default format
        target_age_group: 'Adult men',
        registration_required: false,
        max_attendees: null,
      }));

      return { data: mensEvents, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create men's ministry event (using events table)
  async createMensEvent(eventData: {
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    format: 'breakfast' | 'dinner' | 'retreat' | 'workshop' | 'fellowship';
    speaker?: string;
    topic?: string;
    target_age_group?: string;
    registration_required: boolean;
    max_attendees?: number;
  }): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: `Men's Ministry: ${eventData.title}`,
          description: `${eventData.description}\n\nFormat: ${eventData.format}\nSpeaker: ${eventData.speaker || 'TBD'}\nTopic: ${eventData.topic || 'TBD'}\nTarget: ${eventData.target_age_group || 'Adult men'}\nRegistration: ${eventData.registration_required ? 'Required' : 'Optional'}${eventData.max_attendees ? `\nMax Attendees: ${eventData.max_attendees}` : ''}`,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          branch_id: 'main-branch-id', // Should be actual branch ID
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to men's event format
      const mensEvent = {
        id: data.id,
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location,
        ministry_id: 'mens-ministry-id',
        created_by: data.created_by,
        branch_id: data.branch_id,
        attendance_count: 0,
        status: 'planned',
        speaker: eventData.speaker,
        topic: eventData.topic,
        format: eventData.format,
        target_age_group: eventData.target_age_group,
        registration_required: eventData.registration_required,
        max_attendees: eventData.max_attendees,
      };

      return { data: mensEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get men's ministry statistics
  async getMensStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts from department_assignments where members are assigned to men's ministry
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('members.assigned_department', 'mens')
        .eq('status', 'approved');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('members.assigned_department', 'mens')
        .eq('status', 'approved')
        .eq('members.status', 'active');

      // Get men's ministry events count
      const { data: mensEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .or('title.ilike.%men%,title.ilike.%breakfast%,title.ilike.%retreat%,title.ilike.%fellowship%');

      // Get attendance records count (proxy for completed activities)
      const { data: attendanceCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact' });

      // Calculate monthly growth (placeholder)
      const monthlyGrowth = 12;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: mensEvents?.length || 0,
        completedActivities: attendanceCount?.length || 0,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record event attendance (using attendance table)
  async recordEventAttendance(
    eventId: string,
    memberId: string,
    attended: boolean,
    notes?: string
  ): Promise<ApiResult<void>> {
    try {
      if (attended) {
        // Record attendance in the attendance table
        const { error } = await supabase
          .from('attendance')
          .insert({
            member_id: memberId,
            event_id: eventId,
            attendance_date: new Date().toISOString().split('T')[0],
            notes: notes || 'Men\'s ministry event attendance',
          });

        if (error) {
          return { data: null, error: { message: error.message } };
        }
      }

      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const mensMinistryApi = new MensMinistryApiService();
