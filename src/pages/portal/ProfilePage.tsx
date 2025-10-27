import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { QrCode, ShieldCheck, KeyRound, Settings, FileEdit, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Constants } from '@/integrations/supabase/types';

interface MemberInfo {
  birthdate: string | null;
  gender: string | null;
  maritalStatus: string | null;
  membershipLevel: string | null;
  mobilePhone: string | null;
  homePhone: string | null;
}

interface PersistedProfileState {
  form: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  middleName: string;
  nickname: string;
  addressLine: string;
  addressState: string;
  city: string;
  zipCode: string;
  doNotEmail: boolean;
  doNotText: boolean;
  memberInfo: MemberInfo;
  editOpen: boolean;
}

const STORAGE_KEY_PREFIX = 'profile_page_state';

const buildStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}:${userId}`;

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [persistedState, setPersistedState] = usePersistentState<PersistedProfileState | null>(
    currentUserId ? buildStorageKey(currentUserId) : null,
    () => null,
  );
  const [middleName, setMiddleName] = useState('');
  const [nickname, setNickname] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [doNotEmail, setDoNotEmail] = useState(false);
  const [doNotText, setDoNotText] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    birthdate: null,
    gender: null,
    maritalStatus: null,
    membershipLevel: null,
    mobilePhone: null,
    homePhone: null,
  });
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const refreshPhotoUrl = useCallback(
    async (path: string | null) => {
      if (!path) {
        setPhotoUrl(null);
        return;
      }

      if (path.startsWith('http://') || path.startsWith('https://')) {
        setPhotoUrl(path);
        return;
      }

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .createSignedUrl(path, 60 * 60 * 24);

      if (error) {
        console.error('Failed to create signed URL for profile photo', error);
        setPhotoUrl(null);
        return;
      }

      setPhotoUrl(data?.signedUrl ?? null);
    },
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setEmail(user.email || '');
        const [profileRes, memberRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('first_name, last_name, phone, profile_photo')
            .eq('id', user.id)
            .maybeSingle(),
          user.email
            ? supabase
                .from('members')
                .select('date_of_birth, gender, marital_status, membership_level, phone')
                .eq('email', user.email)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        if (profileRes.data) {
          setForm({
            first_name: profileRes.data.first_name || '',
            last_name: profileRes.data.last_name || '',
            phone: profileRes.data.phone || '',
          });
          const storedPhoto = (profileRes.data as any).profile_photo as string | null;
          setPhotoPath(storedPhoto || null);
          await refreshPhotoUrl(storedPhoto || null);
          setMemberInfo(prev => ({
            ...prev,
            mobilePhone: profileRes.data.phone || prev.mobilePhone,
          }));
        } else {
          setPhotoPath(null);
          await refreshPhotoUrl(null);
        }

        if (memberRes && memberRes.data) {
          setMemberId((memberRes.data as any).id);
          setMemberInfo(prev => ({
            ...prev,
            birthdate: memberRes.data.date_of_birth,
            gender: memberRes.data.gender,
            maritalStatus: memberRes.data.marital_status,
            membershipLevel: memberRes.data.membership_level,
            homePhone: memberRes.data.phone || prev.homePhone,
            mobilePhone: prev.mobilePhone || memberRes.data.phone || prev.mobilePhone,
          }));
        }

        if (persistedState) {
          setForm(prev => ({ ...prev, ...persistedState.form }));
          setMiddleName(persistedState.middleName ?? '');
          setNickname(persistedState.nickname ?? '');
          setAddressLine(persistedState.addressLine ?? '');
          setState(persistedState.addressState ?? '');
          setCity(persistedState.city ?? '');
          setZipCode(persistedState.zipCode ?? '');
          setDoNotEmail(persistedState.doNotEmail ?? false);
          setDoNotText(persistedState.doNotText ?? false);
          if (persistedState.memberInfo) {
            setMemberInfo(prev => ({ ...prev, ...persistedState.memberInfo }));
          }
          setEditOpen(persistedState.editOpen ?? false);
        }
      } else {
        setCurrentUserId(null);
        setPhotoPath(null);
        await refreshPhotoUrl(null);
      }
      setLoading(false);
    })();
  }, [persistedState, refreshPhotoUrl]);

  useEffect(() => {
    if (!photoPath) return;
    const interval = setInterval(() => {
      refreshPhotoUrl(photoPath);
    }, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [photoPath, refreshPhotoUrl]);

  useEffect(() => {
    if (editOpen) {
      refreshPhotoUrl(photoPath);
    }
  }, [editOpen, photoPath, refreshPhotoUrl]);

  useEffect(() => {
    if (!currentUserId) return;

    setPersistedState({
      form,
      middleName,
      nickname,
      addressLine,
      addressState: state,
      city,
      zipCode,
      doNotEmail,
      doNotText,
      memberInfo,
      editOpen,
    });
  }, [
    addressLine,
    city,
    currentUserId,
    doNotEmail,
    doNotText,
    editOpen,
    form,
    memberInfo,
    middleName,
    nickname,
    setPersistedState,
    state,
    zipCode,
  ]);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (!form.first_name.trim() || !form.last_name.trim()) {
        toast({ title: 'Validation', description: 'First and last name are required.', variant: 'destructive' });
        setSaving(false);
        return;
      }
      
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
        })
        .eq('id', user.id);
      
      if (profileError) {
        toast({ title: 'Save failed', description: profileError.message, variant: 'destructive' });
        setSaving(false);
        return;
      }

      // Update members table if member exists
      if (memberId && user.email) {
        const { error: memberError } = await supabase
          .from('members')
          .update({
            full_name: `${form.first_name.trim()} ${form.last_name.trim()}`,
            phone: form.phone.trim() || null,
            date_of_birth: memberInfo.birthdate || null,
            gender: (memberInfo.gender as any) || null,
            marital_status: (memberInfo.maritalStatus as any) || null,
            membership_level: (memberInfo.membershipLevel as any) || null,
          })
          .eq('email', user.email);
        
        if (memberError) {
          toast({ title: 'Warning', description: 'Profile updated but member info update failed: ' + memberError.message, variant: 'destructive' });
        }
      }

      toast({ title: 'Saved', description: 'Profile updated successfully.' });
      setMemberInfo(prev => ({
        ...prev,
        mobilePhone: form.phone.trim() || prev.mobilePhone,
      }));
      setEditOpen(false);
    }
    setSaving(false);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 2MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const previousPath = photoPath;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      console.error('Profile photo upload failed', upErr);
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ profile_photo: path })
      .eq('id', user.id);

    if (updateErr) {
      toast({ title: 'Upload failed', description: updateErr.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    setPhotoPath(path);
    await refreshPhotoUrl(path);
    toast({ title: 'Photo updated' });

    if (previousPath && previousPath !== path) {
      const { error: removeErr } = await supabase.storage.from('profile-photos').remove([previousPath]);
      if (removeErr) {
        console.error('Failed to remove previous profile photo', removeErr);
      }
    }
    setUploading(false);
  };

  const removePhoto = async () => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const currentPath = photoPath;
    const { error } = await supabase.from('profiles').update({ profile_photo: null }).eq('id', user.id);
    if (error) {
      toast({ title: 'Remove failed', description: error.message, variant: 'destructive' });
    } else {
      if (currentPath) {
        const { error: removeErr } = await supabase.storage.from('profile-photos').remove([currentPath]);
        if (removeErr) {
          console.error('Failed to delete profile photo from storage', removeErr);
        }
      }
      setPhotoPath(null);
      await refreshPhotoUrl(null);
      toast({ title: 'Photo removed' });
    }
    setUploading(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const formatEnum = (value: string | null, fallback = 'Unknown') => {
    if (!value) return fallback;
    return value
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayName = [form.first_name, form.last_name].filter(Boolean).join(' ').trim() || email;
  const birthdateDisplay = formatDate(memberInfo.birthdate);
  const genderDisplay = formatEnum(memberInfo.gender);
  const maritalStatusDisplay = formatEnum(memberInfo.maritalStatus);
  const gradeDisplay = memberInfo.membershipLevel ? formatEnum(memberInfo.membershipLevel, '—') : '—';
  const genderOptions = Constants.public.Enums.gender;
  const maritalStatusOptions = Constants.public.Enums.marital_status;
  const membershipLevelOptions = Constants.public.Enums.membership_level;
  const mobilePhoneDisplay = memberInfo.mobilePhone?.trim() || '—';
  const homePhoneDisplay = memberInfo.homePhone?.trim() || '—';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading profile…</div>
    );
  }

  const actionButtons = [
    { label: 'QR Code', icon: QrCode, onClick: () => handleNavigation('/portal/qr-code') },
    { label: 'Two-Factor Authentication', icon: ShieldCheck, onClick: () => handleNavigation('/portal/two-factor-auth') },
    { label: 'Change Password', icon: KeyRound, onClick: () => handleNavigation('/portal/change-password') },
    { label: 'Directory Settings', icon: Settings, onClick: () => handleNavigation('/portal/directory-settings') },
    { label: 'Edit Account Info', icon: FileEdit, onClick: () => handleNavigation('/portal/edit-account') },
  ];

  return (
    <div className="space-y-8">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <div className="flex flex-wrap gap-3">
          {actionButtons.map(({ label, icon: Icon, onClick }) => (
            <Button key={label} variant="outline" size="sm" onClick={onClick} className="gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <UserCog className="h-4 w-4" />
              Edit Profile
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent className="w-full h-[80vh] max-h-[80vh] overflow-hidden p-0 sm:max-w-4xl">
          <div className="flex h-full flex-col">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Edit Person</DialogTitle>
              <DialogDescription className="text-muted-foreground">Update your personal details and contact preferences.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-lg bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border border-muted-foreground/30">
                        <AvatarImage src={photoUrl || undefined} alt={displayName} />
                        <AvatarFallback>{displayName?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <input ref={fileInputRef as any} type="file" accept="image/*" className="hidden" onChange={onUpload} />
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute right-0 top-0 h-7 w-7 rounded-full border border-border/60 bg-background/90 text-foreground shadow-sm hover:bg-background"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <span className="sr-only">Change photo</span>
                        {uploading ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/70 border-t-transparent" />
                        ) : (
                          <FileEdit className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      {photoUrl && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute left-0 bottom-0 h-7 w-7 rounded-full bg-background/90 text-destructive shadow-sm"
                          onClick={removePhoto}
                          disabled={uploading}
                        >
                          <span className="sr-only">Remove photo</span>
                          <span className="text-lg leading-none">×</span>
                        </Button>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{displayName}</div>
                      <div className="text-sm text-muted-foreground">Update personal details below</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg bg-muted/10 p-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name<span className="text-destructive"> *</span></Label>
                    <Input
                      id="first_name"
                      value={form.first_name}
                      onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name<span className="text-destructive"> *</span></Label>
                    <Input
                      id="last_name"
                      value={form.last_name}
                      onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={middleName}
                      onChange={e => setMiddleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border border-border/60 bg-card/80 shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthdate">Birthdate</Label>
                        <Input
                          id="birthdate"
                          placeholder="MM/DD/YYYY"
                          value={memberInfo.birthdate || ''}
                          onChange={e => setMemberInfo(prev => ({ ...prev, birthdate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={memberInfo.gender ?? undefined}
                          onValueChange={value => setMemberInfo(prev => ({ ...prev, gender: value }))}
                        >
                          <SelectTrigger id="gender" className="w-full capitalize">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map(option => (
                              <SelectItem key={option} value={option} className="capitalize">
                                {formatEnum(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/60 bg-card/80 shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <Tabs defaultValue="address" className="w-full">
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="address">Address</TabsTrigger>
                          <TabsTrigger value="map">Map</TabsTrigger>
                        </TabsList>
                        <TabsContent value="address" className="space-y-3 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="address_line">Address Line</Label>
                            <Input
                              id="address_line"
                              value={addressLine}
                              onChange={e => setAddressLine(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input id="state" value={state} onChange={e => setState(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">Zip Code</Label>
                            <Input id="zip" value={zipCode} onChange={e => setZipCode(e.target.value)} />
                          </div>
                        </TabsContent>
                        <TabsContent value="map" className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                          Map preview coming soon
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border border-border/60 bg-card/80 shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile_phone">Mobile Phone</Label>
                        <Input
                          id="mobile_phone"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox checked={doNotText} onCheckedChange={value => setDoNotText(Boolean(value))} />
                        Do Not Text
                      </label>
                      <div className="space-y-2">
                        <Label htmlFor="home_phone">Home Phone</Label>
                        <Input
                          id="home_phone"
                          value={memberInfo.homePhone || ''}
                          onChange={e => setMemberInfo(prev => ({ ...prev, homePhone: e.target.value }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/60 bg-card/80 shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="email_input">Email</Label>
                        <Input id="email_input" type="email" value={email} disabled />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox checked={doNotEmail} onCheckedChange={value => setDoNotEmail(Boolean(value))} />
                        Do Not Email
                      </label>
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade <span className="normal-case text-xs text-muted-foreground/80">(As of school year 2025-2026)</span></Label>
                        <Select
                          value={memberInfo.membershipLevel ?? undefined}
                          onValueChange={value => setMemberInfo(prev => ({ ...prev, membershipLevel: value }))}
                        >
                          <SelectTrigger id="grade" className="w-full capitalize">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {membershipLevelOptions.map(option => (
                              <SelectItem key={option} value={option} className="capitalize">
                                {formatEnum(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/60 bg-card/80 shadow-none sm:col-span-2">
                    <CardContent className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="marital_status">Marital Status</Label>
                        <Select
                          value={memberInfo.maritalStatus ?? undefined}
                          onValueChange={value => setMemberInfo(prev => ({ ...prev, maritalStatus: value }))}
                        >
                          <SelectTrigger id="marital_status" className="w-full capitalize">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            {maritalStatusOptions.map(option => (
                              <SelectItem key={option} value={option} className="capitalize">
                                {formatEnum(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between rounded-md border border-dashed border-border/60 p-4">
                        <div>
                          <div className="font-medium">Add Family Member</div>
                          <div className="text-sm text-muted-foreground">Link related family members to this profile.</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toast({ 
                            title: 'Coming Soon', 
                            description: 'Family member linking will be available in a future update.' 
                          })}
                        >
                          + New Person
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-border/60 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card className="border border-border/60 bg-card/80 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-8">
            <Avatar className="h-24 w-24 border border-muted-foreground/30">
              <AvatarImage src={photoUrl || undefined} alt={displayName} />
              <AvatarFallback>{displayName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="text-xl font-semibold text-foreground text-center">{displayName}</div>
            {memberInfo.membershipLevel && (
              <div className="text-sm text-muted-foreground">
                {formatEnum(memberInfo.membershipLevel, 'Member')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input ref={fileInputRef as any} type="file" accept="image/*" className="hidden" onChange={onUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Change Photo'}
              </Button>
              {photoUrl && (
                <Button variant="ghost" size="sm" onClick={removePhoto} disabled={uploading}>
                  Remove
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-border/60 bg-card/80 shadow-sm">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Mobile Phone</div>
                <div className="text-base font-semibold text-foreground">{mobilePhoneDisplay}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Home Phone</div>
                <div className="text-base font-semibold text-foreground">{homePhoneDisplay}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Email</div>
                <div className="text-base font-semibold text-foreground break-all">{email}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-border/60 bg-card/80 shadow-sm">
              <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Birthdate</div>
                  <div className="text-base font-semibold text-foreground">{birthdateDisplay}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Gender</div>
                  <div className="text-base font-semibold text-foreground">{genderDisplay}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Grade <span className="normal-case text-xs text-muted-foreground/80">(As of school year 2025-2026)</span></div>
                  <div className="text-base font-semibold text-foreground">{gradeDisplay}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-sm md:col-span-2">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Marital Status</div>
                  <div className="text-base font-semibold text-foreground">{maritalStatusDisplay}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
