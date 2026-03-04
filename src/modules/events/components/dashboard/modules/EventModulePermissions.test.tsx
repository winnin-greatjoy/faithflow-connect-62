import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueueManagerModule } from './QueueManager';
import { RosterManagerModule } from './RosterManager';
import { RegistrationManagerModule } from './RegistrationManager';
import { AccommodationManagerModule } from './AccommodationManager';
import { WorshipPlannerModule } from './WorshipPlanner';
import { HealthcareManagerModule } from './HealthcareManager';
import { ChildSafetyManagerModule } from './ChildSafetyManager';
import { SafeguardingManagerModule } from './SafeguardingManager';
import { GivingManagerModule } from './GivingManager';
import { FinanceReportingModule } from './FinanceReporting';
import { PrayerManagerModule } from './PrayerManager';
import { AttendanceManagerModule } from './AttendanceManager';
import { AssetManagerModule } from './AssetManager';
import { GrowthPathwaysModule } from './GrowthPathways';
import { StaffChatModule } from './StaffChat';

const mockUseParams = vi.fn();
const mockUseAuthz = vi.fn();
const mockUseQueues = vi.fn();
const mockUseCreateQueue = vi.fn();
const mockUseUpdateQueue = vi.fn();
const mockUseDeleteQueue = vi.fn();
const mockUseCallNextInQueue = vi.fn();
const mockUseUpdateTicketStatus = vi.fn();
const mockUseJoinQueue = vi.fn();
const mockUseEventShifts = vi.fn();
const mockUseCreateShift = vi.fn();
const mockUseDeleteShift = vi.fn();
const mockUseAssignVolunteer = vi.fn();
const mockUseAccommodationRooms = vi.fn();
const mockUseAccommodationBookings = vi.fn();
const mockUseCreateAccommodationRoom = vi.fn();
const mockUseUpdateAccommodationRoom = vi.fn();
const mockUseDeleteAccommodationRoom = vi.fn();
const mockUseCreateAccommodationBooking = vi.fn();
const mockUseUpdateAccommodationBooking = vi.fn();
const mockUseDeleteAccommodationBooking = vi.fn();
const mockUseAssets = vi.fn();
const mockUseCreateAsset = vi.fn();
const mockUseUpdateAsset = vi.fn();
const mockUseReportMaintenance = vi.fn();
const mockUseSetlist = vi.fn();
const mockUseSongs = vi.fn();
const mockUseAddServiceItem = vi.fn();
const mockUseUpdateServiceItem = vi.fn();
const mockUseDeleteServiceItem = vi.fn();
const mockUseCreateSong = vi.fn();
const mockUseDeleteSong = vi.fn();
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
  useDeleteQueue: () => mockUseDeleteQueue(),
  useCallNextInQueue: () => mockUseCallNextInQueue(),
  useUpdateTicketStatus: () => mockUseUpdateTicketStatus(),
  useJoinQueue: () => mockUseJoinQueue(),
  useEventShifts: () => mockUseEventShifts(),
  useCreateShift: () => mockUseCreateShift(),
  useDeleteShift: () => mockUseDeleteShift(),
  useAssignVolunteer: () => mockUseAssignVolunteer(),
  useAccommodationRooms: () => mockUseAccommodationRooms(),
  useAccommodationBookings: () => mockUseAccommodationBookings(),
  useCreateAccommodationRoom: () => mockUseCreateAccommodationRoom(),
  useUpdateAccommodationRoom: () => mockUseUpdateAccommodationRoom(),
  useDeleteAccommodationRoom: () => mockUseDeleteAccommodationRoom(),
  useCreateAccommodationBooking: () => mockUseCreateAccommodationBooking(),
  useUpdateAccommodationBooking: () => mockUseUpdateAccommodationBooking(),
  useDeleteAccommodationBooking: () => mockUseDeleteAccommodationBooking(),
  useAssets: () => mockUseAssets(),
  useCreateAsset: () => mockUseCreateAsset(),
  useUpdateAsset: () => mockUseUpdateAsset(),
  useReportMaintenance: () => mockUseReportMaintenance(),
  useSetlist: () => mockUseSetlist(),
  useSongs: () => mockUseSongs(),
  useAddServiceItem: () => mockUseAddServiceItem(),
  useUpdateServiceItem: () => mockUseUpdateServiceItem(),
  useDeleteServiceItem: () => mockUseDeleteServiceItem(),
  useCreateSong: () => mockUseCreateSong(),
  useDeleteSong: () => mockUseDeleteSong(),
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
    mockUseDeleteQueue.mockReturnValue(makeMutation());
    mockUseCallNextInQueue.mockReturnValue(makeMutation());
    mockUseUpdateTicketStatus.mockReturnValue(makeMutation());
    mockUseJoinQueue.mockReturnValue(makeMutation());

    mockUseCreateShift.mockReturnValue(makeMutation());
    mockUseDeleteShift.mockReturnValue(makeMutation());
    mockUseAssignVolunteer.mockReturnValue(makeMutation());
    mockUseAccommodationRooms.mockReturnValue({ data: [], isLoading: false });
    mockUseAccommodationBookings.mockReturnValue({ data: [], isLoading: false });
    mockUseCreateAccommodationRoom.mockReturnValue(makeMutation());
    mockUseUpdateAccommodationRoom.mockReturnValue(makeMutation());
    mockUseDeleteAccommodationRoom.mockReturnValue(makeMutation());
    mockUseCreateAccommodationBooking.mockReturnValue(makeMutation());
    mockUseUpdateAccommodationBooking.mockReturnValue(makeMutation());
    mockUseDeleteAccommodationBooking.mockReturnValue(makeMutation());
    mockUseAssets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseCreateAsset.mockReturnValue(makeMutation());
    mockUseUpdateAsset.mockReturnValue(makeMutation());
    mockUseReportMaintenance.mockReturnValue(makeMutation());
    mockUseSetlist.mockReturnValue({ data: [], isLoading: false });
    mockUseSongs.mockReturnValue({ data: [], isLoading: false });
    mockUseAddServiceItem.mockReturnValue(makeMutation());
    mockUseUpdateServiceItem.mockReturnValue(makeMutation());
    mockUseDeleteServiceItem.mockReturnValue(makeMutation());
    mockUseCreateSong.mockReturnValue(makeMutation());
    mockUseDeleteSong.mockReturnValue(makeMutation());
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
    expect(screen.getByRole('button', { name: /kiosk display/i })).toBeDisabled();
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
    expect(screen.getByRole('button', { name: /export schedule/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /manage/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /fill slot/i })).toBeDisabled();
  });

  it('disables registration create/export controls for unauthorized users', async () => {
    render(<RegistrationManagerModule eventId="event-1" eventTitle="Sunday Service" />);

    const addRegistrationButton = await screen.findByRole('button', { name: /add registration/i });
    const formDesignerButton = screen.getByRole('button', { name: /form designer/i });
    const exportButton = screen.getByRole('button', { name: /export/i });

    expect(addRegistrationButton).toBeDisabled();
    expect(formDesignerButton).toBeDisabled();
    expect(exportButton).toBeDisabled();
    expect(screen.queryByText('Form Builder Mock')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create registration/i })).not.toBeInTheDocument();
  });

  it('disables registration update and delete actions for unauthorized users', async () => {
    render(<RegistrationManagerModule eventId="event-1" eventTitle="Sunday Service" />);

    await screen.findByText('Guest One');
    const trigger = screen.getByRole('button', { name: /registration actions for guest one/i });
    fireEvent.pointerDown(trigger, { button: 0 });

    const markConfirmed = await screen.findByText(/mark confirmed/i);
    const markPaid = await screen.findByText(/mark paid/i);
    const deleteItem = await screen.findByText(/^delete$/i);

    expect(markConfirmed).toHaveAttribute('aria-disabled', 'true');
    expect(markPaid).toHaveAttribute('aria-disabled', 'true');
    expect(deleteItem).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(markConfirmed);
    fireEvent.click(markPaid);
    fireEvent.click(deleteItem);

    expect(mockUpdateRegistrationStatus).not.toHaveBeenCalled();
    expect(mockDeleteRegistration).not.toHaveBeenCalled();
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

  it('allows status updates but blocks delete when only manage is permitted in registration', async () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (_moduleSlug: string, action: string = 'view') => action !== 'delete',
      loading: false,
    });

    render(<RegistrationManagerModule eventId="event-1" eventTitle="Sunday Service" />);

    const regName = await screen.findByText('Guest One');
    const regRow = regName.closest('div.grid');
    expect(regRow).toBeTruthy();

    const trigger = within(regRow as HTMLElement).getByRole('button');
    fireEvent.pointerDown(trigger, { button: 0 });

    const markConfirmed = await screen.findByText(/mark confirmed/i);
    const deleteItem = await screen.findByText(/^delete$/i);

    expect(markConfirmed).not.toHaveAttribute('aria-disabled', 'true');
    expect(deleteItem).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(markConfirmed);
    await waitFor(() =>
      expect(mockUpdateRegistrationStatus).toHaveBeenCalledWith('reg-1', 'confirmed')
    );

    fireEvent.click(deleteItem);
    expect(mockDeleteRegistration).not.toHaveBeenCalled();
  });

  it('disables accommodation action controls for unauthorized users', async () => {
    mockUseAccommodationRooms.mockReturnValue({
      data: [
        {
          id: 'room-1',
          event_id: 'event-1',
          room_number: '101',
          building: 'Block A',
          floor: 1,
          room_type: 'standard',
          capacity: 2,
          status: 'available',
          amenities: ['WiFi'],
          notes: '',
        },
      ],
      isLoading: false,
    });
    mockUseAccommodationBookings.mockReturnValue({
      data: [
        {
          id: 'booking-1',
          event_id: 'event-1',
          room_id: null,
          guest_name: 'Guest One',
          check_in_date: '2026-02-25',
          check_out_date: '2026-02-27',
          status: 'pending',
          special_requests: '',
          room: null,
          member: null,
        },
      ],
      isLoading: false,
    });

    render(<AccommodationManagerModule />);

    fireEvent.click(screen.getByRole('button', { name: /rooms/i }));
    expect(screen.getByRole('button', { name: /add room/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /edit room 101/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete room 101/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /bookings/i }));
    expect(screen.getByRole('button', { name: /new booking/i })).toBeDisabled();
  });

  it('enables room management but disables delete when only manage is permitted in accommodation', async () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (_moduleSlug: string, action: string = 'view') => action !== 'delete',
      loading: false,
    });
    const deleteRoomMutation = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
    mockUseDeleteAccommodationRoom.mockReturnValue(deleteRoomMutation);
    mockUseAccommodationRooms.mockReturnValue({
      data: [
        {
          id: 'room-1',
          event_id: 'event-1',
          room_number: '101',
          building: 'Block A',
          floor: 1,
          room_type: 'standard',
          capacity: 2,
          status: 'available',
          amenities: ['WiFi'],
          notes: '',
        },
      ],
      isLoading: false,
    });
    mockUseAccommodationBookings.mockReturnValue({ data: [], isLoading: false });

    render(<AccommodationManagerModule />);

    fireEvent.click(screen.getByRole('button', { name: /rooms/i }));
    expect(screen.getByRole('button', { name: /add room/i })).toBeEnabled();
    const deleteRoomButton = screen.getByRole('button', { name: /delete room 101/i });
    expect(deleteRoomButton).toBeDisabled();

    fireEvent.click(deleteRoomButton);
    expect(deleteRoomMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('enables queue management but disables queue delete when only manage is permitted', () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (_moduleSlug: string, action: string = 'view') => action !== 'delete',
      loading: false,
    });
    const deleteQueueMutation = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
    mockUseDeleteQueue.mockReturnValue(deleteQueueMutation);
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

    expect(screen.getByRole('button', { name: /manage/i })).toBeEnabled();
    const deleteQueueButton = screen.getByRole('button', { name: /delete queue front desk/i });
    expect(deleteQueueButton).toBeDisabled();
    fireEvent.click(deleteQueueButton);
    expect(deleteQueueMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('enables roster management but disables shift delete when only manage is permitted', () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (_moduleSlug: string, action: string = 'view') => action !== 'delete',
      loading: false,
    });
    const deleteShiftMutation = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
    mockUseDeleteShift.mockReturnValue(deleteShiftMutation);
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

    expect(screen.getByRole('button', { name: /manage/i })).toBeEnabled();
    const deleteShiftButton = screen.getByRole('button', { name: /delete shift main entrance/i });
    expect(deleteShiftButton).toBeDisabled();
    fireEvent.click(deleteShiftButton);
    expect(deleteShiftMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('disables worship module actions for unauthorized users', async () => {
    mockUseSetlist.mockReturnValue({
      data: [
        {
          id: 'item-1',
          event_id: 'event-1',
          song_id: null,
          item_type: 'sermon',
          title: 'Main Sermon',
          duration: '40:00',
          start_time: '09:30',
          item_order: 0,
          assigned_to: 'Pastor',
          key_override: null,
          notes: null,
        },
      ],
      isLoading: false,
    });
    mockUseAdminContext.mockReturnValue({
      selectedBranchId: 'branch-1',
      setSelectedBranchId: vi.fn(),
      branchName: 'Main Branch',
      loading: false,
    });
    mockUseSongs.mockReturnValue({
      data: [
        {
          id: 'song-1',
          branch_id: 'branch-1',
          title: 'Way Maker',
          artist: 'Sinach',
          original_key: 'E',
          bpm: 68,
          duration: '5:45',
          tags: ['Worship'],
          theme: 'Faith',
          lyrics: null,
          chord_chart_url: null,
          created_at: null,
        },
      ],
      isLoading: false,
    });

    render(<WorshipPlannerModule />);

    expect(screen.getByRole('button', { name: /add item/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^songs$/i }));
    expect(screen.getByRole('button', { name: /add song/i })).toBeDisabled();
  });

  it('allows authorized worship users to create songs', async () => {
    mockUseAuthz.mockReturnValue({
      hasRole: () => false,
      can: (moduleSlug: string) => moduleSlug === 'events',
      loading: false,
    });
    const createSongMutation = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
    mockUseCreateSong.mockReturnValue(createSongMutation);
    mockUseAdminContext.mockReturnValue({
      selectedBranchId: 'branch-1',
      setSelectedBranchId: vi.fn(),
      branchName: 'Main Branch',
      loading: false,
    });
    mockUseSongs.mockReturnValue({ data: [], isLoading: false });
    mockUseSetlist.mockReturnValue({ data: [], isLoading: false });

    render(<WorshipPlannerModule />);

    fireEvent.click(screen.getByRole('button', { name: /^songs$/i }));
    fireEvent.click(screen.getByRole('button', { name: /add song/i }));

    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
    expect(titleInput).toBeTruthy();
    fireEvent.change(titleInput!, {
      target: { value: 'Goodness of God' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save song/i }));

    await waitFor(() => expect(createSongMutation.mutateAsync).toHaveBeenCalledTimes(1));
    expect(createSongMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        branch_id: 'branch-1',
        title: 'Goodness of God',
      })
    );
  });

  it('disables healthcare action controls for unauthorized users', () => {
    render(<HealthcareManagerModule />);

    expect(screen.getByRole('button', { name: /global alert/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /log incident/i })).toBeDisabled();
  });

  it('disables child safety action controls for unauthorized users', () => {
    render(<ChildSafetyManagerModule />);

    expect(screen.getByRole('button', { name: /new check-in/i })).toBeDisabled();
  });

  it('disables safeguarding action controls for unauthorized users', () => {
    render(<SafeguardingManagerModule />);

    expect(screen.getByRole('button', { name: /new check/i })).toBeDisabled();
  });

  it('disables giving action controls for unauthorized users', () => {
    render(<GivingManagerModule />);

    expect(screen.getByRole('button', { name: /copy link/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /manual entry/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /view register/i })).toBeDisabled();
  });

  it('disables finance reporting action controls for unauthorized users', () => {
    render(<FinanceReportingModule />);

    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
  });

  it('disables prayer manager action controls for unauthorized users', () => {
    render(<PrayerManagerModule />);

    expect(screen.getByRole('button', { name: /share testimony/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /post request/i })).toBeDisabled();
    screen.getAllByRole('button', { name: /pray now/i }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('disables attendance action controls for unauthorized users', () => {
    render(<AttendanceManagerModule />);

    expect(screen.getByRole('button', { name: /kiosk mode/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /dispatch/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /export attendance/i })).toBeDisabled();
  });

  it('disables attendance actions when event context is missing', () => {
    mockUseParams.mockReturnValue({});
    mockUseAuthz.mockReturnValue({
      hasRole: () => true,
      can: () => true,
      loading: false,
    });

    render(<AttendanceManagerModule />);

    expect(screen.getByRole('button', { name: /kiosk mode/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /dispatch/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /export attendance/i })).toBeDisabled();
  });

  it('disables asset manager action controls for unauthorized users', () => {
    mockUseAdminContext.mockReturnValue({
      selectedBranchId: 'branch-1',
      setSelectedBranchId: vi.fn(),
      branchName: 'Main Branch',
      loading: false,
    });
    mockUseAssets.mockReturnValue({
      data: [
        {
          id: 'asset-1',
          name: 'Camera A',
          category: 'AV',
          location: 'Stage',
          status: 'available',
          condition: 'good',
          serial_number: 'SN-1',
          current_checkout: [],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<AssetManagerModule />);

    expect(screen.getByRole('button', { name: /new asset/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /check out/i })).toBeDisabled();
  });

  it('disables growth pathways action controls for unauthorized users', () => {
    render(<GrowthPathwaysModule />);

    fireEvent.click(screen.getByRole('button', { name: /^members$/i }));
    expect(screen.getByRole('button', { name: /manage enrollments/i })).toBeDisabled();
  });

  it('disables staff chat action controls for unauthorized users', () => {
    render(<StaffChatModule />);

    expect(screen.getByRole('button', { name: /emergency broadcast/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /attach file/i })).toBeDisabled();
  });
});
