import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const DirectoryPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Church Directory</h1>
      <Card>
        <CardHeader>
          <CardTitle>Members Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Directory content will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectoryPage;