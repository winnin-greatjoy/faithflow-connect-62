import React, { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Phone, Mail, MapPin, Building2, User } from 'lucide-react';
import { resolveProfilePhotoUrl } from '@/utils/memberOperations';
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
  profilePhoto: z.string().optional().or(z.literal('')),
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
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

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

    (async () => {
      const url = await resolveProfilePhotoUrl(watchedPhoto);
      setPreviewUrl(url);
    })();
  }, [watchedPhoto]);

  const handleSubmit = (data: ConvertFormData) => {
    onSubmit(data);
    toast({
      title: convert && convert.id ? 'Identity Synchronized' : 'Identity Initialized',
      description: `${data.fullName} registered successfully in the digital ledger.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-10"
        >
          {/* Section 1: Core Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-1.5 rounded-full bg-vibrant-gradient" />
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/80">
                Core Identity
              </h3>
            </div>

            <div className="glass border-primary/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <FormField
                  control={form.control}
                  name="profilePhoto"
                  render={({ field }) => (
                    <FormItem className="shrink-0">
                      <div className="relative group/photo p-1">
                        <div className="h-32 w-32 rounded-[2rem] ring-4 ring-primary/5 group-hover/photo:ring-primary/20 transition-all duration-500 overflow-hidden shadow-xl glass bg-white/50">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Convert"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-vibrant-gradient opacity-10 flex items-center justify-center">
                              <User className="h-12 w-12 text-primary/40" />
                            </div>
                          )}
                        </div>

                        <label
                          htmlFor={uploadInputId}
                          className="absolute -bottom-2 -right-2 h-11 w-11 rounded-2xl bg-vibrant-gradient text-white shadow-lg flex items-center justify-center border-4 border-white dark:border-zinc-950 z-10 transition-all hover:scale-110 active:scale-90 cursor-pointer shadow-primary/20 hover:shadow-primary/40"
                        >
                          <Camera className={cn('h-5 w-5', isUploading && 'animate-pulse')} />
                        </label>

                        <input
                          id={uploadInputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploading(true);
                            try {
                              const path = await uploadProfilePhoto(file);
                              field.onChange(path);
                              toast({
                                title: 'Visual Data Secure',
                                description: 'Identity biometric record updated.',
                              });
                            } catch (error: any) {
                              toast({
                                title: 'Link Failed',
                                description: error.message,
                                variant: 'destructive',
                              });
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                        />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex-1 w-full space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Legal Designation / Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter full identity designation"
                              {...field}
                              className="glass h-14 rounded-2xl border-primary/5 focus:ring-primary/20 font-serif text-2xl font-bold bg-white/40 pl-5 transition-all focus:bg-white/60"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                              <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500 mt-2" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            <Phone className="h-3 w-3" /> Signal Line (Primary)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+000 000 0000"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-bold text-sm bg-white/30"
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
                          <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            <Mail className="h-3 w-3" /> Digital Node (Mail)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="identity@node.com"
                              {...field}
                              className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-bold text-sm bg-white/30"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Regional Deployment */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-1.5 rounded-full bg-primary/20" />
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/80">
                Territory Deployment
              </h3>
            </div>

            <div className="glass border-primary/5 p-8 rounded-[2.5rem] shadow-xl space-y-8 bg-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="community"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        <MapPin className="h-3 w-3" /> Primary Sector (Community)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Assigned community area"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-bold text-sm bg-white/30"
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
                        <Building2 className="h-3 w-3" /> Operational Zone (Area)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Assigned regional zone"
                          {...field}
                          className="glass h-12 rounded-xl border-primary/5 focus:ring-primary/20 font-bold text-sm bg-white/30"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold tracking-widest text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Administrative Base (Branch Assignment)
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass h-14 rounded-2xl border-primary/5 focus:ring-primary/20 font-black text-xs uppercase tracking-widest bg-white/40">
                          <SelectValue placeholder="Select Operational Center" />
                        </SelectTrigger>
                        <SelectContent className="glass border-primary/10 rounded-2xl shadow-3xl">
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id}
                              className="font-bold text-[10px] uppercase tracking-widest py-3 hover:bg-primary/5"
                            >
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
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-primary/5">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="w-full sm:w-auto text-[10px] font-black uppercase tracking-[0.25em] opacity-40 hover:opacity-100 hover:bg-rose-500/5 hover:text-rose-500 h-14 px-10 rounded-2xl transition-all"
            >
              Terminate Session
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-vibrant-gradient text-white border-none font-black text-[10px] uppercase tracking-[0.25em] h-14 px-12 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
              >
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                {convert && convert.id ? 'Authorize Update' : 'Initialize Record'}
              </Button>
            </div>
          </div>
        </motion.div>
      </form>
    </Form>
  );
};
