
import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { MemberManagement } from '@/components/admin/MemberManagement';
import { CommunicationHub } from '@/components/admin/CommunicationHub';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { VolunteersModule } from '@/components/admin/VolunteersModule';
import { DepartmentsModule } from '@/components/admin/DepartmentsModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MemberManagement />;
      case 'communication':
        return <CommunicationHub />;
      case 'finance':
        return <FinanceModule />;
      case 'events':
        return <EventsModule />;
      case 'volunteers':
        return <VolunteersModule />;
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
        <AdminSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          
          <main className="flex-1 p-6">
            {renderActiveModule()}
          </main>
          
          <footer className="bg-white border-t px-6 py-4">
            <p className="text-sm text-gray-500">
              © 2024 Faith Healing Bible Church - Beccle St Branch. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
