import React from 'react';
import { MultiBranchView } from './MultiBranchView';

/**
 * Multi-Branch Management Module for Superadmin
 * Supports hierarchical structure: Main HQ > District HQs > Local Branches
 */
export const MultiBranchManagement: React.FC = () => {
  return <MultiBranchView />;
};
