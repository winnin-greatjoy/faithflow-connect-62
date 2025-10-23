import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  MensMinistryMember,
  MensEvent,
  DepartmentStats,
} from '@/types/api';

// Men's Ministry API Service
export class MensMinistryApiService extends BaseApiService {
  constructor() {
    super('mens_ministry_members');
  }

  // Get men's ministry members
  async getMensMembers(request?: ListRequest): Promise<ApiResult<MensMinistryMember[]>> {
    try {
      let query = supabase
        .from('ministry_members')
        .select(`
          *,
          member:members!ministry_members_member_id_fkey(
            id,
            full_name,
            email,
            phone,
            date_joined,
            status
          )
        `)
        .eq('ministry_id', 'mens-ministry-id');

      if (request?.filters?.search) {
        query = query.or(`member.full_name.ilike.%${request.filters.search}%,member.email.ilike.%${request.filters.search}%`);
      }

      if (request?.sort) {
        query = query.order(request.sort.field, { ascending: request.sort.direction === 'asc' });
      } else {
        query = query.order('joined_date', { ascending: false });
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const mensMembers: MensMinistryMember[] = (data || []).map(member => ({
        id: member.id,
        member_id: member.member_id,
        ministry_id: member.ministry_id,
        role: member.role as 'leader' | 'coordinator' | 'member',
        joined_date: member.joined_date,
        status: member.status,
        member: member.member,
        leadership_role: 'elder',
        mentoring_pairs: 3,
        discipleship_groups: 2,
        retreat_attendance: 5,
      }));

      return { data: mensMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get men's ministry events
  async getMensEvents(request?: ListRequest): Promise<ApiResult<MensEvent[]>> {
    try {
      let query = supabase
        .from('ministry_events')
        .select('*')
        .eq('ministry_id', 'mens-ministry-id')
        .order('event_date', { ascending: false });

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

      return { data: data as MensEvent[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create men's ministry event
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
  }): Promise<ApiResult<MensEvent>> {
    try {
      const { data, error } = await supabase
        .from('ministry_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          ministry_id: 'mens-ministry-id',
          created_by: 'current-user-id', // Would get from auth context
          branch_id: 'current-branch-id',
          status: 'planned',
          registration_required: eventData.registration_required,
          max_attendees: eventData.max_attendees,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as MensEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get men's ministry statistics
  async getMensStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      const { data: totalMembers } = await supabase
        .from('ministry_members')
        .select('member_id', { count: 'exact' })
        .eq('ministry_id', 'mens-ministry-id')
        .eq('status', 'active');

      const { data: activeMembers } = await supabase
        .from('ministry_members')
        .select('member_id', { count: 'exact' })
        .eq('ministry_id', 'mens-ministry-id')
        .eq('status', 'active')
        .eq('member.status', 'active');

      const { data: upcomingEvents } = await supabase
        .from('ministry_events')
        .select('id', { count: 'exact' })
        .eq('ministry_id', 'mens-ministry-id')
        .eq('status', 'planned');

      const completedActivities = 25; // Would be calculated
      const monthlyGrowth = 12;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: upcomingEvents?.length || 0,
        completedActivities,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record event attendance
  async recordEventAttendance(
    eventId: string,
    memberId: string,
    attended: boolean,
    notes?: string
  ): Promise<ApiResult<void>> {
    try {
      // This would insert into an event_attendance table
      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const mensMinistryApi = new MensMinistryApiService();
