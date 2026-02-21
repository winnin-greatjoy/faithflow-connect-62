import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileEdit from './ProfileEdit';
import { useToast } from '@/components/ui/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';
import {
  QrCode,
  ShieldCheck,
  KeyRound,
  Settings,
  FileEdit,
  UserCog,
  CreditCard,
  User,
} from 'lucide-react';
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
  baptismDate: string | null;
  dateJoined: string | null;
  baptizedSubLevel: string | null;
  branchId: string | null;
  branchName: string | null;
  community: string | null;
  area: string | null;
  street: string | null;
  publicLandmark: string | null;
  assignedDepartment: string | null;
  ministry: string | null;
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

const DEFAULT_MEMBER_INFO: MemberInfo = {
  birthdate: null,
  gender: null,
  maritalStatus: null,
  membershipLevel: null,
  mobilePhone: null,
  homePhone: null,
  baptismDate: null,
  dateJoined: null,
  baptizedSubLevel: null,
  branchId: null,
  branchName: null,
  community: null,
  area: null,
  street: null,
  publicLandmark: null,
  assignedDepartment: null,
  ministry: null,
};

const isMemberInfoEqual = (a?: MemberInfo | null, b?: MemberInfo | null) => {
  const infoA = a ?? DEFAULT_MEMBER_INFO;
  const infoB = b ?? DEFAULT_MEMBER_INFO;
  return (
    infoA.birthdate === infoB.birthdate &&
    infoA.gender === infoB.gender &&
    infoA.maritalStatus === infoB.maritalStatus &&
    infoA.membershipLevel === infoB.membershipLevel &&
    infoA.mobilePhone === infoB.mobilePhone &&
    infoA.homePhone === infoB.homePhone &&
    infoA.baptismDate === infoB.baptismDate &&
    infoA.dateJoined === infoB.dateJoined &&
    infoA.baptizedSubLevel === infoB.baptizedSubLevel &&
    infoA.branchId === infoB.branchId &&
    infoA.community === infoB.community &&
    infoA.area === infoB.area &&
    infoA.street === infoB.street &&
    infoA.publicLandmark === infoB.publicLandmark &&
    infoA.assignedDepartment === infoB.assignedDepartment &&
    infoA.ministry === infoB.ministry
  );
};

