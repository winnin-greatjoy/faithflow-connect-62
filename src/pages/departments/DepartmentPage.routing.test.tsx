import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DepartmentPage } from './DepartmentPage';

const mockToast = vi.fn();

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

const mockGenericDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Generic Department Dashboard:{departmentId}</div>
));
const mockUsheringDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Ushering Dashboard:{departmentId}</div>
));
const mockChoirDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Choir Dashboard:{departmentId}</div>
));
const mockTechnicalDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Technical Dashboard:{departmentId}</div>
));
const mockFinanceDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Finance Dashboard:{departmentId}</div>
));
const mockEvangelismDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Evangelism Dashboard:{departmentId}</div>
));
const mockPrayerDashboard = vi.fn(({ departmentId }: { departmentId: string }) => (
  <div>Prayer Dashboard:{departmentId}</div>
));
const mockTaskBoard = vi.fn(
  ({ departmentId, canEdit }: { departmentId: string; canEdit: boolean }) => (
    <div>
      Department Task Board:{departmentId}:{String(canEdit)}
    </div>
  )
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: [string]) => mockFrom(...args),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/ui/skeletons', () => ({
  DashboardSkeleton: () => <div>Loading Skeleton</div>,
}));

vi.mock('@/components/departments/DepartmentDashboard', () => ({
  DepartmentDashboard: (props: unknown) => mockGenericDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/UsheringDashboard', () => ({
  UsheringDashboard: (props: unknown) => mockUsheringDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/ChoirDashboard', () => ({
  ChoirDashboard: (props: unknown) => mockChoirDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/TechnicalDashboard', () => ({
  TechnicalDashboard: (props: unknown) => mockTechnicalDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/FinanceDashboard', () => ({
  FinanceDashboard: (props: unknown) => mockFinanceDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/EvangelismDashboard', () => ({
  EvangelismDashboard: (props: unknown) =>
    mockEvangelismDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/PrayerTeamDashboard', () => ({
  PrayerTeamDashboard: (props: unknown) => mockPrayerDashboard(props as { departmentId: string }),
}));

vi.mock('@/components/departments/DepartmentTaskBoard', () => ({
  DepartmentTaskBoard: (props: unknown) =>
    mockTaskBoard(props as { departmentId: string; canEdit: boolean }),
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/departments/:slug" element={<DepartmentPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('DepartmentPage routing and dashboard rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  });

  it.each([
    ['ushering', 'Ushering Dashboard:dept-1'],
    ['choir', 'Choir Dashboard:dept-1'],
    ['technical', 'Technical Dashboard:dept-1'],
    ['finance', 'Finance Dashboard:dept-1'],
    ['evangelism', 'Evangelism Dashboard:dept-1'],
    ['prayer-team', 'Prayer Dashboard:dept-1'],
  ])('renders specialized dashboard for %s slug', async (slug, expectedText) => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'dept-1', name: 'Department', slug, branch_id: 'branch-1' },
      error: null,
    });

    renderAt(`/departments/${slug}`);

    await waitFor(() => expect(screen.getByText(expectedText)).toBeInTheDocument());
  });

  it('renders generic dashboard shell for non-specialized slug', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'dept-2', name: 'Care', slug: 'care', branch_id: 'branch-1' },
      error: null,
    });

    renderAt('/departments/care');

    await waitFor(() =>
      expect(screen.getByText('Generic Department Dashboard:dept-2')).toBeInTheDocument()
    );
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tasks/i })).toBeInTheDocument();
  });

  it('shows not found state and toasts when department does not exist', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    renderAt('/departments/missing');

    await waitFor(() => expect(screen.getByText(/department not found/i)).toBeInTheDocument());
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Department not found',
      })
    );
  });
});
