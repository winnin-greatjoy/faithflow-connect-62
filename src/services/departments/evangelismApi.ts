import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  DepartmentMember,
  DepartmentStats,
} from '@/types/api';

// Evangelism API Service
export class EvangelismApiService extends BaseApiService {
  constructor() {
    super('department_assignments'); // Using existing table for assignments
  }

  // Get evangelism team members
  async getEvangelismMembers(request?: ListRequest): Promise<ApiResult<DepartmentMember[]>> {
    try {
      // Get members assigned to evangelism department using existing tables
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
        .eq('members.assigned_department', 'evangelism'); // Filter by assigned_department field

      // Apply filters
      if (request?.filters?.search) {
        query = query.or(`member.full_name.ilike.%${request.filters.search}%,member.email.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status as 'pending' | 'approved' | 'rejected');
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

      // Transform data to DepartmentMember format with evangelism-specific fields
      const evangelismMembers: DepartmentMember[] = (data || []).map(assignment => ({
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
        // Evangelism-specific fields (would be stored in extended schema or computed)
        outreach_area: 'Downtown', // Would come from extended profile
        conversions: 8, // Would be calculated from events
        events_led: 12, // Would be calculated from events created
        follow_ups_pending: 3, // Would be calculated from follow-up activities
      }));

      return { data: evangelismMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get outreach events (using events table)
  async getOutreachEvents(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Use events table to represent outreach events (filter by title containing "outreach")
      let query = supabase
        .from('events')
        .select('*')
        .ilike('title', '%outreach%')
        .order('event_date', { ascending: false });

      // Apply filters
      if (request?.filters?.status) {
        // Map status to event state (would need custom logic)
        query = query.eq('title', request.filters.status);
      }

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

      // Transform events to outreach event format
      const outreachEvents = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location || 'Various locations',
        type: 'community', // Default type
        target_audience: 'General public',
        expected_attendees: 50, // Would be stored in description or separate field
        actual_attendees: 0, // Would be calculated from attendance
        conversions: 0, // Would be calculated from follow-ups
        led_by: event.created_by,
        team_members: [], // Would be calculated from attendance records
        materials_used: [], // Would be stored in description
        follow_up_required: true,
        notes: event.description,
      }));

      return { data: outreachEvents, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create outreach event (using events table)
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
  }): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: `Outreach: ${eventData.title}`,
          description: `${eventData.description}\n\nType: ${eventData.type}\nTarget: ${eventData.target_audience}\nExpected: ${eventData.expected_attendees}\nTeam: ${eventData.team_members.join(', ')}\nMaterials: ${eventData.materials_used?.join(', ') || 'None'}`,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          branch_id: 'main-branch-id', // Should be actual branch ID
          created_by: eventData.led_by,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to outreach event format
      const outreachEvent = {
        id: data.id,
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
        notes: eventData.description,
      };

      return { data: outreachEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get follow-up contacts (using first_timers table as follow-up contacts)
  async getFollowUpContacts(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Use first_timers table to represent follow-up contacts
      let query = supabase
        .from('first_timers')
        .select('*')
        .order('first_visit', { ascending: false });

      // Apply filters
      if (request?.filters?.status) {
        query = query.eq('follow_up_status', request.filters.status as 'pending' | 'called' | 'visited' | 'completed');
      }

      if (request?.filters?.search) {
        query = query.or(`full_name.ilike.%${request.filters.search}%,email.ilike.%${request.filters.search}%`);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform first_timers to follow-up contact format
      const followUpContacts = (data || []).map(person => ({
        id: person.id,
        contact_name: person.full_name,
        contact_info: person.email || person.phone || 'No contact info',
        source_event: null, // Would need to be tracked separately
        status: person.follow_up_status === 'completed' ? 'converted' :
                person.follow_up_status === 'called' ? 'contacted' : 'new',
        assigned_to: person.created_by || 'unassigned',
        last_contact_date: person.first_visit,
        next_contact_date: null, // Would need to be calculated
        notes: person.follow_up_notes ? [person.follow_up_notes] : [],
        conversion_date: person.follow_up_status === 'completed' ? person.first_visit : null,
        church_integration: person.follow_up_status === 'completed' ? 'Member' : null,
      }));

      return { data: followUpContacts, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create follow-up contact (using first_timers table)
  async createFollowUpContact(contactData: {
    contact_name: string;
    contact_info: string;
    source_event?: string;
    assigned_to: string;
    initial_notes?: string;
  }): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from('first_timers')
        .insert({
          full_name: contactData.contact_name,
          email: contactData.contact_info.includes('@') ? contactData.contact_info : null,
          phone: contactData.contact_info.includes('@') ? null : contactData.contact_info,
          first_visit: new Date().toISOString().split('T')[0],
          service_date: new Date().toISOString().split('T')[0],
          follow_up_status: 'pending' as 'pending' | 'called' | 'visited' | 'completed',
          follow_up_notes: contactData.initial_notes,
          branch_id: 'main-branch-id', // Should be actual branch ID
          area: 'Downtown', // Would come from form input
          community: 'Main Community', // Would come from form input
          street: '123 Main St', // Would come from form input
          status: 'new' as 'new' | 'contacted' | 'followed_up' | 'converted',
          created_by: contactData.assigned_to,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to follow-up contact format
      const followUpContact = {
        id: data.id,
        contact_name: contactData.contact_name,
        contact_info: contactData.contact_info,
        source_event: contactData.source_event,
        status: 'new',
        assigned_to: contactData.assigned_to,
        last_contact_date: data.first_visit,
        next_contact_date: null,
        notes: contactData.initial_notes ? [contactData.initial_notes] : [],
        conversion_date: null,
        church_integration: null,
      };

      return { data: followUpContact, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update follow-up contact status (using first_timers table)
  async updateFollowUpStatus(
    contactId: string,
    status: 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested',
    notes?: string
  ): Promise<ApiResult<any>> {
    try {
      // Map status to first_timer_status
      const mappedStatus = status === 'converted' ? 'converted' :
                          status === 'contacted' ? 'contacted' :
                          status === 'interested' ? 'followed_up' : 'new';

      const updateData: any = {
        follow_up_status: mappedStatus,
        follow_up_notes: notes,
      };

      if (status === 'converted') {
        updateData.status = 'converted';
      }

      const { data, error } = await supabase
        .from('first_timers')
        .update(updateData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to follow-up contact format
      const followUpContact = {
        id: data.id,
        contact_name: data.full_name,
        contact_info: data.email || data.phone || 'No contact info',
        source_event: null,
        status,
        assigned_to: data.created_by || 'unassigned',
        last_contact_date: data.first_visit,
        next_contact_date: null,
        notes: data.follow_up_notes ? [data.follow_up_notes] : [],
        conversion_date: status === 'converted' ? data.first_visit : null,
        church_integration: status === 'converted' ? 'Member' : null,
      };

      return { data: followUpContact, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Record outreach results (update event)
  async recordOutreachResults(
    eventId: string,
    results: {
      actual_attendees: number;
      conversions: number;
      notes?: string;
    }
  ): Promise<ApiResult<any>> {
    try {
      // Update the event with results
      const { data, error } = await supabase
        .from('events')
        .update({
          description: `${results.notes || ''}\n\nResults: ${results.actual_attendees} attendees, ${results.conversions} conversions`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to outreach event format
      const outreachEvent = {
        id: data.id,
        title: data.title.replace('Outreach: ', ''),
        description: data.description,
        event_date: data.event_date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location || 'Various locations',
        type: 'community',
        target_audience: 'General public',
        expected_attendees: 50, // Would need to be parsed from description
        actual_attendees: results.actual_attendees,
        conversions: results.conversions,
        led_by: data.created_by,
        team_members: [],
        materials_used: [],
        follow_up_required: true,
        notes: results.notes,
      };

      return { data: outreachEvent, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get evangelism statistics
  async getEvangelismStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts from department_assignments where members are assigned to evangelism
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('members.assigned_department', 'evangelism')
        .eq('status', 'approved' as 'pending' | 'approved' | 'rejected');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('members.assigned_department', 'evangelism')
        .eq('status', 'approved' as 'pending' | 'approved' | 'rejected')
        .eq('members.status', 'active' as 'active' | 'inactive' | 'suspended' | 'transferred');

      // Get outreach events count
      const { data: outreachEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .ilike('title', '%outreach%');

      // Get first timers count (proxy for outreach activities)
      const { data: firstTimers } = await supabase
        .from('first_timers')
        .select('id', { count: 'exact' })
        .eq('follow_up_status', 'completed' as 'pending' | 'called' | 'visited' | 'completed');

      // Calculate monthly growth (placeholder)
      const monthlyGrowth = 18;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: outreachEvents?.length || 0,
        completedActivities: firstTimers?.length || 0,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const evangelismApi = new EvangelismApiService();
