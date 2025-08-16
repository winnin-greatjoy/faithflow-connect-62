
import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { MemberManagement } from '@/components/admin/MemberManagement';
import MensMinistryDashboard from '@/components/admin/MensMinistryDashboard';
import { CMSDashboard } from '@/components/cms/CMSDashboard';
import { CommunicationHub } from '@/components/admin/CommunicationHub';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { VolunteersModule } from '@/components/admin/VolunteersModule';
import { DepartmentsModule } from '@/components/admin/DepartmentsModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MemberManagement />;
      case 'mens-ministry':
        return <MensMinistryDashboard />;
      case 'cms':
        return <CMSDashboard />;
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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <AdminSidebar
          activeModule={activeModule}
          onModuleChange={(module) => {
            setActiveModule(module);
            setSidebarOpen(false); // Close sidebar on mobile after selection
          }}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 lg:ml-0">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
