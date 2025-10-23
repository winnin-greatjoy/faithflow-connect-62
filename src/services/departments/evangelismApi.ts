import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  EvangelismMember,
  OutreachEvent,
  FollowUpContact,
  DepartmentStats,
} from '@/types/api';

// Evangelism API Service
export class EvangelismApiService extends BaseApiService {
  constructor() {
    super('outreach_events');
  }

  // Get evangelism team members
  async getEvangelismMembers(request?: ListRequest): Promise<ApiResult<EvangelismMember[]>> {
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
        .eq('department_id', 'evangelism-department-id');

      if (request?.filters?.search) {
        query = query.or(`member.full_name.ilike.%${request.filters.search}%,member.email.ilike.%${request.filters.search}%`);
      }

      if (request?.sort) {
        query = query.order(request.sort.field, { ascending: request.sort.direction === 'asc' });
      } else {
        query = query.order('assigned_date', { ascending: false });
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const evangelismMembers: EvangelismMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        outreach_area: 'Downtown',
        conversions: 8,
        events_led: 12,
        follow_ups_pending: 3,
      }));

      return { data: evangelismMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get outreach events
  async getOutreachEvents(request?: ListRequest): Promise<ApiResult<OutreachEvent[]>> {
    try {
      let query = supabase
        .from('outreach_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      if (request?.filters?.search) {
        query = query.or(`title.ilike.%${request.filters.search}%,location.ilike.%${request.filters.search}%`);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as OutreachEvent[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create outreach event
  async createOutreachEvent(eventData: {
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location: string;
    type: 'street' | 'door_to_door' | 'community' | 'campus' | 'special';
    target_audience: string;
    expected_attendees: number;
    led_by: string;
    team_members: string[];
    materials_used?: string[];
  }): Promise<ApiResult<OutreachEvent>> {
    try {
      const { data, error } = await supabase
        .from('outreach_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          type: eventData.type,
          target_audience: eventData.target_audience,
          expected_attendees: eventData.expected_attendees,
          actual_attendees: 0,
          conversions: 0,
          led_by: eventData.led_by,
          team_members: eventData.team_members,
          materials_used: eventData.materials_used,
          follow_up_required: true,
          status: 'planned',
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as OutreachEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get follow-up contacts
  async getFollowUpContacts(request?: ListRequest): Promise<ApiResult<FollowUpContact[]>> {
    try {
      let query = supabase
        .from('follow_up_contacts')
        .select('*')
        .order('last_contact_date', { ascending: false });

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      if (request?.filters?.assignedTo) {
        query = query.eq('assigned_to', request.filters.assignedTo);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as FollowUpContact[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create follow-up contact
  async createFollowUpContact(contactData: {
    contact_name: string;
    contact_info: string;
    source_event?: string;
    assigned_to: string;
    initial_notes?: string;
  }): Promise<ApiResult<FollowUpContact>> {
    try {
      const { data, error } = await supabase
        .from('follow_up_contacts')
        .insert({
          contact_name: contactData.contact_name,
          contact_info: contactData.contact_info,
          source_event: contactData.source_event,
          status: 'new',
          assigned_to: contactData.assigned_to,
          last_contact_date: new Date().toISOString(),
          next_contact_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          notes: contactData.initial_notes ? [contactData.initial_notes] : [],
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as FollowUpContact, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update follow-up contact status
  async updateFollowUpStatus(
    contactId: string,
    status: 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested',
    notes?: string
  ): Promise<ApiResult<FollowUpContact>> {
    try {
      const updateData: any = {
        status,
        last_contact_date: new Date().toISOString(),
      };

      if (notes) {
        // Add note to existing notes array
        const { data: currentContact } = await supabase
          .from('follow_up_contacts')
          .select('notes')
          .eq('id', contactId)
          .single();

        const existingNotes = currentContact?.notes || [];
        updateData.notes = [...existingNotes, `${new Date().toISOString()}: ${notes}`];
      }

      if (status === 'converted') {
        updateData.conversion_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('follow_up_contacts')
        .update(updateData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as FollowUpContact, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record outreach results
  async recordOutreachResults(
    eventId: string,
    results: {
      actual_attendees: number;
      conversions: number;
      notes?: string;
    }
  ): Promise<ApiResult<OutreachEvent>> {
    try {
      const { data, error } = await supabase
        .from('outreach_events')
        .update({
          actual_attendees: results.actual_attendees,
          conversions: results.conversions,
          status: 'completed',
          notes: results.notes,
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as OutreachEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get evangelism statistics
  async getEvangelismStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'evangelism-department-id')
        .eq('status', 'approved');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'evangelism-department-id')
        .eq('status', 'approved')
        .eq('member.status', 'active');

      const { data: plannedEvents } = await supabase
        .from('outreach_events')
        .select('id', { count: 'exact' })
        .eq('status', 'planned');

      const completedOutreaches = 22; // Would be calculated
      const monthlyGrowth = 18;
      const totalConversions = 34; // Would be calculated

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: plannedEvents?.length || 0,
        completedActivities: completedOutreaches,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const evangelismApi = new EvangelismApiService();
