import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthz } from '@/hooks/useAuthz';
import { useAuth } from '@/hooks/useAuth';
import { Users, Calendar, BookOpen, Settings, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const PortalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { roles, branchId, can } = useAuthz();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 relative pb-16 lg:pb-0">
        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {/* Page Header */}
              <div className="px-2 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Hello {user?.user_metadata?.firstName || 'Winnin'},</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">We are very excited you got here, looking forward to meeting you and your family very soon!</p>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Welcome back! Access your ministry and department information.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">My Role</CardTitle>
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
                    <div className="text-xl sm:text-2xl font-bold capitalize">{roles[0] || 'Member'}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active member</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">My Departments</CardTitle>
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
                    <div className="text-xl sm:text-2xl font-bold">2</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active assignments</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Access Level</CardTitle>
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{can('admin') ? 'Full' : 'Standard'}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Current permissions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming events in 30 days</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Example events - replace with dynamic data later */}
                  <div>
                    <div className="text-sm font-medium text-blue-600">Elementary</div>
                    <div className="text-xs text-gray-600">Sun 26 Oct 2025 | 07:00 PM To 08:00 PM</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600">Preschool</div>
                    <div className="text-xs text-gray-600">Sun 09 Nov 2025 | 09:00 PM To 10:00 PM</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600">Nursery</div>
                    <div className="text-xs text-gray-600">Sun 26 Oct 2025 | 08:00 PM To 09:00 PM</div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Next 30 days</p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <Link to="/portal/profile">
                  <Button variant="outline" className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2">
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">My Profile</span>
                  </Button>
                </Link>
                <Link to="/portal/departments">
                  <Button variant="outline" className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Departments</span>
                  </Button>
                </Link>
                <Link to="/portal/events">
                  <Button variant="outline" className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Events</span>
                  </Button>
                </Link>
              </div>

              {/* Recent Activity */}
              <Card className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    <div className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">Department Assignment Approved</p>
                          <p className="text-xs text-muted-foreground mt-0.5">You've been added to Choir Department</p>
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap ml-2">2 days ago</div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">Event RSVP Confirmed</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Youth Rally - March 15th</p>
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap ml-2">5 days ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Mobile tab bar spacer */}
          <div className="lg:hidden h-16 flex-shrink-0"></div>

          <footer className="bg-white border-t px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© 2024 Faith Healing Bible Church - Beccle St Branch. All rights reserved.</p>
          </footer>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default PortalDashboard;
