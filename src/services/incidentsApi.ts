import { supabase } from '@/integrations/supabase/client';

// Helper types from the SQL schema
export type IncidentType =
  | 'medical'
  | 'security'
  | 'maintenance'
  | 'fire'
  | 'crowd_control'
  | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'dispatched' | 'resolved' | 'false_alarm';
export type ResponderStatus = 'assigned' | 'en_route' | 'arrived' | 'completed';

export interface IncidentReporter {
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface IncidentStaff {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  profile_photo?: string;
  skills?: string[];
}

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
  reporter?: IncidentReporter | null;
  responders?: IncidentResponder[];
}

export interface IncidentResponder {
  id: string;
  incident_id: string;
  staff_id: string;
  status: ResponderStatus;
  assigned_at: string;
  en_route_at?: string;
  arrived_at?: string;
  completed_at?: string;
  staff?: IncidentStaff;
}

export const incidentsApi = {
  /**
   * Fetch activity logs for an incident
   */
  async getIncidentLogs(incidentId: string) {
    const { data, error } = await (supabase as any)
      .from('event_incident_logs')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Add a log entry for an incident
   */
  async addLog(incidentId: string, action: string, details?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await (supabase as any).from('event_incident_logs').insert({
      incident_id: incidentId,
      action,
      details,
      actor_id: user?.id,
    });
    if (error) console.error('Logging failed:', error);
  },

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
    const { data, error } = await (supabase as any)
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

    // Log the report
    this.addLog(
      data.id,
      'reported',
      `Incident reported at ${payload.location_details || 'unknown location'}`
    );

    return data;
  },

  /**
   * Alias for getActiveIncidents (backward compatibility)
   */
  async getAllIncidents(eventId: string) {
    return this.getActiveIncidents(eventId);
  },

  /**
   * Fetch active incidents for an event with responders and logs
   */
  async getActiveIncidents(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('event_incidents')
      .select(
        `
        *,
        reporter:reporter_id (
          *
        ),
        responders:event_incident_responders(
          *,
          staff:staff_id(*)
        ),
        logs:event_incident_logs(*)
      `
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  /**
   * Backward compatibility alias for assignResponder or bulk assignment
   */
  async assignStaff(incidentId: string, staffIds: string | string[]) {
    const ids = Array.isArray(staffIds) ? staffIds : [staffIds];

    // Update the legacy array field
    const { error } = await (supabase as any)
      .from('event_incidents')
      .update({
        assigned_to: ids,
        status: 'dispatched',
      })
      .eq('id', incidentId);

    if (error) throw error;

    // Ensure the latest responder is also in the new relationship table
    const latestStaffId = ids[ids.length - 1];
    if (latestStaffId) {
      await this.assignResponder(incidentId, latestStaffId);
    }

    return true;
  },

  /**
   * Assign a responder to an incident (New Relationship Table)
   */
  async assignResponder(incidentId: string, staffId: string) {
    // Create responder entry in the specialized table
    const { error: respError } = await (supabase as any).from('event_incident_responders').upsert(
      {
        incident_id: incidentId,
        staff_id: staffId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      },
      { onConflict: 'incident_id,staff_id' }
    );

    if (respError) throw respError;

    // Log assignment
    this.addLog(incidentId, 'dispatched', `Staff member assigned to incident`);

    // Update parent incident status to 'dispatched'
    const { error: statusError } = await (supabase as any)
      .from('event_incidents')
      .update({ status: 'dispatched' })
      .eq('id', incidentId)
      .eq('status', 'open'); // Only update if it's currently open

    if (statusError) {
      console.warn('Failed to update incident status to dispatched:', statusError);
    }

    return true;
  },

  /**
   * Update responder status and notes
   */
  async updateResponderStatus(responderId: string, status: ResponderStatus, notes?: string) {
    const updatePayload: any = { status };
    if (notes) updatePayload.notes = notes;
    if (status === 'en_route') updatePayload.en_route_at = new Date().toISOString();
    if (status === 'arrived') updatePayload.arrived_at = new Date().toISOString();
    if (status === 'completed') updatePayload.completed_at = new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from('event_incident_responders')
      .update(updatePayload)
      .eq('id', responderId)
      .select()
      .single();

    if (error) throw error;

    // Log responder status change
    this.addLog(data.incident_id, status, `Responder status updated to ${status}`);
    if (notes) this.addLog(data.incident_id, 'note_added', `Note: ${notes}`);

    return data;
  },

  /**
   * Update incident status (toplevel)
   */
  async updateIncidentStatus(incidentId: string, status: IncidentStatus) {
    const updatePayload: any = { status };
    if (status === 'resolved' || status === 'false_alarm') {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { data, error } = await (supabase as any)
      .from('event_incidents')
      .update(updatePayload)
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw error;

    // Log resolution
    this.addLog(incidentId, status, `Incident marked as ${status}`);

    return data;
  },
};
