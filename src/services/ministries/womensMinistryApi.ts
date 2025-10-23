import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  WomensMinistryMember,
  WomensEvent,
  DepartmentStats,
} from '@/types/api';

// Women's Ministry API Service
export class WomensMinistryApiService extends BaseApiService {
  constructor() {
    super('womens_ministry_members');
  }

  async getWomensMembers(request?: ListRequest): Promise<ApiResult<WomensMinistryMember[]>> {
    try {
      let query = supabase
        .from('ministry_members')
        .select(`
          *,
          member:members!ministry_members_member_id_fkey(*)
        `)
        .eq('ministry_id', 'womens-ministry-id');

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

      const womensMembers: WomensMinistryMember[] = (data || []).map(member => ({
        id: member.id,
        member_id: member.member_id,
        ministry_id: member.ministry_id,
        role: member.role as 'leader' | 'coordinator' | 'member',
        joined_date: member.joined_date,
        status: member.status,
        member: member.member,
        ministry_focus: 'prayer',
        small_groups: ['Morning Prayer', 'Bible Study'],
        retreat_attendance: 3,
        service_projects: 8,
      }));

      return { data: womensMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getWomensEvents(request?: ListRequest): Promise<ApiResult<WomensEvent[]>> {
    try {
      let query = supabase
        .from('ministry_events')
        .select('*')
        .eq('ministry_id', 'womens-ministry-id')
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

      return { data: data as WomensEvent[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async createWomensEvent(eventData: {
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    format: 'conference' | 'retreat' | 'workshop' | 'fellowship' | 'service';
    speaker?: string;
    topic?: string;
    childcare_provided: boolean;
    age_restrictions?: string;
    registration_fee?: number;
  }): Promise<ApiResult<WomensEvent>> {
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
          ministry_id: 'womens-ministry-id',
          created_by: 'current-user-id',
          branch_id: 'current-branch-id',
          status: 'planned',
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as WomensEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getWomensStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      const { data: totalMembers } = await supabase
        .from('ministry_members')
        .select('member_id', { count: 'exact' })
        .eq('ministry_id', 'womens-ministry-id')
        .eq('status', 'active');

      const { data: activeMembers } = await supabase
        .from('ministry_members')
        .select('member_id', { count: 'exact' })
        .eq('ministry_id', 'womens-ministry-id')
        .eq('status', 'active')
        .eq('member.status', 'active');

      const { data: upcomingEvents } = await supabase
        .from('ministry_events')
        .select('id', { count: 'exact' })
        .eq('ministry_id', 'womens-ministry-id')
        .eq('status', 'planned');

      const completedActivities = 32;
      const monthlyGrowth = 15;

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
}

export const womensMinistryApi = new WomensMinistryApiService();
