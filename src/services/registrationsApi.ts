import { supabase } from '@/integrations/supabase/client';

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  payment_status: 'pending' | 'paid' | 'not_required' | 'partially_paid' | 'refunded';
  amount_paid: number;
  registered_at: string;
  cancelled_at?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrationPayload {
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  metadata?: any;
}

export const registrationsApi = {
  /**
   * Register for an event
   */
  async registerForEvent(payload: CreateRegistrationPayload, options?: { fee?: number }) {
    const { data: user } = await supabase.auth.getUser();

    const record: any = {
      event_id: payload.event_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      metadata: payload.metadata || null,
      member_id: user.user?.id || null,
      status: 'confirmed',
      payment_status: options?.fee && options.fee > 0 ? 'pending' : 'not_required',
      amount_paid: 0,
    };

    return (supabase as any).from('event_registrations').insert(record).select().single();
  },

  /**
   * Get all registrations for an event (admin/organizer only)
   */
  async getEventRegistrations(eventId: string) {
    return (supabase as any)
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });
  },

  /**
   * Get registration count for an event
   */
  async getRegistrationCount(eventId: string) {
    const { count, error } = await (supabase as any)
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    return { count, error };
  },

  /**
   * Get current user's registrations
   */
  async getMyRegistrations() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: [], error: new Error('Not authenticated') };

    return (supabase as any)
      .from('event_registrations')
      .select('*, events(*)')
      .eq('member_id', user.user.id)
      .order('registered_at', { ascending: false });
  },

  /**
   * Check if user is registered for an event
   */
  async isRegistered(eventId: string, email: string) {
    return (supabase as any)
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('email', email)
      .maybeSingle();
  },

  /**
   * Cancel a registration
   */
  async cancelRegistration(registrationId: string) {
    return (supabase as any)
      .from('event_registrations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single();
  },

  /**
   * Update registration status (admin only)
   */
  async updateRegistrationStatus(
    registrationId: string,
    status: 'confirmed' | 'cancelled' | 'waitlist'
  ) {
    const updates: any = { status };
    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    return (supabase as any)
      .from('event_registrations')
      .update(updates)
      .eq('id', registrationId)
      .select()
      .single();
  },

  /**
   * Delete a registration (admin only)
   */
  async deleteRegistration(registrationId: string) {
    return (supabase as any).from('event_registrations').delete().eq('id', registrationId);
  },

  /**
   * Update payment status (admin only)
   */
  async updatePaymentStatus(registrationId: string, status: string, amount?: number) {
    const updates: any = { payment_status: status };
    if (amount !== undefined) updates.amount_paid = amount;

    return (supabase as any)
      .from('event_registrations')
      .update(updates)
      .eq('id', registrationId)
      .select()
      .single();
  },

  /**
   * Check if user is eligible for an event
   */
  async checkEligibility(eventId: string) {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return { eligible: true, reason: 'Guest' }; // Guests handled by public visibility check

    const { data: event } = await (supabase as any)
      .from('events')
      .select('target_audience, visibility')
      .eq('id', eventId)
      .single();

    if (!event) return { eligible: false, reason: 'Event not found' };
    if (event.target_audience === 'everyone') return { eligible: true };

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role, is_baptized')
      .eq('id', userRes.user.id)
      .single();

    if (!profile) return { eligible: false, reason: 'Profile not found' };

    if (event.target_audience === 'baptized_members' && !profile.is_baptized) {
      return { eligible: false, reason: 'This event is for baptized members only' };
    }

    if (
      event.target_audience === 'leaders_only' &&
      !['super_admin', 'admin', 'pastor', 'leader'].includes(profile.role)
    ) {
      return { eligible: false, reason: 'This event is for leaders only' };
    }

    if (
      event.target_audience === 'workers_and_leaders' &&
      !['super_admin', 'admin', 'pastor', 'leader', 'worker'].includes(profile.role)
    ) {
      return { eligible: false, reason: 'This event is for workers and leaders only' };
    }

    return { eligible: true };
  },
};

export default registrationsApi;
