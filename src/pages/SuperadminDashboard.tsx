import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SuperadminSidebar } from '@/components/admin/superadmin/SuperadminSidebar';
import { SuperadminHeader } from '@/components/admin/superadmin/SuperadminHeader';
import { SuperadminOverview } from '@/components/admin/superadmin/SuperadminOverview';
import { DistrictManagement } from '@/components/admin/superadmin/DistrictManagement';
import { SuperadminTransferManagement } from '@/components/admin/superadmin/SuperadminTransferManagement';
import { SuperadminUsersRoles } from '@/components/admin/superadmin/SuperadminUsersRoles';
import { SystemReportsModule } from '@/components/admin/superadmin/SystemReportsModule';
import { SystemConfiguration } from '@/components/admin/superadmin/SystemConfiguration';
import { AuditLogsModule } from '@/components/admin/superadmin/AuditLogsModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { SuperAdminFinanceDashboard } from '@/components/admin/superadmin/SuperAdminFinanceDashboard';
import { SuperAdminCMSDashboard } from '@/components/admin/superadmin/SuperAdminCMSDashboard';
import { SuperAdminStreamingDashboard } from '@/components/admin/superadmin/SuperAdminStreamingDashboard';
import { AdminProvider } from '@/context/AdminContext';
import { Loader2 } from 'lucide-react';

const SuperadminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperadmin, loading } = useSuperadmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine active module from URL
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access denied for non-superadmins
  if (!isSuperadmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You do not have permission to access the Superadmin Dashboard.
        </p>
        <button onClick={() => navigate('/admin')} className="text-primary hover:underline">
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <SuperadminOverview />;
      case 'districts':
        return <DistrictManagement />;
      case 'transfers':
        return <SuperadminTransferManagement />;
      case 'users':
        return <SuperadminUsersRoles />;
      case 'finance':
        return <SuperAdminFinanceDashboard />;
      case 'cms':
        return <SuperAdminCMSDashboard />;
      case 'streaming':
        return <SuperAdminStreamingDashboard />;
      case 'reports':
        return <SystemReportsModule />;
      case 'events':
        return <EventsModule />;
      case 'settings':
        return <SystemConfiguration />;
      case 'audit':
        return <AuditLogsModule />;
      default:
        return <SuperadminOverview />;
    }
  };

  return (
    <AdminProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-muted/30 flex w-full">
          <SuperadminSidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <SuperadminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminProvider>
  );
};

export default SuperadminDashboard;
