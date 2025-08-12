
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Member, MembershipLevel, Gender, MaritalStatus } from '@/types/membership';
import { mockBranches, departments } from '@/data/mockMembershipData';
import { useToast } from '@/hooks/use-toast';

const memberSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced']),
  spouseName: z.string().optional(),
  numberOfChildren: z.coerce.number().min(0),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  community: z.string().min(1, 'Community is required'),
  area: z.string().min(1, 'Area is required'),
  street: z.string().min(1, 'Street is required'),
  publicLandmark: z.string().optional(),
  branchId: z.coerce.number().min(1, 'Branch is required'),
  membershipLevel: z.enum(['baptized', 'convert', 'visitor']),
  baptizedSubLevel: z.enum(['leader', 'worker']).optional(),
  leaderRole: z.enum(['pastor', 'assistant_pastor', 'department_head', 'ministry_head']).optional(),
  baptismDate: z.string().optional(),
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

export const MemberForm = ({ member, onSubmit, onCancel }: MemberFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member ? {
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      spouseName: member.spouseName || '',
      numberOfChildren: member.numberOfChildren,
      email: member.email,
      phone: member.phone,
      community: member.community,
      area: member.area,
      street: member.street,
      publicLandmark: member.publicLandmark || '',
      branchId: member.branchId,
      membershipLevel: member.membershipLevel,
      baptizedSubLevel: member.baptizedSubLevel,
      leaderRole: member.leaderRole,
      baptismDate: member.baptismDate || '',
      assignedDepartment: member.assignedDepartment || '',
      prayerNeeds: member.prayerNeeds,
      pastoralNotes: member.pastoralNotes
    } : {
      numberOfChildren: 0,
      membershipLevel: 'visitor' as MembershipLevel,
      gender: 'male' as Gender,
      maritalStatus: 'single' as MaritalStatus,
      branchId: 1
    }
  });

  const watchedMembershipLevel = form.watch('membershipLevel');
  const watchedBaptizedSubLevel = form.watch('baptizedSubLevel');
  const watchedMaritalStatus = form.watch('maritalStatus');

  const handleSubmit = (data: MemberFormData) => {
    console.log('Submitting member data:', data);
    onSubmit(data);
    toast({
      title: member ? "Member Updated" : "Member Added",
      description: `${data.fullName} has been ${member ? 'updated' : 'added'} successfully.`,
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Add New Member'}</CardTitle>
        <CardDescription>
          {member ? 'Update member information' : 'Enter detailed information for the new member'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
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
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <Input placeholder="Enter spouse name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="numberOfChildren"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Children</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
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
                      <FormLabel>Community</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter community" {...field} />
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
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter area" {...field} />
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
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
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
                      <FormLabel>Public Landmark (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Near..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Church Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Church Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch/Campus</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockBranches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="membershipLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select membership level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="visitor">Visitor</SelectItem>
                          <SelectItem value="convert">Convert</SelectItem>
                          <SelectItem value="baptized">Baptized</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedMembershipLevel === 'baptized' && (
                  <>
                    <FormField
                      control={form.control}
                      name="baptizedSubLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Baptized Sub-Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub-level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="worker">Worker</SelectItem>
                              <SelectItem value="leader">Leader</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pastor">Pastor</SelectItem>
                                <SelectItem value="assistant_pastor">Assistant Pastor</SelectItem>
                                <SelectItem value="department_head">Department Head</SelectItem>
                                <SelectItem value="ministry_head">Ministry Head</SelectItem>
                              </SelectContent>
                            </Select>
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
                      name="assignedDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              
              <FormField
                control={form.control}
                name="prayerNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prayer Needs</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter prayer requests and needs..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
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
                        placeholder="Enter pastoral notes and observations..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {member ? 'Update Member' : 'Add Member'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
