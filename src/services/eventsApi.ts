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
  status?: 'draft' | 'published' | 'cancelled';
  visibility?: 'public' | 'private';
  metadata?: any;
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

    const record: any = {
      title: payload.title,
      description: payload.description ?? null,
      event_level,
      owner_scope_id,
      district_id,
      branch_id,
      start_at: payload.start_at ?? null,
      end_at: payload.end_at ?? null,
      location: payload.location ?? null,
      capacity: payload.capacity ?? null,
      status: payload.status ?? 'draft',
      visibility: payload.visibility ?? 'public',
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
};

export default eventsApi;
