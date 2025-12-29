import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { MemberManagementPage } from '@/modules/members';
import { DepartmentsModule } from '@/components/admin/DepartmentsModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { VolunteersModule } from '@/components/admin/VolunteersModule';
import { CommunicationHub } from '@/components/admin/CommunicationHub';
import { BranchSettingsModule } from '@/components/admin/BranchSettingsModule';
import { JoinRequests } from '@/components/admin/JoinRequests';
import { TransferApprovalQueue } from '@/components/admin/TransferApprovalQueue';
import { CMSDashboard } from '@/components/cms/CMSDashboard';
import { StreamingModule } from '@/components/admin/StreamingModule';
import { BranchReportsModule } from '@/components/admin/BranchReportsModule';
import { MessageTemplateManager } from '@/components/admin/MessageTemplateManager';
import { SystemConfiguration } from '@/components/admin/superadmin/SystemConfiguration';
import { GlobalRoleManagement } from '@/components/admin/superadmin/GlobalRoleManagement';
import { SystemReportsModule } from '@/components/admin/superadmin/SystemReportsModule';
import { SuperAdminDashboardOverview } from '@/components/admin/superadmin/SuperAdminDashboardOverview';
import { MultiBranchManagement } from '@/components/admin/superadmin/MultiBranchManagement';
import { DistrictManagement } from '@/components/admin/superadmin/DistrictManagement';
import { DistrictDashboard } from '@/components/admin/district/DistrictDashboard';
import { SuperadminTransferManagement } from '@/components/admin/superadmin/SuperadminTransferManagement';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { useAuthz } from '@/hooks/useAuthz';
import { AdminProvider, useAdminContext } from '@/context/AdminContext';

// Define the inner dashboard content to use the context
const DashboardContent = ({ isPortalMode = false }: { isPortalMode?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const { can, hasRole, loading: authzLoading } = useAuthz();
  const { selectedBranchId, loading: contextLoading } = useAdminContext();

  const portalModule = useMemo(() => {
    const splat = (params as any)['*'] as string | undefined;
    if (!splat) return 'overview';
    const first = splat.split('/')[0];
    return first || 'overview';
  }, [params]);

  const portalBasePath = useMemo(() => {
    const splat = (params as any)['*'] as string | undefined;
    if (!splat) return location.pathname;
    const suffix = `/${splat}`;
    if (location.pathname.endsWith(suffix)) {
      return location.pathname.slice(0, -suffix.length);
    }
    return location.pathname;
  }, [location.pathname, params]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine active module based on URL
  const getActiveModule = () => {
    if (isPortalMode) {
      return portalModule;
    }

    const path = location.pathname.split('/admin/')[1];
    if (!path) return 'overview';
    return path.split('/')[0];
  };

  const activeModule = getActiveModule();

  const handleModuleChange = (module: string) => {
    if (isPortalMode) {
      if (module === 'overview') navigate(portalBasePath);
      else navigate(`${portalBasePath}/${module}`);
    } else {
      if (module === 'overview') {
        navigate('/admin');
      } else {
        navigate(`/admin/${module}`);
      }
    }
  };

  // ... (denied definition)

  if (superadminLoading || authzLoading || contextLoading) {
    return <div>Loading...</div>; // Replace with proper skeleton
  }

  const renderActiveModule = () => {
    // If superadmin is in "Global View" (no branch selected), show superadmin modules
    const isGlobalView = isSuperadmin && !selectedBranchId;

    const denied = (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500 max-w-md">
          You do not have the required permissions to view this module.
        </p>
      </div>
    );

    switch (activeModule) {
      case 'overview':
        // Show SuperAdmin overview ONLY if in global view AND not in portal mode
        // If in portal mode, we represent a branch, so show DashboardOverview
        // Redirect SuperAdmin to the new Governance Dashboard
        if (isGlobalView && !isPortalMode) return <Navigate to="/superadmin" replace />;
        // Show District Dashboard for District Admins if no branch selected
        if (hasRole('district_admin') && !selectedBranchId) return <DistrictDashboard />;

        return <DashboardOverview />;

      // Superadmin Specific Modules - Only accessible in Global View
      // ... (keep same)
      // Superadmin Specific Modules - Redirect to new Dashboard
      // All these are now handled in the dedicated /superadmin route
      case 'superadmin-transfers':
        return isSuperadmin && !isPortalMode ? (
          <Navigate to="/superadmin/transfers" replace />
        ) : (
          denied
        );
      case 'system-config':
        return isSuperadmin && !isPortalMode ? (
          <Navigate to="/superadmin/settings" replace />
        ) : (
          denied
        );
      case 'global-roles':
        return isSuperadmin && !isPortalMode ? <Navigate to="/superadmin/users" replace /> : denied;
      case 'system-reports':
        return isSuperadmin && !isPortalMode ? (
          <Navigate to="/superadmin/reports" replace />
        ) : (
          denied
        );

      case 'districts':
        return isSuperadmin && !isPortalMode ? (
          <Navigate to="/superadmin/districts" replace />
        ) : (
          denied
        );

      case 'members':
        return can('members', 'view') || isSuperadmin ? <OptimizedMemberManagement /> : denied;
      case 'departments':
        return can('departments', 'view') || isSuperadmin ? <DepartmentsModule /> : denied;
      case 'events':
        return can('events', 'view') || isSuperadmin ? <EventsModule /> : denied;
      case 'finance':
        return can('finance', 'view') || isSuperadmin ? <FinanceModule /> : denied;
      case 'volunteers':
        return can('volunteers', 'view') || isSuperadmin ? <VolunteersModule /> : denied;
      case 'communication':
        return can('communication', 'view') || isSuperadmin ? <CommunicationHub /> : denied;
      case 'join-requests':
        return can('members', 'manage') || isSuperadmin ? <JoinRequests /> : denied;
      case 'transfers':
        return can('members', 'manage') || isSuperadmin ? <TransferApprovalQueue /> : denied;
      case 'branch-settings':
        return hasRole('super_admin', 'admin') ? <BranchSettingsModule /> : denied;
      case 'cms':
        // Assuming CMS access requires 'manage' on 'content' or similar, or just admin access
        return hasRole('super_admin', 'admin') ? <CMSDashboard /> : denied;
      case 'streaming':
        return can('streaming', 'view') || isSuperadmin ? <StreamingModule /> : denied;
      case 'reports':
        return can('reports', 'view') || isSuperadmin ? <BranchReportsModule /> : denied;
      case 'templates':
        return can('communication', 'manage') || isSuperadmin ? <MessageTemplateManager /> : denied;

      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          variant="admin"
          isPortalMode={isPortalMode}
        />

        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0">
          <AdminHeader
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            isPortalMode={isPortalMode}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Wrap the dashboard in the provider
const AdminDashboard = ({ isPortalMode = false }: { isPortalMode?: boolean }) => {
  const params = useParams();
  const location = useLocation();

  // Get branchId from params if in portal mode, OR from navigation state if passed (e.g. from Superadmin "Manage" button)
  // URL: /branch-portal/:branchId/*
  const initialBranchId = isPortalMode ? params.branchId : (location.state as any)?.branchId;

  return (
    <AdminProvider initialBranchId={initialBranchId}>
      <DashboardContent isPortalMode={isPortalMode} />
    </AdminProvider>
  );
};

export default AdminDashboard;
