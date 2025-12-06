import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface EvangelismSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvangelismSettings: React.FC<EvangelismSettingsProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evangelism Settings & Reports</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="areas">Areas</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <p>General evangelism settings coming soon</p>
                  <p className="text-sm mt-2">
                    Configure team preferences and notification settings
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outreach Areas */}
          <TabsContent value="areas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outreach Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <p>Outreach area management coming soon</p>
                  <p className="text-sm mt-2">Add, edit, and organize evangelism coverage areas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Outreaches:</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contacts Made:</span>
                      <span className="text-sm font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Conversions:</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Follow-ups Active:</span>
                      <span className="text-sm font-medium">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Members:</span>
                      <span className="text-sm font-medium">13</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Events Led:</span>
                      <span className="text-sm font-medium">35</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Conversions/Member:</span>
                      <span className="text-sm font-medium">2.6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Training Sessions:</span>
                      <span className="text-sm font-medium">4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Area Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Area Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { area: 'Downtown', percentage: 85 },
                      { area: 'North Side', percentage: 70 },
                      { area: 'South District', percentage: 65 },
                      { area: 'East End', percentage: 45 },
                    ].map((item) => (
                      <div key={item.area} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.area}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Monthly Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Conversion Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Team Performance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
