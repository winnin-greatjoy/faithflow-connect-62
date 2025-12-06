import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { OptimizedMemberManagement as MemberManagement } from '@/components/admin/OptimizedMemberManagement';
import { MensMinistryDashboard } from '@/components/ministry/MensMinistryDashboard';
import WomensMinistryDashboard from '@/components/ministry/WomensMinistryDashboard';
import YouthMinistryDashboard from '@/components/ministry/YouthMinistryDashboard';
import ChildrensMinistryDashboard from '@/components/ministry/ChildrenMinistryDashboard';
import { CommunicationHub } from '@/components/admin/CommunicationHub';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { DepartmentsModule } from '@/components/admin/DepartmentsModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { VolunteersModule } from '@/components/admin/VolunteersModule';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthz } from '@/hooks/useAuthz';
import { CMSDashboard } from '@/components/cms/CMSDashboard';
import { JoinRequests } from '@/components/admin/JoinRequests';
import { StreamingModule } from '@/components/admin/StreamingModule';
import {
  ChoirDashboard,
  UsheringDashboard,
  PrayerTeamDashboard,
  EvangelismDashboard,
  FinanceDashboard,
  TechnicalDashboard,
} from '@/components/departments';
import { TransferApprovalQueue } from '@/components/admin/TransferApprovalQueue';
import { MessageTemplateManager } from '@/components/admin/MessageTemplateManager';
import { MultiBranchManagement } from '@/components/admin/superadmin/MultiBranchManagement';
import { SuperadminTransferManagement } from '@/components/admin/superadmin/SuperadminTransferManagement';
import { useSuperadmin } from '@/hooks/useSuperadmin';

const AdminDashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { loading: authzLoading, can } = useAuthz();
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();

  // Determine active module based on URL path
  const getActiveModuleFromPath = (pathname: string): string => {
    if (pathname.startsWith('/admin/mens-ministry')) return 'mens-ministry';
    if (pathname.startsWith('/admin/womens-ministry')) return 'womens-ministry';
    if (pathname.startsWith('/admin/youth-ministry')) return 'youth-ministry';
    if (pathname.startsWith('/admin/childrens-ministry')) return 'childrens-ministry';
    if (
      pathname.startsWith('/admin/departments/1') ||
      pathname.startsWith('/admin/departments/choir')
    )
      return 'choir';
    if (
      pathname.startsWith('/admin/departments/2') ||
      pathname.startsWith('/admin/departments/ushering')
    )
      return 'ushering';
    if (
      pathname.startsWith('/admin/departments/3') ||
      pathname.startsWith('/admin/departments/prayer')
    )
      return 'prayer-team';
    if (
      pathname.startsWith('/admin/departments/4') ||
      pathname.startsWith('/admin/departments/evangelism')
    )
      return 'evangelism';
    if (
      pathname.startsWith('/admin/departments/5') ||
      pathname.startsWith('/admin/departments/finance-dept')
    )
      return 'finance-dept';
    if (
      pathname.startsWith('/admin/departments/6') ||
      pathname.startsWith('/admin/departments/technical')
    )
      return 'technical';
    if (pathname.startsWith('/admin/departments')) return 'departments';
    if (pathname.startsWith('/admin/join-requests')) return 'join-requests';
    if (pathname.startsWith('/admin/transfers')) return 'transfers';
    if (pathname.startsWith('/admin/members')) return 'members';
    if (pathname.startsWith('/admin/communication')) return 'communication';
    if (pathname.startsWith('/admin/finance')) return 'finance';
    if (pathname.startsWith('/admin/events')) return 'events';
    if (pathname.startsWith('/admin/streaming')) return 'streaming';
    if (pathname.startsWith('/admin/reports')) return 'reports';
    if (pathname.startsWith('/admin/settings')) return 'settings';
    if (pathname.startsWith('/admin/templates')) return 'templates';
    if (pathname.startsWith('/admin/volunteers')) return 'volunteers';
    // Superadmin routes
    if (pathname.startsWith('/admin/multi-branch')) return 'multi-branch';
    if (pathname.startsWith('/admin/superadmin-transfers')) return 'superadmin-transfers';
    return 'overview';
  };

  const [activeModule, setActiveModule] = useState(() =>
    getActiveModuleFromPath(location.pathname)
  );

  // Update active module when location changes
  useEffect(() => {
    setActiveModule(getActiveModuleFromPath(location.pathname));
  }, [location.pathname]);

  // Close mobile sidebar when module changes
  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    if (window.innerWidth < 1024) {
      // Close sidebar on mobile after selection
      setSidebarOpen(false);
    }
  };

  const renderActiveModule = () => {
    if (authzLoading) return <div className="p-6">Loading...</div>;
    const denied = (
      <div className="p-6 rounded-lg bg-white border">
        <div className="text-gray-700">You do not have access to this module.</div>
      </div>
    );
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return can('admin', 'view') ? <MemberManagement /> : denied;
      case 'mens-ministry':
        return <MensMinistryDashboard />;
      case 'womens-ministry':
        return <WomensMinistryDashboard userRole="head" />;
      case 'youth-ministry':
        return <YouthMinistryDashboard userRole="head" />;
      case 'childrens-ministry':
        return <ChildrensMinistryDashboard userRole="head" />;
      case 'choir':
        return can('choir', 'view') ? <ChoirDashboard departmentId="choir-dept-id" /> : denied;
      case 'ushering':
        return can('ushering', 'view') ? (
          <UsheringDashboard departmentId="ushering-dept-id" />
        ) : (
          denied
        );
      case 'prayer-team':
        return can('prayer', 'view') ? (
          <PrayerTeamDashboard departmentId="prayer-dept-id" />
        ) : (
          denied
        );
      case 'evangelism':
        return can('evangelism', 'view') ? (
          <EvangelismDashboard departmentId="evangelism-dept-id" />
        ) : (
          denied
        );
      case 'finance-dept':
        return can('finance', 'view') ? (
          <FinanceDashboard departmentId="finance-dept-id" />
        ) : (
          denied
        );
      case 'technical':
        return <TechnicalDashboard departmentId="technical-dept-id" />;
      case 'communication':
        return can('admin', 'view') ? <CommunicationHub /> : denied;
      case 'finance':
        return can('finance', 'view') ? <FinanceModule /> : denied;
      case 'events':
        return <EventsModule />;
      case 'departments':
        return can('admin', 'view') ? <DepartmentsModule /> : denied;
      case 'join-requests':
        return can('admin', 'view') ? <JoinRequests /> : denied;
      case 'transfers':
        return can('admin', 'view') ? <TransferApprovalQueue /> : denied;
      case 'cms':
        return <CMSDashboard />;
      case 'reports':
        return can('admin', 'view') ? <ReportsModule /> : denied;
      case 'streaming':
        return <StreamingModule />;
      case 'settings':
        return can('admin', 'manage') ? <SettingsModule /> : denied;
      case 'templates':
        return can('admin', 'manage') ? <MessageTemplateManager /> : denied;
      case 'volunteers':
        return can('admin', 'view') ? <VolunteersModule /> : denied;
      // Superadmin modules
      case 'multi-branch':
        return isSuperadmin && !superadminLoading ? <MultiBranchManagement /> : denied;
      case 'superadmin-transfers':
        return isSuperadmin && !superadminLoading ? <SuperadminTransferManagement /> : denied;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 relative pb-16 lg:pb-0">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-0 lg:left-0 lg:bottom-0 lg:z-20">
          <AdminSidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={isSidebarCollapsed}
            onCollapse={setIsSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">{renderActiveModule()}</main>

          {/* Mobile tab bar */}
          <div className="lg:hidden h-16 flex-shrink-0"></div>

          <footer className="bg-white border-t px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2024 Faith Healing Bible Church - Beccle St Branch. All rights reserved.
            </p>
          </footer>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
