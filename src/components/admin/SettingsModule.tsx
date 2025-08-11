
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Church, Users, Bell, Shield, Database } from 'lucide-react';

export const SettingsModule = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your church management system preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Church className="mr-2 h-5 w-5" />
                Church Information
              </CardTitle>
              <CardDescription>Basic information about your church</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Church Name</label>
                  <Input value="Faith Healing Bible Church" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Branch/Location</label>
                  <Input value="Beccle St Branch" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input value="123 Beccle Street, London, UK" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input value="+44 20 1234 5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input value="info@fhbcbeccle.org" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <Input value="www.fhbcbeccle.org" />
              </div>
              
              <Button>Save Church Information</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Automatic Member Check-in</label>
                  <p className="text-sm text-gray-500">Enable QR code scanning for event attendance</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-sm text-gray-500">Send email updates for important events</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Send SMS reminders and alerts</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Public Website Integration</label>
                  <p className="text-sm text-gray-500">Sync events and announcements with public site</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">New Member Registration</label>
                    <p className="text-sm text-gray-500">Get notified when someone joins the church</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Event Registration</label>
                    <p className="text-sm text-gray-500">Notifications for new event sign-ups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Donation Alerts</label>
                    <p className="text-sm text-gray-500">Get notified of large donations or milestones</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Volunteer Schedule Changes</label>
                    <p className="text-sm text-gray-500">Alerts when volunteers update their availability</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Weekly Reports</label>
                    <p className="text-sm text-gray-500">Automatic weekly summary emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage admin users and their permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Current Admin Users</h4>
                  <p className="text-sm text-gray-500">People with access to the admin dashboard</p>
                </div>
                <Button size="sm">Add New User</Button>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-gray-500">admin@fhbcbeccle.org</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Super Admin</span>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Two-Factor Authentication</label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Session Timeout</label>
                  <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                </div>
                <select className="border rounded px-3 py-1 text-sm">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>4 hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Login Audit Trail</label>
                  <p className="text-sm text-gray-500">Log all admin login attempts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>Connect with third-party services and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Service (Mailgun)</h4>
                    <p className="text-sm text-gray-500">Connected - Sending newsletters and notifications</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Gateway (Stripe)</h4>
                    <p className="text-sm text-gray-500">Connected - Processing online donations</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">SMS Service (Twilio)</h4>
                    <p className="text-sm text-gray-500">Not connected - Click to set up SMS notifications</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Video Streaming (YouTube)</h4>
                    <p className="text-sm text-gray-500">Not connected - Integrate with live streams</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
