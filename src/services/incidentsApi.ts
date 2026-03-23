import { supabase } from '@/integrations/supabase/client';

// Helper types from the SQL schema
export type IncidentType = 'medical' | 'security' | 'maintenance' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'dispatched' | 'resolved' | 'false_alarm';

export interface EventIncident {
  id: string;
  event_id: string;
  reporter_id: string | null;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location_details: string;
  description: string;
  assigned_to: string[];
  resolved_at: string | null;
  created_at: string;
  // Payload joined data
  reporter?: { full_name: string } | null;
  assignees?: { id: string; full_name: string }[];
}

export const incidentsApi = {
  /**
   * Report a new incident
   */
  async reportIncident(payload: {
    event_id: string;
    reporter_id?: string;
    type: IncidentType;
    severity?: IncidentSeverity;
    location_details?: string;
    description: string;
  }) {
    const { data, error } = await supabase
      .from('event_incidents')
      .insert({
        event_id: payload.event_id,
        reporter_id: payload.reporter_id || null,
        type: payload.type,
        severity: payload.severity || 'medium',
        location_details: payload.location_details || null,
        description: payload.description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch active incidents for an event
   */
  async getActiveIncidents(eventId: string) {
    const { data, error } = await supabase
      .from('event_incidents')
      .select(
        `
        *,
        reporter:reporter_id (
          full_name
        )
      `
      )
      .eq('event_id', eventId)
      .neq('status', 'resolved')
      .neq('status', 'false_alarm')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  /**
   * Fetch all incidents for a dashboard timeline
   */
  async getAllIncidents(eventId: string) {
    const { data, error } = await supabase
      .from('event_incidents')
      .select(
        `
        *,
        reporter:reporter_id (
          full_name
        )
      `
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  /**
   * Update incident status
   */
  async updateIncidentStatus(incidentId: string, status: IncidentStatus) {
    const updatePayload: any = { status };
    if (status === 'resolved' || status === 'false_alarm') {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('event_incidents')
      .update(updatePayload)
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Assign staff to an incident
   */
  async assignStaff(incidentId: string, staffIds: string[]) {
    const { data, error } = await supabase
      .from('event_incidents')
      .update({
        assigned_to: staffIds,
        status: 'dispatched', // Auto update status when assigning
      })
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
