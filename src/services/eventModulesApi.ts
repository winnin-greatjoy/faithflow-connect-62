/**
 * Event Modules API Service
 * Provides CRUD operations for all event management module tables
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ============================================
// TYPE DEFINITIONS (derived from Supabase Database types)
// ============================================

type PublicTables = Database['public']['Tables'];
type TableRow<T extends keyof PublicTables> = PublicTables[T]['Row'];
type TableInsert<T extends keyof PublicTables> = PublicTables[T]['Insert'];
type TableUpdate<T extends keyof PublicTables> = PublicTables[T]['Update'];

export type EventZone = Pick<
  TableRow<'event_zones'>,
  'id' | 'event_id' | 'name' | 'capacity' | 'current_occupancy' | 'zone_type' | 'created_at'
>;

export type EventAttendance = Pick<
  TableRow<'event_attendance'>,
  | 'id'
  | 'event_id'
  | 'member_id'
  | 'zone_id'
  | 'status'
  | 'checked_in_at'
  | 'checked_out_at'
  | 'checked_in_by'
  | 'notes'
>;

export type EventShift = Pick<
  TableRow<'event_shifts'>,
  'id' | 'event_id' | 'role' | 'department' | 'start_time' | 'end_time' | 'max_volunteers' | 'notes'
>;

export type ShiftAssignment = Pick<
  TableRow<'event_shift_assignments'>,
  'id' | 'shift_id' | 'member_id' | 'status' | 'assigned_at' | 'confirmed_at'
>;

export type Song = Pick<
  TableRow<'songs'>,
  | 'id'
  | 'branch_id'
  | 'title'
  | 'artist'
  | 'original_key'
  | 'bpm'
  | 'duration'
  | 'tags'
  | 'theme'
  | 'lyrics'
  | 'chord_chart_url'
  | 'created_at'
>;

export type ServiceItem = Pick<
  TableRow<'service_items'>,
  | 'id'
  | 'event_id'
  | 'song_id'
  | 'item_type'
  | 'title'
  | 'duration'
  | 'start_time'
  | 'item_order'
  | 'assigned_to'
  | 'key_override'
  | 'notes'
>;

export type Asset = Pick<
  TableRow<'assets'>,
  | 'id'
  | 'branch_id'
  | 'name'
  | 'category'
  | 'serial_number'
  | 'status'
  | 'location'
  | 'condition'
  | 'notes'
  | 'created_at'
>;

export type AssetCheckout = Pick<
  TableRow<'asset_checkouts'>,
  | 'id'
  | 'asset_id'
  | 'event_id'
  | 'checked_out_to'
  | 'checked_out_by'
  | 'checked_out_at'
  | 'expected_return'
  | 'returned_at'
  | 'notes'
>;

export type MaintenanceTicket = Pick<
  TableRow<'maintenance_tickets'>,
  | 'id'
  | 'asset_id'
  | 'reported_by'
  | 'issue_description'
  | 'priority'
  | 'status'
  | 'resolution_notes'
  | 'resolved_at'
  | 'created_at'
>;

export type Queue = Pick<
  TableRow<'queues'>,
  'id' | 'event_id' | 'name' | 'description' | 'status' | 'max_capacity' | 'avg_service_time'
>;

export type QueueTicket = Pick<
  TableRow<'queue_tickets'>,
  | 'id'
  | 'queue_id'
  | 'ticket_number'
  | 'member_id'
  | 'guest_name'
  | 'priority'
  | 'status'
  | 'joined_at'
  | 'called_at'
  | 'served_at'
  | 'completed_at'
>;

export type QueueCreateInput = Pick<
  TableInsert<'queues'>,
  'event_id' | 'name' | 'description' | 'status' | 'max_capacity' | 'avg_service_time'
> & {
  event_id: string;
  name: string;
};

export type QueueUpdateInput = Pick<
  TableUpdate<'queues'>,
  'name' | 'description' | 'status' | 'max_capacity' | 'avg_service_time'
>;

export type QueueJoinInput = Pick<
  TableInsert<'queue_tickets'>,
  'member_id' | 'guest_name' | 'priority' | 'status' | 'notes'
>;

export type AccommodationRoom = TableRow<'rooms'>;

export type AccommodationBooking = TableRow<'room_bookings'>;

export interface AccommodationBookingWithRelations extends AccommodationBooking {
  room?: {
    id: string;
    room_number: string;
    building: string | null;
    capacity: number;
    room_type: string | null;
    status: string | null;
  } | null;
  member?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string;
    membership_level: string;
    status: string | null;
  } | null;
}

export type AccommodationRoomCreateInput = Pick<
  TableInsert<'rooms'>,
  | 'event_id'
  | 'room_number'
  | 'building'
  | 'floor'
  | 'room_type'
  | 'capacity'
  | 'status'
  | 'amenities'
  | 'notes'
> & {
  event_id: string;
  room_number: string;
  capacity: number;
};

export type AccommodationRoomUpdateInput = Pick<
  TableUpdate<'rooms'>,
  'room_number' | 'building' | 'floor' | 'room_type' | 'capacity' | 'status' | 'amenities' | 'notes'
>;

export type AccommodationBookingCreateInput = Pick<
  TableInsert<'room_bookings'>,
  | 'event_id'
  | 'room_id'
  | 'member_id'
  | 'guest_name'
  | 'check_in_date'
  | 'check_out_date'
  | 'special_requests'
  | 'status'
> & {
  event_id: string;
  check_in_date: string;
  check_out_date: string;
};

export type AccommodationBookingUpdateInput = Pick<
  TableUpdate<'room_bookings'>,
  | 'room_id'
  | 'member_id'
  | 'guest_name'
  | 'check_in_date'
  | 'check_out_date'
  | 'special_requests'
  | 'status'
>;

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceApi = {
  // Zones
  async getZones(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('event_zones')
      .select('*')
      .eq('event_id', eventId)
      .order('name');
    if (error) throw error;
    return data as EventZone[];
  },

  async createZone(zone: Omit<EventZone, 'id' | 'created_at'>) {
    const { data, error } = await (supabase as any)
      .from('event_zones')
      .insert(zone)
      .select()
      .single();
    if (error) throw error;
    return data as EventZone;
  },

  async updateZoneOccupancy(zoneId: string, delta: number) {
    const { data, error } = await (supabase as any).rpc('increment_zone_occupancy', {
      zone_id: zoneId,
      delta,
    });
    if (error) throw error;
    return data;
  },

  // Attendance Records
  async getAttendance(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('event_attendance')
      .select(
        `
        *,
        member:members(id, full_name, avatar_url),
        zone:event_zones(id, name)
      `
      )
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async checkIn(record: Omit<EventAttendance, 'id' | 'checked_in_at'>) {
    const { data, error } = await (supabase as any)
      .from('event_attendance')
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data as EventAttendance;
  },

  async checkOut(attendanceId: string) {
    const { data, error } = await (supabase as any)
      .from('event_attendance')
      .update({ status: 'checked_out', checked_out_at: new Date().toISOString() })
      .eq('id', attendanceId)
      .select()
      .single();
    if (error) throw error;
    return data as EventAttendance;
  },
};

// ============================================
// ROSTER/SHIFTS API
// ============================================

export const rosterApi = {
  async getShifts(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('event_shifts')
      .select(
        `
        *,
        assignments:event_shift_assignments(
          *,
          member:members(id, full_name, avatar_url)
        )
      `
      )
      .eq('event_id', eventId)
      .order('start_time');
    if (error) throw error;
    return data as (EventShift & { assignments: ShiftAssignment[] })[];
  },

  async createShift(shift: Omit<EventShift, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any)
      .from('event_shifts')
      .insert(shift)
      .select()
      .single();
    if (error) throw error;
    return data as EventShift;
  },

  async updateShift(shiftId: string, updates: Partial<EventShift>) {
    const { data, error } = await (supabase as any)
      .from('event_shifts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', shiftId)
      .select()
      .single();
    if (error) throw error;
    return data as EventShift;
  },

  async deleteShift(shiftId: string) {
    const { error } = await (supabase as any).from('event_shifts').delete().eq('id', shiftId);
    if (error) throw error;
  },

  async assignVolunteer(shiftId: string, memberId: string) {
    const { data, error } = await (supabase as any)
      .from('event_shift_assignments')
      .insert({ shift_id: shiftId, member_id: memberId })
      .select()
      .single();
    if (error) throw error;
    return data as ShiftAssignment;
  },

  async updateAssignmentStatus(assignmentId: string, status: ShiftAssignment['status']) {
    const updates: any = { status };
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from('event_shift_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();
    if (error) throw error;
    return data as ShiftAssignment;
  },
};

// ============================================
// WORSHIP/SONGS API
// ============================================

export const worshipApi = {
  // Songs Library
  async getSongs(branchId: string) {
    const { data, error } = await (supabase as any)
      .from('songs')
      .select('*')
      .eq('branch_id', branchId)
      .order('title');
    if (error) throw error;
    return data as Song[];
  },

  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any).from('songs').insert(song).select().single();
    if (error) throw error;
    return data as Song;
  },

  async updateSong(songId: string, updates: Partial<Song>) {
    const { data, error } = await (supabase as any)
      .from('songs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', songId)
      .select()
      .single();
    if (error) throw error;
    return data as Song;
  },

  async deleteSong(songId: string) {
    const { error } = await (supabase as any).from('songs').delete().eq('id', songId);
    if (error) throw error;
  },

  // Service Items (Setlist)
  async getSetlist(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('service_items')
      .select(
        `
        *,
        song:songs(id, title, artist, original_key)
      `
      )
      .eq('event_id', eventId)
      .order('item_order');
    if (error) throw error;
    return data as ServiceItem[];
  },

  async addServiceItem(item: Omit<ServiceItem, 'id' | 'created_at'>) {
    const { data, error } = await (supabase as any)
      .from('service_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data as ServiceItem;
  },

  async updateServiceItem(itemId: string, updates: Partial<ServiceItem>) {
    const { data, error } = await (supabase as any)
      .from('service_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data as ServiceItem;
  },

  async reorderSetlist(eventId: string, orderedIds: string[]) {
    // Update each item's order
    const updates = orderedIds.map((id, index) =>
      (supabase as any).from('service_items').update({ item_order: index }).eq('id', id)
    );
    await Promise.all(updates);
  },

  async deleteServiceItem(itemId: string) {
    const { error } = await (supabase as any).from('service_items').delete().eq('id', itemId);
    if (error) throw error;
  },
};

// ============================================
// ASSETS API
// ============================================

export const assetsApi = {
  async getAssets(branchId: string) {
    const { data, error } = await (supabase as any)
      .from('assets')
      .select(
        `
        *,
        current_checkout:asset_checkouts(
          id, checked_out_to, checked_out_at, expected_return,
          user:members(id, full_name)
        )
      `
      )
      .eq('branch_id', branchId)
      .order('name');
    if (error) throw error;
    return data as Asset[];
  },

  async createAsset(asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any).from('assets').insert(asset).select().single();
    if (error) throw error;
    return data as Asset;
  },

  async updateAsset(assetId: string, updates: Partial<Asset>) {
    const { data, error } = await (supabase as any)
      .from('assets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', assetId)
      .select()
      .single();
    if (error) throw error;
    return data as Asset;
  },

  async checkOutAsset(checkout: Omit<AssetCheckout, 'id' | 'checked_out_at'>) {
    // Update asset status
    await (supabase as any).from('assets').update({ status: 'in_use' }).eq('id', checkout.asset_id);

    // Create checkout record
    const { data, error } = await (supabase as any)
      .from('asset_checkouts')
      .insert(checkout)
      .select()
      .single();
    if (error) throw error;
    return data as AssetCheckout;
  },

  async returnAsset(checkoutId: string, condition?: string) {
    const { data: checkout } = await (supabase as any)
      .from('asset_checkouts')
      .select('asset_id')
      .eq('id', checkoutId)
      .single();

    // Update asset status
    await (supabase as any)
      .from('assets')
      .update({ status: 'available' })
      .eq('id', checkout.asset_id);

    // Update checkout record
    const { data, error } = await (supabase as any)
      .from('asset_checkouts')
      .update({
        returned_at: new Date().toISOString(),
        return_condition: condition,
      })
      .eq('id', checkoutId)
      .select()
      .single();
    if (error) throw error;
    return data as AssetCheckout;
  },

  async reportMaintenance(
    ticket: Omit<MaintenanceTicket, 'id' | 'created_at' | 'status' | 'resolved_at'>
  ) {
    // Update asset status
    await (supabase as any)
      .from('assets')
      .update({ status: 'maintenance' })
      .eq('id', ticket.asset_id);

    // Create ticket
    const { data, error } = await (supabase as any)
      .from('maintenance_tickets')
      .insert(ticket)
      .select()
      .single();
    if (error) throw error;
    return data as MaintenanceTicket;
  },

  async resolveMaintenanceTicket(ticketId: string, notes: string) {
    const { data: ticket } = await (supabase as any)
      .from('maintenance_tickets')
      .select('asset_id')
      .eq('id', ticketId)
      .single();

    // Update asset status
    await (supabase as any)
      .from('assets')
      .update({ status: 'available' })
      .eq('id', ticket.asset_id);

    // Update ticket
    const { data, error } = await (supabase as any)
      .from('maintenance_tickets')
      .update({
        status: 'resolved',
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select()
      .single();
    if (error) throw error;
    return data as MaintenanceTicket;
  },
};

// ============================================
// ACCOMMODATION API
// ============================================

export const accommodationApi = {
  async getRooms(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('rooms')
      .select('*')
      .eq('event_id', eventId)
      .order('building')
      .order('room_number');
    if (error) throw error;
    return data as AccommodationRoom[];
  },

  async createRoom(room: AccommodationRoomCreateInput) {
    const { data, error } = await (supabase as any)
      .from('rooms')
      .insert({
        event_id: room.event_id,
        room_number: room.room_number,
        building: room.building ?? null,
        floor: room.floor ?? null,
        room_type: room.room_type ?? null,
        capacity: room.capacity,
        status: room.status ?? 'available',
        amenities: room.amenities ?? [],
        notes: room.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as AccommodationRoom;
  },

  async updateRoom(roomId: string, updates: AccommodationRoomUpdateInput) {
    const { data, error } = await (supabase as any)
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();
    if (error) throw error;
    return data as AccommodationRoom;
  },

  async deleteRoom(roomId: string) {
    const { data: linkedBookings, error: bookingError } = await (supabase as any)
      .from('room_bookings')
      .select('id')
      .eq('room_id', roomId)
      .limit(1);
    if (bookingError) throw bookingError;
    if ((linkedBookings || []).length > 0) {
      throw new Error(
        'Cannot delete room with linked bookings. Reassign or delete bookings first.'
      );
    }

    const { error } = await (supabase as any).from('rooms').delete().eq('id', roomId);
    if (error) throw error;
  },

  async getBookings(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('room_bookings')
      .select(
        `
        *,
        room:rooms(id, room_number, building, capacity, room_type, status),
        member:members(id, full_name, email, phone, membership_level, status)
      `
      )
      .eq('event_id', eventId)
      .order('check_in_date');
    if (error) throw error;
    return (data || []) as AccommodationBookingWithRelations[];
  },

  async createBooking(booking: AccommodationBookingCreateInput) {
    const { data, error } = await (supabase as any)
      .from('room_bookings')
      .insert({
        event_id: booking.event_id,
        room_id: booking.room_id ?? null,
        member_id: booking.member_id ?? null,
        guest_name: booking.guest_name ?? null,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        special_requests: booking.special_requests ?? null,
        status: booking.status ?? 'confirmed',
      })
      .select()
      .single();
    if (error) throw error;
    return data as AccommodationBooking;
  },

  async updateBooking(bookingId: string, updates: AccommodationBookingUpdateInput) {
    const { data, error } = await (supabase as any)
      .from('room_bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();
    if (error) throw error;
    return data as AccommodationBooking;
  },

  async deleteBooking(bookingId: string) {
    const { error } = await (supabase as any).from('room_bookings').delete().eq('id', bookingId);
    if (error) throw error;
  },
};

// ============================================
// QUEUE API
// ============================================

export const queueApi = {
  async getQueues(eventId: string) {
    const { data, error } = await (supabase as any)
      .from('queues')
      .select(
        `
        *,
        tickets:queue_tickets(*)
      `
      )
      .eq('event_id', eventId);
    if (error) throw error;
    return data as (Queue & { tickets: QueueTicket[] })[];
  },

  async createQueue(queue: QueueCreateInput) {
    const { data, error } = await (supabase as any)
      .from('queues')
      .insert({
        event_id: queue.event_id,
        name: queue.name,
        description: queue.description ?? null,
        status: queue.status ?? 'active',
        max_capacity: queue.max_capacity ?? null,
        avg_service_time: queue.avg_service_time ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Queue;
  },

  async updateQueue(queueId: string, updates: QueueUpdateInput) {
    const { data, error } = await (supabase as any)
      .from('queues')
      .update(updates)
      .eq('id', queueId)
      .select()
      .single();
    if (error) throw error;
    return data as Queue;
  },

  async joinQueue(queueId: string, ticket: QueueJoinInput) {
    // Generate ticket number
    const { count } = await (supabase as any)
      .from('queue_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queueId);

    const ticketNumber = `Q${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await (supabase as any)
      .from('queue_tickets')
      .insert({
        queue_id: queueId,
        ticket_number: ticketNumber,
        member_id: ticket.member_id ?? null,
        guest_name: ticket.guest_name ?? null,
        priority: ticket.priority ?? 'normal',
        status: ticket.status ?? 'waiting',
        notes: ticket.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as QueueTicket;
  },

  async callNext(queueId: string) {
    // Find next waiting ticket
    const { data: nextTicket, error: nextError } = await (supabase as any)
      .from('queue_tickets')
      .select('id')
      .eq('queue_id', queueId)
      .eq('status', 'waiting')
      .order('priority', { ascending: false })
      .order('joined_at')
      .limit(1)
      .maybeSingle();

    if (nextError) throw nextError;

    if (!nextTicket) return null;

    const { data, error } = await (supabase as any)
      .from('queue_tickets')
      .update({ status: 'called', called_at: new Date().toISOString() })
      .eq('id', nextTicket.id)
      .select()
      .single();
    if (error) throw error;
    return data as QueueTicket;
  },

  async updateTicketStatus(ticketId: string, status: QueueTicket['status']) {
    const updates: any = { status };
    if (status === 'serving') updates.served_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from('queue_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();
    if (error) throw error;
    return data as QueueTicket;
  },
};

// Export all APIs
export const eventModulesApi = {
  attendance: attendanceApi,
  roster: rosterApi,
  worship: worshipApi,
  assets: assetsApi,
  accommodation: accommodationApi,
  queue: queueApi,
};
