import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SB_URL');
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY');
const credentialSecret = Deno.env.get('EVENT_CREDENTIAL_SECRET');

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SB_URL or SB_SERVICE_ROLE_KEY');
}
if (!credentialSecret) {
  throw new Error('Missing EVENT_CREDENTIAL_SECRET');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TOKEN_PREFIX = 'ffev1';
const CREDENTIAL_VERSION = 1;
const CREDENTIAL_KEY_VERSION = 1;
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const POST_EVENT_GRACE_SECONDS = 60 * 60 * 24; // 24 hours
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const hmacKeyPromise = crypto.subtle.importKey(
  'raw',
  encoder.encode(credentialSecret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
);

interface CredentialPayloadV1 {
  typ: 'event_registration';
  v: 1;
  kv: number;
  event_id: string;
  registration_id: string;
  member_id: string | null;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  iat: number;
  exp: number;
  nonce: string;
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const fromBase64Url = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const sign = async (body: string) => {
  const key = await hmacKeyPromise;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return toBase64Url(new Uint8Array(signature));
};

const verifySignature = async (body: string, signature: string) => {
  const key = await hmacKeyPromise;
  return crypto.subtle.verify('HMAC', key, fromBase64Url(signature), encoder.encode(body));
};

const generateToken = async (payload: CredentialPayloadV1) => {
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const body = `${TOKEN_PREFIX}.${payloadB64}`;
  const signature = await sign(body);
  return `${body}.${signature}`;
};

const parseAndVerifyToken = async (token: string): Promise<CredentialPayloadV1> => {
  const trimmed = token.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid credential token format.');
  }
  const [prefix, payloadB64, signature] = parts;
  if (prefix !== TOKEN_PREFIX) {
    throw new Error('Invalid credential token prefix.');
  }

  const body = `${prefix}.${payloadB64}`;
  const validSignature = await verifySignature(body, signature);
  if (!validSignature) {
    throw new Error('Credential signature verification failed.');
  }

  const payloadRaw = decoder.decode(fromBase64Url(payloadB64));
  const payload = JSON.parse(payloadRaw) as CredentialPayloadV1;
  if (
    payload.typ !== 'event_registration' ||
    payload.v !== 1 ||
    typeof payload.event_id !== 'string' ||
    typeof payload.registration_id !== 'string'
  ) {
    throw new Error('Invalid credential payload.');
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('Credential has expired.');
  }
  return payload;
};

const hasAnyRole = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  roles: string[]
) => {
  for (const role of roles) {
    const { data, error } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: role,
    } as any);
    if (!error && data) {
      return true;
    }
  }
  return false;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const isJson = (req.headers.get('content-type') || '').includes('application/json');
    const body = (isJson ? await req.json() : {}) as {
      action?: 'issue' | 'verify';
      eventId?: string;
      registrationId?: string;
      token?: string;
    };

    if (!body.action) {
      return new Response(JSON.stringify({ error: 'Missing action.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const supabaseUser = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (body.action === 'issue') {
      if (!body.eventId || !body.registrationId) {
        return new Response(JSON.stringify({ error: 'Missing eventId or registrationId.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const { data: registration, error: registrationError } = await supabaseAdmin
        .from('event_registrations')
        .select('id, event_id, member_id, name, email, status')
        .eq('id', body.registrationId)
        .eq('event_id', body.eventId)
        .maybeSingle();

      if (registrationError || !registration) {
        return new Response(JSON.stringify({ error: 'Registration not found for this event.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const userEmail = (user.email || '').trim().toLowerCase();
      const registrationEmail = (registration.email || '').trim().toLowerCase();
      const ownsRegistration =
        registration.member_id === user.id ||
        (!!userEmail && !!registrationEmail && userEmail === registrationEmail);
      if (!ownsRegistration) {
        return new Response(
          JSON.stringify({ error: 'You cannot issue a credential for this user.' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      let expiresAtEpoch = Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS;
      const { data: eventData } = await supabaseAdmin
        .from('events')
        .select('end_at')
        .eq('id', body.eventId)
        .maybeSingle();
      if (eventData?.end_at) {
        const endMs = new Date(eventData.end_at).getTime();
        if (!Number.isNaN(endMs)) {
          expiresAtEpoch = Math.floor(endMs / 1000) + POST_EVENT_GRACE_SECONDS;
        }
      }

      const nowEpoch = Math.floor(Date.now() / 1000);
      const payload: CredentialPayloadV1 = {
        typ: 'event_registration',
        v: CREDENTIAL_VERSION,
        kv: CREDENTIAL_KEY_VERSION,
        event_id: registration.event_id,
        registration_id: registration.id,
        member_id: registration.member_id,
        status: registration.status,
        iat: nowEpoch,
        exp: Math.max(expiresAtEpoch, nowEpoch + 60),
        nonce: crypto.randomUUID(),
      };
      const token = await generateToken(payload);

      return new Response(
        JSON.stringify({
          token,
          issued_at: new Date(payload.iat * 1000).toISOString(),
          expires_at: new Date(payload.exp * 1000).toISOString(),
          algorithm: 'HS256',
          key_version: CREDENTIAL_KEY_VERSION,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (body.action === 'verify') {
      if (!body.eventId || !body.token) {
        return new Response(JSON.stringify({ error: 'Missing eventId or token.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const canVerify = await hasAnyRole(supabaseAdmin, user.id, [
        'super_admin',
        'district_admin',
        'admin',
        'pastor',
        'leader',
      ]);
      if (!canVerify) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      let payload: CredentialPayloadV1;
      try {
        payload = await parseAndVerifyToken(body.token);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid token.';
        return new Response(JSON.stringify({ error: message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (payload.event_id !== body.eventId) {
        return new Response(JSON.stringify({ error: 'Credential belongs to another event.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const { data: registration, error: registrationError } = await supabaseAdmin
        .from('event_registrations')
        .select('id, event_id, member_id, name, email, status')
        .eq('id', payload.registration_id)
        .eq('event_id', payload.event_id)
        .maybeSingle();

      if (registrationError || !registration) {
        return new Response(JSON.stringify({ error: 'Registration not found for this event.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (registration.status !== 'confirmed') {
        return new Response(
          JSON.stringify({
            error: `Registration status is ${registration.status}. Only confirmed attendees can check in.`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      let attendanceMemberId: string | null = null;
      if (registration.member_id) {
        const { data: memberData } = await supabaseAdmin
          .from('members')
          .select('id')
          .eq('profile_id', registration.member_id)
          .maybeSingle();
        attendanceMemberId = memberData?.id ?? null;
      }

      return new Response(
        JSON.stringify({
          registration,
          attendance_member_id: attendanceMemberId,
          credential: {
            version: payload.v,
            issued_at: new Date(payload.iat * 1000).toISOString(),
            expires_at: new Date(payload.exp * 1000).toISOString(),
          },
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Unsupported action.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
