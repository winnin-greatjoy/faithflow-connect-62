'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Settings, Workflow, Shield, Globe, AlertTriangle, Save 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';

export const CMSSettings = () => {
  const { toast } = useToast();

  const [persistedSettings, setPersistedSettings] = usePersistentState('cms_settings', () => ({
    site_name: 'Faith Healing Bible Church',
    site_url: 'https://faithhealing.church',
    default_author: 'Admin',
    auto_save: true,
    require_approval: true,
    auto_publish_events: false,
    default_visibility: 'public',
    default_meta_title: 'Faith Healing Bible Church - Growing in Faith Together',
    default_meta_description: 'Join our growing community of believers at Faith Healing Bible Church.',
    content_moderation: true,
    media_virus_scan: true,
    consent_required: true,
  }));

  const [settings, setSettings] = useState(persistedSettings);

  useEffect(() => {
    setSettings(persistedSettings);
  }, [persistedSettings]);

  useEffect(() => {
    if (settings.auto_save) {
      setPersistedSettings(settings);
    }
  }, [settings, setPersistedSettings]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Example API call
      await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast({
        title: '✅ Settings Saved',
        description: 'Your CMS preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: '❌ Save Failed',
        description: 'An error occurred while saving settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CMS Settings</CardTitle>
          <CardDescription>
            Configure and manage your church’s content management preferences.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">
                <Settings className="mr-2 h-4 w-4" /> General
              </TabsTrigger>
              <TabsTrigger value="publishing">
                <Workflow className="mr-2 h-4 w-4" /> Publishing
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="mr-2 h-4 w-4" /> Permissions
              </TabsTrigger>
              <TabsTrigger value="seo">
                <Globe className="mr-2 h-4 w-4" /> SEO
              </TabsTrigger>
              <TabsTrigger value="security">
                <AlertTriangle className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={settings.site_name}
                      onChange={(e) => handleSettingChange('site_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site_url">Site URL</Label>
                    <Input
                      id="site_url"
                      value={settings.site_url}
                      onChange={(e) => handleSettingChange('site_url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default_author">Default Author</Label>
                    <Input
                      id="default_author"
                      value={settings.default_author}
                      onChange={(e) => handleSettingChange('default_author', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save Drafts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save content changes as drafts
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_save}
                    onCheckedChange={(checked) => handleSettingChange('auto_save', checked)}
                  />
                </div>
              </motion.div>
            </TabsContent>

            {/* Publishing Settings */}
            <TabsContent value="publishing">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      All content must be approved before publishing.
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_approval}
                    onCheckedChange={(checked) => handleSettingChange('require_approval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-publish Events</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically publish approved event content.
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_publish_events}
                    onCheckedChange={(checked) => handleSettingChange('auto_publish_events', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="default_visibility">Default Visibility</Label>
                  <Select
                    value={settings.default_visibility}
                    onValueChange={(value) => handleSettingChange('default_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                      <SelectItem value="ministry">Ministry Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="default_meta_title">Default Meta Title</Label>
                  <Input
                    id="default_meta_title"
                    value={settings.default_meta_title}
                    onChange={(e) => handleSettingChange('default_meta_title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="default_meta_description">Default Meta Description</Label>
                  <Textarea
                    id="default_meta_description"
                    value={settings.default_meta_description}
                    onChange={(e) => handleSettingChange('default_meta_description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* SEO Preview */}
                <div className="border rounded-md bg-gray-50 p-3">
                  <p className="text-sm text-blue-700">{settings.default_meta_title}</p>
                  <p className="text-xs text-green-700">{settings.site_url}</p>
                  <p className="text-sm text-gray-600">{settings.default_meta_description}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    SEO Tools Integration
                  </h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect with Google Analytics and Search Console.
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Integrations
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automated moderation and filtering.
                    </p>
                  </div>
                  <Switch
                    checked={settings.content_moderation}
                    onCheckedChange={(checked) => handleSettingChange('content_moderation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Media Virus Scanning</Label>
                    <p className="text-sm text-muted-foreground">
                      Scan uploaded files for malware and viruses.
                    </p>
                  </div>
                  <Switch
                    checked={settings.media_virus_scan}
                    onCheckedChange={(checked) => handleSettingChange('media_virus_scan', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Consent Required for Minors</Label>
                    <p className="text-sm text-muted-foreground">
                      Require explicit consent before publishing content featuring minors.
                    </p>
                  </div>
                  <Switch
                    checked={settings.consent_required}
                    onCheckedChange={(checked) => handleSettingChange('consent_required', checked)}
                  />
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
                    Security Alerts
                  </h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure notifications for security events and violations.
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Alerts
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          <div className="pt-6 border-t">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
