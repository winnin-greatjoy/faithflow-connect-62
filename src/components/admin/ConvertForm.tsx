import React, { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Phone, Mail, MapPin, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const convertSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number (use format: +1234567890)'),
  community: z.string().min(1, 'Community is required'),
  area: z.string().min(1, 'Area is required'),
  branchId: z.string().min(1, 'Branch is required'),
  profilePhoto: z.string().url().optional().or(z.literal('')),
});

export type ConvertFormData = z.infer<typeof convertSchema>;

interface ConvertFormProps {
  convert?: Partial<ConvertFormData & { id?: string }>;
  branches: { id: string; name: string }[];
  onSubmit: (data: ConvertFormData) => void;
  onCancel: () => void;
}

export const ConvertForm: React.FC<ConvertFormProps> = ({
  convert,
  branches,
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const uploadInputId = useId();

  const form = useForm<ConvertFormData>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      fullName: convert?.fullName || '',
      email: convert?.email || '',
      phone: convert?.phone || '',
      community: convert?.community || '',
      area: convert?.area || '',
      branchId: convert?.branchId || '',
      profilePhoto: convert?.profilePhoto || '',
    },
  });

  useEffect(() => {
    if (!form.getValues('branchId') && branches.length > 0) {
      form.setValue('branchId', branches[0].id);
    }
  }, [branches, form]);

  const uploadProfilePhoto = async (file: File): Promise<string> => {
    const fileName = `convert-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage
      .from('convert-profiles')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from('convert-profiles').getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = (data: ConvertFormData) => {
    onSubmit(data);
    toast({
      title: convert && convert.id ? 'Identity Synchronized' : 'Identity Initialized',
      description: `${data.fullName} registered successfully in the digital ledger.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header/Photo Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-primary/[0.02] border border-primary/5 p-6 rounded-[24px]">
            <FormField
              control={form.control}
              name="profilePhoto"
              render={({ field }) => (
                <FormItem className="shrink-0">
                  <div className="relative group">
                    <div className="h-28 w-28 rounded-3xl overflow-hidden glass border-primary/10 shadow-xl group-hover:scale-105 transition-all duration-500">
                      {field.value ? (
                        <img
                          src={field.value}
                          alt="Convert Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-vibrant-gradient opacity-20 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById(uploadInputId)?.click()}
                      className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-vibrant-gradient text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-10"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      id={uploadInputId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadProfilePhoto(file);
                          field.onChange(url);
                          toast({
                            title: 'Photo Encrypted',
                            description: 'Identity visual data secured.',
                          });
                        } catch (error: any) {
                          toast({
                            title: 'Transfer Failed',
                            description: error.message,
                            variant: 'destructive',
                          });
                        }
                      }}
                    />
                  </div>
                </FormItem>
              )}
            />
            <div className="flex-1 space-y-4 text-center md:text-left">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Full Identity Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter core identity name"
                        {...field}
                        className="glass h-14 rounded-2xl border-primary/5 focus:ring-primary/20 font-serif text-xl font-bold bg-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    <Mail className="h-3 w-3" /> Communication Node (Email)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="node@protocol.com"
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
                  <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    <Phone className="h-3 w-3" /> Signal Line (Phone) *
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

          {/* Geolocation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="community"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    <MapPin className="h-3 w-3" /> Territory (Community) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter sector"
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
                  <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    <Building2 className="h-3 w-3" /> Zone (Area/District) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter regional zone"
                      {...field}
                      className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                </FormItem>
              )}
            />
          </div>

          {/* Deployment Select */}
          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Operational Base (Branch) *
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-medium">
                      <SelectValue placeholder="Assign to operational unit" />
                    </SelectTrigger>
                    <SelectContent className="glass border-primary/10 rounded-xl shadow-2xl">
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id} className="font-medium">
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
              </FormItem>
            )}
          />

          {/* Footer Actions */}
          <div className="flex justify-between items-center gap-4 pt-8 border-t border-primary/5">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-rose-500/5 hover:text-rose-500 h-12 px-8 rounded-xl transition-all"
            >
              Abort Signal
            </Button>
            <Button
              type="submit"
              className="bg-vibrant-gradient text-white border-none font-bold text-[10px] uppercase tracking-widest h-12 px-10 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {convert && convert.id ? 'Synchronize Identity' : 'Execute Registration'}
            </Button>
          </div>
        </motion.div>
      </form>
    </Form>
  );
};
