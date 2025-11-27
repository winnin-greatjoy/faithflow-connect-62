import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  departmentId: string | number;
  canEdit?: boolean;
}

/**
 * DepartmentTaskBoard - Placeholder component for future task management
 * This component will be updated once the task management tables are configured in Supabase
 */
export const DepartmentTaskBoard: React.FC<Props> = ({ departmentId, canEdit = false }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Management Coming Soon</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default DepartmentTaskBoard;
