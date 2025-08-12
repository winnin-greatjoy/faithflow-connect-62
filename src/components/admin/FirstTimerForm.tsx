
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FirstTimer } from '@/types/membership';
import { mockBranches, mockMembers } from '@/data/mockMembershipData';
import { useToast } from '@/hooks/use-toast';

const firstTimerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  community: z.string().min(1, 'Community is required'),
  area: z.string().min(1, 'Area is required'),
  street: z.string().min(1, 'Street is required'),
  publicLandmark: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  serviceDate: z.string().min(1, 'Service date is required'),
  invitedBy: z.string().optional(),
  branchId: z.coerce.number().min(1, 'Branch is required'),
  notes: z.string().optional()
});

type FirstTimerFormData = z.infer<typeof firstTimerSchema>;

interface FirstTimerFormProps {
  firstTimer?: FirstTimer;
  onSubmit: (data: FirstTimerFormData) => void;
  onCancel: () => void;
}

export const FirstTimerForm = ({ firstTimer, onSubmit, onCancel }: FirstTimerFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<FirstTimerFormData>({
    resolver: zodResolver(firstTimerSchema),
    defaultValues: firstTimer ? {
      fullName: firstTimer.fullName,
      community: firstTimer.community,
      area: firstTimer.area,
      street: firstTimer.street,
      publicLandmark: firstTimer.publicLandmark || '',
      phone: firstTimer.phone,
      serviceDate: firstTimer.serviceDate,
      invitedBy: firstTimer.invitedBy || '',
      branchId: firstTimer.branchId,
      notes: firstTimer.notes || ''
    } : {
      serviceDate: new Date().toISOString().split('T')[0],
      branchId: 1
    }
  });

  const handleSubmit = (data: FirstTimerFormData) => {
    console.log('Submitting first timer data:', data);
    onSubmit(data);
    toast({
      title: firstTimer ? "First Timer Updated" : "First Timer Recorded",
      description: `${data.fullName} has been ${firstTimer ? 'updated' : 'recorded'} successfully.`,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{firstTimer ? 'Edit First Timer' : 'Record First Timer'}</CardTitle>
        <CardDescription>
          {firstTimer ? 'Update first timer information' : 'Record information for a first-time visitor'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
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
                    <FormLabel>Street Address</FormLabel>
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

              <FormField
                control={form.control}
                name="serviceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="invitedBy"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Invited By (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member who invited them" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockMembers.map((member) => (
                          <SelectItem key={member.id} value={member.fullName}>
                            {member.fullName}
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the first timer..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {firstTimer ? 'Update Record' : 'Record First Timer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
