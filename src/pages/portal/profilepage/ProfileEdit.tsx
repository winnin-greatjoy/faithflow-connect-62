import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileEdit, Settings, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProfileEditProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionButtons: Array<{ label: string; icon: any; onClick: () => void }>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoUrl: string | null;
  displayName: string;
  uploading: boolean;
  removePhoto: () => void;
  form: any;
  setForm: (fn: any) => void;
  middleName: string;
  setMiddleName: (v: string) => void;
  nickname: string;
  setNickname: (v: string) => void;
  addressLine: string;
  setAddressLine: (v: string) => void;
  stateVal: string;
  setStateVal: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  memberInfo: any;
  setMemberInfo: (v: any) => void;
  genderOptions: readonly string[];
  maritalStatusOptions: readonly string[];
  membershipLevelOptions: readonly string[];
  save: () => Promise<void>;
  saving: boolean;
};

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  open,
  onOpenChange,
  actionButtons,
  fileInputRef,
  onUpload,
  photoUrl,
  displayName,
  uploading,
  removePhoto,
  form,
  setForm,
  middleName,
  setMiddleName,
  nickname,
  setNickname,
  addressLine,
  setAddressLine,
  stateVal,
  setStateVal,
  city,
  setCity,
  zipCode,
  setZipCode,
  memberInfo,
  setMemberInfo,
  genderOptions,
  maritalStatusOptions,
  membershipLevelOptions,
  save,
  saving,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

      <DialogContent className="w-full h-[85vh] max-h-[85vh] overflow-hidden p-0 sm:max-w-4xl">
        <div className="flex h-full flex-col">
          <DialogHeader className="relative px-6 pt-6 pb-4">
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update your personal details, contact info, and preferences.</DialogDescription>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-4"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Preferences</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={Boolean(memberInfo.doNotEmail ?? false)}
                  onCheckedChange={value => setMemberInfo((prev: any) => ({ ...prev, doNotEmail: Boolean(value) }))}
                >
                  Do not send emails
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={Boolean(memberInfo.doNotText ?? false)}
                  onCheckedChange={value => setMemberInfo((prev: any) => ({ ...prev, doNotText: Boolean(value) }))}
                >
                  Do not send texts
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="flex flex-col gap-6">
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
                    {uploading ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/70 border-t-transparent" />
                    ) : (
                      <FileEdit className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                {photoUrl && (
                  <Button variant="ghost" size="sm" onClick={removePhoto} disabled={uploading}>
                    Remove Photo
                  </Button>
                )}
              </div>

              <Tabs defaultValue="personal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="church">Church</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="first_name">First Name<span className="text-destructive"> *</span></Label>
                        <Input
                          id="first_name"
                          value={form.first_name}
                          onChange={e => setForm((f: any) => ({ ...f, first_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input id="middle_name" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name<span className="text-destructive"> *</span></Label>
                        <Input
                          id="last_name"
                          value={form.last_name}
                          onChange={e => setForm((f: any) => ({ ...f, last_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={memberInfo.gender ?? undefined}
                          onValueChange={value => setMemberInfo((prev: any) => ({ ...prev, gender: value }))}
                        >
                          <SelectTrigger id="gender" className="w-full capitalize">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map(option => (
                              <SelectItem key={option} value={option} className="capitalize">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="birthdate">Date of Birth</Label>
                        <Input
                          id="birthdate"
                          type="date"
                          value={memberInfo.birthdate || ''}
                          onChange={e => setMemberInfo((prev: any) => ({ ...prev, birthdate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="marital_status">Marital Status</Label>
                      <Select
                        value={memberInfo.maritalStatus ?? undefined}
                        onValueChange={value => setMemberInfo((prev: any) => ({ ...prev, maritalStatus: value }))}
                      >
                        <SelectTrigger id="marital_status" className="w-full capitalize">
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          {maritalStatusOptions.map(option => (
                            <SelectItem key={option} value={option} className="capitalize">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
                    </div>
                  </div>
                </TabsContent>
                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="mobile_phone">Mobile Phone</Label>
                      <Input
                        id="mobile_phone"
                        value={form.phone}
                        onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="home_phone">Home Phone</Label>
                      <Input
                        id="home_phone"
                        value={memberInfo.homePhone || ''}
                        onChange={e => setMemberInfo((prev: any) => ({ ...prev, homePhone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="address_line">Address Line</Label>
                      <Input id="address_line" value={addressLine} onChange={e => setAddressLine(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="state">Community</Label>
                        <Input id="state" value={stateVal} onChange={e => setStateVal(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="city">Area</Label>
                        <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zip">Public landmarks</Label>
                      <Input id="zip" value={zipCode} onChange={e => setZipCode(e.target.value)} />
                    </div>
                  </div>
                </TabsContent>
                        {/* Church Tab */}
                <TabsContent value="church" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    
                    <div>
                      <Label htmlFor="grade">Branch <span className="normal-case text-xs text-muted-foreground/80"></span></Label>
                      <Select
                        value={memberInfo.membershipLevel ?? undefined}
                        onValueChange={value => setMemberInfo((prev: any) => ({ ...prev, membershipLevel: value }))}
                      >
                        <SelectTrigger id="grade" className="w-full capitalize">
                          <SelectValue placeholder="Select Membership Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {membershipLevelOptions.map(option => (
                            <SelectItem key={option} value={option} className="capitalize">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="grade">Membership Level <span className="normal-case text-xs text-muted-foreground/80"></span></Label>
                      <Select
                        value={memberInfo.membershipLevel ?? undefined}
                        onValueChange={value => setMemberInfo((prev: any) => ({ ...prev, membershipLevel: value }))}
                      >
                        <SelectTrigger id="grade" className="w-full capitalize">
                          <SelectValue placeholder="Select Membership Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {membershipLevelOptions.map(option => (
                            <SelectItem key={option} value={option} className="capitalize">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="grade">Baptised Sub-Level <span className="normal-case text-xs text-muted-foreground/80"></span></Label>
                      <Select
                        value={memberInfo.membershipLevel ?? undefined}
                        onValueChange={value => setMemberInfo((prev: any) => ({ ...prev, membershipLevel: value }))}
                      >
                        <SelectTrigger id="grade" className="w-full capitalize">
                          <SelectValue placeholder="Select Membership Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {membershipLevelOptions.map(option => (
                            <SelectItem key={option} value={option} className="capitalize">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter className="border-t border-border/60 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEdit;
