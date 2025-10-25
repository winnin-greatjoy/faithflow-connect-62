import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const ShareAppPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Share App</h1>
      <Card>
        <CardHeader>
          <CardTitle>Share The Anchor Stone App</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Share options will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareAppPage;