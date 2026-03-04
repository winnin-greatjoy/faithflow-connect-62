import { supabase } from '@/integrations/supabase/client';

export interface IssuedEventCredential {
  token: string;
  issued_at: string;
  expires_at: string;
  algorithm: 'HS256';
  key_version: number;
}

export interface VerifiedEventCredential {
  registration: {
    id: string;
    event_id: string;
    member_id: string | null;
    name: string;
    email: string;
    status: 'confirmed' | 'cancelled' | 'waitlist';
  };
  attendance_member_id: string | null;
  credential: {
    version: number;
    issued_at: string;
    expires_at: string;
  };
}

export const eventCredentialsApi = {
  async issueCredential(payload: { eventId: string; registrationId: string }) {
    const { data, error } = await (supabase as any).functions.invoke('event-credentials', {
      body: {
        action: 'issue',
        eventId: payload.eventId,
        registrationId: payload.registrationId,
      },
    });

    return { data: (data as IssuedEventCredential | null) || null, error };
  },

  async verifyCredential(payload: { token: string; eventId: string }) {
    const { data, error } = await (supabase as any).functions.invoke('event-credentials', {
      body: {
        action: 'verify',
        token: payload.token,
        eventId: payload.eventId,
      },
    });

    return { data: (data as VerifiedEventCredential | null) || null, error };
  },
};

export default eventCredentialsApi;
