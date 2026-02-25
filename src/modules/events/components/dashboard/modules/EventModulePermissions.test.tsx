import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueueManagerModule } from './QueueManager';
import { RosterManagerModule } from './RosterManager';
import { RegistrationManagerModule } from './RegistrationManager';

const mockUseParams = vi.fn();
const mockUseAuthz = vi.fn();
const mockUseQueues = vi.fn();
const mockUseCreateQueue = vi.fn();
const mockUseUpdateQueue = vi.fn();
const mockUseCallNextInQueue = vi.fn();
const mockUseUpdateTicketStatus = vi.fn();
const mockUseJoinQueue = vi.fn();
const mockUseEventShifts = vi.fn();
const mockUseCreateShift = vi.fn();
const mockUseAssignVolunteer = vi.fn();
const mockUseMembers = vi.fn();
const mockUseAdminContext = vi.fn();
const mockToastError = vi.fn();
const mockToastInfo = vi.fn();
const mockToastSuccess = vi.fn();
const mockUseToast = vi.fn();
const mockGetEventRegistrations = vi.fn();
const mockUpdateRegistrationStatus = vi.fn();
const mockDeleteRegistration = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

vi.mock('@/hooks/useAuthz', () => ({
  useAuthz: () => mockUseAuthz(),
}));

vi.mock('@/hooks/useEventModules', () => ({
  useQueues: () => mockUseQueues(),
  useCreateQueue: () => mockUseCreateQueue(),
  useUpdateQueue: () => mockUseUpdateQueue(),
  useCallNextInQueue: () => mockUseCallNextInQueue(),
  useUpdateTicketStatus: () => mockUseUpdateTicketStatus(),
  useJoinQueue: () => mockUseJoinQueue(),
  useEventShifts: () => mockUseEventShifts(),
  useCreateShift: () => mockUseCreateShift(),
  useAssignVolunteer: () => mockUseAssignVolunteer(),
}));

vi.mock('@/modules/members/hooks/useMembers', () => ({
  useMembers: () => mockUseMembers(),
}));

