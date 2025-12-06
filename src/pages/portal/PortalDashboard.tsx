import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthz } from '@/hooks/useAuthz';
import { useAuth } from '@/hooks/useAuth';
import { Users, Calendar, BookOpen, Settings, User, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const PortalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { roles, branchId, can } = useAuthz();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<string>(() =>
    location.pathname === '/portal' || location.pathname === '/portal/' ? 'overview' : 'overview'
  );
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
  };

  const getActiveModuleFromPath = (pathname: string) => {
    if (pathname === '/portal' || pathname === '/portal/') return 'overview';
    if (pathname.startsWith('/portal/profile')) return 'profile';
    if (pathname.startsWith('/portal/directory')) return 'directory';
    if (pathname.startsWith('/portal/registrations')) return 'registrations';
    if (pathname.startsWith('/portal/attendance')) return 'attendance';
    if (pathname.startsWith('/portal/groups')) return 'groups';
    if (pathname.startsWith('/portal/calendar')) return 'calendar';
    if (pathname.startsWith('/portal/streaming')) return 'streaming';
    if (pathname.startsWith('/portal/notifications')) return 'notifications';
    if (pathname.startsWith('/portal/settings')) return 'settings';
    if (pathname.startsWith('/portal/share')) return 'share';
    if (pathname.startsWith('/portal/events')) return 'events';
    if (pathname.startsWith('/portal/departments')) return 'departments';
    return 'overview';
  };

  useEffect(() => {
    setActiveModule(getActiveModuleFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingEvents(true);
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        const end = endDate.toISOString().slice(0, 10);

        const { data: evs, error } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', start)
          .lte('event_date', end)
          .order('event_date', { ascending: true })
          .limit(20);

        if (error) console.error('Error fetching events', error);
        if (mounted) setEvents(evs || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const renderActiveModule = () => {
    // The Portal dashboard is used as a layout for portal child routes.
    // The actual 'home' / overview content has been moved to a separate HomePage component
    // so the dashboard should simply render the child route Outlet.
    return <Outlet />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 relative pb-16 lg:pb-0">
        <div className="lg:sticky lg:top-0 lg:left-0 lg:bottom-0 lg:z-20">
          <AdminSidebar
            variant="portal"
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={isSidebarCollapsed}
            onCollapse={setIsSidebarCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">{renderActiveModule()}</main>

          <div className="lg:hidden h-16 flex-shrink-0" />

          <footer className="bg-white border-t px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2024 Faith Healing Bible Church - Beccle St Branch. All rights reserved.
            </p>
          </footer>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default PortalDashboard;
