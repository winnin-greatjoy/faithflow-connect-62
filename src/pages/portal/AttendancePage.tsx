import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Attendance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your attendance history will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;