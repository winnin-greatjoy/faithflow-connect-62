
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Globe, 
  Shield, 
  Workflow, 
  Save,
  AlertTriangle
} from 'lucide-react';

export const CMSSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    site_name: 'Faith Healing Bible Church',
    site_url: 'https://faithhealing.church',
    default_author: 'Admin',
    auto_save: true,
    
    // Publishing Settings
    require_approval: true,
    auto_publish_events: false,
    default_visibility: 'public',
    
    // SEO Settings
    default_meta_title: 'Faith Healing Bible Church - Growing in Faith Together',
    default_meta_description: 'Join our growing community of believers at Faith Healing Bible Church.',
    
    // Security Settings
    content_moderation: true,
    media_virus_scan: true,
    consent_required: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CMS Settings</CardTitle>
          <CardDescription>Configure content management system preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
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
                <div className="space-y-0.5">
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
            </TabsContent>

            <TabsContent value="publishing" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    All content must be approved before publishing
                  </p>
                </div>
                <Switch
                  checked={settings.require_approval}
                  onCheckedChange={(checked) => handleSettingChange('require_approval', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-publish Events</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish approved event content
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="ministry">Ministry Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Role-based Access Control</h4>
                
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">Content Authors</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Can create and edit their own content drafts
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Add ministry members..." className="flex-1" />
                    <Button size="sm">Add</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">Content Reviewers</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Can review and approve content for publishing
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Add reviewers..." className="flex-1" />
                    <Button size="sm">Add</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">Administrators</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Full access to all CMS features and settings
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Add administrators..." className="flex-1" />
                    <Button size="sm">Add</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
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
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  SEO Tools Integration
                </h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with Google Analytics, Search Console, and other SEO tools
                </p>
                <Button variant="outline" size="sm">Configure Integrations</Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Content Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automated content moderation and filtering
                  </p>
                </div>
                <Switch
                  checked={settings.content_moderation}
                  onCheckedChange={(checked) => handleSettingChange('content_moderation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Media Virus Scanning</Label>
                  <p className="text-sm text-muted-foreground">
                    Scan uploaded files for viruses and malware
                  </p>
                </div>
                <Switch
                  checked={settings.media_virus_scan}
                  onCheckedChange={(checked) => handleSettingChange('media_virus_scan', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consent Required for Minors</Label>
                  <p className="text-sm text-muted-foreground">
                    Require explicit consent before publishing content featuring minors
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
                  Configure notifications for security events and policy violations
                </p>
                <Button variant="outline" size="sm">Configure Alerts</Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pt-6 border-t">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
