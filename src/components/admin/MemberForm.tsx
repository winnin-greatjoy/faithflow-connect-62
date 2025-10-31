// src/components/admin/MemberForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Member, MembershipLevel, Gender, MaritalStatus } from '@/types/membership';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const childSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  notes: z.string().optional()
});

const memberSchema = z.object({
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
  leaderRole: z.enum(['pastor', 'assistant_pastor', 'department_head', 'ministry_head']).optional(),
  baptismDate: z.string().optional(),
  joinDate: z.string().min(1, 'Join date is required'),
  baptismOfficiator: z.string().optional(),
  spiritualMentor: z.string().optional(),
  assignedDepartment: z.string().optional(),
  prayerNeeds: z.string().optional(),
  pastoralNotes: z.string().optional()
});

type MemberFormData = z.infer<typeof memberSchema>;

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
    defaultValues: member ? {
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
      joinDate: member.joinDate ? member.joinDate.split('T')[0] : new Date().toISOString().split('T')[0],
      baptismOfficiator: member.baptismOfficiator ?? '',
      spiritualMentor: member.spiritualMentor ?? '',
      assignedDepartment: member.assignedDepartment ?? '',
      prayerNeeds: member.prayerNeeds ?? '',
      pastoralNotes: member.pastoralNotes ?? ''
    } : {
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
      pastoralNotes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image', variant: 'destructive' });
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
          message: `This email is already registered to ${existingMember.full_name}`
        });
        toast({
          title: 'Duplicate Email',
          description: `This email is already registered to ${existingMember.full_name}`,
          variant: 'destructive'
        });
        return;
      }
    }
    
    onSubmit(data);
    toast({ title: member ? 'Member updated' : 'Member added', description: `${data.fullName} saved.` });
  };

  const watchedMembershipLevel = form.watch('membershipLevel');
  const watchedBaptizedSubLevel = form.watch('baptizedSubLevel');
  const watchedMaritalStatus = form.watch('maritalStatus');

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Add Member'}</CardTitle>
        <CardDescription>{member ? 'Update details' : 'Enter member details'}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={form.watch('profilePhoto')} />
                    <AvatarFallback>{(form.watch('fullName') || 'P').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <FormField control={form.control} name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <div className="mt-2 flex items-center gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" /> Upload photo</>}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => form.setValue('profilePhoto', '')}>Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                )} />

                {watchedMaritalStatus === 'married' && (
                  <FormField control={form.control} name="spouseName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Children</h4>
                    <Button size="sm" variant="outline" onClick={() => { handleAddChild(); }}>
                      <Plus className="mr-2 h-4 w-4" /> Add child
                    </Button>
                  </div>

                  {fields.map((f, idx) => (
                    <div key={f.id} className="border rounded p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Child {idx + 1}</div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveChild(idx)}>
                          <Trash2 />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField control={form.control} name={`children.${idx}.name`} render={({ field }) => (
                          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name={`children.${idx}.dateOfBirth`} render={({ field }) => (
                          <FormItem><FormLabel>Date of birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Contact & Church</h3>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <FormField control={form.control} name="community" render={({ field }) => (
                    <FormItem><FormLabel>Community</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem><FormLabel>Area</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="street" render={({ field }) => (
                  <FormItem className="mt-3"><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="publicLandmark" render={({ field }) => (
                  <FormItem className="mt-3"><FormLabel>Public landmark</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="branchId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Select onValueChange={(v) => field.onChange(v)} defaultValue={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                          <SelectContent>
                            {branches.map(b => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="membershipLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership level</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visitor">Visitor</SelectItem>
                            <SelectItem value="convert">Convert</SelectItem>
                            <SelectItem value="baptized">Baptized</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {watchedMembershipLevel === 'baptized' && (
                  <>
                    <FormField control={form.control} name="baptizedSubLevel" render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormLabel>Baptized sub-level</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select sub-level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="disciple">Disciple</SelectItem>
                              <SelectItem value="worker">Worker</SelectItem>
                              <SelectItem value="leader">Leader</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchedBaptizedSubLevel === 'leader' && (
                      <FormField control={form.control} name="leaderRole" render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Leadership role</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pastor">Pastor</SelectItem>
                                <SelectItem value="assistant_pastor">Assistant Pastor</SelectItem>
                                <SelectItem value="department_head">Department Head</SelectItem>
                                <SelectItem value="ministry_head">Ministry Head</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <FormField control={form.control} name="prayerNeeds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prayer needs</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="pastoralNotes" render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>Pastoral notes</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
              <Button type="submit">{member ? 'Update Member' : 'Add Member'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
