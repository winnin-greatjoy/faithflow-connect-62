import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

const mockUseSuperadmin = vi.fn();
const mockUseAuthz = vi.fn();
const mockUseAdminContext = vi.fn();

const mockMensDashboard = vi.fn(() => <div>Mens Ministry Dashboard</div>);
const mockWomensDashboard = vi.fn(({ userRole }: { userRole: string }) => (
  <div>Womens Ministry Dashboard ({userRole})</div>
));
const mockYouthDashboard = vi.fn(({ userRole }: { userRole: string }) => (
  <div>Youth Ministry Dashboard ({userRole})</div>
));
const mockChildrenDashboard = vi.fn(({ userRole }: { userRole: string }) => (
  <div>Children Ministry Dashboard ({userRole})</div>
));

vi.mock('@/hooks/useSuperadmin', () => ({
  useSuperadmin: () => mockUseSuperadmin(),
}));

vi.mock('@/hooks/useAuthz', () => ({
  useAuthz: () => mockUseAuthz(),
}));

vi.mock('@/context/AdminContext', () => ({
  AdminProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAdminContext: () => mockUseAdminContext(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock('@/components/admin/AdminSidebar', () => ({
  AdminSidebar: () => <div />,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  AdminHeader: () => <div />,
}));

vi.mock('@/components/admin/DashboardOverview', () => ({
  DashboardOverview: () => <div>Overview</div>,
}));

vi.mock('@/components/layout/CommandPalette', () => ({
  CommandPalette: () => <div />,
}));

vi.mock('@/components/layout/NotificationDrawer', () => ({
  NotificationDrawer: () => <div />,
}));

vi.mock('@/modules/members', () => ({
  MemberManagementPage: () => <div>Members</div>,
}));

vi.mock('@/modules/bible-school', () => ({
  BibleSchoolPage: () => <div>Bible School</div>,
}));

vi.mock('@/components/admin/DepartmentsModule', () => ({
  DepartmentsModule: () => <div>Departments Module</div>,
}));

vi.mock('@/components/admin/EventsModule', () => ({
  EventsModule: () => <div>Events</div>,
}));

vi.mock('@/components/admin/FinanceModule', () => ({
  FinanceModule: () => <div>Finance</div>,
}));

vi.mock('@/components/admin/VolunteersModule', () => ({
  VolunteersModule: () => <div>Volunteers</div>,
}));

vi.mock('@/components/admin/CommunicationHub', () => ({
  CommunicationHub: () => <div>Communication</div>,
}));

vi.mock('@/components/admin/BranchSettingsModule', () => ({
  BranchSettingsModule: () => <div>Branch Settings</div>,
}));

vi.mock('@/components/admin/JoinRequests', () => ({
  JoinRequests: () => <div>Join Requests</div>,
}));

vi.mock('@/components/admin/TransferApprovalQueue', () => ({
  TransferApprovalQueue: () => <div>Transfers</div>,
}));

vi.mock('@/components/cms/CMSDashboard', () => ({
  CMSDashboard: () => <div>CMS</div>,
}));

vi.mock('@/components/admin/StreamingModule', () => ({
  StreamingModule: () => <div>Streaming</div>,
}));

vi.mock('@/components/admin/BranchReportsModule', () => ({
  BranchReportsModule: () => <div>Reports</div>,
}));

vi.mock('../components/admin/BranchReportDetailPage', () => ({
  BranchReportDetailPage: () => <div>Report Detail</div>,
}));

vi.mock('@/components/admin/MessageTemplateManager', () => ({
  MessageTemplateManager: () => <div>Templates</div>,
}));

vi.mock('@/components/admin/superadmin/SystemConfiguration', () => ({
  SystemConfiguration: () => <div>System Config</div>,
}));

vi.mock('@/components/admin/superadmin/GlobalRoleManagement', () => ({
  GlobalRoleManagement: () => <div>Global Roles</div>,
}));

vi.mock('@/components/admin/superadmin/SystemReportsModule', () => ({
  SystemReportsModule: () => <div>System Reports</div>,
}));

vi.mock('@/components/admin/superadmin/SuperAdminDashboardOverview', () => ({
  SuperAdminDashboardOverview: () => <div>Superadmin Overview</div>,
}));

vi.mock('@/components/admin/superadmin/DistrictManagement', () => ({
  DistrictManagement: () => <div>Districts</div>,
}));

vi.mock('@/components/admin/district/DistrictDashboard', () => ({
  DistrictDashboard: () => <div>District Dashboard</div>,
}));

vi.mock('../components/admin/GeminiAIReportModule', () => ({
  GeminiAIReportModule: () => <div>AI Reports</div>,
}));

vi.mock('@/components/admin/superadmin/SuperadminTransferManagement', () => ({
  SuperadminTransferManagement: () => <div>Superadmin Transfers</div>,
}));

vi.mock('@/components/ministry/MensMinistryDashboard', () => ({
  default: () => mockMensDashboard(),
}));

vi.mock('@/components/ministry/WomensMinistryDashboard', () => ({
  default: (props: unknown) => mockWomensDashboard(props as { userRole: string }),
}));

vi.mock('@/components/ministry/YouthMinistryDashboard', () => ({
  default: (props: unknown) => mockYouthDashboard(props as { userRole: string }),
}));

vi.mock('@/components/ministry/ChildrenMinistryDashboard', () => ({
  default: (props: unknown) => mockChildrenDashboard(props as { userRole: string }),
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </MemoryRouter>
  );

describe('AdminDashboard ministry routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSuperadmin.mockReturnValue({ isSuperadmin: false, loading: false });
    mockUseAuthz.mockReturnValue({
      can: (moduleSlug: string, action: string = 'view') =>
        moduleSlug === 'departments' && action === 'view',
      hasRole: () => false,
      loading: false,
    });
    mockUseAdminContext.mockReturnValue({
      selectedBranchId: 'branch-1',
      setSelectedBranchId: vi.fn(),
      branchName: 'Main Branch',
      loading: false,
    });
  });

  it('renders men ministry dashboard for /admin/mens-ministry/:id', () => {
    renderAt('/admin/mens-ministry/min-1');
    expect(screen.getByText(/mens ministry dashboard/i)).toBeInTheDocument();
  });

  it('renders women ministry dashboard for /admin/womens-ministry/:id', () => {
    renderAt('/admin/womens-ministry/min-2');
    expect(screen.getByText(/womens ministry dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/\(member\)/i)).toBeInTheDocument();
  });

  it('renders youth ministry dashboard for /admin/youth-ministry/:id', () => {
    renderAt('/admin/youth-ministry/min-3');
    expect(screen.getByText(/youth ministry dashboard/i)).toBeInTheDocument();
  });

  it('renders children ministry dashboard for /admin/childrens-ministry/:id', () => {
    renderAt('/admin/childrens-ministry/min-4');
    expect(screen.getByText(/children ministry dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/\(observer\)/i)).toBeInTheDocument();
  });

  it('redirects generic ministries path back to departments module', () => {
    renderAt('/admin/ministries/min-5');
    expect(screen.getByText(/departments module/i)).toBeInTheDocument();
  });

  it('shows access denied when departments view permission is missing', () => {
    mockUseAuthz.mockReturnValue({
      can: () => false,
      hasRole: () => false,
      loading: false,
    });

    renderAt('/admin/mens-ministry/min-6');
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('passes elevated user role to women dashboard for admin users', () => {
    mockUseAuthz.mockReturnValue({
      can: () => true,
      hasRole: (...roles: string[]) => roles.includes('admin'),
      loading: false,
    });

    renderAt('/admin/womens-ministry/min-7');
    expect(screen.getByText(/\(head\)/i)).toBeInTheDocument();
  });
});
