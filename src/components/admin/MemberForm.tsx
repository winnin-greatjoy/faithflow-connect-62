// src/components/admin/MemberForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Trash2, Upload } from 'lucide-react';
import { Member, MembershipLevel, Gender, MaritalStatus } from '@/types/membership';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Department Select Component
const DepartmentSelect: React.FC<{ value?: string; onChange: (value: string) => void; branchId: string }> = ({ value, onChange, branchId }) => {
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
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select department" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">None</SelectItem>
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
    email: z.string().email('Invalid email address'),
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
    prayerNeeds: z.string().optional(),
    pastoralNotes: z.string().optional(),
    createAccount: z.boolean().optional(),
    username: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  })
  .refine(
    (data) => {
      if (data.createAccount) {
        return !!data.username && !!data.password;
      }
      return true;
    },
    {
      message: 'Username and password are required when creating an account',
      path: ['createAccount'],
    }
  );

export type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ member, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('church_branches')
        .select('id, name')
        .order('name');
      if (!error) setBranches(data || []);
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
          branchId: '',
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
          branchId: '',
          membershipLevel: 'visitor',
          baptizedSubLevel: undefined,
          leaderRole: undefined,
          baptismDate: '',
          joinDate: new Date().toISOString().split('T')[0],
          baptismOfficiator: '',
          spiritualMentor: '',
          assignedDepartment: '',
          prayerNeeds: '',
          pastoralNotes: '',
          createAccount: false,
          username: '',
          password: '',
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('profilePhoto', reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
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

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Add Member'}</CardTitle>
        <CardDescription>
          {member ? 'Update member details' : 'Enter new member details'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="church">Church</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6 mt-4">
                <div className="flex items-start gap-6">
                  <div>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={form.watch('profilePhoto')} />
                      <AvatarFallback>
                        {(form.watch('fullName') || 'P').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mt-3 flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          'Uploading...'
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => form.setValue('profilePhoto', '')}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedMaritalStatus === 'married' && (
                      <FormField
                        control={form.control}
                        name="spouseName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spouse Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="community"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Community *</FormLabel>
                          <FormControl>
                            <Input placeholder="Downtown" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area *</FormLabel>
                          <FormControl>
                            <Input placeholder="District 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publicLandmark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public Landmark</FormLabel>
                          <FormControl>
                            <Input placeholder="Near City Hall" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Children</h3>
                    <Button size="sm" variant="outline" type="button" onClick={handleAddChild}>
                      <Plus className="mr-2 h-4 w-4" /> Add Child
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">No children added yet</p>
                  )}

                  {fields.map((f, idx) => (
                    <div key={f.id} className="border rounded-lg p-4 mb-3 bg-muted/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Child {idx + 1}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          onClick={() => handleRemoveChild(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`children.${idx}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Child's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`children.${idx}.dateOfBirth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`children.${idx}.gender`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`children.${idx}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Input placeholder="Optional notes" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Church Information Tab */}
              <TabsContent value="church" className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joinDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Joined *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="membershipLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Level *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visitor">Visitor</SelectItem>
                              <SelectItem value="convert">Convert</SelectItem>
                              <SelectItem value="baptized">Baptized</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedMembershipLevel === 'baptized' && (
                    <FormField
                      control={form.control}
                      name="assignedDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned Department</FormLabel>
                          <FormControl>
                            <DepartmentSelect value={field.value} onChange={field.onChange} branchId={form.watch('branchId')} />
                          </FormControl>
                          <FormDescription>Only baptized members can be assigned to departments</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {watchedMembershipLevel === 'baptized' && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Baptism Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="baptizedSubLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Baptized Sub-Level</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="disciple">Disciple</SelectItem>
                                  <SelectItem value="worker">Worker</SelectItem>
                                  <SelectItem value="leader">Leader</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedBaptizedSubLevel === 'leader' && (
                        <FormField
                          control={form.control}
                          name="leaderRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Leadership Role</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pastor">Pastor</SelectItem>
                                    <SelectItem value="assistant_pastor">
                                      Assistant Pastor
                                    </SelectItem>
                                    <SelectItem value="department_head">Department Head</SelectItem>
                                    <SelectItem value="ministry_head">Ministry Head</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="baptismDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Baptism Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="baptismOfficiator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Baptism Officiator</FormLabel>
                            <FormControl>
                              <Input placeholder="Pastor Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="spiritualMentor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spiritual Mentor</FormLabel>
                            <FormControl>
                              <Input placeholder="Mentor Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Account Creation Tab */}
              <TabsContent value="account" className="space-y-6 mt-4">
                <div className="border rounded-lg p-6 bg-muted/30">
                  <FormField
                    control={form.control}
                    name="createAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium">
                            Create Portal Account
                          </FormLabel>
                          <FormDescription>
                            Enable this to create a login account for this member to access the
                            church portal
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {watchedCreateAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username *</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormDescription>Used for login</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Min 8 characters" {...field} />
                            </FormControl>
                            <FormDescription>Minimum 8 characters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {!watchedCreateAccount && (
                    <div className="mt-4 p-4 bg-background rounded-md border">
                      <p className="text-sm text-muted-foreground">
                        Portal access is disabled for this member. Enable the checkbox above to
                        create a login account.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                    Portal Access Benefits
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• View and RSVP to church events</li>
                    <li>• Access member directory</li>
                    <li>• Join groups and ministries</li>
                    <li>• View personal attendance history</li>
                    <li>• Receive notifications about church activities</li>
                  </ul>
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="prayerNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prayer Needs</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter prayer requests and needs..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Prayer requests that can be shared with the prayer team
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pastoralNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pastoral Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter confidential pastoral notes..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-amber-600 dark:text-amber-400">
                        🔒 Confidential - Only visible to pastoral staff and administrators
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">{member ? 'Update Member' : 'Add Member'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
