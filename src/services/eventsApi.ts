import { supabase } from '@/integrations/supabase/client';

export type EventLevel = 'NATIONAL' | 'DISTRICT' | 'BRANCH';

export interface EventPayload {
  title: string;
  description?: string | null;
  event_level: EventLevel;
  owner_scope_id?: string | null;
  branch_id?: string | null;
  district_id?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location?: string | null;
  capacity?: number | null;
  status?: 'draft' | 'published' | 'cancelled' | 'upcoming' | 'active' | 'ended';
  requires_registration?: boolean;
  is_paid?: boolean;
  visibility?: 'public' | 'private';
  registration_fee?: number;
  target_audience?: string;
  metadata?: any;
  active_modules?: string[];
}

export interface EventRecord extends EventPayload {
  id: string;
  organizer_id: string;
  organizer_role?: string | null;
  created_at: string;
  updated_at: string;
}

// Get profile for current user
async function getProfileForCurrentUser() {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id || null;
  if (!uid) return null;
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, branch_id, role')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return profile as any;
}

async function getDistrictIdForDistrictAdmin(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('districts')
    .select('id')
    .eq('head_admin_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as any)?.id ?? null;
}

function isUuid(value?: string | null): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const eventsApi = {
  async getEvents(opts?: {
    level?: EventLevel;
    branchId?: string | null;
    districtId?: string | null;
    upcomingOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let q: any = (supabase as any).from('events').select('*');

    if (opts?.level) q = q.eq('event_level', opts.level);
    if (opts?.branchId) q = q.eq('branch_id', opts.branchId);
    if (opts?.districtId) q = q.eq('district_id', opts.districtId);
    if (opts?.upcomingOnly) q = q.gte('end_at', new Date().toISOString());
    q = q.order('start_at', { ascending: true });

    if (opts?.limit) q = q.limit(opts.limit);
    if (opts?.offset) q = q.range(opts.offset, (opts.offset || 0) + (opts.limit || 100) - 1);

    return q;
  },

  async getEvent(id: string) {
    return (supabase as any).from('events').select('*').eq('id', id).maybeSingle();
  },

  async createEvent(payload: Partial<EventPayload>) {
    const profile = await getProfileForCurrentUser();
    if (!profile) return { error: new Error('Not authenticated') } as any;

    const role = profile.role as string;

    // Auto-assign level and scope based on role
    let event_level: EventLevel = 'BRANCH';
    let owner_scope_id: string | null = profile.branch_id;
    let district_id: string | null = null;
    let branch_id: string | null = profile.branch_id;

    if (role === 'super_admin') {
      event_level = 'NATIONAL';
      owner_scope_id = null;
      branch_id = null;
    } else if (role === 'district_admin') {
      event_level = 'DISTRICT';
      district_id = await getDistrictIdForDistrictAdmin(profile.id);
      owner_scope_id = district_id;
      branch_id = null;
    }

    // Extract date from start_at for the event_date column (legacy column requirement)
    let event_date = null;
    if (payload.start_at) {
      event_date = payload.start_at.split('T')[0]; // Extract YYYY-MM-DD from ISO timestamp
    }

    const record: any = {
      title: payload.title,
      description: payload.description ?? null,
      event_level,
      owner_scope_id,
      district_id,
      branch_id,
      event_date, // Legacy column
      start_at: payload.start_at ?? null,
      end_at: payload.end_at ?? null,
      location: payload.location ?? null,
      capacity: payload.capacity ?? null,
      status: payload.status ?? 'draft',
      requires_registration: payload.requires_registration ?? false,
      is_paid: payload.is_paid ?? false,
      visibility: payload.visibility ?? 'public',
      registration_fee: payload.registration_fee ?? 0,
      target_audience: payload.target_audience ?? 'everyone',
      metadata: payload.metadata ?? null,
      organizer_id: profile.id,
      organizer_role: role,
    };

    return (supabase as any).from('events').insert(record).select().single();
  },

  async updateEvent(id: string, payload: Partial<EventPayload>) {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return { error: new Error('Not authenticated') } as any;

    const record: any = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    // Remove immutable fields to prevent scope escalation
    delete record.event_level;
    delete record.owner_scope_id;

    return (supabase as any).from('events').update(record).eq('id', id).select().single();
  },

  async deleteEvent(id: string) {
    return (supabase as any).from('events').delete().eq('id', id);
  },

  async registerToEvent(eventId: string, memberId?: string) {
    let mid = memberId;
    if (!mid) {
      const { data: userRes } = await supabase.auth.getUser();
      mid = userRes.user?.id || null;
      if (!mid) return { error: new Error('Not authenticated') } as any;
    }
    return (supabase as any)
      .from('event_rsvps')
      .insert({ event_id: eventId, member_id: mid })
      .select()
      .single();
  },

  async unregisterFromEvent(eventId: string, memberId?: string) {
    let mid = memberId;
    if (!mid) {
      const { data: userRes } = await supabase.auth.getUser();
      mid = userRes.user?.id || null;
      if (!mid) return { error: new Error('Not authenticated') } as any;
    }
    return (supabase as any)
      .from('event_rsvps')
      .delete()
      .match({ event_id: eventId, member_id: mid });
  },

  async getEventsForBranch(branchId: string) {
    return (supabase as any)
      .from('events')
      .select('*')
      .eq('branch_id', branchId)
      .order('start_at', { ascending: true });
  },

  async getEventsForDistrict(districtId: string) {
    return (supabase as any)
      .from('events')
      .select('*')
      .eq('district_id', districtId)
      .order('start_at', { ascending: true });
  },

  // Quota Management
  async getEventQuotas(eventId: string) {
    return (supabase as any).from('event_quotas').select('*').eq('event_id', eventId);
  },

  async upsertEventQuota(payload: {
    event_id: string;
    district_id?: string | null;
    branch_id?: string | null;
    target_amount: number;
    notes?: string;
  }) {
    return (supabase as any)
      .from('event_quotas')
      .upsert(payload, {
        onConflict: payload.district_id ? 'event_id, district_id' : 'event_id, branch_id',
      })
      .select()
      .single();
  },

  async deleteEventQuota(id: string) {
    return (supabase as any).from('event_quotas').delete().eq('id', id);
  },

  // Attendance Management
  async recordAttendance(payload: {
    event_id: string;
    session_id?: string;
    member_id?: string | null;
    zone_id?: string | null;
    type: 'in' | 'out';
    method: 'QR' | 'NFC' | 'MANUAL' | 'ID-SCAN';
    metadata?: any;
  }) {
    const now = new Date().toISOString();
    const { data: userRes } = await supabase.auth.getUser();
    const checkedInBy = userRes.user?.id || null;
    const eventZoneId = isUuid(payload.zone_id) ? payload.zone_id : null;
    const memberId = isUuid(payload.member_id || '') ? payload.member_id : null;
    const notes = JSON.stringify({
      method: payload.method,
      session_id: payload.session_id,
      zone_label: payload.zone_id || null,
      metadata: payload.metadata || null,
    });

    if (payload.type === 'in') {
      return (supabase as any)
        .from('event_attendance')
        .insert({
          event_id: payload.event_id,
          member_id: memberId,
          zone_id: eventZoneId,
          status: 'checked_in',
          checked_in_at: now,
          checked_in_by: checkedInBy,
          notes,
        })
        .select()
        .single();
    }

    let latestQuery: any = (supabase as any)
      .from('event_attendance')
      .select('id')
      .eq('event_id', payload.event_id)
      .is('checked_out_at', null)
      .order('checked_in_at', { ascending: false })
      .limit(1);
    latestQuery = memberId
      ? latestQuery.eq('member_id', memberId)
      : latestQuery.is('member_id', null);
    const { data: latest, error: latestError } = await latestQuery.maybeSingle();

    if (latestError) return { data: null, error: latestError };

    if (latest?.id) {
      return (supabase as any)
        .from('event_attendance')
        .update({
          status: 'checked_out',
          checked_out_at: now,
          notes,
        })
        .eq('id', latest.id)
        .select()
        .single();
    }

    return (supabase as any)
      .from('event_attendance')
      .insert({
        event_id: payload.event_id,
        member_id: memberId,
        zone_id: eventZoneId,
        status: 'checked_out',
        checked_in_at: now,
        checked_out_at: now,
        checked_in_by: checkedInBy,
        notes,
      })
      .select()
      .single();
  },

  async getAttendanceLogs(eventId: string, limit = 50) {
    const { data, error } = await (supabase as any)
      .from('event_attendance')
      .select(
        `
        id,
        event_id,
        member_id,
        zone_id,
        status,
        checked_in_at,
        checked_out_at,
        checked_in_by,
        notes,
        member:members(id, full_name),
        zone:event_zones(id, name)
      `
      )
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })
      .limit(limit);

    if (error) return { data: null, error };

    const normalized = (data || []).map((row: any) => {
      let parsedNotes: any = null;
      if (row.notes) {
        try {
          parsedNotes = JSON.parse(row.notes);
        } catch {
          parsedNotes = null;
        }
      }

      const isCheckout = row.status === 'checked_out';
      const timestamp = isCheckout && row.checked_out_at ? row.checked_out_at : row.checked_in_at;

      return {
        ...row,
        type: isCheckout ? 'out' : 'in',
        method: parsedNotes?.method || 'MANUAL',
        timestamp,
        zone_id: row.zone?.name || parsedNotes?.zone_label || row.zone_id || 'Unknown Zone',
        metadata: parsedNotes?.metadata || null,
      };
    });

    return { data: normalized, error: null };
  },
};

export default eventsApi;
