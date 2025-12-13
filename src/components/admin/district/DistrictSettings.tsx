import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const DistrictSettings: React.FC<{ district: any }> = ({ district }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>District Configuration</CardTitle>
          <CardDescription>Manage general settings for {district.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>District Name</Label>
              <Input defaultValue={district.name} />
            </div>
            <div className="space-y-2">
              <Label>Region / Location</Label>
              <Input defaultValue={district.location || ''} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding & Appearance</CardTitle>
          <CardDescription>
            Customize how the district appears in reports and communications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-32 bg-muted/20 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
            Logo Upload Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
