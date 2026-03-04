import { describe, expect, it } from 'vitest';
import {
  buildEventRegistrationCredential,
  encodeEventRegistrationCredential,
  parseEventRegistrationCredential,
  isCredentialForEvent,
  isSignedEventCredentialToken,
} from './CredentialGenerator';

describe('CredentialGenerator', () => {
  it('encodes and parses v1 event registration credentials', () => {
    const credential = buildEventRegistrationCredential({
      event_id: 'event-123',
      registration_id: 'reg-456',
      member_id: 'member-789',
      name: 'John Doe',
      status: 'confirmed',
      issued_at: '2026-03-02T12:00:00.000Z',
    });

    const encoded = encodeEventRegistrationCredential(credential);
    const parsed = parseEventRegistrationCredential(encoded);

    expect(parsed.error).toBeNull();
    expect(parsed.credential).toEqual(credential);
  });

  it('accepts legacy payload shape with event_id and registration_id', () => {
    const legacyPayload = JSON.stringify({
      event_id: 'event-legacy',
      registration_id: 'reg-legacy',
      name: 'Legacy User',
      status: 'confirmed',
    });

    const parsed = parseEventRegistrationCredential(legacyPayload);

    expect(parsed.error).toBeNull();
    expect(parsed.credential?.event_id).toBe('event-legacy');
    expect(parsed.credential?.registration_id).toBe('reg-legacy');
    expect(parsed.credential?.name).toBe('Legacy User');
    expect(parsed.credential?.t).toBe('event_registration');
    expect(parsed.credential?.v).toBe(1);
  });

  it('rejects invalid payloads', () => {
    const parsed = parseEventRegistrationCredential('not-json');

    expect(parsed.credential).toBeNull();
    expect(parsed.error).toBeTruthy();
  });

  it('checks event scope correctly', () => {
    const credential = buildEventRegistrationCredential({
      event_id: 'event-scope',
      registration_id: 'reg-scope',
    });

    expect(isCredentialForEvent(credential, 'event-scope')).toBe(true);
    expect(isCredentialForEvent(credential, 'event-other')).toBe(false);
  });

  it('detects signed credential token format', () => {
    expect(isSignedEventCredentialToken('ffev1.abc_DEF-123.sig_456')).toBe(true);
    expect(isSignedEventCredentialToken('{"event_id":"x"}')).toBe(false);
  });
});