vi.mock('@/context/AdminContext', () => ({
  useAdminContext: () => mockUseAdminContext(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    info: (...args: unknown[]) => mockToastInfo(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => mockUseToast(),
}));

vi.mock('@/services/registrationsApi', () => ({
  default: {
    getEventRegistrations: (...args: unknown[]) => mockGetEventRegistrations(...args),
    updateRegistrationStatus: (...args: unknown[]) => mockUpdateRegistrationStatus(...args),
    deleteRegistration: (...args: unknown[]) => mockDeleteRegistration(...args),
  },
}));

vi.mock('@/modules/events/components/registration/FormBuilder', () => ({
  FormBuilder: () => <div>Form Builder Mock</div>,
}));

const makeMutation = () => ({
  mutateAsync: vi.fn(),
  isPending: false,
});

describe('Event Modules Permission Guarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ eventId: 'event-1' });
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: () => false,
      loading: false,
    });
    mockUseToast.mockReturnValue({ toast: vi.fn() });

    mockUseCreateQueue.mockReturnValue(makeMutation());
    mockUseUpdateQueue.mockReturnValue(makeMutation());
    mockUseCallNextInQueue.mockReturnValue(makeMutation());
    mockUseUpdateTicketStatus.mockReturnValue(makeMutation());
    mockUseJoinQueue.mockReturnValue(makeMutation());

    mockUseCreateShift.mockReturnValue(makeMutation());
    mockUseAssignVolunteer.mockReturnValue(makeMutation());
    mockUseAdminContext.mockReturnValue({
      selectedBranchId: null,
      setSelectedBranchId: vi.fn(),
      branchName: null,
      loading: false,
    });

    mockGetEventRegistrations.mockResolvedValue({
      data: [
        {
          id: 'reg-1',
          event_id: 'event-1',
          member_id: null,
          name: 'Guest One',
          email: 'guest1@example.com',
          phone: '',
          status: 'waitlist',
          payment_status: 'pending',
          amount_paid: 0,
          registered_at: '2026-02-25T10:00:00.000Z',
          created_at: '2026-02-25T10:00:00.000Z',
          updated_at: '2026-02-25T10:00:00.000Z',
        },
      ],
      error: null,
    });
    mockUpdateRegistrationStatus.mockResolvedValue({ error: null });
    mockDeleteRegistration.mockResolvedValue({ error: null });
  });

  it('disables queue management controls for unauthorized users', () => {
    mockUseQueues.mockReturnValue({
      data: [
        {
          id: 'queue-1',
          event_id: 'event-1',
          name: 'Front Desk',
          description: 'Main Hall',
          status: 'active',
          max_capacity: 20,
          avg_service_time: 60,
          tickets: [],
        },
      ],
      isLoading: false,
    });

    render(<QueueManagerModule />);

    expect(screen.getByRole('button', { name: /operator mode/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /new queue/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /manage/i })).toBeDisabled();
  });

  it('disables roster staffing controls for unauthorized users', () => {
    mockUseEventShifts.mockReturnValue({
      data: [
        {
          id: 'shift-1',
          event_id: 'event-1',
          role: 'Security',
          department: 'Gate A',
          start_time: '2026-02-25T09:00:00.000Z',
          end_time: '2026-02-25T11:00:00.000Z',
          max_volunteers: 2,
          notes: 'Main Entrance',
          assignments: [],
        },
      ],
      isLoading: false,
    });
    mockUseMembers.mockReturnValue({ members: [], loading: false });

    render(<RosterManagerModule />);

    expect(screen.getByRole('button', { name: /add shift/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /manage/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /fill slot/i })).toBeDisabled();
  });

  it('blocks opening form designer for unauthorized users', async () => {
    const toastSpy = vi.fn();
    mockUseToast.mockReturnValue({ toast: toastSpy });

    render(<RegistrationManagerModule eventId="event-1" eventTitle="Sunday Service" />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /form designer/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /form designer/i }));

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Permission denied',
        variant: 'destructive',
      })
    );
    expect(screen.queryByText('Form Builder Mock')).not.toBeInTheDocument();
  });

  it('allows authorized users to create a queue', async () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (moduleSlug: string) => moduleSlug === 'events',
      loading: false,
    });
    const createQueueMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    };
    mockUseCreateQueue.mockReturnValue(createQueueMutation);
    mockUseQueues.mockReturnValue({
      data: [
        {
          id: 'queue-1',
          event_id: 'event-1',
          name: 'Front Desk',
          description: 'Main Hall',
          status: 'active',
          max_capacity: 20,
          avg_service_time: 60,
          tickets: [],
        },
      ],
      isLoading: false,
    });

    render(<QueueManagerModule />);

    fireEvent.click(screen.getByRole('button', { name: /new queue/i }));
    fireEvent.change(screen.getByPlaceholderText(/registration desk a/i), {
      target: { value: 'VIP Queue' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create queue/i }));

    await waitFor(() => expect(createQueueMutation.mutateAsync).toHaveBeenCalledTimes(1));
    expect(createQueueMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: 'event-1',
        name: 'VIP Queue',
        status: 'active',
      })
    );
  });

  it('allows authorized users to create a shift', async () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (moduleSlug: string) => moduleSlug === 'events',
      loading: false,
    });
    const createShiftMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    };
    mockUseCreateShift.mockReturnValue(createShiftMutation);
    mockUseEventShifts.mockReturnValue({ data: [], isLoading: false });
    mockUseMembers.mockReturnValue({ members: [], loading: false });

    render(<RosterManagerModule />);

    fireEvent.click(screen.getByRole('button', { name: /add shift/i }));
    await waitFor(() => expect(document.querySelector('input[name="name"]')).toBeTruthy());

    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement | null;
    const roleInput = document.querySelector('input[name="role"]') as HTMLInputElement | null;
    const locationInput = document.querySelector(
      'input[name="location"]'
    ) as HTMLInputElement | null;
    const requiredCountInput = document.querySelector(
      'input[name="requiredCount"]'
    ) as HTMLInputElement | null;

    expect(nameInput).toBeTruthy();
    expect(roleInput).toBeTruthy();
    expect(locationInput).toBeTruthy();
    expect(requiredCountInput).toBeTruthy();

    fireEvent.change(nameInput!, {
      target: { value: 'Welcome Team Shift' },
    });
    fireEvent.change(roleInput!, {
      target: { value: 'Welcome Team' },
    });
    fireEvent.change(locationInput!, {
      target: { value: 'Front Gate' },
    });
    fireEvent.change(requiredCountInput!, {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create shift/i }));

    await waitFor(() => expect(createShiftMutation.mutateAsync).toHaveBeenCalledTimes(1));
    expect(createShiftMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: 'event-1',
        role: 'Welcome Team',
        department: 'Front Gate',
        max_volunteers: 3,
        notes: 'Welcome Team Shift',
      })
    );
  });

  it('allows authorized users to open form designer', async () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (moduleSlug: string) => moduleSlug === 'events',
      loading: false,
    });

    render(<RegistrationManagerModule eventId="event-1" eventTitle="Sunday Service" />);

    const formDesignerButton = await screen.findByRole('button', { name: /form designer/i });
    expect(formDesignerButton).toBeEnabled();
    fireEvent.click(formDesignerButton);

    expect(await screen.findByText('Form Builder Mock')).toBeInTheDocument();
  });
});
