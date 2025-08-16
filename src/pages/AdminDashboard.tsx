
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
import { MinistryRouter } from '@/components/ministry/MinistryRouter';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MemberManagement />;
      case 'mens-ministry':
        return <MinistryRouter ministryType="mens" userRole="admin" />;
      case 'womens-ministry':
        return <MinistryRouter ministryType="womens" userRole="admin" />;
      case 'youth-ministry':
        return <MinistryRouter ministryType="youth" userRole="admin" />;
      case 'childrens-ministry':
        return <MinistryRouter ministryType="childrens" userRole="admin" />;
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
        return <DepartmentsModule onMinistrySelect={setActiveModule} />;
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
      <div className="min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <AdminSidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />
        
        <SidebarInset className="flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 z-40 bg-background border-b">
            <AdminHeader onMenuToggle={handleMenuToggle} />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderModule()}
            </div>
          </main>
        </SidebarInset>

        {/* Mobile Menu Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <div className="h-full">
              <AdminSidebar
                activeModule={activeModule}
                onModuleChange={(module) => {
                  setActiveModule(module);
                  setMobileMenuOpen(false);
                }}
                isMobileSheet={true}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Menu Button */}
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
          <Button
            size="lg"
            className="rounded-full shadow-lg h-14 w-14"
            onClick={handleMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
