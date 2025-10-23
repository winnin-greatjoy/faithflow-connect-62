import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  TechnicalMember,
  EquipmentItem,
  SupportTicket,
  MaintenanceSchedule,
  DepartmentStats,
} from '@/types/api';

// Technical API Service
export class TechnicalApiService extends BaseApiService {
  constructor() {
    super('support_tickets');
  }

  // Get technical team members
  async getTechnicalMembers(request?: ListRequest): Promise<ApiResult<TechnicalMember[]>> {
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
        .eq('department_id', 'technical-department-id');

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

      const technicalMembers: TechnicalMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        specialization: 'AV Systems',
        certifications: ['CTS', 'Dante Level 2'],
        skill_level: 'expert',
        tickets_resolved: 145,
        uptime_hours: 8760,
        availability: ['Sunday', 'Wednesday'],
      }));

      return { data: technicalMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get equipment items
  async getEquipment(request?: ListRequest): Promise<ApiResult<EquipmentItem[]>> {
    try {
      let query = supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true });

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      if (request?.filters?.category) {
        query = query.eq('category', request.filters.category);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as EquipmentItem[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get support tickets
  async getSupportTickets(request?: ListRequest): Promise<ApiResult<SupportTicket[]>> {
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_date', { ascending: false });

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
      }

      if (request?.filters?.priority) {
        query = query.eq('priority', request.filters.priority);
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

      return { data: data as SupportTicket[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create support ticket
  async createSupportTicket(ticketData: {
    title: string;
    description: string;
    category: 'hardware' | 'software' | 'network' | 'av' | 'other';
    priority: 'low' | 'medium' | 'high' | 'critical';
    requester: string;
    equipment_id?: string;
  }): Promise<ApiResult<SupportTicket>> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          status: 'open',
          requester: ticketData.requester,
          equipment_id: ticketData.equipment_id,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as SupportTicket, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update ticket status
  async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed',
    resolutionNotes?: string
  ): Promise<ApiResult<SupportTicket>> {
    try {
      const updateData: any = {
        status,
        updated_date: new Date().toISOString(),
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_date = new Date().toISOString();
        if (resolutionNotes) {
          updateData.resolution_notes = resolutionNotes;
        }
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as SupportTicket, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get maintenance schedule
  async getMaintenanceSchedule(request?: ListRequest): Promise<ApiResult<MaintenanceSchedule[]>> {
    try {
      let query = supabase
        .from('maintenance_schedule')
        .select('*')
        .order('scheduled_date', { ascending: true });

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

      return { data: data as MaintenanceSchedule[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get technical statistics
  async getTechnicalStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'technical-department-id')
        .eq('status', 'approved');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'technical-department-id')
        .eq('status', 'approved')
        .eq('member.status', 'active');

      const { data: equipmentCount } = await supabase
        .from('equipment')
        .select('id', { count: 'exact' });

      const { data: openTickets } = await supabase
        .from('support_tickets')
        .select('id', { count: 'exact' })
        .in('status', ['open', 'in_progress']);

      const upcomingEvents = 2; // Maintenance schedules
      const completedActivities = 156; // Tickets resolved
      const monthlyGrowth = 25;

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
}

export const technicalApi = new TechnicalApiService();
