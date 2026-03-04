import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CheckInConsole } from './CheckInConsole';

const mockUseParams = vi.fn();
const mockUseMembers = vi.fn();
const mockRecordAttendance = vi.fn();
const mockResolveRegistrationForCheckIn = vi.fn();
const mockVerifyCredential = vi.fn();
const mockGetZones = vi.fn();
const mockCreateZone = vi.fn();
const mockUpdateZone = vi.fn();
const mockDeleteZone = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

vi.mock('@/modules/members/hooks/useMembers', () => ({
  useMembers: (...args: unknown[]) => mockUseMembers(...args),
}));

vi.mock('@/modules/events/hooks/useAttendanceSync', () => ({
  useAttendanceSync: () => ({
    bufferSize: 0,
    isOnline: true,
    isSyncing: false,
    recordAttendance: (...args: unknown[]) => mockRecordAttendance(...args),
  }),
}));

vi.mock('@/services/eventsApi', () => ({
  default: {
    resolveRegistrationForCheckIn: (...args: unknown[]) =>
      mockResolveRegistrationForCheckIn(...args),
  },
}));

vi.mock('@/services/eventCredentialsApi', () => ({
  default: {
    verifyCredential: (...args: unknown[]) => mockVerifyCredential(...args),
  },
}));

vi.mock('@/services/eventModulesApi', () => ({
  attendanceApi: {
    getZones: (...args: unknown[]) => mockGetZones(...args),
    createZone: (...args: unknown[]) => mockCreateZone(...args),
    updateZone: (...args: unknown[]) => mockUpdateZone(...args),
    deleteZone: (...args: unknown[]) => mockDeleteZone(...args),
  },
}));

vi.mock('./PersonDetailDrawer', () => ({
  PersonDetailDrawer: () => null,
}));

