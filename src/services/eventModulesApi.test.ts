import { beforeEach, describe, expect, it, vi } from 'vitest';
import { accommodationApi } from './eventModulesApi';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('eventModulesApi.accommodationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses event-scoped bookings query when room_bookings.event_id exists', async () => {
    const bookings = [{ id: 'b1', event_id: 'evt-1', room_id: null }];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'room_bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: bookings, error: null }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await accommodationApi.getBookings('evt-1');
    expect(result).toEqual(bookings);
    expect(mockFrom).toHaveBeenCalledWith('room_bookings');
    expect(mockFrom).not.toHaveBeenCalledWith('rooms');
  });

  it('throws when event-scoped booking query fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'room_bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'query failed' },
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(accommodationApi.getBookings('evt-legacy')).rejects.toEqual({
      message: 'query failed',
    });
  });

  it('creates unassigned booking successfully with event scope', async () => {
    const created = { id: 'b-new', event_id: 'evt-1', room_id: null };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'room_bookings') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: created,
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(
      accommodationApi.createBooking({
        event_id: 'evt-1',
        room_id: null,
        guest_name: 'Guest A',
        check_in_date: '2026-02-25',
        check_out_date: '2026-02-26',
      })
    ).resolves.toEqual(created);
  });

  it('prevents room deletion when bookings are linked', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'room_bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [{ id: 'b1' }], error: null }),
            }),
          }),
        };
      }
      if (table === 'rooms') {
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(accommodationApi.deleteRoom('r-1')).rejects.toThrow(
      'Cannot delete room with linked bookings'
    );
  });

  it('deletes booking successfully', async () => {
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'room_bookings') {
        return {
          delete: vi.fn().mockReturnValue({
            eq: deleteEq,
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(accommodationApi.deleteBooking('b-1')).resolves.toBeUndefined();
    expect(deleteEq).toHaveBeenCalledWith('id', 'b-1');
  });
});
