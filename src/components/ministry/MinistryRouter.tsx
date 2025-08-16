
import React from 'react';
import WomensMinistryDashboard from './WomensMinistryDashboard';
import YouthMinistryDashboard from './YouthMinistryDashboard';
import ChildrensMinistryDashboard from './ChildrensMinistryDashboard';
import MensMinistryDashboard from '../admin/MensMinistryDashboard';

interface MinistryRouterProps {
  ministryType: 'mens' | 'womens' | 'youth' | 'childrens';
  userRole: string;
}

export const MinistryRouter = ({ ministryType, userRole }: MinistryRouterProps) => {
  switch (ministryType) {
    case 'mens':
      return <MensMinistryDashboard />;
    case 'womens':
      return <WomensMinistryDashboard userRole={userRole as any} />;
    case 'youth':
      return <YouthMinistryDashboard userRole={userRole as any} />;
    case 'childrens':
      return <ChildrensMinistryDashboard userRole={userRole as any} />;
    default:
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground">Ministry Not Found</h3>
          <p className="text-sm text-muted-foreground">The requested ministry dashboard is not available.</p>
        </div>
      );
  }
};