const isPersistedStateEqual = (
  prev: PersistedProfileState | null | undefined,
  next: PersistedProfileState
) => {
  if (!prev) return false;
  return (
    prev.form.first_name === next.form.first_name &&
    prev.form.last_name === next.form.last_name &&
    prev.form.phone === next.form.phone &&
    prev.middleName === next.middleName &&
    prev.nickname === next.nickname &&
    prev.addressLine === next.addressLine &&
    prev.addressState === next.addressState &&
    prev.city === next.city &&
    prev.zipCode === next.zipCode &&
    prev.doNotEmail === next.doNotEmail &&
    prev.doNotText === next.doNotText &&
    prev.editOpen === next.editOpen &&
    isMemberInfoEqual(prev.memberInfo, next.memberInfo)
  );
};

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
  const [persistedState, setPersistedState, persistedMeta] =
    usePersistentState<PersistedProfileState | null>(
      currentUserId ? buildStorageKey(currentUserId) : null,
      () => null
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
  const [memberInfo, setMemberInfo] = useState<MemberInfo>({ ...DEFAULT_MEMBER_INFO });
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const hasAppliedPersisted = useRef(false);

  const refreshPhotoUrl = useCallback(async (path: string | null) => {
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
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setEmail(user.email || '');
        const [profileRes, memberRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('first_name, last_name, phone, profile_photo, middle_name, nickname')
            .eq('id', user.id)
            .maybeSingle(),
          user.email
            ? supabase
                .from('members')
                .select(
                  `
                id,
                date_of_birth,
                gender,
                marital_status,
                membership_level,
                phone,
                email,
                baptism_date,
                date_joined,
                baptized_sub_level,
                community,
                area,
                street,
                public_landmark,
                assigned_department,
                ministry,
                church_branches(name)
              `
                )
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
          setMiddleName((profileRes.data as any).middle_name || '');
          setNickname((profileRes.data as any).nickname || '');
          const storedPhoto = (profileRes.data as any).profile_photo as string | null;
          setPhotoPath(storedPhoto || null);
          await refreshPhotoUrl(storedPhoto || null);
          setMemberInfo((prev) => ({
            ...prev,
            mobilePhone: profileRes.data.phone || prev.mobilePhone,
          }));
        } else {
          setPhotoPath(null);
          await refreshPhotoUrl(null);
        }

        if (memberRes && memberRes.data) {
          setMemberId((memberRes.data as any).id);
          setMemberInfo((prev) => ({
            ...prev,
            birthdate: memberRes.data.date_of_birth,
            gender: memberRes.data.gender,
            maritalStatus: memberRes.data.marital_status,
            membershipLevel: memberRes.data.membership_level,
            homePhone: memberRes.data.phone || prev.homePhone,
            mobilePhone: prev.mobilePhone || memberRes.data.phone || prev.mobilePhone,
            baptismDate: (memberRes.data as any).baptism_date,
            dateJoined: (memberRes.data as any).date_joined,
            baptizedSubLevel: (memberRes.data as any).baptized_sub_level,
            branchId: (memberRes.data as any).branch_id,
            branchName: (memberRes.data as any).church_branches?.name || null,
            community: (memberRes.data as any).community,
            area: (memberRes.data as any).area,
            street: (memberRes.data as any).street,
            publicLandmark: (memberRes.data as any).public_landmark,
            assignedDepartment: (memberRes.data as any).assigned_department,
            ministry: (memberRes.data as any).ministry,
          }));

          // Sync to separate states used in ProfileEdit
          setAddressLine((memberRes.data as any).street || '');
          setState((memberRes.data as any).community || '');
          setCity((memberRes.data as any).area || '');
          setZipCode((memberRes.data as any).public_landmark || '');
        }
      } else {
        setCurrentUserId(null);
        setPhotoPath(null);
        await refreshPhotoUrl(null);
      }
      setLoading(false);
    })();
  }, [refreshPhotoUrl]);

  useEffect(() => {
    if (!persistedMeta.isHydrated) return;
    if (!currentUserId) return;
    if (hasAppliedPersisted.current) return;

    if (!persistedState) {
      hasAppliedPersisted.current = true;
      return;
    }

    setForm((prev) => ({ ...prev, ...persistedState.form }));
    setMiddleName(persistedState.middleName ?? '');
    setNickname(persistedState.nickname ?? '');
    setAddressLine(persistedState.addressLine ?? '');
    setState(persistedState.addressState ?? '');
    setCity(persistedState.city ?? '');
    setZipCode(persistedState.zipCode ?? '');
    setDoNotEmail(persistedState.doNotEmail ?? false);
    setDoNotText(persistedState.doNotText ?? false);
    if (persistedState.memberInfo) {
      setMemberInfo((prev) => ({ ...prev, ...persistedState.memberInfo }));
    }
    setEditOpen(persistedState.editOpen ?? false);
    hasAppliedPersisted.current = true;
  }, [persistedMeta.isHydrated, currentUserId, persistedState]);

  useEffect(() => {
    if (!photoPath) return;
    const interval = setInterval(
      () => {
        refreshPhotoUrl(photoPath);
      },
      12 * 60 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, [photoPath, refreshPhotoUrl]);

  useEffect(() => {
    if (editOpen) {
      refreshPhotoUrl(photoPath);
    }
  }, [editOpen, photoPath, refreshPhotoUrl]);

  useEffect(() => {
    if (!currentUserId) return;
    if (!persistedMeta.isHydrated) return;

    setPersistedState((prev) => {
      const next: PersistedProfileState = {
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
      };

      if (isPersistedStateEqual(prev, next)) {
        return prev as PersistedProfileState;
      }

      return next;
    });
  }, [
    addressLine,
    city,
    currentUserId,
    doNotEmail,
    doNotText,
    editOpen,
    form,
    persistedMeta.isHydrated,
    memberInfo,
    middleName,
    nickname,
    setPersistedState,
    state,
    zipCode,
  ]);

  const save = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'User not found. Please log in again.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      if (!form.first_name.trim() || !form.last_name.trim()) {
        toast({
          title: 'Validation',
          description: 'First and last name are required.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Update profiles table
      console.log('Attempting profile update for user:', user.id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
      });

      const {
        error: profileError,
        data: profileData,
        status: profileStatus,
      } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          middle_name: middleName.trim() || null,
          nickname: nickname.trim() || null,
        })
        .eq('id', user.id)
        .select();

      console.log('Profile update response:', {
        status: profileStatus,
        data: profileData,
        error: profileError,
      });

      if (profileError) {
        console.error('Profile update error details:', profileError);
        toast({
          title: 'Profile Save Failed',
          description: `${profileError.message} (Code: ${profileError.code})`,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Update members table if member exists
      if (memberId && user.email) {
        const memberUpdateData: any = {
          full_name: `${form.first_name.trim()} ${form.last_name.trim()}`,
        };

        if (form.phone.trim()) memberUpdateData.phone = form.phone.trim();
        if (memberInfo.birthdate) memberUpdateData.date_of_birth = memberInfo.birthdate;
        if (memberInfo.gender) memberUpdateData.gender = memberInfo.gender;
        if (memberInfo.maritalStatus) memberUpdateData.marital_status = memberInfo.maritalStatus;
        if (addressLine.trim()) memberUpdateData.street = addressLine.trim();
        if (state.trim()) memberUpdateData.community = state.trim();
        if (city.trim()) memberUpdateData.area = city.trim();
        if (zipCode.trim()) memberUpdateData.public_landmark = zipCode.trim();

        console.log('Attempting member update for email:', user.email, memberUpdateData);

        const { error: memberError, status: memberStatus } = await supabase
          .from('members')
          .update(memberUpdateData)
          .eq('email', user.email);

        console.log('Member update response:', { status: memberStatus, error: memberError });

        if (memberError) {
          console.error('Member update error details:', memberError);
          toast({
            title: 'Warning',
            description: 'Profile updated but member info update failed: ' + memberError.message,
            variant: 'destructive',
          });
          // We don't return here because profile update succeeded
        }
      }

      toast({ title: 'Saved', description: 'Profile updated successfully.' });
      setMemberInfo((prev) => ({
        ...prev,
        mobilePhone: form.phone.trim() || prev.mobilePhone,
        street: addressLine.trim() || prev.street,
        community: state.trim() || prev.community,
        area: city.trim() || prev.area,
        publicLandmark: zipCode.trim() || prev.publicLandmark,
      }));
      setEditOpen(false);
    } catch (err: any) {
      console.error('Unexpected error during save:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    setUploading(true);
    const previousPath = photoPath;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true, contentType: file.type });
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
      const { error: removeErr } = await supabase.storage
        .from('profile-photos')
        .remove([previousPath]);
      if (removeErr) {
        console.error('Failed to remove previous profile photo', removeErr);
      }
    }
    setUploading(false);
  };

  const removePhoto = async () => {
    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }
    const currentPath = photoPath;
    const { error } = await supabase
      .from('profiles')
      .update({ profile_photo: null })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Remove failed', description: error.message, variant: 'destructive' });
    } else {
      if (currentPath) {
        const { error: removeErr } = await supabase.storage
          .from('profile-photos')
          .remove([currentPath]);
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
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const formatEnum = (value: string | null, fallback = 'Unknown') => {
    if (!value) return fallback;
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayName = [form.first_name, form.last_name].filter(Boolean).join(' ').trim() || email;
  const birthdateDisplay = formatDate(memberInfo.birthdate);
  const genderDisplay = formatEnum(memberInfo.gender);
  const maritalStatusDisplay = formatEnum(memberInfo.maritalStatus);
  const gradeDisplay = memberInfo.membershipLevel
    ? formatEnum(memberInfo.membershipLevel, '—')
    : '—';
  const genderOptions = Constants.public.Enums.gender;
  const maritalStatusOptions = Constants.public.Enums.marital_status;
  const membershipLevelOptions = Constants.public.Enums.membership_level;
  const baptizedSubLevelOptions = Constants.public.Enums.baptized_sub_level;
  const mobilePhoneDisplay = memberInfo.mobilePhone?.trim() || '—';
  const homePhoneDisplay = memberInfo.homePhone?.trim() || '—';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  const actionButtons = [
    { label: 'QR Code', icon: QrCode, onClick: () => handleNavigation('/portal/qr-code') },
    {
      label: 'Digital ID Card',
      icon: CreditCard,
      onClick: () => handleNavigation('/portal/id-card'),
    },
    {
      label: 'Two-Factor Authentication',
      icon: ShieldCheck,
      onClick: () => handleNavigation('/portal/two-factor-auth'),
    },
    {
      label: 'Change Password',
      icon: KeyRound,
      onClick: () => handleNavigation('/portal/change-password'),
    },
    {
      label: 'Directory Settings',
      icon: Settings,
      onClick: () => handleNavigation('/portal/directory-settings'),
    },
    {
      label: 'Edit Account Info',
      icon: FileEdit,
      onClick: () => handleNavigation('/portal/edit-account'),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ProfileEdit
        open={editOpen}
        onOpenChange={setEditOpen}
        actionButtons={actionButtons}
        fileInputRef={fileInputRef}
        onUpload={onUpload}
        photoUrl={photoUrl}
        displayName={displayName}
        uploading={uploading}
        removePhoto={removePhoto}
        form={form}
        setForm={setForm}
        middleName={middleName}
        setMiddleName={setMiddleName}
        nickname={nickname}
        setNickname={setNickname}
        addressLine={addressLine}
        setAddressLine={setAddressLine}
        stateVal={state}
        setStateVal={setState}
        city={city}
        setCity={setCity}
        zipCode={zipCode}
        setZipCode={setZipCode}
        memberInfo={memberInfo}
        setMemberInfo={setMemberInfo}
        genderOptions={genderOptions}
        maritalStatusOptions={maritalStatusOptions}
        save={save}
        saving={saving}
      />

      <div className="grid gap-8 lg:grid-cols-[350px,1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-none bg-white shadow-xl ring-1 ring-border/20">
            <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
            <CardContent className="relative flex flex-col items-center gap-4 px-6 pb-8 -mt-12">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={photoUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                    {displayName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileEdit className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h2>
                <p className="text-sm font-medium text-primary/80 uppercase tracking-widest">
                  {formatEnum(memberInfo.membershipLevel, 'Member')}
                </p>
                {memberInfo.branchName && (
                  <p className="text-xs text-muted-foreground">{memberInfo.branchName} Branch</p>
                )}
              </div>
              <div className="w-full pt-4 space-y-2">
                <Button
                  className="w-full shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  onClick={() => setEditOpen(true)}
                >
                  <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
                <input
                  ref={fileInputRef as any}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUpload}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none bg-white shadow-xl ring-1 ring-border/20">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-6">
                <InfoItem label="Full Name" value={displayName} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Gender" value={genderDisplay} />
                  <InfoItem label="Birthdate" value={birthdateDisplay} />
                </div>
                <InfoItem label="Marital Status" value={maritalStatusDisplay} />
                {nickname && <InfoItem label="Nickname" value={nickname} />}
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-xl ring-1 ring-border/20">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" /> Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-6">
                <InfoItem label="Email Address" value={email} subValue="Primary" />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Mobile Phone" value={mobilePhoneDisplay} />
                  <InfoItem label="Home Phone" value={homePhoneDisplay} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                    Stay Connected
                  </p>
                  <div className="flex gap-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${!doNotEmail ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                    >
                      Email: {!doNotEmail ? 'Enabled' : 'Disabled'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${!doNotText ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                    >
                      SMS: {!doNotText ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-xl ring-1 ring-border/20">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Church Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Membership Level" value={gradeDisplay} />
                  <InfoItem label="Joined Date" value={formatDate(memberInfo.dateJoined)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Baptism Status"
                    value={memberInfo.baptismDate ? 'Baptized' : 'Not Baptized'}
                  />
                  {memberInfo.baptismDate && (
                    <InfoItem label="Baptism Date" value={formatDate(memberInfo.baptismDate)} />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Department" value={memberInfo.assignedDepartment || 'None'} />
                  <InfoItem label="Ministry" value={memberInfo.ministry || 'None'} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-xl ring-1 ring-border/20">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Address & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-6">
                <InfoItem label="Home Address" value={memberInfo.street || '—'} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Area" value={memberInfo.area || '—'} />
                  <InfoItem label="Community" value={memberInfo.community || '—'} />
                </div>
                <InfoItem label="Public Landmarks" value={memberInfo.publicLandmark || '—'} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string | null; subValue?: string }> = ({
  label,
  value,
  subValue,
}) => (
  <div className="space-y-1">
    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
      {label}
    </p>
    <div className="flex items-center gap-2">
      <p className="text-sm font-semibold text-foreground break-all">{value || '—'}</p>
      {subValue && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase font-medium">
          {subValue}
        </span>
      )}
    </div>
  </div>
);
