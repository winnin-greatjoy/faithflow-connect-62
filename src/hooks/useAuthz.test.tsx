import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthz } from './useAuthz';

// Create hoisted mock functions
const mockGetUser = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
}));

describe('useAuthz Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Permission Checking', () => {
    it('should return false when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuthz());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userId).toBeNull();
      expect(result.current.can('members', 'view')).toBe(false);
    });

    it('should grant all permissions for super_admin role', async () => {
      // Mock authenticated user
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'admin@test.com' } as any,
        },
        error: null,
      });

      // Mock profile with super_admin role
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { branch_id: 'branch-1', role: 'super_admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        // user_roles, role_permissions, module_role_permissions
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            in: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      });

      const { result } = renderHook(() => useAuthz());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Super admin should have access to everything
      expect(result.current.can('members', 'view')).toBe(true);
      expect(result.current.can('members', 'create')).toBe(true);
      expect(result.current.can('members', 'delete')).toBe(true);
      expect(result.current.can('finance', 'manage')).toBe(true);
      expect(result.current.can('admin', 'manage')).toBe(true);
    });

    it('should check hasRole correctly', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'leader@test.com' } as any,
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { branch_id: 'branch-1', role: 'leader' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ role: 'leader', role_id: null }],
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            in: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      });

      const { result } = renderHook(() => useAuthz());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasRole('leader')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(false);
      expect(result.current.hasRole('leader', 'pastor')).toBe(true);
    });

    it('should handle fallback permissions when no DB permissions exist', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'worker@test.com' } as any,
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { branch_id: 'branch-1', role: 'worker' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ role: 'worker', role_id: null }],
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            in: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      });

      const { result } = renderHook(() => useAuthz());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Worker should have view access to departments via fallback
      expect(result.current.can('choir', 'view')).toBe(true);
      expect(result.current.can('choir', 'create')).toBe(true);
      expect(result.current.can('choir', 'delete')).toBe(false);
    });

    it('should handle department-scoped permissions', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-dept', email: 'dept@test.com' } as any },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles')
          return {
            select: vi
              .fn()
              .mockReturnValue({
                eq: vi
                  .fn()
                  .mockReturnValue({
                    maybeSingle: vi
                      .fn()
                      .mockResolvedValue({
                        data: { branch_id: 'b1', role: 'member' },
                        error: null,
                      }),
                  }),
              }),
          };
        if (table === 'user_roles')
          return {
            select: vi
              .fn()
              .mockReturnValue({
                eq: vi
                  .fn()
                  .mockResolvedValue({
                    data: [{ role: 'member', role_id: 'r1', department_id: 'dept-123' }],
                    error: null,
                  }),
              }),
          };
        if (table === 'committee_members')
          return {
            select: vi
              .fn()
              .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          };
        if (table === 'role_permissions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              in: vi.fn().mockResolvedValue({
                data: [
                  {
                    role_id: 'r1',
                    module_id: 'mod1',
                    actions: ['view', 'update'],
                    coverage_type: 'department',
                    department_id: 'dept-123',
                    scope_type: 'global',
                    module: { slug: 'finance' },
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi
            .fn()
            .mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              in: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        };
      });

      const { result } = renderHook(() => useAuthz());
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should have access to specific department finance
      expect(result.current.can('finance', 'view')).toBe(true);
      expect(result.current.can('finance', 'update')).toBe(true);
      expect(result.current.can('finance', 'delete')).toBe(false);
    });

    it('should handle committee-scoped permissions', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-comm', email: 'comm@test.com' } as any },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles')
          return {
            select: vi
              .fn()
              .mockReturnValue({
                eq: vi
                  .fn()
                  .mockReturnValue({
                    maybeSingle: vi
                      .fn()
                      .mockResolvedValue({
                        data: { branch_id: 'b1', role: 'member' },
                        error: null,
                      }),
                  }),
              }),
          };
        if (table === 'user_roles')
          return {
            select: vi
              .fn()
              .mockReturnValue({
                eq: vi
                  .fn()
                  .mockResolvedValue({ data: [{ role: 'member', role_id: 'r2' }], error: null }),
              }),
          };
        if (table === 'committee_members')
          return {
            select: vi
              .fn()
              .mockReturnValue({
                eq: vi
                  .fn()
                  .mockResolvedValue({ data: [{ committee_id: 'comm-456' }], error: null }),
              }),
          };
        if (table === 'role_permissions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              in: vi.fn().mockResolvedValue({
                data: [
                  {
                    role_id: 'r2',
                    module_id: 'mod2',
                    actions: ['manage'],
                    coverage_type: 'committee',
                    committee_id: 'comm-456',
                    scope_type: 'global',
                    module: { slug: 'tasks' },
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi
            .fn()
            .mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              in: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        };
      });

      const { result } = renderHook(() => useAuthz());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.can('tasks', 'manage')).toBe(true);
      expect(result.current.can('tasks', 'delete')).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useAuthz());
      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after data fetch', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuthz());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
