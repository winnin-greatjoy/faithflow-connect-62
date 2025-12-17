import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthz } from '@/hooks/useAuthz';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Branch = {
  id: string;
  name: string;
  is_district_hq: boolean;
};

type ProfileOption = {
  id: string;
  full_name: string;
};

type NotificationPrefs = {
  new_member_registration?: boolean;
  event_registration?: boolean;
  donation_alerts?: boolean;
  volunteer_schedule_changes?: boolean;
  weekly_reports?: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  new_member_registration: true,
  event_registration: true,
  donation_alerts: false,
  volunteer_schedule_changes: true,
  weekly_reports: true,
};

const isMissingColumnError = (error: any) => {
  const msg = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  const hint = String(error?.hint || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  return (
    msg.includes('schema cache') ||
    msg.includes('could not find') ||
    msg.includes('column') ||
    details.includes('schema cache') ||
    details.includes('could not find') ||
    details.includes('column') ||
    hint.includes('schema cache') ||
    hint.includes('could not find') ||
    hint.includes('column') ||
    code === 'pgrst204'
  );
};

export const DistrictSettings: React.FC<{
  district: any;
  branches: Branch[];
  onRefresh: () => void;
}> = ({ district, branches, onRefresh }) => {
  const { toast } = useToast();
  const { hasRole } = useAuthz();
  const { isSuperadmin } = useSuperadmin();

  const canEdit = isSuperadmin || hasRole('district_admin');
  const canEditHeadAdmin = isSuperadmin;

  const [saving, setSaving] = React.useState(false);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [districtName, setDistrictName] = React.useState<string>(district?.name ?? '');
  const [districtLocation, setDistrictLocation] = React.useState<string>(district?.location ?? '');
  const [headAdminId, setHeadAdminId] = React.useState<string>(district?.head_admin_id ?? 'none');
  const [defaultBranchId, setDefaultBranchId] = React.useState<string>(
    district?.default_branch_id ?? 'none'
  );
  const [brandingColor, setBrandingColor] = React.useState<string>(
    district?.branding_color ?? '#6366f1'
  );
  const [logoPath, setLogoPath] = React.useState<string | null>(
    district?.branding_logo_path ?? null
  );
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [profiles, setProfiles] = React.useState<ProfileOption[]>([]);
  const [supportsExtendedSettings, setSupportsExtendedSettings] = React.useState(true);
  const [prefs, setPrefs] = React.useState<NotificationPrefs>({
    ...DEFAULT_PREFS,
    ...((district?.notification_prefs as any) || {}),
  });

  React.useEffect(() => {
    setDistrictName(district?.name ?? '');
    setDistrictLocation(district?.location ?? '');
    setHeadAdminId(district?.head_admin_id ?? 'none');
    setDefaultBranchId(district?.default_branch_id ?? 'none');
    setBrandingColor(district?.branding_color ?? '#6366f1');
    setLogoPath(district?.branding_logo_path ?? null);
    setPrefs({ ...DEFAULT_PREFS, ...((district?.notification_prefs as any) || {}) });
  }, [district]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!district?.id) return;
      const { error } = await supabase
        .from('districts')
        .select('branding_color, branding_logo_path, default_branch_id, notification_prefs')
        .eq('id', district.id)
        .single();

      if (!active) return;
      if (error && isMissingColumnError(error)) {
        setSupportsExtendedSettings(false);
      } else {
        setSupportsExtendedSettings(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [district?.id]);

  const refreshLogoUrl = React.useCallback(async (path: string | null) => {
    if (!path) {
      setLogoUrl(null);
      return;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      setLogoUrl(path);
      return;
    }

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(path, 60 * 60 * 24);
    if (error) {
      console.error('Failed to create signed URL for district logo', error);
      setLogoUrl(null);
      return;
    }
    setLogoUrl(data?.signedUrl ?? null);
  }, []);

  React.useEffect(() => {
    refreshLogoUrl(logoPath);
  }, [logoPath, refreshLogoUrl]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!canEditHeadAdmin) {
        setProfiles([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');

      if (!active) return;
      if (error) {
        setProfiles([]);
        return;
      }

      const mapped: ProfileOption[] = (data || []).map((p: any) => ({
        id: p.id,
        full_name: `${p.first_name} ${p.last_name}`.trim(),
      }));
      setProfiles(mapped);
    })();
    return () => {
      active = false;
    };
  }, [canEditHeadAdmin]);

  const handleSave = async () => {
    if (!district?.id) return;

    if (!canEdit) {
      toast({
        title: 'Permission denied',
        description: 'You cannot edit these settings.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: districtName?.trim() || district?.name,
        location: districtLocation?.trim() || null,
      };

      if (supportsExtendedSettings) {
        payload.default_branch_id =
          defaultBranchId && defaultBranchId !== 'none' ? defaultBranchId : null;
        payload.branding_color = brandingColor || null;
        payload.branding_logo_path = logoPath;
        payload.notification_prefs = prefs || {};
      }

      if (canEditHeadAdmin) {
        payload.head_admin_id = headAdminId && headAdminId !== 'none' ? headAdminId : null;
      }

      const { error } = await supabase.from('districts').update(payload).eq('id', district.id);
      if (error) {
        if (isMissingColumnError(error)) {
          setSupportsExtendedSettings(false);
          const fallbackPayload: any = {
            name: districtName?.trim() || district?.name,
            location: districtLocation?.trim() || null,
          };
          if (canEditHeadAdmin) {
            fallbackPayload.head_admin_id =
              headAdminId && headAdminId !== 'none' ? headAdminId : null;
          }

          const { error: fallbackError } = await supabase
            .from('districts')
            .update(fallbackPayload)
            .eq('id', district.id);

          if (fallbackError) throw fallbackError;

          toast({
            title: 'Saved (partial)',
            description:
              'Saved district name/location. Apply the latest migration to enable branding/default branch/notifications, then refresh schema cache.',
          });
          onRefresh();
          return;
        }
        throw error;
      }

      toast({ title: 'Saved', description: 'District settings updated.' });
      onRefresh();
    } catch (e: any) {
      toast({
        title: 'Save failed',
        description: e?.message || 'Could not save district settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    if (!district?.id) return;
    if (!supportsExtendedSettings) {
      toast({
        title: 'Migration required',
        description:
          'Apply the latest district settings migration to enable branding/logo updates.',
        variant: 'destructive',
      });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 2MB.', variant: 'destructive' });
      return;
    }

    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `district-logos/${district.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('profile-photos')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { error: updateErr } = await supabase
        .from('districts')
        .update({ branding_logo_path: path })
        .eq('id', district.id);
      if (updateErr) {
        if (isMissingColumnError(updateErr)) {
          setSupportsExtendedSettings(false);
          await supabase.storage.from('profile-photos').remove([path]);
          toast({
            title: 'Migration required',
            description:
              'Apply the latest district settings migration to enable branding/logo updates.',
            variant: 'destructive',
          });
          return;
        }
        throw updateErr;
      }

      setLogoPath(path);
      toast({ title: 'Uploaded', description: 'District logo updated.' });
      onRefresh();
    } catch (e: any) {
      toast({
        title: 'Upload failed',
        description: e?.message || 'Could not upload district logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!district?.id) return;
    if (!logoPath) return;
    if (!supportsExtendedSettings) {
      toast({
        title: 'Migration required',
        description:
          'Apply the latest district settings migration to enable branding/logo updates.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const current = logoPath;
      const { error: updateErr } = await supabase
        .from('districts')
        .update({ branding_logo_path: null })
        .eq('id', district.id);
      if (updateErr) {
        if (isMissingColumnError(updateErr)) {
          setSupportsExtendedSettings(false);
          toast({
            title: 'Migration required',
            description:
              'Apply the latest district settings migration to enable branding/logo updates.',
            variant: 'destructive',
          });
          return;
        }
        throw updateErr;
      }

      await supabase.storage.from('profile-photos').remove([current]);
      setLogoPath(null);
      toast({ title: 'Removed', description: 'District logo removed.' });
      onRefresh();
    } catch (e: any) {
      toast({
        title: 'Remove failed',
        description: e?.message || 'Could not remove district logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const defaultBranchOptions = branches.map((b) => ({ id: b.id, name: b.name }));

  return (
    <div className="space-y-6">
      {!supportsExtendedSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Action required</CardTitle>
            <CardDescription>
              Your database is missing the latest District Settings columns. Apply migration{' '}
              <span className="font-mono">20251216104600_add_district_settings_fields.sql</span> and
              refresh the schema cache.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>District Configuration</CardTitle>
          <CardDescription>Manage general settings for {district?.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>District Name</Label>
              <Input
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Region / Location</Label>
              <Input
                value={districtLocation}
                onChange={(e) => setDistrictLocation(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Head Admin</Label>
              <Select
                value={headAdminId || 'none'}
                onValueChange={setHeadAdminId}
                disabled={!canEditHeadAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select head admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!canEditHeadAdmin && (
                <div className="text-xs text-muted-foreground">
                  Only superadmins can change the head admin.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Default Branch</Label>
              <Select
                value={defaultBranchId || 'none'}
                onValueChange={setDefaultBranchId}
                disabled={!canEdit || !supportsExtendedSettings}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {defaultBranchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!canEdit || saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure district-level notification defaults.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium">New Member Registration</div>
                <div className="text-xs text-muted-foreground">
                  Notify when someone joins a branch in this district
                </div>
              </div>
              <Switch
                checked={Boolean(prefs.new_member_registration)}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, new_member_registration: v }))}
                disabled={!canEdit || !supportsExtendedSettings}
              />
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="min-w-0">
                <div className="text-sm font-medium">Event Registration</div>
                <div className="text-xs text-muted-foreground">
                  Notifications for event activity in district branches
                </div>
              </div>
              <Switch
                checked={Boolean(prefs.event_registration)}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, event_registration: v }))}
                disabled={!canEdit || !supportsExtendedSettings}
              />
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="min-w-0">
                <div className="text-sm font-medium">Donation Alerts</div>
                <div className="text-xs text-muted-foreground">
                  District-level finance notifications (view-only reports)
                </div>
              </div>
              <Switch
                checked={Boolean(prefs.donation_alerts)}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, donation_alerts: v }))}
                disabled={!canEdit || !supportsExtendedSettings}
              />
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="min-w-0">
                <div className="text-sm font-medium">Volunteer Schedule Changes</div>
                <div className="text-xs text-muted-foreground">
                  Notify on volunteer updates in district branches
                </div>
              </div>
              <Switch
                checked={Boolean(prefs.volunteer_schedule_changes)}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, volunteer_schedule_changes: v }))}
                disabled={!canEdit || !supportsExtendedSettings}
              />
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="min-w-0">
                <div className="text-sm font-medium">Weekly Reports</div>
                <div className="text-xs text-muted-foreground">
                  Enable weekly district summary notifications
                </div>
              </div>
              <Switch
                checked={Boolean(prefs.weekly_reports)}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, weekly_reports: v }))}
                disabled={!canEdit || !supportsExtendedSettings}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!canEdit || saving || !supportsExtendedSettings}>
              {saving ? 'Saving…' : 'Save Preferences'}
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <Input
                type="color"
                value={brandingColor}
                onChange={(e) => setBrandingColor(e.target.value)}
                disabled={!canEdit || !supportsExtendedSettings}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadLogo(f);
                    if (e.target) e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canEdit || uploadingLogo || !supportsExtendedSettings}
                >
                  {uploadingLogo ? 'Uploading…' : logoPath ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoPath && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive"
                        disabled={!canEdit || uploadingLogo || !supportsExtendedSettings}
                      >
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove district logo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the logo from storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRemoveLogo}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            {logoUrl ? (
              <img src={logoUrl} alt="District logo" className="h-20 w-auto object-contain" />
            ) : (
              <div className="text-sm text-muted-foreground">No logo uploaded.</div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!canEdit || saving || !supportsExtendedSettings}>
              {saving ? 'Saving…' : 'Save Branding'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
