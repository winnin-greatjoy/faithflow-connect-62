import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  DepartmentMember,
  DepartmentStats,
} from '@/types/api';

// Technical API Service
export class TechnicalApiService extends BaseApiService {
  constructor() {
    super('department_assignments'); // Using existing table for assignments
  }

  // Get technical team members
  async getTechnicalMembers(request?: ListRequest): Promise<ApiResult<DepartmentMember[]>> {
    try {
      // Get members assigned to technical department using existing tables
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
        `);

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

      // Filter results to only include members assigned to technical department
      let filteredData = (data || []).filter(assignment =>
        assignment.member?.assigned_department === 'technical'
      );

      // Apply search filtering on client side
      if (request?.filters?.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredData = filteredData.filter(assignment =>
          assignment.member?.full_name?.toLowerCase().includes(searchTerm) ||
          assignment.member?.email?.toLowerCase().includes(searchTerm)
        );
      }

      // Transform data to DepartmentMember format with technical-specific fields
      const technicalMembers: DepartmentMember[] = filteredData.map(assignment => ({
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
        // Technical-specific fields
        specialization: 'AV Systems', // Would come from extended profile
        certifications: ['CTS', 'Dante Level 2'], // Would come from certifications table
        skill_level: 'expert', // Would come from profile
        tickets_resolved: 145, // Would be calculated from attendance/events
        uptime_hours: 8760, // Would be calculated from system logs
        availability: ['Sunday', 'Wednesday'], // Would come from profile
      }));

      return { data: technicalMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get equipment items (mock data for now since no equipment table exists)
  async getEquipment(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Return mock equipment data since we don't have an equipment table yet
      const equipment = [
        {
          id: '1',
          name: 'Main Sound Board',
          type: 'Audio Mixer',
          category: 'audio',
          model: 'Yamaha QL5',
          serial_number: 'QL5-001',
          purchase_date: '2023-01-15',
          warranty_expiry: '2026-01-15',
          status: 'operational',
          location: 'Sound Booth',
          assigned_to: 'Sarah Johnson',
          last_maintenance: '2024-01-15',
          next_maintenance: '2024-04-15',
          notes: 'Professional digital mixing console',
          specifications: { channels: 64, inputs: 32 },
        },
        {
          id: '2',
          name: 'Projector 1',
          type: 'Video Projector',
          category: 'video',
          model: 'Epson EB-S41',
          serial_number: 'EPS-002',
          purchase_date: '2023-06-10',
          warranty_expiry: '2025-06-10',
          status: 'operational',
          location: 'Sanctuary',
          assigned_to: 'David Wilson',
          last_maintenance: '2024-01-10',
          next_maintenance: '2024-07-10',
          notes: 'Main sanctuary projector',
          specifications: { resolution: 'SVGA', lumens: 3300 },
        },
        {
          id: '3',
          name: 'Live Stream Encoder',
          type: 'Streaming Equipment',
          category: 'streaming',
          model: 'Blackmagic Web Presenter',
          serial_number: 'BM-003',
          purchase_date: '2023-03-20',
          warranty_expiry: '2025-03-20',
          status: 'maintenance',
          location: 'Media Room',
          assigned_to: 'Emily Davis',
          last_maintenance: '2024-01-20',
          next_maintenance: '2024-01-30',
          notes: 'Currently undergoing software updates',
          specifications: { resolution: '1080p', inputs: 'HDMI/SDI' },
        },
      ];

      // Apply basic filtering
      let filteredEquipment = equipment;

      if (request?.filters?.status) {
        filteredEquipment = filteredEquipment.filter(item => item.status === request.filters?.status);
      }

      // Apply pagination
      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        filteredEquipment = filteredEquipment.slice(offset, offset + request.pagination.limit);
      }

      return { data: filteredEquipment, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get support tickets (using events table as support tickets)
  async getSupportTickets(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Use events table to represent support tickets (filter by title containing "support" or "issue")
      let query = supabase
        .from('events')
        .select('*')
        .or('title.ilike.%support%,title.ilike.%issue%,title.ilike.%maintenance%,title.ilike.%repair%')
        .order('event_date', { ascending: false });

      // Apply filters
      if (request?.filters?.status) {
        query = query.eq('title', request.filters.status as string); // Placeholder mapping
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

      // Transform events to support ticket format
      const supportTickets = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        category: 'other', // Default category
        priority: 'medium', // Default priority
        status: 'open', // Would be derived from event status
        requester: event.created_by,
        assigned_to: null,
        created_date: event.created_at,
        updated_date: event.updated_at,
        resolved_date: null,
        resolution_notes: null,
        equipment_id: null,
        event_id: null,
        estimated_time: null,
        actual_time: null,
      }));

      return { data: supportTickets, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create support ticket (using events table)
  async createSupportTicket(ticketData: {
    title: string;
    description: string;
    category: 'hardware' | 'software' | 'network' | 'av' | 'other';
    priority: 'low' | 'medium' | 'high' | 'critical';
    requester: string;
    equipment_id?: string;
  }): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: `Support Ticket: ${ticketData.title}`,
          description: `${ticketData.description}\n\nPriority: ${ticketData.priority}\nCategory: ${ticketData.category}\nRequester: ${ticketData.requester}`,
          event_date: new Date().toISOString().split('T')[0],
          branch_id: 'main-branch-id', // Should be actual branch ID
          created_by: ticketData.requester,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to support ticket format
      const supportTicket = {
        id: data.id,
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
        status: 'open',
        requester: ticketData.requester,
        assigned_to: null,
        created_date: data.created_at,
        updated_date: data.updated_at,
        resolved_date: null,
        resolution_notes: null,
        equipment_id: ticketData.equipment_id,
        event_id: null,
        estimated_time: null,
        actual_time: null,
      };

      return { data: supportTicket, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update ticket status (using events table)
  async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed',
    resolutionNotes?: string
  ): Promise<ApiResult<any>> {
    try {
      // Update the event with status and resolution notes
      const statusUpdate = `Status: ${status}${resolutionNotes ? `\nResolution: ${resolutionNotes}` : ''}`;
      const { data, error } = await supabase
        .from('events')
        .update({
          description: statusUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to support ticket format
      const supportTicket = {
        id: data.id,
        title: data.title.replace('Support Ticket: ', ''),
        description: data.description,
        category: 'other',
        priority: 'medium',
        status,
        requester: data.created_by,
        assigned_to: null,
        created_date: data.created_at,
        updated_date: data.updated_at,
        resolved_date: status === 'resolved' || status === 'closed' ? data.updated_at : null,
        resolution_notes: resolutionNotes,
        equipment_id: null,
        event_id: null,
        estimated_time: null,
        actual_time: null,
      };

      return { data: supportTicket, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get maintenance schedule (using events table)
  async getMaintenanceSchedule(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      // Get events that could be maintenance activities
      let query = supabase
        .from('events')
        .select('*')
        .or('title.ilike.%maintenance%,title.ilike.%repair%,title.ilike.%service%,title.ilike.%upgrade%')
        .order('event_date', { ascending: true });

      if (request?.filters?.status) {
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

      // Transform events to maintenance schedule format
      const maintenanceSchedule = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        equipment_id: null, // Would need to be parsed from description
        scheduled_date: event.event_date,
        start_time: event.start_time || '9:00 AM',
        end_time: event.end_time || '5:00 PM',
        type: 'preventive', // Default type
        status: 'scheduled', // Would be derived from event status
        assigned_to: event.created_by,
        estimated_duration: 2, // Hours (would need to be calculated)
        actual_duration: null,
        notes: event.description,
        next_maintenance: null,
        recurring: false,
        recurring_interval: null,
      }));

      return { data: maintenanceSchedule, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get technical statistics
  async getTechnicalStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts from members table where assigned_department = 'technical'
      const { data: totalMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'technical');

      const { data: activeMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'technical')
        .eq('status', 'active');

      // Get technical events count (proxy for equipment and tickets)
      const { data: technicalEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .or('title.ilike.%maintenance%,title.ilike.%support%,title.ilike.%technical%');

      // Get attendance records count (proxy for completed activities)
      const { data: attendanceCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact' });

      // Calculate monthly growth (placeholder)
      const monthlyGrowth = 25;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: technicalEvents?.length || 0,
        completedActivities: attendanceCount?.length || 0,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const technicalApi = new TechnicalApiService();
