import { describe, it, expect, vi, beforeEach } from 'vitest';
import { choirApi } from './choirApi';

// Mock Supabase client using vi.hoisted
const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('choirApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChoirMembers', () => {
    it('should fetch choir members successfully', async () => {
      const mockMembers = [
        {
          id: '1',
          member_id: 'member-1',
          voice_part: 'soprano',
          years_experience: 5,
          member: {
            id: 'member-1',
            full_name: 'Jane Doe',
            email: 'jane@test.com',
          },
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq,
        }),
      });

      const result = await choirApi.getChoirMembers();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockMembers);
      expect(mockFrom).toHaveBeenCalledWith('department_assignments');
    });

    it('should handle errors when fetching choir members', async () => {
      const mockError = { message: 'Database error' };

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await choirApi.getChoirMembers();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to fetch choir members');
    });
  });

  describe('addChoirMember', () => {
    it('should add a new choir member successfully', async () => {
      const newMember = {
        member_id: 'member-2',
        voice_part: 'tenor' as const,
        years_experience: 3,
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...newMember, id: 'new-id' },
        error: null,
      });

      mockFrom.mockReturnValue({
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await choirApi.addChoirMember(newMember);

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('id', 'new-id');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          member_id: newMember.member_id,
          voice_part: newMember.voice_part,
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

      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await choirApi.addChoirMember(newMember);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('getChoirStats', () => {
    it('should calculate choir statistics correctly', async () => {
      const mockMembers = [
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
        { id: '3', status: 'inactive' },
      ];

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockMembers,
            error: null,
          }),
        }),
      });

      const result = await choirApi.getChoirStats();

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('totalMembers');
      expect(result.data).toHaveProperty('activeMembers');
    });
  });
});
