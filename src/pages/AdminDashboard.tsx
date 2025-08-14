
import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { MemberManagement } from '@/components/admin/MemberManagement';
import MensMinistryDashboard from '@/components/admin/MensMinistryDashboard';
import { CommunicationHub } from '@/components/admin/CommunicationHub';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { DepartmentsModule } from '@/components/admin/DepartmentsModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MemberManagement />;
      case 'mens-ministry':
        return <MensMinistryDashboard />;
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
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AdminSidebar 
          activeModule={activeModule} 
          onModuleChange={setActiveModule}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {renderActiveModule()}
          </main>
          
          <footer className="bg-white border-t px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2024 Faith Healing Bible Church - Beccle St Branch. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
