
import React from 'react';
import { MemberPortal } from '@/components/portal/MemberPortal';

const MemberPortalDemo = () => {
  return (
    <MemberPortal
      memberId={1}
      memberName="David Clark"
      membershipLevel="baptized"
      baptizedSubLevel="worker"
      ministry="Men's Ministry"
      department="Finance Committee"
    />
  );
};

export default MemberPortalDemo;
