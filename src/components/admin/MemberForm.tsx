// src/components/admin/MemberForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
  Upload,
  Camera,
  FileDown,
  Sparkles,
  User,
  Shield,
  Key,
  FileText,
} from 'lucide-react';
import { Member, MembershipLevel, Gender, MaritalStatus } from '@/types/membership';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranchScope } from '@/hooks/useBranchScope';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Department Select Component
const DepartmentSelect: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  branchId: string;
}> = ({ value, onChange, branchId }) => {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (branchId) {
      (async () => {
        const { data } = await supabase
          .from('departments')
          .select('id, name')
          .eq('branch_id', branchId)
          .order('name');
        setDepartments(data || []);
      })();
    }
  }, [branchId]);

  return (
    <Select onValueChange={(val) => onChange(val === '_none' ? '' : val)} value={value || ''}>
      <SelectTrigger>
        <SelectValue placeholder="Select department" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">None</SelectItem>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const childSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  notes: z.string().optional(),
});

const memberSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    profilePhoto: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female']),
    maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced']),
    spouseName: z.string().optional(),
    numberOfChildren: z.coerce.number().min(0),
    children: z.array(childSchema).optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(7, 'Phone number must be at least 7 characters'),
    community: z.string().min(1, 'Community is required'),
    area: z.string().min(1, 'Area is required'),
    street: z.string().min(1, 'Street is required'),
    publicLandmark: z.string().optional(),
    branchId: z.string().min(1, 'Branch is required'),
    membershipLevel: z.enum(['baptized', 'convert', 'visitor']),
    baptizedSubLevel: z.enum(['leader', 'worker', 'disciple']).optional(),
    leaderRole: z
      .enum(['pastor', 'assistant_pastor', 'department_head', 'ministry_head'])
      .optional(),
    baptismDate: z.string().optional(),
    joinDate: z.string().min(1, 'Join date is required'),
    baptismOfficiator: z.string().optional(),
    spiritualMentor: z.string().optional(),
    assignedDepartment: z.string().optional(),
    // Discipleship tracking
    discipleshipClass1: z.boolean().optional(),
    discipleshipClass2: z.boolean().optional(),
    discipleshipClass3: z.boolean().optional(),
    // Status
    status: z.enum(['active', 'inactive', 'suspended', 'transferred']).optional(),
    lastAttendance: z.string().optional(),
    // Notes
    prayerNeeds: z.string().optional(),
    pastoralNotes: z.string().optional(),
    // Admin role assignment (optional - only used when creating admin)
    assignAdminRole: z.boolean().optional(),
    adminRole: z
      .enum([
        'super_admin',
        'general_overseer',
        'district_overseer',
        'district_admin',
        'admin',
        'pastor',
      ])
      .optional(),
    adminBranchId: z.string().optional(),
    adminDistrictId: z.string().optional(),
    // Account creation
    createAccount: z.boolean().optional(),
    username: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Only validate password if createAccount is true
      if (data.createAccount) {
        if (!data.username || !data.password) {
          return false;
        }
        if (data.password.length < 8) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Username and password (min 8 characters) are required when creating an account',
      path: ['createAccount'],
    }
  )
  .refine(
    (data: any) => {
      // If assigning admin role, require the role to be selected
      if (data.assignAdminRole && !data.adminRole) {
        return false;
      }
      return true;
    },
    {
      message: 'Admin role is required when assigning admin access',
      path: ['adminRole'],
    }
  );

export type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
  /** Enable admin role assignment tab */
  showAdminRoleSelector?: boolean;
  /** Default admin role to select */
  defaultAdminRole?: string;
}

