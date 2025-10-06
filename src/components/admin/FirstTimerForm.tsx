// src/components/admin/FirstTimerForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
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

export const FirstTimerForm: React.FC<FirstTimerFormProps> = ({ firstTimer, onSubmit, onCancel }) => {
  const { toast } = useToast();

  const form = useForm<FirstTimerFormData>({
    resolver: zodResolver(firstTimerSchema),
    defaultValues: firstTimer ? {
      fullName: firstTimer.fullName,
      community: firstTimer.community,
      area: firstTimer.area,
      street: firstTimer.street,
      publicLandmark: firstTimer.publicLandmark ?? '',
      phone: firstTimer.phone ?? '',
      serviceDate: firstTimer.serviceDate ?? new Date().toISOString().split('T')[0],
      invitedBy: firstTimer.invitedBy ?? '',
      branchId: firstTimer.branchId ?? 1,
      notes: firstTimer.notes ?? ''
    } : {
      fullName: '',
      community: '',
      area: '',
      street: '',
      publicLandmark: '',
      phone: '',
      serviceDate: new Date().toISOString().split('T')[0],
      invitedBy: '',
      branchId: 1,
      notes: ''
    }
  });

  const submit = (data: FirstTimerFormData) => {
    onSubmit(data);
    toast({ title: firstTimer ? 'First timer updated' : 'First timer recorded', description: `${data.fullName} saved.` });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{firstTimer ? 'Edit First Timer' : 'Record First Timer'}</CardTitle>
        <CardDescription>{firstTimer ? 'Update visitor info' : 'Record a first-time visitor'}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="community" render={({ field }) => (
                <FormItem>
                  <FormLabel>Community</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="street" render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="publicLandmark" render={({ field }) => (
                <FormItem>
                  <FormLabel>Public landmark (optional)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="serviceDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Service date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                      <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>{mockBranches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="invitedBy" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Invited by (optional)</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>{mockMembers.map(m => <SelectItem key={m.id} value={m.fullName}>{m.fullName}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
              <Button type="submit">{firstTimer ? 'Update' : 'Record'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
