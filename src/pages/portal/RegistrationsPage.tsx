import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const RegistrationsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Registrations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your registration history will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationsPage;