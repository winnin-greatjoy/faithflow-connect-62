import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Eye, EyeOff, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DirectorySettingsPage: React.FC = () => {
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your directory privacy settings have been updated',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Directory Settings</h1>
        <p className="text-muted-foreground mt-2">Control what information is visible in the member directory</p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          These settings control what other members can see about you in the directory. Your basic information will always be visible to church leadership.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Visibility Settings</CardTitle>
          <CardDescription>Choose what information to display in the directory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-phone" className="font-medium">Phone Number</Label>
                </div>
                <p className="text-sm text-muted-foreground">Display your phone number to other members</p>
              </div>
              <Switch
                id="show-phone"
                checked={showPhone}
                onCheckedChange={setShowPhone}
              />
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-email" className="font-medium">Email Address</Label>
                </div>
                <p className="text-sm text-muted-foreground">Display your email address to other members</p>
              </div>
              <Switch
                id="show-email"
                checked={showEmail}
                onCheckedChange={setShowEmail}
              />
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-address" className="font-medium">Home Address</Label>
                </div>
                <p className="text-sm text-muted-foreground">Display your home address to other members</p>
              </div>
              <Switch
                id="show-address"
                checked={showAddress}
                onCheckedChange={setShowAddress}
              />
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-birthday" className="font-medium">Birthday</Label>
                </div>
                <p className="text-sm text-muted-foreground">Display your birthday to other members</p>
              </div>
              <Switch
                id="show-birthday"
                checked={showBirthday}
                onCheckedChange={setShowBirthday}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow-messages" className="font-medium">Allow Messages</Label>
                <p className="text-sm text-muted-foreground">Allow other members to send you messages through the portal</p>
              </div>
              <Switch
                id="allow-messages"
                checked={allowMessages}
                onCheckedChange={setAllowMessages}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Summary</CardTitle>
          <CardDescription>What members will see in the directory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {showPhone ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <span>Phone: {showPhone ? 'Visible' : 'Hidden'}</span>
            </div>
            <div className="flex items-center gap-2">
              {showEmail ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <span>Email: {showEmail ? 'Visible' : 'Hidden'}</span>
            </div>
            <div className="flex items-center gap-2">
              {showAddress ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <span>Address: {showAddress ? 'Visible' : 'Hidden'}</span>
            </div>
            <div className="flex items-center gap-2">
              {showBirthday ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <span>Birthday: {showBirthday ? 'Visible' : 'Hidden'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectorySettingsPage;
