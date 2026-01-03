// src/components/admin/FirstTimerForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  User,
  Calendar,
  MapPin,
  Building2,
  Flag,
  UserPlus,
  Info,
  CheckCircle2,
} from 'lucide-react';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranchScope } from '@/hooks/useBranchScope';
import { cn } from '@/lib/utils';

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

export const FirstTimerForm: React.FC<FirstTimerFormProps> = ({
  firstTimer,
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const { effectiveBranchId, canSwitchBranch } = useBranchScope();
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [members, setMembers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    (async () => {
      // Fetch branches based on scope
      const branchQuery = supabase.from('church_branches').select('id, name').order('name');

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
      title: firstTimer ? 'Prospect Data Synchronized' : 'Encounter Recorded',
      description: `${data.fullName} is now part of the follow - up orchestration.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-8">
        <div className="h-[65vh] overflow-y-auto pr-3 space-y-10 custom-scrollbar">
          {/* Identity Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                Core Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Full Legal Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Digital Contact (Email)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@domain.com"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Signal Line (Phone)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+123 456 7890"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          {/* Residence Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 pt-6 border-t border-primary/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-vibrant-gradient/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                Residence Mapping
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="community"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Territory (Community) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter community"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Regional Zone (Area) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter district/area"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Street Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House #, Street name"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publicLandmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Navigation Landmark
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Near prominent structure"
                        {...field}
                        className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          {/* Chronology Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 pt-6 border-t border-primary/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                Encounter Chronology
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Operational Base (Branch) *
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!canSwitchBranch && !!effectiveBranchId}
                      >
                        <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id} className="font-medium">
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Service Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstVisit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        First Arrival *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="invitedBy"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Invitation Source (Invited By)
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) => field.onChange(val === '_none' ? '' : val)}
                        value={field.value || ''}
                      >
                        <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                          <SelectValue placeholder="Select orchestrating member" />
                        </SelectTrigger>
                        <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                          <SelectItem value="_none" className="font-bold text-muted-foreground">
                            None (Universal Inflow)
                          </SelectItem>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={m.full_name} className="font-medium">
                              {m.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          {/* Orchestration Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 pt-6 border-t border-primary/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-vibrant-gradient/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                Follow-up Orchestration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Lifecycle Status *
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                          <SelectItem value="new" className="font-medium">
                            Initial Encounter
                          </SelectItem>
                          <SelectItem value="contacted" className="font-medium">
                            Signal Established
                          </SelectItem>
                          <SelectItem value="followed_up" className="font-medium">
                            Deep Engagement
                          </SelectItem>
                          <SelectItem
                            value="converted"
                            className="font-medium text-primary font-bold"
                          >
                            Identity Assimilated
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Engagement Protocol *
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                        <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                          <SelectItem value="pending" className="font-medium">
                            Awaiting Logic
                          </SelectItem>
                          <SelectItem value="called" className="font-medium">
                            Voice Signal
                          </SelectItem>
                          <SelectItem value="visited" className="font-medium">
                            Physical Encounter
                          </SelectItem>
                          <SelectItem value="completed" className="font-medium">
                            Cycle Finalized
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUpNotes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Engagement Intel (Follow-up Notes)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Log detailed encounter dynamics..."
                        {...field}
                        className="glass min-h-[120px] rounded-2xl border-primary/5 focus:ring-primary/20 font-medium resize-none p-4"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Universal Observations
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional tactical intelligence..."
                        {...field}
                        className="glass min-h-[120px] rounded-2xl border-primary/5 focus:ring-primary/20 font-medium resize-none p-4"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        </div>

        <div className="flex justify-between items-center gap-4 pt-8 border-t border-primary/5 mt-auto">
          <Button
            variant="ghost"
            type="button"
            onClick={onCancel}
            className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-rose-500/5 hover:text-rose-500 h-14 px-10 rounded-2xl transition-all"
          >
            Abort Encounter
          </Button>
          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-vibrant-gradient text-white border-none font-bold text-[10px] uppercase tracking-widest h-14 px-12 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {firstTimer ? 'Synchronize Data' : 'Execute Recording'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
