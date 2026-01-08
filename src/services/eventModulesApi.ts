/**
 * Event Modules API Service
 * Provides CRUD operations for all event management module tables
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPE DEFINITIONS (until types.ts is regenerated)
// ============================================

export interface EventZone {
  id: string;
  event_id: string;
  name: string;
  capacity: number | null;
  current_occupancy: number;
  zone_type: 'main_hall' | 'overflow' | 'outdoor' | 'children' | 'vip' | 'other';
  created_at: string;
}

export interface EventAttendance {
  id: string;
  event_id: string;
  member_id: string | null;
  zone_id: string | null;
  status: 'checked_in' | 'active' | 'checked_out';
  checked_in_at: string;
  checked_out_at: string | null;
  checked_in_by: string | null;
  notes: string | null;
}

export interface EventShift {
  id: string;
  event_id: string;
  role: string;
  department: string | null;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  notes: string | null;
}

export interface ShiftAssignment {
  id: string;
  shift_id: string;
  member_id: string;
  status: 'confirmed' | 'pending' | 'declined';
  assigned_at: string;
  confirmed_at: string | null;
}

export interface Song {
  id: string;
  branch_id: string;
  title: string;
  artist: string | null;
  original_key: string | null;
  bpm: number | null;
  duration: string | null;
  tags: string[] | null;
  theme: string | null;
  lyrics: string | null;
  chord_chart_url: string | null;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  event_id: string;
  song_id: string | null;
  item_type: 'song' | 'prayer' | 'sermon' | 'announcement' | 'offering' | 'other';
  title: string;
  duration: string | null;
  start_time: string | null;
  item_order: number;
  assigned_to: string | null;
  key_override: string | null;
  notes: string | null;
}

export interface Asset {
  id: string;
  branch_id: string;
  name: string;
  category: 'audio' | 'visual' | 'lighting' | 'furniture' | 'instruments' | 'other';
  serial_number: string | null;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  location: string | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | null;
  notes: string | null;
  created_at: string;
}

export interface AssetCheckout {
  id: string;
  asset_id: string;
  event_id: string | null;
  checked_out_to: string | null;
  checked_out_by: string | null;
  checked_out_at: string;
  expected_return: string | null;
  returned_at: string | null;
  notes: string | null;
}

export interface MaintenanceTicket {
  id: string;
  asset_id: string;
  reported_by: string | null;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Queue {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'closed';
  max_capacity: number | null;
  avg_service_time: number | null;
}

export interface QueueTicket {
  id: string;
  queue_id: string;
  ticket_number: string;
  member_id: string | null;
  guest_name: string | null;
  priority: 'normal' | 'priority' | 'vip';
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'no_show';
  joined_at: string;
  called_at: string | null;
  served_at: string | null;
  completed_at: string | null;
}

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

  async createQueue(queue: Omit<Queue, 'id'>) {
    const { data, error } = await (supabase as any).from('queues').insert(queue).select().single();
    if (error) throw error;
    return data as Queue;
  },

  async joinQueue(
    queueId: string,
    ticket: Omit<QueueTicket, 'id' | 'joined_at' | 'ticket_number'>
  ) {
    // Generate ticket number
    const { count } = await (supabase as any)
      .from('queue_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queueId);

    const ticketNumber = `Q${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await (supabase as any)
      .from('queue_tickets')
      .insert({ ...ticket, queue_id: queueId, ticket_number: ticketNumber })
      .select()
      .single();
    if (error) throw error;
    return data as QueueTicket;
  },

  async callNext(queueId: string) {
    // Find next waiting ticket
    const { data: nextTicket } = await (supabase as any)
      .from('queue_tickets')
      .select('id')
      .eq('queue_id', queueId)
      .eq('status', 'waiting')
      .order('priority', { ascending: false })
      .order('joined_at')
      .limit(1)
      .single();

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
  queue: queueApi,
};