export const MemberForm: React.FC<MemberFormProps> = ({
  member,
  onSubmit,
  onCancel,
  showAdminRoleSelector = false,
  defaultAdminRole,
}) => {
  const { toast } = useToast();
  const { effectiveBranchId, canSwitchBranch } = useBranchScope();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      const [branchesRes, districtsRes] = await Promise.all([
        supabase.from('church_branches').select('id, name').order('name'),
        supabase.from('districts').select('id, name').order('name'),
      ]);
      if (!branchesRes.error) setBranches(branchesRes.data || []);
      if (!districtsRes.error) setDistricts(districtsRes.data || []);
    })();
  }, []);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          fullName: member.fullName,
          profilePhoto: member.profilePhoto ?? '',
          dateOfBirth: member.dateOfBirth ?? '',
          gender: (member.gender ?? 'male') as Gender,
          maritalStatus: (member.maritalStatus ?? 'single') as MaritalStatus,
          spouseName: member.spouseName ?? '',
          numberOfChildren: member.numberOfChildren ?? 0,
          children: member.children ?? [],
          email: member.email ?? '',
          phone: member.phone ?? '',
          community: member.community ?? '',
          area: member.area ?? '',
          street: member.street ?? '',
          publicLandmark: member.publicLandmark ?? '',
          branchId: String(member.branchId ?? effectiveBranchId ?? ''),
          membershipLevel: member.membershipLevel ?? 'visitor',
          baptizedSubLevel: member.baptizedSubLevel ?? undefined,
          leaderRole: member.leaderRole ?? undefined,
          baptismDate: member.baptismDate ?? '',
          joinDate: member.joinDate
            ? member.joinDate.split('T')[0]
            : new Date().toISOString().split('T')[0],
          baptismOfficiator: member.baptismOfficiator ?? '',
          spiritualMentor: member.spiritualMentor ?? '',
          assignedDepartment: member.assignedDepartment ?? '',
          discipleshipClass1: member.discipleshipClass1 ?? false,
          discipleshipClass2: member.discipleshipClass2 ?? false,
          discipleshipClass3: member.discipleshipClass3 ?? false,
          status: member.status ?? 'active',
          lastAttendance: member.lastAttendance ?? '',
          prayerNeeds: member.prayerNeeds ?? '',
          pastoralNotes: member.pastoralNotes ?? '',
          createAccount: false,
          username: '',
          password: '',
        }
      : {
          fullName: '',
          profilePhoto: '',
          dateOfBirth: '',
          gender: 'male',
          maritalStatus: 'single',
          spouseName: '',
          numberOfChildren: 0,
          children: [],
          email: '',
          phone: '',
          community: '',
          area: '',
          street: '',
          publicLandmark: '',
          branchId: effectiveBranchId ?? '',
          membershipLevel: 'visitor',
          baptizedSubLevel: undefined,
          leaderRole: undefined,
          baptismDate: '',
          joinDate: new Date().toISOString().split('T')[0],
          baptismOfficiator: '',
          spiritualMentor: '',
          assignedDepartment: '',
          discipleshipClass1: false,
          discipleshipClass2: false,
          discipleshipClass3: false,
          status: 'active',
          lastAttendance: '',
          prayerNeeds: '',
          pastoralNotes: '',
          createAccount: false,
          username: '',
          password: '',
        },
  });

  // Auto-set branch for branch admins
  useEffect(() => {
    if (!canSwitchBranch && effectiveBranchId && !form.getValues('branchId')) {
      form.setValue('branchId', effectiveBranchId);
    }
  }, [effectiveBranchId, canSwitchBranch, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children',
  });

  const uploadProfilePhoto = async (file: File): Promise<string> => {
    const fileName = `member-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    return fileName;
  };

  // Effect to resolve signed URL for preview
  const watchedPhoto = form.watch('profilePhoto');
  useEffect(() => {
    if (!watchedPhoto) {
      setPreviewUrl(null);
      return;
    }

    if (
      watchedPhoto.startsWith('http://') ||
      watchedPhoto.startsWith('https://') ||
      watchedPhoto.startsWith('data:')
    ) {
      setPreviewUrl(watchedPhoto);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.storage
          .from('profile-photos')
          .createSignedUrl(watchedPhoto, 60 * 60); // 1 hour for preview
        if (!error && data?.signedUrl) {
          setPreviewUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Error resolving preview URL:', err);
      }
    })();
  }, [watchedPhoto]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadProfilePhoto(file);
      form.setValue('profilePhoto', url);
      toast({
        title: 'Photo Uploaded',
        description: 'Profile identity record updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddChild = () => {
    append({ id: Date.now().toString(), name: '', dateOfBirth: '', gender: 'male', notes: '' });
    form.setValue('numberOfChildren', (form.getValues('children')?.length || 0) + 1);
  };

  const handleRemoveChild = (idx: number) => {
    remove(idx);
    form.setValue('numberOfChildren', Math.max(0, (form.getValues('children')?.length || 1) - 1));
  };

  const submit = async (data: MemberFormData) => {
    // Check for duplicate email before submitting
    if (data.email && !member) {
      const { data: existingMember } = await supabase
        .from('members')
        .select('id, full_name')
        .ilike('email', data.email.trim())
        .limit(1)
        .maybeSingle();

      if (existingMember) {
        form.setError('email', {
          type: 'manual',
          message: `This email is already registered to ${existingMember.full_name}`,
        });
        toast({
          title: 'Duplicate Email',
          description: `This email is already registered to ${existingMember.full_name}`,
          variant: 'destructive',
        });
        return;
      }
    }

    onSubmit(data);
    toast({
      title: member ? 'Member updated' : 'Member added',
      description: `${data.fullName} saved.`,
    });
  };

  const watchedMembershipLevel = form.watch('membershipLevel');
  const watchedBaptizedSubLevel = form.watch('baptizedSubLevel');
  const watchedMaritalStatus = form.watch('maritalStatus');
  const watchedCreateAccount = form.watch('createAccount');

  // Handle validation errors - show toast with first error
  const onFormError = (errors: any) => {
    console.error('Form validation errors:', errors);

    // Get the first error message
    const firstError = Object.entries(errors)[0];
    if (firstError) {
      const [field, error] = firstError as [string, any];
      toast({
        title: 'Validation Error',
        description: `${field}: ${error?.message || 'Invalid value'}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit, onFormError)} className="space-y-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList
            className={cn(
              'glass p-1 h-14 rounded-2xl border-primary/5 gap-1 bg-white/40 dark:bg-black/20 grid w-full',
              showAdminRoleSelector ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'
            )}
          >
            <TabsTrigger
              value="personal"
              className="rounded-xl px-2 sm:px-4 h-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-vibrant-gradient data-[state=active]:!text-blue-600 data-[state=active]:shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary"
            >
              <User className="h-3.5 w-3.5" />
              <span className="inline-block transition-colors">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="church"
              className="rounded-xl px-2 sm:px-4 h-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-vibrant-gradient data-[state=active]:!text-blue-600 data-[state=active]:shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="inline-block transition-colors">Church Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="rounded-xl px-2 sm:px-4 h-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-vibrant-gradient data-[state=active]:!text-blue-600 data-[state=active]:shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary"
            >
              <Key className="h-3.5 w-3.5" />
              <span className="inline-block transition-colors">Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-xl px-2 sm:px-4 h-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-vibrant-gradient data-[state=active]:!text-blue-600 data-[state=active]:shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="inline-block transition-colors">Notes</span>
            </TabsTrigger>
            {showAdminRoleSelector && (
              <TabsTrigger
                value="admin-role"
                className="rounded-xl px-2 sm:px-4 h-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-amber-500 data-[state=active]:!text-blue-600 data-[state=active]:shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-amber-500/10 hover:text-amber-600"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="inline">Admin Role</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent
            value="personal"
            className="space-y-8 mt-6 h-[65vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start gap-8"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative group p-1">
                  <Avatar className="h-32 w-32 rounded-[2rem] ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all duration-500 overflow-hidden shadow-xl">
                    <AvatarImage src={previewUrl || ''} className="object-cover" />
                    <AvatarFallback className="bg-vibrant-gradient text-white text-3xl font-serif font-bold">
                      {(form.watch('fullName') || 'P').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Floating Upload Icon Trigger via Label for better mobile support */}
                  <label
                    htmlFor="profile-upload"
                    className="absolute -bottom-1 -right-1 h-11 w-11 rounded-2xl bg-vibrant-gradient text-white shadow-lg flex items-center justify-center border-4 border-white dark:border-zinc-950 z-10 transition-all hover:scale-110 active:scale-90 cursor-pointer hover:shadow-primary/40"
                  >
                    <Upload className={cn('h-5 w-5', isUploading && 'animate-bounce')} />
                  </label>

                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {form.watch('profilePhoto') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => form.setValue('profilePhoto', '')}
                    className="text-[10px] font-bold uppercase tracking-widest h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-lg w-full"
                  >
                    Purge Image
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Date of Birth *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Gender *
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                <SelectItem value="male" className="font-medium">
                                  Male
                                </SelectItem>
                                <SelectItem value="female" className="font-medium">
                                  Female
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Marital Status *
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                <SelectItem value="single" className="font-medium">
                                  Single
                                </SelectItem>
                                <SelectItem value="married" className="font-medium">
                                  Married
                                </SelectItem>
                                <SelectItem value="widowed" className="font-medium">
                                  Widowed
                                </SelectItem>
                                <SelectItem value="divorced" className="font-medium">
                                  Divorced
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchedMaritalStatus === 'married' && (
                    <FormField
                      control={form.control}
                      name="spouseName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Spouse Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter spouse full name"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </motion.div>

            <div className="border-t border-primary/5 pt-8 space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-foreground">
                  Contact Information
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-1">
                  Direct reach and physical address
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Email Address *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@domain.com"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+Country Code"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="community"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Community / Zone *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter community name"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Sector / Area *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter specific area"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Primary Street *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="House number and street"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicLandmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Landmark
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nearby recognizable feature"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t border-primary/5 pt-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Children</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-1">
                    Family records
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={handleAddChild}
                  className="glass border-primary/10 font-bold text-[10px] uppercase tracking-widest h-9 rounded-xl hover:bg-primary/5 transition-all text-xs"
                >
                  <Plus className="mr-2 h-3.5 w-3.5" /> Add Child
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="glass border-dashed border-primary/10 rounded-2xl p-8 text-center bg-primary/[0.02]">
                  <p className="text-sm font-medium text-muted-foreground opacity-60">
                    No children records added
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {fields.map((f, idx) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass border-primary/5 rounded-2xl p-6 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-vibrant-gradient opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-black">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                          Offspring Data
                        </h4>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => handleRemoveChild(idx)}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`children.${idx}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                              Given Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Child Name"
                                {...field}
                                className="glass h-10 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`children.${idx}.dateOfBirth`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                              Chronology
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="glass h-10 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`children.${idx}.gender`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                              Sex
                            </FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="glass h-10 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="glass border-primary/10 rounded-xl">
                                  <SelectItem value="male" className="font-medium">
                                    Male
                                  </SelectItem>
                                  <SelectItem value="female" className="font-medium">
                                    Female
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`children.${idx}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                              Observations
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Extra data"
                                {...field}
                                className="glass h-10 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Church Information Tab */}
          <TabsContent
            value="church"
            className="space-y-8 mt-6 h-[65vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Church Details</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-1">
                    Branch and joining information
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Church Branch *
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!canSwitchBranch && !!effectiveBranchId}
                          >
                            <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium disabled:opacity-50">
                              <SelectValue placeholder="Select operational unit" />
                            </SelectTrigger>
                            <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joinDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Join Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Church Rank</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-1">
                    Membership level and assignments
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="membershipLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Membership Level *
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || 'baptized'}
                          >
                            <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                              <SelectItem value="baptized" className="font-medium">
                                Baptized
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-[10px] font-bold opacity-60">
                          External flows (Visitors/Converts) use specialized protocols
                        </FormDescription>
                        <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                      </FormItem>
                    )}
                  />

                  {watchedMembershipLevel === 'baptized' && (
                    <FormField
                      control={form.control}
                      name="assignedDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Unit Assignment
                          </FormLabel>
                          <FormControl>
                            <DepartmentSelect
                              value={field.value}
                              onChange={field.onChange}
                              branchId={form.watch('branchId')}
                            />
                          </FormControl>
                          <FormDescription className="text-[10px] font-bold opacity-60">
                            Available only to validated Baptized members
                          </FormDescription>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
              {watchedMembershipLevel === 'baptized' && (
                <div className="border-t border-primary/5 pt-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      Baptism Details
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-1">
                      Sacramental information
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="baptizedSubLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Sub-Level *
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                <SelectValue placeholder="Select sub-level" />
                              </SelectTrigger>
                              <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                <SelectItem value="disciple" className="font-medium">
                                  Disciple
                                </SelectItem>
                                <SelectItem value="worker" className="font-medium">
                                  Worker
                                </SelectItem>
                                <SelectItem value="leader" className="font-medium">
                                  Leader
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />

                    {watchedBaptizedSubLevel === 'leader' && (
                      <FormField
                        control={form.control}
                        name="leaderRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                              Command Role *
                            </FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                  <SelectItem value="pastor" className="font-medium">
                                    Pastor
                                  </SelectItem>
                                  <SelectItem value="assistant_pastor" className="font-medium">
                                    Assistant Pastor
                                  </SelectItem>
                                  <SelectItem value="department_head" className="font-medium">
                                    Department Head
                                  </SelectItem>
                                  <SelectItem value="ministry_head" className="font-medium">
                                    Ministry Head
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="baptismDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Baptism Chronology
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="baptismOfficiator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Officiating Authority
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter officiator name"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="spiritualMentor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Spiritual Counselor
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter mentor name"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Account Creation Tab */}
          <TabsContent
            value="account"
            className="space-y-8 mt-6 h-[65vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {watchedMembershipLevel !== 'baptized' ? (
                <div className="glass border-amber-500/10 rounded-2xl p-8 bg-amber-500/[0.02] border-dashed text-center">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-2">
                    Access Logic Restricted
                  </h4>
                  <p className="text-sm text-amber-800/60 dark:text-amber-200/60 max-w-md mx-auto">
                    Portal credentialization is exclusively reserved for validated{' '}
                    <strong>baptized members</strong>. Upgrade status in the Ecclesiastical tab to
                    initialize.
                  </p>
                </div>
              ) : (
                <div className="glass border-primary/5 rounded-2xl p-8 bg-primary/[0.02]">
                  <FormField
                    control={form.control}
                    name="createAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-4 space-y-0 mb-8 p-4 rounded-xl hover:bg-primary/5 transition-all">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded-lg border-primary/20 data-[state=checked]:bg-vibrant-gradient data-[state=checked]:border-transparent"
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-lg font-serif font-bold text-foreground">
                            Create Account
                          </FormLabel>
                          <FormDescription className="text-xs font-medium opacity-60">
                            Create login credentials for the church portal
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <AnimatePresence>
                    {watchedCreateAccount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-primary/5 overflow-hidden"
                      >
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                Username (Email) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="member@domain.com"
                                  {...field}
                                  className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                Password *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Minimum 8 characters"
                                  {...field}
                                  className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="glass border-primary/5 rounded-2xl p-6 bg-vibrant-gradient/5">
                <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Ecosystem Privileges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Real-time Event Orchestration',
                    'Strategic Group Membership',
                    'Universal Directory Access',
                    'Chronological Attendance Audit',
                    'Instant Direct Notifications',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium opacity-70">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent
            value="notes"
            className="space-y-8 mt-6 h-[65vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="prayerNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Prayer Needs
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detail specific spiritual requirements..."
                        className="glass min-h-[150px] rounded-2xl border-primary/5 focus:ring-primary/20 font-medium resize-none shadow-inner p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs font-medium opacity-60">
                      Shared with authorized intercessors and prayer units
                    </FormDescription>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pastoralNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/80">
                      Pastoral Notes (Confidential)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter highly sensitive pastoral data..."
                        className="glass min-h-[150px] rounded-2xl border-rose-500/10 focus:ring-rose-500/20 font-medium border-dashed bg-rose-500/[0.02] resize-none shadow-inner p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs font-bold text-rose-500/60 flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Protocol Level: Absolute Confidentiality - Access strictly limited
                    </FormDescription>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                  </FormItem>
                )}
              />
            </motion.div>
          </TabsContent>

          {/* Admin Role Tab - Only shown when showAdminRoleSelector is true */}
          {showAdminRoleSelector && (
            <TabsContent
              value="admin-role"
              className="space-y-8 mt-6 h-[65vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="glass border-purple-500/20 rounded-2xl p-6 bg-purple-500/[0.03] flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold text-purple-900 dark:text-purple-100 mb-1">
                      Admin Rights
                    </h4>
                    <p className="text-sm text-purple-800/60 dark:text-purple-200/60">
                      Assigning administrative status grants special access to church management
                      functions.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="assignAdminRole"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-4 space-y-0 glass border-primary/5 p-6 rounded-2xl hover:bg-primary/5 transition-all">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) form.setValue('createAccount', true);
                          }}
                          className="h-6 w-6 rounded-lg border-primary/20 data-[state=checked]:bg-vibrant-gradient data-[state=checked]:border-transparent mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-xl font-serif font-bold text-foreground">
                          Assign Admin Role
                        </FormLabel>
                        <FormDescription className="text-sm font-medium opacity-60">
                          Grant this member administrative access to the system or a specific branch
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {form.watch('assignAdminRole') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 pt-6 border-t border-primary/5 overflow-hidden"
                    >
                      <FormField
                        control={form.control}
                        name="adminRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                              Admin Role *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={defaultAdminRole || field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                  <SelectValue placeholder="Select rank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                <SelectItem value="super_admin" className="font-medium">
                                  Super Admin (System Core)
                                </SelectItem>
                                <SelectItem value="general_overseer" className="font-medium">
                                  General Overseer
                                </SelectItem>
                                <SelectItem value="district_overseer" className="font-medium">
                                  District Overseer
                                </SelectItem>
                                <SelectItem value="district_admin" className="font-medium">
                                  District Admin
                                </SelectItem>
                                <SelectItem value="admin" className="font-medium">
                                  Branch Admin
                                </SelectItem>
                                <SelectItem value="pastor" className="font-medium">
                                  Pastor
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(form.watch('adminRole') === 'district_admin' ||
                          form.watch('adminRole') === 'district_overseer') && (
                          <FormField
                            control={form.control}
                            name="adminDistrictId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                  District *
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                      <SelectValue placeholder="Select district" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                    {districts.map((district) => (
                                      <SelectItem key={district.id} value={district.id}>
                                        {district.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                              </FormItem>
                            )}
                          />
                        )}

                        {(form.watch('adminRole') === 'admin' ||
                          form.watch('adminRole') === 'pastor') && (
                          <FormField
                            control={form.control}
                            name="adminBranchId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                  Branch *
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || form.watch('branchId')}
                                >
                                  <FormControl>
                                    <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                                      <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                                    {branches.map((branch) => (
                                      <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] uppercase font-bold tracking-widest" />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-primary/5 mt-auto">
          <Button
            variant="ghost"
            type="button"
            onClick={() => window.open('/member-registration-form.html', '_blank')}
            className="text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary/5 h-12 px-6 rounded-xl w-full sm:w-auto order-last sm:order-first"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Manifesto
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              className="glass border-primary/10 font-bold text-[10px] uppercase tracking-widest h-12 px-8 rounded-xl hover:bg-primary/5 transition-all w-full sm:w-auto"
            >
              Abort
            </Button>
            <Button
              type="submit"
              className="bg-vibrant-gradient text-white border-none font-bold text-[10px] uppercase tracking-widest h-12 px-10 rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95 w-full sm:w-auto"
            >
              {member ? 'Finalize Changes' : 'Initialize Identity'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
