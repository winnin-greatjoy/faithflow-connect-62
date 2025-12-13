import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Church, Users, Bell, Shield, Database, Edit } from 'lucide-react';
import { RolesManager } from '@/components/admin/roles/RolesManager';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null; // Profile might not have email, but we often join or store it. Wait, profiles table doesn't have email in schema usually, it's in auth. But previous code in DistrictManagement fetched it?
  // Checking DistrictManagement fetching:
  // membersRes.data.map(p => ({ ... email: null ... }))
  // So profiles table doesn't have email readily available unless we join auth.
  // BUT `admin-create-member` uses `data.email` to insert into members.
  // Members table HAS email. Profiles table DOES NOT usually.
  // If we list "Current Admin Users", we are listing PROFILES.
  // Profiles are linked to Members? Ideally one to one.
  // Let's use `full_name` and `role`. Email might be missing or we try to fetch it?
  // Getting email from `auth.users` client side is not easy (admin only).
  // We can join `members` table on `id` -> `id` (if they are same?)
  // Actually, `admin-create-member` tries to keep them in sync.
  // Let's try to join members to get email.
  role: string | null;
}

// Update User interface to reflect what we can actually get easily
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: string | null;
  // We will try to get email from linked member record if possible
  member?: {
    email: string | null;
  };
}

export const SystemConfiguration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Dialog states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Fetch profiles with administrative roles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'super_admin', 'district_admin'] as any)
        .order('first_name');

      if (error) throw error;

      setUsers((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Configuration</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Configure system-wide settings and integrations (Superadmin Only).
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <div className="relative">
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-full md:w-auto flex-nowrap justify-start md:justify-normal px-4 md:px-0">
              <TabsTrigger value="general" className="whitespace-nowrap">
                General
              </TabsTrigger>
              <TabsTrigger value="notifications" className="whitespace-nowrap">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">
                Users & Permissions
              </TabsTrigger>
              <TabsTrigger value="integrations" className="whitespace-nowrap">
                Integrations
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
        </div>

        <TabsContent value="general" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Church className="mr-2 h-5 w-5 flex-shrink-0" />
                Church Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Basic information about your church
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Church Name</label>
                  <Input value="Faith Healing Bible Church" readOnly className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Branch/Location</label>
                  <Input value="Beccle St Branch" readOnly className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Address</label>
                  <Input value="123 Beccle Street, London, UK" readOnly className="w-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                    <Input value="+44 20 1234 5678" readOnly className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <Input value="info@fhbcbeccle.org" readOnly className="w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Website</label>
                  <Input value="www.fhbcbeccle.org" readOnly className="w-full" />
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full sm:w-auto">Save Church Information</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">System Preferences</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex items-start space-x-4 py-3">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">
                    Automatic Member Check-in
                  </label>
                  <p className="text-xs text-gray-500">
                    Enable QR code scanning for event attendance
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-start space-x-4 py-3 border-t">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">Email Notifications</label>
                  <p className="text-xs text-gray-500">Send email updates for important events</p>
                </div>
                <div className="flex-shrink-0">
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-start space-x-4 py-3 border-t">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">SMS Notifications</label>
                  <p className="text-xs text-gray-500">Send SMS reminders and alerts</p>
                </div>
                <div className="flex-shrink-0">
                  <Switch />
                </div>
              </div>

              <div className="flex items-start space-x-4 py-3 border-t">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">
                    Public Website Integration
                  </label>
                  <p className="text-xs text-gray-500">
                    Sync events and announcements with public site
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Bell className="mr-2 h-5 w-5 flex-shrink-0" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-1">
                <div className="flex items-start space-x-4 py-3">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">
                      New Member Registration
                    </label>
                    <p className="text-xs text-gray-500">
                      Get notified when someone joins the church
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Event Registration</label>
                    <p className="text-xs text-gray-500">Notifications for new event sign-ups</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Donation Alerts</label>
                    <p className="text-xs text-gray-500">
                      Get notified of large donations or milestones
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">
                      Volunteer Schedule Changes
                    </label>
                    <p className="text-xs text-gray-500">
                      Alerts when volunteers update their availability
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Weekly Reports</label>
                    <p className="text-xs text-gray-500">Automatic weekly summary emails</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Users className="mr-2 h-5 w-5 flex-shrink-0" />
                User Management
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage admin users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-sm sm:text-base">Current Admin Users</h4>
                  <p className="text-xs sm:text-sm text-gray-500">
                    People with access to the admin dashboard
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setIsCreateUserOpen(true)}
                >
                  Add New User
                </Button>
              </div>

              <div className="space-y-3">
                {loadingUsers ? (
                  <div className="text-center py-4 text-gray-500">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No admin users found.</div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {user.first_name?.[0] || user.full_name?.[0] || 'U'}
                          {user.last_name?.[0] || ''}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {user.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate capitalize">
                            {user.role?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-0 mt-2 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 sm:px-3"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit Role
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Roles & Permissions</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create roles (admin, leader, member, etc.), assign permissions per module, and
                assign to users
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <RolesManager />
            </CardContent>
          </Card>

          {/* Dialogs */}
          <CreateUserDialog
            open={isCreateUserOpen}
            onOpenChange={setIsCreateUserOpen}
            onSuccess={fetchUsers}
          />

          <EditUserDialog
            open={isEditUserOpen}
            onOpenChange={setIsEditUserOpen}
            user={selectedUser}
            onSuccess={fetchUsers}
          />

          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Shield className="mr-2 h-5 w-5 flex-shrink-0" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-1">
                <div className="flex items-start space-x-4 py-3">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">
                      Two-Factor Authentication
                    </label>
                    <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-t">
                  <div className="mb-2 sm:mb-0 sm:mr-4">
                    <label className="block text-sm font-medium mb-1">Session Timeout</label>
                    <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="border rounded-md px-3 py-1.5 text-sm h-9 w-full sm:w-40">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                  </select>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Login Audit Trail</label>
                    <p className="text-xs text-gray-500">Log all admin login attempts</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Database className="mr-2 h-5 w-5 flex-shrink-0" />
                External Integrations
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Connect with third-party services and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium text-sm sm:text-base mb-0.5">
                      Email Service (Mailgun)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Connected - Sending newsletters and notifications
                    </p>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                      Active
                    </span>
                    <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                      <span className="sr-only sm:not-sr-only">Configure</span>
                      <span className="sm:hidden">⚙️</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium text-sm sm:text-base mb-0.5">
                      Payment Gateway (Stripe)
                    </h4>
                    <p className="text-xs text-gray-500">Connected - Processing online donations</p>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                      Active
                    </span>
                    <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                      <span className="sr-only sm:not-sr-only">Configure</span>
                      <span className="sm:hidden">⚙️</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium text-sm sm:text-base mb-0.5">
                      SMS Service (Twilio)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Not connected - Click to set up SMS notifications
                    </p>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded whitespace-nowrap">
                      Inactive
                    </span>
                    <Button size="sm" className="h-8 px-2 sm:px-3">
                      <span className="sr-only sm:not-sr-only">Connect</span>
                      <span className="sm:hidden">🔗</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium text-sm sm:text-base mb-0.5">
                      Video Streaming (YouTube)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Not connected - Integrate with live streams
                    </p>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded whitespace-nowrap">
                      Inactive
                    </span>
                    <Button size="sm" className="h-8 px-2 sm:px-3">
                      <span className="sr-only sm:not-sr-only">Connect</span>
                      <span className="sm:hidden">🔗</span>
                    </Button>
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
