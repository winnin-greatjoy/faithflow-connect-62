import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { MemberManagement } from '@/components/admin/MemberManagement';
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
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { useAuthz } from '@/hooks/useAuthz';
import { AdminProvider, useAdminContext } from '@/context/AdminContext';

// Define the inner dashboard content to use the context
const DashboardContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const { can, hasRole, loading: authzLoading } = useAuthz();
  const { loading: contextLoading } = useAdminContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine active module based on URL
  const getActiveModule = () => {
    const path = location.pathname.split('/admin/')[1];
    if (!path) return 'overview';
    return path.split('/')[0];
  };

  const activeModule = getActiveModule();

  const handleModuleChange = (module: string) => {
    if (module === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${module}`);
    }
  };

  const denied = (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You don't have permission to view this module.</p>
      </div>
    </div>
  );

  if (superadminLoading || authzLoading || contextLoading) {
    return <div>Loading...</div>;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;

      case 'members':
        return can('members', 'view') || isSuperadmin ? <MemberManagement /> : denied;
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
        />

        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Wrap the dashboard in the provider
const AdminDashboard = () => {
  return (
    <AdminProvider>
      <DashboardContent />
    </AdminProvider>
  );
};

export default AdminDashboard;
