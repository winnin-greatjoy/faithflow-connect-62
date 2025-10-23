import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  ChildrensMinistryMember,
  ChildrensEvent,
  DepartmentStats,
} from '@/types/api';

// Children's Ministry API Service
export class ChildrensMinistryApiService extends BaseApiService {
  constructor() {
    super('childrens_ministry_members');
  }

  async getChildrensMembers(request?: ListRequest): Promise<ApiResult<ChildrensMinistryMember[]>> {
    try {
      let query = supabase
        .from('ministry_members')
        .select(`
          *,
          member:members!ministry_members_member_id_fkey(*)
        `)
        .eq('ministry_id', 'childrens-ministry-id');

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

      const childrensMembers: ChildrensMinistryMember[] = (data || []).map(member => ({
        id: member.id,
        member_id: member.member_id,
        ministry_id: member.ministry_id,
        role: member.role as 'leader' | 'coordinator' | 'member',
        joined_date: member.joined_date,
        status: member.status,
        member: member.member,
        age: 8,
        parent_id: 'parent-member-id',
        parent_name: 'John & Mary Smith',
        allergies: ['Peanuts', 'Shellfish'],
        emergency_contact: '555-0101',
        classroom: 'Room 201',
        check_in_time: '9:00 AM',
        check_out_time: '10:30 AM',
      }));

      return { data: childrensMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getChildrensEvents(request?: ListRequest): Promise<ApiResult<ChildrensEvent[]>> {
    try {
      let query = supabase
        .from('ministry_events')
        .select('*')
        .eq('ministry_id', 'childrens-ministry-id')
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

      return { data: data as ChildrensEvent[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async createChildrensEvent(eventData: {
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    age_range: string;
    format: 'sunday_school' | 'vacation_bible_school' | 'camp' | 'party';
    parent_permission_required: boolean;
    snack_provided: boolean;
    teacher_ratio: number;
    curriculum?: string;
  }): Promise<ApiResult<ChildrensEvent>> {
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
          ministry_id: 'childrens-ministry-id',
          created_by: 'current-user-id',
          branch_id: 'current-branch-id',
          status: 'planned',
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as ChildrensEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getChildrensStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      const { data: totalMembers } = await supabase
        .from('ministry_members')
        .select('member_id', { count: 'exact' })
        .eq('ministry_id', 'childrens-ministry-id')
        .eq('status', 'active');

      const { data: activeMembers } = await supabase
        .from('ministry_members')
        .select('member_id', { count: 'exact' })
        .eq('ministry_id', 'childrens-ministry-id')
        .eq('status', 'active')
        .eq('member.status', 'active');

      const { data: upcomingEvents } = await supabase
        .from('ministry_events')
        .select('id', { count: 'exact' })
        .eq('ministry_id', 'childrens-ministry-id')
        .eq('status', 'planned');

      const completedActivities = 38;
      const monthlyGrowth = 18;

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

  async recordChildCheckIn(
    eventId: string,
    childId: string,
    checkInData: {
      check_in_time: string;
      checked_in_by: string;
      parent_signature?: string;
      notes?: string;
    }
  ): Promise<ApiResult<void>> {
    try {
      // This would insert into a child_checkin table
      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async recordChildCheckOut(
    eventId: string,
    childId: string,
    checkOutData: {
      check_out_time: string;
      checked_out_by: string;
      parent_signature: string;
      notes?: string;
    }
  ): Promise<ApiResult<void>> {
    try {
      // This would insert into a child_checkout table
      return { data: undefined, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const childrensMinistryApi = new ChildrensMinistryApiService();
