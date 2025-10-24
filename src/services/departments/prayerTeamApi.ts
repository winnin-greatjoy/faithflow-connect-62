import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  DepartmentMember,
  DepartmentStats,
} from '@/types/api';

// Prayer Team API Service
export class PrayerTeamApiService extends BaseApiService {
  constructor() {
    super('department_assignments'); // Using existing table for assignments
  }

  // Get prayer team members
  async getPrayerMembers(request?: ListRequest): Promise<ApiResult<DepartmentMember[]>> {
    try {
      // Get members assigned to prayer department using existing tables
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
        .eq('status', 'approved'); // Only get approved assignments

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

      // Filter results to only include members assigned to prayer department
      let filteredData = (data || []).filter(assignment =>
        assignment.member?.assigned_department === 'prayer'
      );

      // Apply search filtering on client side
      if (request?.filters?.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredData = filteredData.filter(assignment =>
          assignment.member?.full_name?.toLowerCase().includes(searchTerm) ||
          assignment.member?.email?.toLowerCase().includes(searchTerm)
        );
      }

      // Transform data to DepartmentMember format with prayer-specific fields
      const prayerMembers: DepartmentMember[] = filteredData.map(assignment => ({
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
        // Prayer-specific fields
        specialization: 'Intercession', // Would come from extended profile
        prayer_hours_weekly: 10, // Would be calculated
        requests_handled: 25, // Would be calculated from events/attendance
        availability: ['Monday', 'Wednesday', 'Friday'], // Would come from profile
      }));

      return { data: prayerMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get prayer requests (using events table as prayer requests)
  async getPrayerRequests(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Use events table to represent prayer requests (filter by title containing "prayer")
      let query = supabase
        .from('events')
        .select('*')
        .ilike('title', '%prayer%')
        .order('event_date', { ascending: false });

      // Apply filters
      if (request?.filters?.search) {
        query = query.or(`title.ilike.%${request.filters.search}%,description.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        // Map status to event state (would need custom logic)
        query = query.eq('title', request.filters.status); // Placeholder
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform events to prayer request format
      const prayerRequests = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        requester_name: event.created_by, // Using created_by as requester
        requester_contact: null,
        category: 'ministry', // Default category
        urgency: 'medium', // Default urgency
        status: 'new', // Would be derived from event status
        assigned_to: null,
        date_received: event.created_at,
        date_updated: event.updated_at,
        follow_up_notes: [],
        answered_date: null,
      }));

      return { data: prayerRequests, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create new prayer request (using events table)
  async createPrayerRequest(requestData: {
    title: string;
    description: string;
    requester_name?: string;
    requester_contact?: string;
    category: 'health' | 'family' | 'career' | 'finance' | 'ministry' | 'other';
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    anonymous?: boolean;
  }): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: `Prayer Request: ${requestData.title}`,
          description: `${requestData.description}\n\nCategory: ${requestData.category}\nUrgency: ${requestData.urgency}\nRequester: ${requestData.requester_name || 'Anonymous'}`,
          event_date: new Date().toISOString().split('T')[0],
          branch_id: 'main-branch-id', // Should be actual branch ID
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform to prayer request format
      const prayerRequest = {
        id: data.id,
        title: requestData.title,
        description: requestData.description,
        requester_name: requestData.requester_name || (requestData.anonymous ? 'Anonymous' : null),
        requester_contact: requestData.requester_contact,
        category: requestData.category,
        urgency: requestData.urgency,
        status: 'new',
        assigned_to: null,
        date_received: data.created_at,
        date_updated: data.updated_at,
        follow_up_notes: [],
        answered_date: null,
      };

      return { data: prayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Assign prayer request to team member (update event)
  async assignPrayerRequest(
    requestId: string,
    memberId: string
  ): Promise<ApiResult<any>> {
    try {
      // Update the event with assignment info
      const { data, error } = await supabase
        .from('events')
        .update({
          description: `Assigned to: ${memberId}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to prayer request format
      const prayerRequest = {
        id: data.id,
        title: data.title.replace('Prayer Request: ', ''),
        description: data.description,
        requester_name: 'Unknown',
        requester_contact: null,
        category: 'ministry',
        urgency: 'medium',
        status: 'assigned',
        assigned_to: memberId,
        date_received: data.created_at,
        date_updated: data.updated_at,
        follow_up_notes: [],
        answered_date: null,
      };

      return { data: prayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update prayer request status
  async updatePrayerRequestStatus(
    requestId: string,
    status: 'new' | 'assigned' | 'in_progress' | 'answered' | 'closed',
    notes?: string
  ): Promise<ApiResult<any>> {
    try {
      // Update the event description with status and notes
      const statusUpdate = `Status: ${status}${notes ? `\nNotes: ${notes}` : ''}`;
      const { data, error } = await supabase
        .from('events')
        .update({
          description: statusUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to prayer request format
      const prayerRequest = {
        id: data.id,
        title: data.title.replace('Prayer Request: ', ''),
        description: data.description,
        requester_name: 'Unknown',
        requester_contact: null,
        category: 'ministry',
        urgency: 'medium',
        status,
        assigned_to: null,
        date_received: data.created_at,
        date_updated: data.updated_at,
        follow_up_notes: notes ? [notes] : [],
        answered_date: status === 'answered' ? data.updated_at : null,
      };

      return { data: prayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get prayer sessions (using events table)
  async getPrayerSessions(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Get events that could be prayer sessions
      let query = supabase
        .from('events')
        .select('*')
        .ilike('title', '%prayer%')
        .order('event_date', { ascending: false });

      if (request?.filters?.status) {
        // Map status to event state
        query = query.eq('title', request.filters.status as string);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform events to prayer session format
      const prayerSessions = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        session_date: event.event_date,
        start_time: event.start_time || '7:00 PM',
        end_time: event.end_time || '8:00 PM',
        type: 'group', // Default type
        attendees: 0, // Would need to be calculated from attendance
        leader: event.created_by,
        notes: event.description,
        requests_covered: [], // Would need separate tracking
      }));

      return { data: prayerSessions, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get prayer team statistics
  async getPrayerStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts from members table where assigned_department = 'prayer'
      const { data: totalMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'prayer');

      const { data: activeMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'prayer')
        .eq('status', 'active');

      // Get prayer-related events count
      const { data: prayerEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .ilike('title', '%prayer%');

      // Get attendance records count (proxy for completed activities)
      const { data: attendanceCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact' });

      // Calculate monthly growth (placeholder)
      const monthlyGrowth = 22;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: prayerEvents?.length || 0,
        completedActivities: attendanceCount?.length || 0,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Add follow-up note to prayer request
  async addFollowUpNote(
    requestId: string,
    note: string
  ): Promise<ApiResult<any>> {
    try {
      // Get current event
      const { data: currentEvent } = await supabase
        .from('events')
        .select('description')
        .eq('id', requestId)
        .single();

      const updatedDescription = `${currentEvent?.description || ''}\n\n${new Date().toISOString()}: ${note}`;

      const { data, error } = await supabase
        .from('events')
        .update({
          description: updatedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to prayer request format
      const prayerRequest = {
        id: data.id,
        title: data.title.replace('Prayer Request: ', ''),
        description: data.description,
        requester_name: 'Unknown',
        requester_contact: null,
        category: 'ministry',
        urgency: 'medium',
        status: 'in_progress',
        assigned_to: null,
        date_received: data.created_at,
        date_updated: data.updated_at,
        follow_up_notes: [note],
        answered_date: null,
      };

      return { data: prayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance
export const prayerTeamApi = new PrayerTeamApiService();
