// src/modules/bible-school/components/dialogs/GraduateDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
    id: string;
    member_id: string;
    member_name?: string;
    current_program_id: string;
    current_cohort_id: string;
}

interface Program {
    id: string;
    name: string;
}

interface GraduateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    student?: Student;
    program?: Program;
    onSuccess?: () => void;
}

export const GraduateDialog: React.FC<GraduateDialogProps> = ({
    isOpen,
    onClose,
    student,
    program,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        graduationDate: new Date().toISOString().split('T')[0],
        generateCertificate: true,
        certificateNumber: '',
    });

    // Auto-generate certificate number when dialog opens
    React.useEffect(() => {
        if (isOpen && !formData.certificateNumber) {
            const year = new Date().getFullYear();
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            setFormData(prev => ({
                ...prev,
                certificateNumber: `CERT-${year}-${random}`,
            }));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!student || !program) {
            toast({
                title: 'Error',
                description: 'Student or program information missing',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Create graduation record
            const { error: gradError } = await supabase.from('bible_graduations').insert({
                student_id: student.id,
                program_id: student.current_program_id,
                cohort_id: student.current_cohort_id,
                graduation_date: formData.graduationDate,
                certificate_number: formData.certificateNumber,
                issued_by: user?.id,
            });

            if (gradError) throw gradError;

            // Update enrollment status to completed
            const { error: enrollError } = await supabase
                .from('bible_enrollments')
                .update({
                    status: 'completed',
                    completed_at: formData.graduationDate,
                })
                .eq('student_id', student.id)
                .eq('cohort_id', student.current_cohort_id);

            if (enrollError) throw enrollError;

            // Update student status
            const { error: studentError } = await supabase
                .from('bible_students')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', student.id);

            if (studentError) throw studentError;

            // Update member record based on program
            const memberUpdates: any = {};

            switch (program.name.toLowerCase()) {
                case 'workers':
                    memberUpdates.membership_level = 'baptized';
                    memberUpdates.baptized_sub_level = 'worker';
                    break;
                case 'leadership':
                    memberUpdates.baptized_sub_level = 'leader';
                    break;
                case 'pastoral':
                    memberUpdates.baptized_sub_level = 'pastor';
                    memberUpdates.leader_role = 'pastor';
                    break;
            }

            if (Object.keys(memberUpdates).length > 0) {
                const { error: memberError } = await supabase
                    .from('members')
                    .update(memberUpdates)
                    .eq('id', student.member_id);

                if (memberError) console.error('Failed to update member:', memberError);
            }

            // Send congratulations notification
            try {
                await supabase.from('notification_logs').insert({
                    recipient_id: student.member_id,
                    type: 'graduation',
                    subject: 'Bible School Graduation',
                    message: `Congratulations on graduating from ${program.name} program! Certificate #${formData.certificateNumber}`,
                    status: 'pending',
                });
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }

            toast({
                title: 'Student Graduated',
                description: `Successfully graduated from ${program.name} program`,
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to graduate student',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Graduate Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {student && program && (
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                            <h3 className="font-semibold text-lg mb-1">{student.member_name || 'Student'}</h3>
                            <p className="text-sm text-muted-foreground">
                                Graduating from: <span className="font-medium text-foreground">{program.name}</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="graduationDate">Graduation Date *</Label>
                        <Input
                            id="graduationDate"
                            type="date"
                            value={formData.graduationDate}
                            onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="certificateNumber">Certificate Number *</Label>
                        <Input
                            id="certificateNumber"
                            value={formData.certificateNumber}
                            onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                            placeholder="CERT-2024-XXXXXX"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Auto-generated, but can be customized
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                        <Checkbox
                            id="generateCert"
                            checked={formData.generateCertificate}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, generateCertificate: checked as boolean })
                            }
                        />
                        <label
                            htmlFor="generateCert"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Generate and email certificate to student
                        </label>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                        <p className="font-medium mb-1">Graduation will:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Mark enrollment as completed</li>
                            <li>Update student status</li>
                            <li>Issue certificate with unique number</li>
                            {program?.name.toLowerCase().includes('worker') && (
                                <li>Update member level to Worker</li>
                            )}
                            {program?.name.toLowerCase().includes('leadership') && (
                                <li>Update member level to Leader</li>
                            )}
                            {program?.name.toLowerCase().includes('pastoral') && (
                                <li>Update member level to Pastor</li>
                            )}
                            <li>Send congratulations notification</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Graduate Student'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
