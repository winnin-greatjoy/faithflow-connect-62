
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
import{ DepartmentsModule } from '@/components/admin/DepartmentsModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { VolunteersModule } from '@/components/admin/VolunteersModule';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminDashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Determine active module based on URL path
  const getActiveModuleFromPath = (pathname: string): string => {
    if (pathname.startsWith('/admin/mens-ministry')) return 'mens-ministry';
    if (pathname.startsWith('/admin/womens-ministry')) return 'womens-ministry';
    if (pathname.startsWith('/admin/youth-ministry')) return 'youth-ministry';
    if (pathname.startsWith('/admin/childrens-ministry')) return 'childrens-ministry';
    if (pathname.startsWith('/admin/departments')) return 'departments';
    if (pathname.startsWith('/admin/members')) return 'members';
    if (pathname.startsWith('/admin/communication')) return 'communication';
    if (pathname.startsWith('/admin/finance')) return 'finance';
    if (pathname.startsWith('/admin/events')) return 'events';
    if (pathname.startsWith('/admin/reports')) return 'reports';
    if (pathname.startsWith('/admin/settings')) return 'settings';
    if (pathname.startsWith('/admin/volunteers')) return 'volunteers';
    return 'overview';
  };

  const [activeModule, setActiveModule] = useState(() => getActiveModuleFromPath(location.pathname));

  // Update active module when location changes
  useEffect(() => {
    setActiveModule(getActiveModuleFromPath(location.pathname));
  }, [location.pathname]);
  
  // Close mobile sidebar when module changes
  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    if (window.innerWidth < 1024) { // Close sidebar on mobile after selection
      setSidebarOpen(false);
    }
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MemberManagement />;
      case 'mens-ministry':
        return <MensMinistryDashboard />;
      case 'womens-ministry':
        return <WomensMinistryDashboard userRole="head" />;
      case 'youth-ministry':
        return <YouthMinistryDashboard userRole="head" />;
      case 'childrens-ministry':
        return <ChildrensMinistryDashboard userRole="head" />;
      case 'communication':
        return <CommunicationHub />;
      case 'finance':
        return <FinanceModule />;
      case 'events':
        return <EventsModule />;
      case 'departments':
        return <DepartmentsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      case 'volunteers':
        return <VolunteersModule />;
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
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {renderActiveModule()}
          </main>
          
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
