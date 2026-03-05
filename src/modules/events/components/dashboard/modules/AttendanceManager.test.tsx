import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AttendanceManagerModule } from './AttendanceManager';

// Mock authz
const mockHasRole = vi.fn((..._roles: string[]) => true);
const mockCan = vi.fn(() => true);
vi.mock('@/hooks/useAuthz', () => ({
  useAuthz: () => ({
    loading: false,
    userId: 'test-user-id',
    branchId: 'test-branch-id',
    roles: ['admin'],
    hasRole: mockHasRole,
    can: mockCan,
  }),
}));

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((cb: any) => { cb?.('SUBSCRIBED'); return {} as any; }),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock attendance API
vi.mock('@/services/eventModulesApi', () => ({
  attendanceApi: {
    getZones: vi.fn().mockResolvedValue([]),
    getAttendance: vi.fn().mockResolvedValue([]),
    createZone: vi.fn().mockResolvedValue({ id: 'z1', name: 'Test Zone' }),
    updateZone: vi.fn().mockResolvedValue({}),
    deleteZone: vi.fn().mockResolvedValue(undefined),
    updateZoneOccupancy: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/services/eventsApi', () => ({
  eventsApi: {
    getAttendanceLogs: vi.fn().mockResolvedValue({ data: [], error: null }),
    recordAttendance: vi.fn().mockResolvedValue({ data: {}, error: null }),
    resolveRegistrationForCheckIn: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  default: {
    getAttendanceLogs: vi.fn().mockResolvedValue({ data: [], error: null }),
    recordAttendance: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
}));

// Mock members hook
vi.mock('@/modules/members/hooks/useMembers', () => ({
  useMembers: () => ({
    members: [],
    isLoading: false,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useAttendanceSync
vi.mock('@/modules/events/hooks/useAttendanceSync', () => ({
  useAttendanceSync: () => ({
    isOnline: true,
    bufferSize: 0,
    isSyncing: false,
    recordAttendance: vi.fn().mockResolvedValue({ success: true }),
    syncNow: vi.fn(),
  }),
}));

const renderWithRouter = (eventId = 'test-event-123') => {
  return render(
    <MemoryRouter initialEntries={[`/admin/events/${eventId}`]}>
      <Routes>
        <Route
          path="/admin/events/:eventId"
          element={
            <AttendanceManagerModule
              event={{ id: eventId, title: 'Test Event' }}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('AttendanceManagerModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header and navigation tabs', () => {
    renderWithRouter();
    expect(screen.getByText('Attendance Ops')).toBeInTheDocument();
    expect(screen.getByText('Check-In Console')).toBeInTheDocument();
    expect(screen.getByText('Zone Monitor')).toBeInTheDocument();
    expect(screen.getByText('Presence Logs')).toBeInTheDocument();
  });

  it('renders the Dispatch button and it is clickable', () => {
    renderWithRouter();
    const dispatchButtons = screen.getAllByText('Dispatch');
    expect(dispatchButtons.length).toBeGreaterThan(0);
    // Should not throw when clicked
    fireEvent.click(dispatchButtons[0]);
  });

  it('renders the Kiosk Mode button', () => {
    renderWithRouter();
    expect(screen.getByText('Kiosk Mode')).toBeInTheDocument();
  });

  it('renders session info and date', () => {
    renderWithRouter();
    expect(screen.getByText('Morning Service')).toBeInTheDocument();
    expect(screen.getByText('LIVE Sync Active')).toBeInTheDocument();
  });

  it('switches tabs when clicked', async () => {
    renderWithRouter();

    const monitorTab = screen.getByText('Zone Monitor');
    fireEvent.click(monitorTab);

    await waitFor(() => {
      // The Zone Monitor tab should now be active (contains zone monitor content)
      expect(screen.getByText('Zone Occupancy')).toBeInTheDocument();
    });
  });

  it('disables actions when user lacks permissions', () => {
    mockCan.mockReturnValue(false);
    mockHasRole.mockReturnValue(false);

    renderWithRouter();

    const kioskBtn = screen.getByText('Kiosk Mode');
    expect(kioskBtn).toBeDisabled();
  });

  it('shows export button', () => {
    renderWithRouter();
    const exportBtn = screen.getByLabelText('Export attendance');
    expect(exportBtn).toBeInTheDocument();
  });
});
