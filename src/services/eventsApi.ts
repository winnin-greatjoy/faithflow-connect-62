import { supabase } from '@/integrations/supabase/client';
import { useAuthz } from '@/hooks/useAuthz';

// Minimal types for the service responses/payloads
export type Scope = 'local' | 'district' | 'national';

export interface EventPayload {
  title: string;
  description?: string | null;
  scope?: Scope | string; // incoming from UI (may be TitleCase)
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

// Utility: normalize scope to lowercase DB enum values
const normalizeScope = (s?: string | Scope | null): Scope => {
  if (!s) return 'local';
  const v = String(s).toLowerCase();
  if (v === 'national') return 'national';
  if (v === 'district') return 'district';
  return 'local';
};

// Get profile for current user
async function getProfileForCurrentUser() {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id || null;
  if (!uid) return null;
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, branch_id, district_id, role')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return profile as any;
}

export const eventsApi = {
  async getEvents(opts?: {
    scope?: Scope | string;
    branchId?: string | null;
    districtId?: string | null;
    upcomingOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let q: any = supabase.from('events').select('*');

    if (opts?.scope) q = q.eq('scope', normalizeScope(opts.scope));
    if (opts?.branchId) q = q.eq('branch_id', opts.branchId);
    if (opts?.districtId) q = q.eq('district_id', opts.districtId);
    if (opts?.upcomingOnly) q = q.gte('end_at', new Date().toISOString());
    q = q.order('start_at', { ascending: true });

    if (opts?.limit) q = q.limit(opts.limit);
    if (opts?.offset) q = q.range(opts.offset, (opts.offset || 0) + (opts.limit || 100) - 1);

    return q;
  },

  async getEvent(id: string) {
    return supabase.from('events').select('*').eq('id', id).maybeSingle();
  },

  async createEvent(payload: EventPayload) {
    // fetch current profile to ensure we populate branch/district from server side
    const profile = await getProfileForCurrentUser();
    if (!profile) return { error: new Error('Not authenticated') } as any;

    const role = profile.role as string;
    const allowedScope: Scope =
      role === 'super_admin' ? 'national' : role === 'district_admin' ? 'district' : 'local';

    // Normalize incoming scope but enforce allowedScope for non-superadmins
    const requested = normalizeScope(payload.scope);
    const finalScope: Scope = role === 'super_admin' ? requested : allowedScope;

    const record: any = {
      title: payload.title,
      description: payload.description ?? null,
      scope: finalScope,
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

    // Attach branch/district ids according to finalScope
    if (finalScope === 'local') {
      record.branch_id = profile.branch_id ?? payload.branch_id ?? null;
    } else if (finalScope === 'district') {
      record.district_id = profile.district_id ?? payload.district_id ?? null;
    }

    return supabase.from('events').insert(record).select().single();
  },

  async updateEvent(id: string, payload: Partial<EventPayload>) {
    const profile = await getProfileForCurrentUser();
    if (!profile) return { error: new Error('Not authenticated') } as any;
    const role = profile.role as string;
    const allowedScope: Scope =
      role === 'super_admin' ? 'national' : role === 'district_admin' ? 'district' : 'local';

    const requested = normalizeScope(payload.scope);
    const finalScope: Scope = role === 'super_admin' ? requested : allowedScope;

    const updatePayload: any = { ...payload };
    updatePayload.scope = finalScope;

    if (finalScope === 'local') {
      updatePayload.branch_id = profile.branch_id ?? payload.branch_id ?? null;
      updatePayload.district_id = null;
    } else if (finalScope === 'district') {
      updatePayload.district_id = profile.district_id ?? payload.district_id ?? null;
      updatePayload.branch_id = null;
    } else {
      updatePayload.branch_id = null;
      updatePayload.district_id = null;
    }

    return supabase.from('events').update(updatePayload).eq('id', id).select().single();
  },

  async deleteEvent(id: string) {
    return supabase.from('events').delete().eq('id', id);
  },

  async registerToEvent(eventId: string, memberId?: string) {
    // If memberId not provided, assume current user
    let mid = memberId;
    if (!mid) {
      const { data: userRes } = await supabase.auth.getUser();
      mid = userRes.user?.id || null;
      if (!mid) return { error: new Error('Not authenticated') } as any;
    }
    const result = supabase
      .from('event_participants' as any)
      .insert({ event_id: eventId, member_id: mid })
      .select()
      .single();
    return result;
  },

  async unregisterFromEvent(eventId: string, memberId?: string) {
    let mid = memberId;
    if (!mid) {
      const { data: userRes } = await supabase.auth.getUser();
      mid = userRes.user?.id || null;
      if (!mid) return { error: new Error('Not authenticated') } as any;
    }
    const result = supabase
      .from('event_participants' as any)
      .delete()
      .match({ event_id: eventId, member_id: mid });
    return result;
  },

  async getEventsForBranch(branchId: string) {
    const result = (supabase as any)
      .from('events')
      .select('*')
      .eq('branch_id', branchId)
      .order('start_at', { ascending: true });
    return result;
  },

  async getEventsForDistrict(districtId: string) {
    const result = (supabase as any)
      .from('events')
      .select('*')
      .eq('district_id', districtId)
      .order('start_at', { ascending: true });
    return result;
  },
};

export default eventsApi;
