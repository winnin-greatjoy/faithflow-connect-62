import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SuperadminSidebar } from '@/components/admin/superadmin/SuperadminSidebar';
import { SuperadminHeader } from '@/components/admin/superadmin/SuperadminHeader';
import { SuperAdminDashboardOverview } from '@/components/admin/superadmin/SuperAdminDashboardOverview';
import { MultiBranchManagement } from '@/components/admin/superadmin/MultiBranchManagement';
import { SuperadminTransferManagement } from '@/components/admin/superadmin/SuperadminTransferManagement';
import { SystemConfiguration } from '@/components/admin/superadmin/SystemConfiguration';
import { GlobalRoleManagement } from '@/components/admin/superadmin/GlobalRoleManagement';
import { SystemReportsModule } from '@/components/admin/superadmin/SystemReportsModule';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { DashboardSkeleton } from '@/components/ui/skeletons';

const SuperadminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperadmin, loading } = useSuperadmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect non-superadmins
  useEffect(() => {
    if (!loading && !isSuperadmin) {
      navigate('/admin', { replace: true });
    }
  }, [isSuperadmin, loading, navigate]);

  const getActiveModule = () => {
    const path = location.pathname.split('/superadmin/')[1];
    if (!path) return 'overview';
    return path.split('/')[0];
  };

  const activeModule = getActiveModule();

  const handleModuleChange = (module: string) => {
    if (module === 'overview') {
      navigate('/superadmin');
    } else {
      navigate(`/superadmin/${module}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!isSuperadmin) {
    return null; // Will redirect
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <SuperAdminDashboardOverview />;
      case 'branches':
        return <MultiBranchManagement />;
      case 'transfers':
        return <SuperadminTransferManagement />;
      case 'roles':
        return <GlobalRoleManagement />;
      case 'reports':
        return <SystemReportsModule />;
      case 'settings':
        return <SystemConfiguration />;
      default:
        return <SuperAdminDashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <SuperadminSidebar
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0">
          <SuperadminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SuperadminDashboard;
