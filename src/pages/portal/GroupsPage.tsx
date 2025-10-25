import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const GroupsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Groups</h1>
      <Card>
        <CardHeader>
          <CardTitle>Church Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your group memberships will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsPage;