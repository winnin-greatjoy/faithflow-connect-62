export const generateCredentialId = (eventId: string, personId: string): string => {
  // In a real app, this would be a signed JWT or a hash from the server.
  // For now, we simulate a secure token structure.
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TCKT-${eventId.substring(0, 4).toUpperCase()}-${timestamp}-${random}`;
};

export const generateQRCodeData = (credentialId: string): string => {
  return JSON.stringify({
    t: 'event_ticket',
    id: credentialId,
    v: 1,
  });
};

export interface EventRegistrationCredentialV1 {
  t: 'event_registration';
  v: 1;
  event_id: string;
  registration_id: string;
  member_id?: string | null;
  name?: string;
  status?: string;
  issued_at: string;
}

export const EVENT_SIGNED_CREDENTIAL_PREFIX = 'ffev1';

interface LegacyEventRegistrationCredential {
  event_id?: string | null;
  registration_id?: string | null;
  member_id?: string | null;
  name?: string;
  status?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const buildEventRegistrationCredential = (payload: {
  event_id: string;
  registration_id: string;
  member_id?: string | null;
  name?: string;
  status?: string;
  issued_at?: string;
}): EventRegistrationCredentialV1 => ({
  t: 'event_registration',
  v: 1,
  event_id: payload.event_id,
  registration_id: payload.registration_id,
  member_id: payload.member_id ?? null,
  name: payload.name,
  status: payload.status,
  issued_at: payload.issued_at || new Date().toISOString(),
});

export const encodeEventRegistrationCredential = (
  credential: EventRegistrationCredentialV1
): string => JSON.stringify(credential);

export const parseEventRegistrationCredential = (
  rawPayload: string
): { credential: EventRegistrationCredentialV1 | null; error: string | null } => {
  try {
    const parsed = JSON.parse(rawPayload);
    if (!isRecord(parsed)) {
      return { credential: null, error: 'QR payload must be a JSON object.' };
    }

    if (
      parsed.t === 'event_registration' &&
      parsed.v === 1 &&
      typeof parsed.event_id === 'string' &&
      typeof parsed.registration_id === 'string'
    ) {
      return {
        credential: buildEventRegistrationCredential({
          event_id: parsed.event_id,
          registration_id: parsed.registration_id,
          member_id: typeof parsed.member_id === 'string' ? parsed.member_id : null,
          name: typeof parsed.name === 'string' ? parsed.name : undefined,
          status: typeof parsed.status === 'string' ? parsed.status : undefined,
          issued_at: typeof parsed.issued_at === 'string' ? parsed.issued_at : undefined,
        }),
        error: null,
      };
    }

    const legacy = parsed as LegacyEventRegistrationCredential;
    if (
      typeof legacy.event_id === 'string' &&
      legacy.event_id &&
      typeof legacy.registration_id === 'string' &&
      legacy.registration_id
    ) {
      return {
        credential: buildEventRegistrationCredential({
          event_id: legacy.event_id,
          registration_id: legacy.registration_id,
          member_id: typeof legacy.member_id === 'string' ? legacy.member_id : null,
          name: typeof legacy.name === 'string' ? legacy.name : undefined,
          status: typeof legacy.status === 'string' ? legacy.status : undefined,
        }),
        error: null,
      };
    }

    return { credential: null, error: 'QR payload is missing event or registration identifiers.' };
  } catch {
    return { credential: null, error: 'Invalid QR payload format.' };
  }
};

export const isCredentialForEvent = (
  credential: EventRegistrationCredentialV1,
  eventId: string
): boolean => credential.event_id === eventId;

export const isSignedEventCredentialToken = (value: string): boolean =>
  new RegExp(`^${EVENT_SIGNED_CREDENTIAL_PREFIX}\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$`).test(
    value.trim()
  );

export const getTicketColorStrength = (role: string): string => {
  switch (role) {
    case 'VOLUNTEER':
      return 'bg-blue-600';
    case 'STAFF':
      return 'bg-purple-600';
    case 'SPEAKER':
      return 'bg-amber-500';
    default:
      return 'bg-black'; // Standard attendee
  }
};