describe('CheckInConsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ eventId: 'event-1' });
    mockUseMembers.mockReturnValue({ members: [], loading: false });
    mockRecordAttendance.mockResolvedValue({ success: true, offline: false });
    mockResolveRegistrationForCheckIn.mockResolvedValue({
      data: {
        registration: {
          id: 'reg-1',
          event_id: 'event-1',
          member_id: 'profile-1',
          name: 'Guest One',
          email: 'guest1@example.com',
          status: 'confirmed',
        },
        attendance_member_id: 'member-1',
      },
      error: null,
    });
    mockVerifyCredential.mockResolvedValue({
      data: {
        registration: {
          id: 'reg-1',
          event_id: 'event-1',
          member_id: 'profile-1',
          name: 'Guest One',
          email: 'guest1@example.com',
          status: 'confirmed',
        },
        attendance_member_id: 'member-1',
        credential: {
          version: 1,
          issued_at: '2026-03-02T20:00:00.000Z',
          expires_at: '2026-03-03T20:00:00.000Z',
        },
      },
      error: null,
    });
    mockGetZones.mockResolvedValue([]);
    mockCreateZone.mockResolvedValue({
      id: 'zone-new',
      event_id: 'event-1',
      name: 'New Zone',
      capacity: 100,
      current_occupancy: 0,
      zone_type: 'ENTRY',
      created_at: new Date().toISOString(),
    });
    mockUpdateZone.mockResolvedValue({
      id: 'zone-1',
      event_id: 'event-1',
      name: 'Updated Zone',
      capacity: 333,
      current_occupancy: 0,
      zone_type: 'HALL',
      created_at: new Date().toISOString(),
    });
    mockDeleteZone.mockResolvedValue(undefined);
  });

  it('processes a valid QR credential and records attendance', async () => {
    render(<CheckInConsole />);

    fireEvent.change(screen.getByPlaceholderText(/paste scanned qr payload/i), {
      target: {
        value: JSON.stringify({
          t: 'event_registration',
          v: 1,
          event_id: 'event-1',
          registration_id: 'reg-1',
          issued_at: '2026-03-02T20:00:00.000Z',
        }),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /validate qr data/i }));

    await waitFor(() =>
      expect(mockResolveRegistrationForCheckIn).toHaveBeenCalledWith({
        event_id: 'event-1',
        registration_id: 'reg-1',
      })
    );
    await waitFor(() => expect(mockRecordAttendance).toHaveBeenCalledTimes(1));
    expect(mockRecordAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: 'event-1',
        member_id: 'member-1',
        method: 'QR',
        metadata: expect.objectContaining({
          registration_id: 'reg-1',
          attendee_name: 'Guest One',
          credential_type: 'event_registration',
          credential_version: 1,
        }),
      })
    );
    expect(await screen.findByText(/check-in successful\. welcome!/i)).toBeInTheDocument();
  });

  it('rejects QR payloads from another event', async () => {
    render(<CheckInConsole />);

    fireEvent.change(screen.getByPlaceholderText(/paste scanned qr payload/i), {
      target: {
        value: JSON.stringify({
          t: 'event_registration',
          v: 1,
          event_id: 'event-2',
          registration_id: 'reg-1',
          issued_at: '2026-03-02T20:00:00.000Z',
        }),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /validate qr data/i }));

    await waitFor(() => {
      expect(mockResolveRegistrationForCheckIn).not.toHaveBeenCalled();
      expect(mockRecordAttendance).not.toHaveBeenCalled();
    });
    expect(await screen.findByText(/belongs to another event/i)).toBeInTheDocument();
  });

  it('verifies signed credential tokens via backend', async () => {
    render(<CheckInConsole />);

    fireEvent.change(screen.getByPlaceholderText(/paste scanned qr payload/i), {
      target: {
        value: 'ffev1.abc_DEF-123.sig_456',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /validate qr data/i }));

    await waitFor(() =>
      expect(mockVerifyCredential).toHaveBeenCalledWith({
        token: 'ffev1.abc_DEF-123.sig_456',
        eventId: 'event-1',
      })
    );
    expect(mockResolveRegistrationForCheckIn).not.toHaveBeenCalled();
    expect(mockRecordAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          credential_type: 'event_registration_signed',
          credential_signed: true,
        }),
      })
    );
  });

  it('blocks duplicate scans within throttle window', async () => {
    render(<CheckInConsole />);
    const payload = JSON.stringify({
      t: 'event_registration',
      v: 1,
      event_id: 'event-1',
      registration_id: 'reg-1',
      issued_at: '2026-03-02T20:00:00.000Z',
    });

    fireEvent.change(screen.getByPlaceholderText(/paste scanned qr payload/i), {
      target: { value: payload },
    });
    fireEvent.click(screen.getByRole('button', { name: /validate qr data/i }));
    await waitFor(() => expect(mockRecordAttendance).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText(/paste scanned qr payload/i), {
      target: { value: payload },
    });
    fireEvent.click(screen.getByRole('button', { name: /validate qr data/i }));

    await waitFor(() => {
      expect(mockResolveRegistrationForCheckIn).toHaveBeenCalledTimes(2);
      expect(mockRecordAttendance).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText(/duplicate scan blocked/i)).toBeInTheDocument();
  });

  it('shows unsupported message when camera scanner is unavailable', async () => {
    render(<CheckInConsole />);

    fireEvent.click(screen.getByRole('button', { name: /start camera/i }));

    expect(await screen.findByText(/camera scanning is not supported/i)).toBeInTheDocument();
    expect(screen.getByText('UNSUPPORTED')).toBeInTheDocument();
  });

  it('creates and selects a new zone from manage zones panel', async () => {
    render(<CheckInConsole />);

    fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    fireEvent.change(screen.getByPlaceholderText(/zone name/i), {
      target: { value: 'North Gate' },
    });
    fireEvent.change(screen.getByPlaceholderText(/capacity/i), {
      target: { value: '250' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create zone/i }));

    await waitFor(() =>
      expect(mockCreateZone).toHaveBeenCalledWith(
        expect.objectContaining({
          event_id: 'event-1',
          name: 'North Gate',
          capacity: 250,
        })
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/active zone selector/i)).toHaveValue('zone-new')
    );
  });

  it('edits an existing zone from manage zones panel', async () => {
    mockGetZones.mockResolvedValueOnce([
      {
        id: 'zone-1',
        event_id: 'event-1',
        name: 'South Gate',
        capacity: 150,
        current_occupancy: 0,
        zone_type: 'ENTRY',
        created_at: new Date().toISOString(),
      },
    ]);

    render(<CheckInConsole />);

    fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    await screen.findByRole('button', { name: /edit/i });
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByPlaceholderText(/edit zone name/i), {
      target: { value: 'Updated Zone' },
    });
    fireEvent.change(screen.getByPlaceholderText(/edit capacity/i), {
      target: { value: '333' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(mockUpdateZone).toHaveBeenCalledWith(
        'zone-1',
        expect.objectContaining({
          name: 'Updated Zone',
          capacity: 333,
          zone_type: 'ENTRY',
        })
      )
    );
  });

  it('deletes an existing zone from manage zones panel', async () => {
    const previousConfirm = (window as any).confirm;
    (window as any).confirm = vi.fn(() => true);
    mockGetZones.mockResolvedValueOnce([
      {
        id: 'zone-1',
        event_id: 'event-1',
        name: 'South Gate',
        capacity: 150,
        current_occupancy: 0,
        zone_type: 'ENTRY',
        created_at: new Date().toISOString(),
      },
    ]);

    render(<CheckInConsole />);

    await screen.findByRole('option', { name: 'South Gate' });
    const selector = screen.getByLabelText(/active zone selector/i);
    fireEvent.change(selector, { target: { value: 'zone-1' } });
    fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(mockDeleteZone).toHaveBeenCalledWith('zone-1'));
    await waitFor(() =>
      expect(screen.getByLabelText(/active zone selector/i)).toHaveValue('zone-main')
    );
    (window as any).confirm = previousConfirm;
  });
});
