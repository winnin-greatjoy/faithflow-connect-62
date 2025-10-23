import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  PrayerTeamMember,
  PrayerRequest,
  PrayerSession,
  DepartmentStats,
} from '@/types/api';

// Prayer Team API Service
export class PrayerTeamApiService extends BaseApiService {
  constructor() {
    super('prayer_requests'); // Using prayer_requests as base table
  }

  // Get prayer team members
  async getPrayerMembers(request?: ListRequest): Promise<ApiResult<PrayerTeamMember[]>> {
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
        .eq('department_id', 'prayer-department-id');

      if (request?.filters?.search) {
        query = query.or(`member.full_name.ilike.%${request.filters.search}%,member.email.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
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

      const prayerMembers: PrayerTeamMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        specialization: 'Intercession',
        prayer_hours_weekly: 10,
        requests_handled: 25,
        availability: ['Monday', 'Wednesday', 'Friday'],
      }));

      return { data: prayerMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get prayer requests with filtering
  async getPrayerRequests(request?: ListRequest): Promise<ApiResult<PrayerRequest[]>> {
    try {
      let query = supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (request?.filters?.search) {
        query = query.or(`title.ilike.%${request.filters.search}%,requester_name.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      if (request?.filters?.category) {
        query = query.eq('category', request.filters.category);
      }

      if (request?.filters?.urgency) {
        query = query.eq('urgency', request.filters.urgency);
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

      return { data: data as PrayerRequest[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create new prayer request
  async createPrayerRequest(requestData: {
    title: string;
    description: string;
    requester_name?: string;
    requester_contact?: string;
    category: 'health' | 'family' | 'career' | 'finance' | 'ministry' | 'other';
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    anonymous?: boolean;
  }): Promise<ApiResult<PrayerRequest>> {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert({
          title: requestData.title,
          description: requestData.description,
          requester_name: requestData.requester_name || (requestData.anonymous ? 'Anonymous' : null),
          requester_contact: requestData.requester_contact,
          category: requestData.category,
          urgency: requestData.urgency,
          status: 'new',
          date_received: new Date().toISOString(),
          date_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as PrayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Assign prayer request to team member
  async assignPrayerRequest(
    requestId: string,
    memberId: string
  ): Promise<ApiResult<PrayerRequest>> {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .update({
          assigned_to: memberId,
          status: 'assigned',
          date_updated: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as PrayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update prayer request status
  async updatePrayerRequestStatus(
    requestId: string,
    status: 'new' | 'assigned' | 'in_progress' | 'answered' | 'closed',
    notes?: string
  ): Promise<ApiResult<PrayerRequest>> {
    try {
      const updateData: any = {
        status,
        date_updated: new Date().toISOString(),
      };

      if (status === 'answered') {
        updateData.answered_date = new Date().toISOString();
      }

      if (notes) {
        updateData.follow_up_notes = notes;
      }

      const { data, error } = await supabase
        .from('prayer_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as PrayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get prayer sessions
  async getPrayerSessions(request?: ListRequest): Promise<ApiResult<PrayerSession[]>> {
    try {
      let query = supabase
        .from('prayer_sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as PrayerSession[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get prayer team statistics
  async getPrayerStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'prayer-department-id')
        .eq('status', 'approved');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'prayer-department-id')
        .eq('status', 'approved')
        .eq('member.status', 'active');

      const { data: pendingRequests } = await supabase
        .from('prayer_requests')
        .select('id', { count: 'exact' })
        .in('status', ['new', 'assigned']);

      const completedSessions = 34; // Would be calculated
      const monthlyGrowth = 22;
      const answeredPrayers = 28; // Would be calculated

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: 0, // Would be calculated
        completedActivities: completedSessions,
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
  ): Promise<ApiResult<PrayerRequest>> {
    try {
      // Get current request
      const { data: currentRequest } = await supabase
        .from('prayer_requests')
        .select('follow_up_notes')
        .eq('id', requestId)
        .single();

      const existingNotes = currentRequest?.follow_up_notes || [];
      const updatedNotes = [...existingNotes, `${new Date().toISOString()}: ${note}`];

      const { data, error } = await supabase
        .from('prayer_requests')
        .update({
          follow_up_notes: updatedNotes,
          date_updated: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as PrayerRequest, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance
export const prayerTeamApi = new PrayerTeamApiService();
