import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Church Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your notifications will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;