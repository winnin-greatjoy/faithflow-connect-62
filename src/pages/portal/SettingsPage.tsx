import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Portal Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your portal settings will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;