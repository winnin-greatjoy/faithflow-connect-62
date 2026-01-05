import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SuperadminSidebar } from '@/components/admin/superadmin/SuperadminSidebar';
import { SuperadminHeader } from '@/components/admin/superadmin/SuperadminHeader';
import { SuperadminOverview } from '@/components/admin/superadmin/SuperadminOverview';
import { DistrictManagement } from '@/components/admin/superadmin/DistrictManagement';
import { SuperadminTransferManagement } from '@/components/admin/superadmin/SuperadminTransferManagement';
import { UsersRolesModule } from '@/components/admin/superadmin/users-roles/UsersRolesModule';
import { SystemReportsModule } from '@/components/admin/superadmin/SystemReportsModule';
import { ReportDetailPage } from '@/components/admin/superadmin/ReportDetailPage';
import { SystemConfiguration } from '@/components/admin/superadmin/SystemConfiguration';
import { AuditLogsModule } from '@/components/admin/superadmin/AuditLogsModule';
import { EventsModule } from '@/components/admin/EventsModule';
import { SuperAdminFinanceDashboard } from '@/components/admin/superadmin/SuperAdminFinanceDashboard';
import { SuperAdminCMSDashboard } from '@/components/admin/superadmin/SuperAdminCMSDashboard';
import { SuperAdminStreamingDashboard } from '@/components/admin/superadmin/SuperAdminStreamingDashboard';
import { BibleSchoolPage } from '@/modules/bible-school';
import { AdminProvider } from '@/context/AdminContext';
import { Shield } from 'lucide-react';

const SuperadminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperadmin, loading } = useSuperadmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center animate-pulse mb-6 relative z-10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary relative z-10" />
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md bg-card p-10 rounded-3xl border border-border shadow-xl scale-in-center">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-6 opacity-50" />
          <h1 className="text-3xl font-bold font-serif text-foreground mb-3">Restricted Access</h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            This terminal is reserved for global system administrators. Unauthorized access attempts
            are audited.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            Return to Branch Admin
          </button>
        </div>
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
        return <UsersRolesModule />;
      case 'bible-school':
        return <BibleSchoolPage />;
      case 'finance':
        return <SuperAdminFinanceDashboard />;
      case 'cms':
        return <SuperAdminCMSDashboard />;
      case 'streaming':
        return <SuperAdminStreamingDashboard />;
      case 'reports': {
        const pathParts = location.pathname.split('/superadmin/reports/');
        const reportId = pathParts[1];
        if (reportId) {
          return <ReportDetailPage reportId={reportId} />;
        }
        return <SystemReportsModule />;
      }
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
        <div className="min-h-screen bg-background flex w-full relative overflow-hidden">
          {/* Background */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-slate-50/50 dark:bg-slate-950/50" />

          <SuperadminSidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 h-screen overflow-hidden">
            <SuperadminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

            <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto pb-20"
              >
                {renderActiveModule()}
              </motion.div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminProvider>
  );
};

export default SuperadminDashboard;
