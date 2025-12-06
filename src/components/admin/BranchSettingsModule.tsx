import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Bell, Clock, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Branch Settings Module - Branch-specific configurations
 * Only accessible to admins of the specific branch
 */
export const BranchSettingsModule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [branchData, setBranchData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    fetchBranchSettings();
  }, []);

  const fetchBranchSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's branch
      const { data: profile } = await supabase
        .from('profiles')
        .select('branch_id')
        .eq('id', user.id)
        .single();

      if (!profile?.branch_id) return;

      // Get branch details
      const { data: branch } = await supabase
        .from('church_branches')
        .select('*')
        .eq('id', profile.branch_id)
        .single();

      if (branch) {
        setBranchData({
          name: branch.name || '',
          address: branch.address || '',
          phone: branch.phone || '',
          email: branch.contact_email || '',
          website: branch.website || '',
        });
      }
    } catch (error) {
      console.error('Error fetching branch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranchInfo = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('branch_id')
        .eq('id', user.id)
        .single();

      if (!profile?.branch_id) throw new Error('No branch assigned');

      const { error } = await supabase
        .from('church_branches')
        .update({
          name: branchData.name,
          address: branchData.address,
          phone: branchData.phone,
          contact_email: branchData.email,
          website: branchData.website,
        })
        .eq('id', profile.branch_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Branch information updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update branch information',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading branch settings...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Branch Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Configure settings specific to your branch
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
        <div className="relative">
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-full md:w-auto flex-nowrap justify-start md:justify-normal px-4 md:px-0">
              <TabsTrigger value="general" className="whitespace-nowrap">
                Branch Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="whitespace-nowrap">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="whitespace-nowrap">
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Branch Profile Tab */}
        <TabsContent value="general" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Building className="mr-2 h-5 w-5 flex-shrink-0" />
                Branch Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Basic information about your branch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Branch Name *</label>
                  <Input
                    value={branchData.name}
                    onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
                    placeholder="e.g., Beccle St Branch"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Address</label>
                  <Input
                    value={branchData.address}
                    onChange={(e) => setBranchData({ ...branchData, address: e.target.value })}
                    placeholder="123 Beccle Street, London, UK"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                    <Input
                      value={branchData.phone}
                      onChange={(e) => setBranchData({ ...branchData, phone: e.target.value })}
                      placeholder="+44 20 1234 5678"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <Input
                      value={branchData.email}
                      onChange={(e) => setBranchData({ ...branchData, email: e.target.value })}
                      placeholder="info@branch.org"
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Website</label>
                  <Input
                    value={branchData.website}
                    onChange={(e) => setBranchData({ ...branchData, website: e.target.value })}
                    placeholder="www.branch.org"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveBranchInfo} className="w-full sm:w-auto">
                  Save Branch Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branch Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Clock className="mr-2 h-5 w-5 flex-shrink-0" />
                Branch Preferences
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure branch-specific preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex items-start space-x-4 py-3">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">Auto Check-in for Events</label>
                  <p className="text-xs text-gray-500">
                    Enable automatic member check-in for branch events
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-start space-x-4 py-3 border-t">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">Public Branch Calendar</label>
                  <p className="text-xs text-gray-500">Display branch events on public website</p>
                </div>
                <div className="flex-shrink-0">
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-start space-x-4 py-3 border-t">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium mb-1">Member Directory</label>
                  <p className="text-xs text-gray-500">Allow members to view branch directory</p>
                </div>
                <div className="flex-shrink-0">
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branch Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Bell className="mr-2 h-5 w-5 flex-shrink-0" />
                Branch Notifications
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure notification preferences for your branch
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt0">
              <div className="space-y-1">
                <div className="flex items-start space-x-4 py-3">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">
                      New Member Welcome Email
                    </label>
                    <p className="text-xs text-gray-500">
                      Automatically send welcome emails to new branch members
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Event Reminders</label>
                    <p className="text-xs text-gray-500">
                      Send automatic reminders for branch events
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Weekly Branch Updates</label>
                    <p className="text-xs text-gray-500">Send weekly summary to branch members</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch />
                  </div>
                </div>

                <div className="flex items-start space-x-4 py-3 border-t">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium mb-1">Birthday Notifications</label>
                    <p className="text-xs text-gray-500">
                      Notify admins of upcoming member birthdays
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch defaultChecked />
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
