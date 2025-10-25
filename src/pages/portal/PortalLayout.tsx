import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : ''}`;

export const PortalLayout: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/portal' || location.pathname === '/portal/';
  // When user is on the portal dashboard route we want the outlet
  // to take the full screen (no PortalLayout sidebar/padding) so
  // the PortalDashboard can render with the admin-style header/sidebar
  // and fill the viewport like AdminDashboard.
  if (isDashboard) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] p-4">
      <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4`}>
        <Card className="p-4 h-fit hidden lg:block">
          <div className="mb-6">
            <img src="[Your Church Logo]" alt="The Anchor Stone" className="w-12 h-12 mb-2" />
            <div className="text-lg font-semibold">The Anchor Stone</div>
          </div>
          <nav className="flex lg:flex-col gap-2">
            <NavLink to="/portal" end className={navLinkClass}>
              <span className="inline-block mr-2">🏠</span> Home
            </NavLink>
            <NavLink to="/portal/profile" className={navLinkClass}>
              <span className="inline-block mr-2">👤</span> My Profile
            </NavLink>
            <NavLink to="/portal/directory" className={navLinkClass}>
              <span className="inline-block mr-2">📖</span> Directory
            </NavLink>
            <NavLink to="/portal/registrations" className={navLinkClass}>
              <span className="inline-block mr-2">📝</span> My Registrations
            </NavLink>
            <NavLink to="/portal/attendance" className={navLinkClass}>
              <span className="inline-block mr-2">✔️</span> My Attendance
            </NavLink>
            <NavLink to="/portal/groups" className={navLinkClass}>
              <span className="inline-block mr-2">👥</span> Groups
            </NavLink>
            <NavLink to="/portal/calendar" className={navLinkClass}>
              <span className="inline-block mr-2">📅</span> Calendar
            </NavLink>
            <NavLink to="/portal/notifications" className={navLinkClass}>
              <span className="inline-block mr-2">🔔</span> Notifications
            </NavLink>
            <NavLink to="/portal/settings" className={navLinkClass}>
              <span className="inline-block mr-2">⚙️</span> Settings
            </NavLink>
            <NavLink to="/portal/share" className={navLinkClass}>
              <span className="inline-block mr-2">📤</span> Share App
            </NavLink>
            <NavLink to="/auth/logout" className={navLinkClass}>
              <span className="inline-block mr-2">🚪</span> Log Out
            </NavLink>
          </nav>
        </Card>

        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;
