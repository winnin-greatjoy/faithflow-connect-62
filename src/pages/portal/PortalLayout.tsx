import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : ''}`;

export const PortalLayout: React.FC = () => {
  const location = useLocation();
  // Always render outlet full width — portal pages should use the
  // admin-style header/sidebar (PortalDashboard) and not the
  // legacy PortalLayout left card. This keeps all portal routes
  // loading inside the portal dashboard container.
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default PortalLayout;
