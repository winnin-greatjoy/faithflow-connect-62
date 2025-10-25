import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Church Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Church calendar will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;