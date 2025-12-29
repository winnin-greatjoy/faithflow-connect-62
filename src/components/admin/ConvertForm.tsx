// src/components/admin/ConvertForm.tsx
import React, { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    const uploadInputId = useId(); // Fix ID collision

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

    // Set branch default when branches load
    useEffect(() => {
        if (!form.getValues('branchId') && branches.length > 0) {
            form.setValue('branchId', branches[0].id);
        }
    }, [branches, form]);

    // Upload profile photo to Supabase Storage
    const uploadProfilePhoto = async (file: File): Promise<string> => {
        const fileName = `convert-${Date.now()}.${file.name.split('.').pop()}`;

        const { data, error } = await supabase.storage
            .from('convert-profiles')
            .upload(fileName, file, { upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('convert-profiles')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    const handleSubmit = (data: ConvertFormData) => {
        console.log('[ConvertForm] Submitting:', data);
        onSubmit(data);
        toast({
            title: convert && convert.id ? 'Convert updated' : 'Convert added',
            description: `${data.fullName} saved successfully.`,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Profile Photo at Top Left */}
                <FormField
                    control={form.control}
                    name="profilePhoto"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-start gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                                        {field.value ? (
                                            <img
                                                src={field.value}
                                                alt={`${form.getValues('fullName') || 'Convert'} profile photo`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="h-10 w-10 text-gray-400" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById(uploadInputId)?.click()}
                                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition"
                                        aria-label="Upload profile photo"
                                    >
                                        <Camera className="h-4 w-4" />
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
                                                    title: 'Photo uploaded',
                                                    description: 'Profile photo uploaded successfully.',
                                                });
                                            } catch (error: any) {
                                                toast({
                                                    title: 'Upload failed',
                                                    description: error.message || 'Failed to upload photo',
                                                    variant: 'destructive',
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="email@example.com" {...field} />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="community"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Community *</FormLabel>
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
                                <FormLabel>Area *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter area/district" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Branch *</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {convert && convert.id ? 'Update Convert' : 'Add Convert'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
