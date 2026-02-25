/**
 * React Query Hooks for Event Modules
 * Provides useQuery and useMutation hooks for all event module data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  attendanceApi,
  rosterApi,
  worshipApi,
  assetsApi,
  accommodationApi,
  queueApi,
  EventZone,
  EventAttendance,
  EventShift,
  Song,
  ServiceItem,
  Asset,
  AccommodationRoomCreateInput,
  AccommodationRoomUpdateInput,
  AccommodationBookingCreateInput,
  AccommodationBookingUpdateInput,
  Queue,
  QueueTicket,
  QueueCreateInput,
  QueueUpdateInput,
  QueueJoinInput,
} from '@/services/eventModulesApi';

// ============================================
// QUERY KEYS
// ============================================

export const eventModuleKeys = {
  zones: (eventId: string) => ['event-zones', eventId] as const,
  attendance: (eventId: string) => ['event-attendance', eventId] as const,
  shifts: (eventId: string) => ['event-shifts', eventId] as const,
  songs: (branchId: string) => ['songs', branchId] as const,
  setlist: (eventId: string) => ['setlist', eventId] as const,
  assets: (branchId: string) => ['assets', branchId] as const,
  accommodationRooms: (eventId: string) => ['accommodation-rooms', eventId] as const,
  accommodationBookings: (eventId: string) => ['accommodation-bookings', eventId] as const,
  queues: (eventId: string) => ['queues', eventId] as const,
};

// ============================================
// ATTENDANCE HOOKS
// ============================================

export function useEventZones(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.zones(eventId),
    queryFn: () => attendanceApi.getZones(eventId),
    enabled: !!eventId,
  });
}

export function useEventAttendance(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.attendance(eventId),
    queryFn: () => attendanceApi.getAttendance(eventId),
    enabled: !!eventId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreateZone(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zone: Omit<EventZone, 'id' | 'created_at'>) => attendanceApi.createZone(zone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.zones(eventId) });
      toast.success('Zone created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create zone: ${error.message}`);
    },
  });
}

export function useCheckIn(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: Omit<EventAttendance, 'id' | 'checked_in_at'>) =>
      attendanceApi.checkIn(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.attendance(eventId) });
      toast.success('Check-in recorded');
    },
    onError: (error: Error) => {
      toast.error(`Check-in failed: ${error.message}`);
    },
  });
}

export function useCheckOut(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attendanceId: string) => attendanceApi.checkOut(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.attendance(eventId) });
      toast.success('Check-out recorded');
    },
    onError: (error: Error) => {
      toast.error(`Check-out failed: ${error.message}`);
    },
  });
}

// ============================================
// ROSTER HOOKS
// ============================================

export function useEventShifts(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.shifts(eventId),
    queryFn: () => rosterApi.getShifts(eventId),
    enabled: !!eventId,
  });
}

export function useCreateShift(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shift: Omit<EventShift, 'id' | 'created_at' | 'updated_at'>) =>
      rosterApi.createShift(shift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.shifts(eventId) });
      toast.success('Shift created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create shift: ${error.message}`);
    },
  });
}

export function useUpdateShift(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, updates }: { shiftId: string; updates: Partial<EventShift> }) =>
      rosterApi.updateShift(shiftId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.shifts(eventId) });
      toast.success('Shift updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update shift: ${error.message}`);
    },
  });
}

export function useDeleteShift(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shiftId: string) => rosterApi.deleteShift(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.shifts(eventId) });
      toast.success('Shift deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete shift: ${error.message}`);
    },
  });
}

export function useAssignVolunteer(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, memberId }: { shiftId: string; memberId: string }) =>
      rosterApi.assignVolunteer(shiftId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.shifts(eventId) });
      toast.success('Volunteer assigned');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign volunteer: ${error.message}`);
    },
  });
}

// ============================================
// WORSHIP HOOKS
// ============================================

export function useSongs(branchId: string) {
  return useQuery({
    queryKey: eventModuleKeys.songs(branchId),
    queryFn: () => worshipApi.getSongs(branchId),
    enabled: !!branchId,
  });
}

export function useCreateSong(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (song: Omit<Song, 'id' | 'created_at' | 'updated_at'>) =>
      worshipApi.createSong(song),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.songs(branchId) });
      toast.success('Song added to library');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add song: ${error.message}`);
    },
  });
}

export function useUpdateSong(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ songId, updates }: { songId: string; updates: Partial<Song> }) =>
      worshipApi.updateSong(songId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.songs(branchId) });
      toast.success('Song updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update song: ${error.message}`);
    },
  });
}

export function useDeleteSong(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (songId: string) => worshipApi.deleteSong(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.songs(branchId) });
      toast.success('Song deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete song: ${error.message}`);
    },
  });
}

export function useSetlist(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.setlist(eventId),
    queryFn: () => worshipApi.getSetlist(eventId),
    enabled: !!eventId,
  });
}

export function useAddServiceItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<ServiceItem, 'id' | 'created_at'>) => worshipApi.addServiceItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.setlist(eventId) });
      toast.success('Item added to setlist');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });
}

export function useUpdateServiceItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: Partial<ServiceItem> }) =>
      worshipApi.updateServiceItem(itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.setlist(eventId) });
      toast.success('Item updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
}

export function useReorderSetlist(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => worshipApi.reorderSetlist(eventId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.setlist(eventId) });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder: ${error.message}`);
    },
  });
}

// ============================================
// ASSETS HOOKS
// ============================================

export function useAssets(branchId: string) {
  return useQuery({
    queryKey: eventModuleKeys.assets(branchId),
    queryFn: () => assetsApi.getAssets(branchId),
    enabled: !!branchId,
  });
}

export function useCreateAsset(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) =>
      assetsApi.createAsset(asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.assets(branchId) });
      toast.success('Asset created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create asset: ${error.message}`);
    },
  });
}

export function useUpdateAsset(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, updates }: { assetId: string; updates: Partial<Asset> }) =>
      assetsApi.updateAsset(assetId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.assets(branchId) });
      toast.success('Asset updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update asset: ${error.message}`);
    },
  });
}

export function useCheckOutAsset(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkout: Parameters<typeof assetsApi.checkOutAsset>[0]) =>
      assetsApi.checkOutAsset(checkout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.assets(branchId) });
      toast.success('Asset checked out');
    },
    onError: (error: Error) => {
      toast.error(`Failed to check out asset: ${error.message}`);
    },
  });
}

export function useReturnAsset(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checkoutId, condition }: { checkoutId: string; condition?: string }) =>
      assetsApi.returnAsset(checkoutId, condition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.assets(branchId) });
      toast.success('Asset returned');
    },
    onError: (error: Error) => {
      toast.error(`Failed to return asset: ${error.message}`);
    },
  });
}

export function useReportMaintenance(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticket: Parameters<typeof assetsApi.reportMaintenance>[0]) =>
      assetsApi.reportMaintenance(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.assets(branchId) });
      toast.success('Maintenance ticket created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to report issue: ${error.message}`);
    },
  });
}

// ============================================
// ACCOMMODATION HOOKS
// ============================================

export function useAccommodationRooms(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.accommodationRooms(eventId),
    queryFn: () => accommodationApi.getRooms(eventId),
    enabled: !!eventId,
  });
}

export function useCreateAccommodationRoom(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (room: AccommodationRoomCreateInput) => accommodationApi.createRoom(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationRooms(eventId) });
      toast.success('Room added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add room: ${error.message}`);
    },
  });
}

export function useUpdateAccommodationRoom(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, updates }: { roomId: string; updates: AccommodationRoomUpdateInput }) =>
      accommodationApi.updateRoom(roomId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationRooms(eventId) });
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationBookings(eventId) });
      toast.success('Room updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update room: ${error.message}`);
    },
  });
}

export function useDeleteAccommodationRoom(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => accommodationApi.deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationRooms(eventId) });
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationBookings(eventId) });
      toast.success('Room deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete room: ${error.message}`);
    },
  });
}

export function useAccommodationBookings(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.accommodationBookings(eventId),
    queryFn: () => accommodationApi.getBookings(eventId),
    enabled: !!eventId,
  });
}

export function useCreateAccommodationBooking(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (booking: AccommodationBookingCreateInput) =>
      accommodationApi.createBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationBookings(eventId) });
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationRooms(eventId) });
      toast.success('Booking created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });
}

export function useUpdateAccommodationBooking(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      updates,
    }: {
      bookingId: string;
      updates: AccommodationBookingUpdateInput;
    }) => accommodationApi.updateBooking(bookingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationBookings(eventId) });
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationRooms(eventId) });
      toast.success('Booking updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });
}

export function useDeleteAccommodationBooking(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => accommodationApi.deleteBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationBookings(eventId) });
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.accommodationRooms(eventId) });
      toast.success('Booking deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete booking: ${error.message}`);
    },
  });
}

// ============================================
// QUEUE HOOKS
// ============================================

export function useQueues(eventId: string) {
  return useQuery({
    queryKey: eventModuleKeys.queues(eventId),
    queryFn: () => queueApi.getQueues(eventId),
    enabled: !!eventId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time queue updates
  });
}

export function useCreateQueue(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queue: QueueCreateInput) => queueApi.createQueue(queue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.queues(eventId) });
      toast.success('Queue created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create queue: ${error.message}`);
    },
  });
}

export function useUpdateQueue(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queueId, updates }: { queueId: string; updates: QueueUpdateInput }) =>
      queueApi.updateQueue(queueId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.queues(eventId) });
      toast.success('Queue updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update queue: ${error.message}`);
    },
  });
}

export function useJoinQueue(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queueId, ticket }: { queueId: string; ticket: QueueJoinInput }) =>
      queueApi.joinQueue(queueId, ticket),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.queues(eventId) });
      toast.success(`Ticket ${data.ticket_number} issued`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to join queue: ${error.message}`);
    },
  });
}

export function useCallNextInQueue(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queueId: string) => queueApi.callNext(queueId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.queues(eventId) });
      if (data) {
        toast.success(`Calling ${data.ticket_number}`);
      } else {
        toast.info('No one waiting in queue');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to call next: ${error.message}`);
    },
  });
}

export function useUpdateTicketStatus(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: QueueTicket['status'] }) =>
      queueApi.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventModuleKeys.queues(eventId) });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ticket: ${error.message}`);
    },
  });
}
