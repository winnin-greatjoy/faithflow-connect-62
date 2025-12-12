// src/components/admin/FirstTimerForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranchScope } from '@/hooks/useBranchScope';

// Schema matching first_timers table
const firstTimerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone must be at least 7 characters').optional().or(z.literal('')),
  community: z.string().min(1, 'Community is required'),
  area: z.string().min(1, 'Area is required'),
  street: z.string().min(1, 'Street is required'),
  publicLandmark: z.string().optional(),
  serviceDate: z.string().min(1, 'Service date is required'),
  firstVisit: z.string().min(1, 'First visit date is required'),
  invitedBy: z.string().optional(),
  branchId: z.string().min(1, 'Branch is required'),
  status: z.enum(['new', 'contacted', 'followed_up', 'converted']),
  followUpStatus: z.enum(['pending', 'called', 'visited', 'completed']),
  followUpNotes: z.string().optional(),
  notes: z.string().optional(),
});

export type FirstTimerFormData = z.infer<typeof firstTimerSchema>;

interface FirstTimerFormProps {
  firstTimer?: {
    id?: string | number;
    fullName?: string;
    email?: string;
    phone?: string;
    community?: string;
    area?: string;
    street?: string;
    publicLandmark?: string;
    serviceDate?: string;
    firstVisit?: string;
    invitedBy?: string;
    branchId?: string | number;
    status?: 'new' | 'contacted' | 'followed_up' | 'converted';
    followUpStatus?: 'pending' | 'called' | 'visited' | 'completed';
    followUpNotes?: string;
    notes?: string;
  };
  onSubmit: (data: FirstTimerFormData) => void;
  onCancel: () => void;
}

export const FirstTimerForm: React.FC<FirstTimerFormProps> = ({ firstTimer, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const { effectiveBranchId, canSwitchBranch } = useBranchScope();
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [members, setMembers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    (async () => {
      // Fetch branches based on scope
      let branchQuery = supabase.from('church_branches').select('id, name').order('name');
      
      // Fetch members for "invited by" - scoped to branch
      let membersQuery = supabase.from('members').select('id, full_name').order('full_name');
      if (effectiveBranchId) {
        membersQuery = membersQuery.eq('branch_id', effectiveBranchId);
      }

      const [{ data: br }, { data: mr }] = await Promise.all([branchQuery, membersQuery]);
      setBranches((br as any) || []);
      setMembers((mr as any) || []);
    })();
  }, [effectiveBranchId]);

  const form = useForm<FirstTimerFormData>({
    resolver: zodResolver(firstTimerSchema),
    defaultValues: {
      fullName: firstTimer?.fullName ?? '',
      email: firstTimer?.email ?? '',
      phone: firstTimer?.phone ?? '',
      community: firstTimer?.community ?? '',
      area: firstTimer?.area ?? '',
      street: firstTimer?.street ?? '',
      publicLandmark: firstTimer?.publicLandmark ?? '',
      serviceDate: firstTimer?.serviceDate ?? new Date().toISOString().split('T')[0],
      firstVisit: firstTimer?.firstVisit ?? new Date().toISOString().split('T')[0],
      invitedBy: firstTimer?.invitedBy ?? '',
      branchId: String(firstTimer?.branchId ?? effectiveBranchId ?? ''),
      status: firstTimer?.status ?? 'new',
      followUpStatus: firstTimer?.followUpStatus ?? 'pending',
      followUpNotes: firstTimer?.followUpNotes ?? '',
      notes: firstTimer?.notes ?? '',
    },
  });

  // Auto-set branch for branch admins
  useEffect(() => {
    if (!canSwitchBranch && effectiveBranchId && !form.getValues('branchId')) {
      form.setValue('branchId', effectiveBranchId);
    }
  }, [effectiveBranchId, canSwitchBranch, form]);

  const submit = (data: FirstTimerFormData) => {
    onSubmit(data);
    toast({ 
      title: firstTimer ? 'First timer updated' : 'First timer recorded', 
      description: `${data.fullName} saved.` 
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{firstTimer ? 'Edit First Timer' : 'Record First Timer'}</CardTitle>
        <CardDescription>
          {firstTimer ? 'Update visitor information' : 'Record a first-time visitor'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="community" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community *</FormLabel>
                    <FormControl><Input placeholder="Downtown" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area *</FormLabel>
                    <FormControl><Input placeholder="District 5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="street" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street *</FormLabel>
                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="publicLandmark" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Landmark</FormLabel>
                    <FormControl><Input placeholder="Near City Hall" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Visit Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Visit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="branchId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!canSwitchBranch && !!effectiveBranchId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
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

                <FormField control={form.control} name="serviceDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="firstVisit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Visit Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="invitedBy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invited By</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.full_name}>{m.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Status & Follow-up */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Status & Follow-up
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="followed_up">Followed Up</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="followUpStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Status *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select follow-up status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="called">Called</SelectItem>
                          <SelectItem value="visited">Visited</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="followUpNotes" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Follow-up Notes</FormLabel>
                    <FormControl><Textarea placeholder="Notes from follow-up calls/visits..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>General Notes</FormLabel>
                    <FormControl><Textarea placeholder="Additional notes..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
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
