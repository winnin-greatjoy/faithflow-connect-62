import { describe, it, expect, vi, beforeEach } from 'vitest';
import { choirApi } from './choirApi';

// Mock Supabase client using vi.hoisted
const mockFrom = vi.hoisted(() => vi.fn());
const mockGetUser = vi.hoisted(() => vi.fn());

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  },
}));

describe('choirApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
  });

  describe('getChoirMembers', () => {
    it('should fetch choir members successfully', async () => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          member_id: 'member-1',
          department_id: 'choir-dept',
          assigned_date: '2026-03-01T10:00:00Z',
          status: 'approved',
          approved_by: null,
          approved_date: null,
          assigned_by: 'user-1',
          created_at: '2026-03-01T10:00:00Z',
          reason: null,
          type: 'assignment',
          updated_at: '2026-03-01T10:00:00Z',
          member: {
            id: 'member-1',
            full_name: 'Jane Doe',
            email: 'jane@test.com',
            assigned_department: 'choir',
          },
        },
      ];

      const queryBuilder = {
        eq: vi.fn(),
        order: vi.fn().mockResolvedValue({
          data: mockAssignments,
          error: null,
        }),
        range: vi.fn(),
      };
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.range.mockReturnValue(queryBuilder);

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue(queryBuilder),
      });

      const result = await choirApi.getChoirMembers();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toMatchObject({
        id: 'assignment-1',
        member_id: 'member-1',
        voice_part: 'soprano',
      });
      expect(queryBuilder.order).toHaveBeenCalledWith('assigned_date', { ascending: false });
      expect(mockFrom).toHaveBeenCalledWith('department_assignments');
    });

    it('should handle errors when fetching choir members', async () => {
      const mockError = { message: 'Database error' };
      const queryBuilder = {
        eq: vi.fn(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
        range: vi.fn(),
      };
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.range.mockReturnValue(queryBuilder);

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue(queryBuilder),
      });

      const result = await choirApi.getChoirMembers();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('addChoirMember', () => {
    it('should add a new choir member successfully', async () => {
      const newMember = {
        member_id: 'member-2',
        voice_part: 'tenor' as const,
        years_experience: 3,
      };

      const mockInsert = vi.fn();
      const mockUpdate = vi.fn();
      let departmentAssignmentsCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'department_assignments') {
          departmentAssignmentsCallCount += 1;

          if (departmentAssignmentsCallCount === 1) {
            return {
              insert: mockInsert.mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'assignment-1' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'assignment-1',
                    member_id: 'member-2',
                    department_id: 'choir-dept',
                    assigned_date: '2026-03-01T11:00:00Z',
                    status: 'approved',
                    approved_by: null,
                    approved_date: null,
                    assigned_by: 'user-1',
                    created_at: '2026-03-01T11:00:00Z',
                    reason: 'Choir member registration',
                    type: 'assignment',
                    updated_at: '2026-03-01T11:00:00Z',
                    member: {
                      id: 'member-2',
                      full_name: 'John Doe',
                      assigned_department: 'choir',
                    },
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === 'members') {
          return {
            update: mockUpdate.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'member-2' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table mock: ${table}`);
      });

      const result = await choirApi.addChoirMember(newMember);

      expect(result.error).toBeNull();
      expect(result.data).toMatchObject({
        id: 'assignment-1',
        member_id: 'member-2',
        voice_part: 'tenor',
        years_experience: 3,
      });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          member_id: 'member-2',
          department_id: 'choir-dept',
          assigned_by: 'user-1',
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          assigned_department: 'choir',
        })
      );
    });

    it('should handle errors when adding choir member', async () => {
      const newMember = {
        member_id: 'member-2',
        voice_part: 'tenor' as const,
        years_experience: 3,
      };
      const mockError = { message: 'Insert failed' };

      mockFrom.mockImplementation((table: string) => {
        if (table === 'department_assignments') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: mockError,
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table mock: ${table}`);
      });

      const result = await choirApi.addChoirMember(newMember);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Insert failed');
    });
  });

  describe('getChoirStats', () => {
    it('should calculate choir statistics correctly', async () => {
      let membersCallCount = 0;
      let eventsCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'members') {
          membersCallCount += 1;

          if (membersCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ id: '1' }, { id: '2' }, { id: '3' }],
                  error: null,
                }),
              }),
            };
          }

          const secondEq = vi.fn().mockResolvedValue({
            data: [{ id: '1' }, { id: '2' }],
            error: null,
          });

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: secondEq,
              }),
            }),
          };
        }

        if (table === 'events') {
          eventsCallCount += 1;

          if (eventsCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: [{ id: 'event-1' }],
                  error: null,
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              lt: vi.fn().mockResolvedValue({
                data: [{ id: 'event-2' }, { id: 'event-3' }],
                error: null,
              }),
            }),
          };
        }

        throw new Error(`Unexpected table mock: ${table}`);
      });

      const result = await choirApi.getChoirStats();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(
        expect.objectContaining({
          totalMembers: 3,
          activeMembers: 2,
          upcomingEvents: 1,
          completedActivities: 2,
          monthlyGrowth: 8,
        })
      );
    });
  });
});
