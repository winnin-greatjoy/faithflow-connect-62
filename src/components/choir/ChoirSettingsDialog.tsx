import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChoirSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
}

interface ChoirSettings {
  choirName: string;
  description: string;
  rehearsalDay: string;
  rehearsalTime: string;
  meetingLocation: string;
  director: string;
  minMembersPerPart: number;
  defaultKey: string;
  warmupDuration: number;
}

export const ChoirSettingsDialog: React.FC<ChoirSettingsDialogProps> = ({
  open,
  onOpenChange,
  departmentId,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ChoirSettings>({
    choirName: '',
    description: '',
    rehearsalDay: 'Wednesday',
    rehearsalTime: '18:00',
    meetingLocation: '',
    director: '',
    minMembersPerPart: 3,
    defaultKey: 'C',
    warmupDuration: 15,
  });

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, departmentId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('name, description')
        .eq('id', departmentId)
        .single();

      if (error) throw error;

      if (data) {
        // Try to parse settings from description JSON
        let parsedSettings = {};
        try {
          if (data.description) {
            parsedSettings = JSON.parse(data.description);
          }
        } catch {
          // Description is not JSON, use as plain text
        }

        setSettings({
          choirName: data.name || '',
          description:
            typeof parsedSettings === 'string'
              ? parsedSettings
              : (parsedSettings as any).description || '',
          rehearsalDay: (parsedSettings as any).rehearsalDay || 'Wednesday',
          rehearsalTime: (parsedSettings as any).rehearsalTime || '18:00',
          meetingLocation: (parsedSettings as any).meetingLocation || '',
          director: (parsedSettings as any).director || '',
          minMembersPerPart: (parsedSettings as any).minMembersPerPart || 3,
          defaultKey: (parsedSettings as any).defaultKey || 'C',
          warmupDuration: (parsedSettings as any).warmupDuration || 15,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settingsJson = JSON.stringify({
        description: settings.description,
        rehearsalDay: settings.rehearsalDay,
        rehearsalTime: settings.rehearsalTime,
        meetingLocation: settings.meetingLocation,
        director: settings.director,
        minMembersPerPart: settings.minMembersPerPart,
        defaultKey: settings.defaultKey,
        warmupDuration: settings.warmupDuration,
      });

      const { error } = await supabase
        .from('departments')
        .update({
          name: settings.choirName,
          description: settingsJson,
        })
        .eq('id', departmentId);

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Choir settings updated successfully',
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choir Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="rehearsal">Rehearsal</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="choirName">Choir Name</Label>
              <Input
                id="choirName"
                value={settings.choirName}
                onChange={(e) => setSettings({ ...settings, choirName: e.target.value })}
                placeholder="e.g., Grace Community Choir"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Brief description of the choir..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Choir Director</Label>
              <Input
                id="director"
                value={settings.director}
                onChange={(e) => setSettings({ ...settings, director: e.target.value })}
                placeholder="Director's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minMembers">Minimum Members per Voice Part</Label>
              <Input
                id="minMembers"
                type="number"
                min="1"
                value={settings.minMembersPerPart}
                onChange={(e) =>
                  setSettings({ ...settings, minMembersPerPart: parseInt(e.target.value) || 3 })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="rehearsal" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="rehearsalDay">Rehearsal Day</Label>
              <Select
                value={settings.rehearsalDay}
                onValueChange={(v) => setSettings({ ...settings, rehearsalDay: v })}
              >
                <SelectTrigger id="rehearsalDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rehearsalTime">Rehearsal Time</Label>
              <Input
                id="rehearsalTime"
                type="time"
                value={settings.rehearsalTime}
                onChange={(e) => setSettings({ ...settings, rehearsalTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Meeting Location</Label>
              <Input
                id="location"
                value={settings.meetingLocation}
                onChange={(e) => setSettings({ ...settings, meetingLocation: e.target.value })}
                placeholder="e.g., Main Sanctuary, Room 201"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warmup">Warm-up Duration (minutes)</Label>
              <Input
                id="warmup"
                type="number"
                min="5"
                max="60"
                value={settings.warmupDuration}
                onChange={(e) =>
                  setSettings({ ...settings, warmupDuration: parseInt(e.target.value) || 15 })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="defaultKey">Default Performance Key</Label>
              <Select
                value={settings.defaultKey}
                onValueChange={(v) => setSettings({ ...settings, defaultKey: v })}
              >
                <SelectTrigger id="defaultKey">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">C Major</SelectItem>
                  <SelectItem value="D">D Major</SelectItem>
                  <SelectItem value="Eb">Eb Major</SelectItem>
                  <SelectItem value="F">F Major</SelectItem>
                  <SelectItem value="G">G Major</SelectItem>
                  <SelectItem value="Ab">Ab Major</SelectItem>
                  <SelectItem value="Bb">Bb Major</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Performance Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure all members arrive 30 minutes before performance</li>
                <li>• Conduct sound check before audience arrives</li>
                <li>• Have backup sheet music available</li>
                <li>• Designate a stage manager for logistics</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
