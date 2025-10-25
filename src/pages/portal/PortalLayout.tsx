import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : ''}`;

export const PortalLayout: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-56px)] p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-4 h-fit">
          <div className="text-sm text-gray-600 mb-2">My Portal</div>
          <nav className="flex lg:flex-col gap-2">
            <NavLink to="/portal/profile" className={navLinkClass}>Profile</NavLink>
            <NavLink to="/portal/events" className={navLinkClass}>My Events</NavLink>
            <NavLink to="/portal/departments" className={navLinkClass}>My Departments</NavLink>
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
