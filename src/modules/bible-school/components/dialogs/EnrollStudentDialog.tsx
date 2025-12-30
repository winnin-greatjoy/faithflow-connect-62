// src/modules/bible-school/components/dialogs/EnrollStudentDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Application {
    id: string;
    member_id: string;
    program_id: string;
    member_name?: string;
}

interface Cohort {
    id: string;
    cohort_name: string;
    program_id: string;
    start_date: string;
}

interface EnrollStudentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    application?: Application;
    cohorts: Cohort[];
    onSuccess?: () => void;
}

export const EnrollStudentDialog: React.FC<EnrollStudentDialogProps> = ({
    isOpen,
    onClose,
    application,
    cohorts,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cohortId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
    });

    // Filter cohorts by program
    const availableCohorts = application
        ? cohorts.filter(c => c.program_id === application.program_id && new Date(c.start_date) > new Date())
        : cohorts;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cohortId || !application) {
            toast({
                title: 'Validation Error',
                description: 'Please select a cohort',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            // Check if student record exists
            let { data: student } = await supabase
                .from('bible_students')
                .select('id')
                .eq('member_id', application.member_id)
                .maybeSingle();

            // Create student record if doesn't exist
            if (!student) {
                const { data: newStudent, error: studentError } = await supabase
                    .from('bible_students')
                    .insert({
                        member_id: application.member_id,
                        current_program_id: application.program_id,
                        current_cohort_id: formData.cohortId,
                        status: 'enrolled',
                    })
                    .select()
                    .single();

                if (studentError) throw studentError;
                student = newStudent;
            } else {
                // Update existing student
                const { error: updateError } = await supabase
                    .from('bible_students')
                    .update({
                        current_program_id: application.program_id,
                        current_cohort_id: formData.cohortId,
                        status: 'enrolled',
                    })
                    .eq('id', student.id);

                if (updateError) throw updateError;
            }

            // Create enrollment record
            const { error: enrollError } = await supabase
                .from('bible_enrollments')
                .insert({
                    student_id: student.id,
                    cohort_id: formData.cohortId,
                    status: 'active',
                });

            if (enrollError) throw enrollError;

            // Update application status
            const { error: appError } = await supabase
                .from('bible_applications')
                .update({
                    status: 'approved',
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', application.id);

            if (appError) throw appError;

            // Send notification to student
            try {
                await supabase.from('notification_logs').insert({
                    recipient_id: application.member_id,
                    type: 'enrollment',
                    subject: 'Bible School Enrollment Approved',
                    message: `Your application has been approved! You have been enrolled in the program.`,
                    status: 'pending',
                });
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }

            toast({
                title: 'Student Enrolled',
                description: 'Student has been successfully enrolled in the cohort',
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to enroll student',
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
                    <DialogTitle>Enroll Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {application && (
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">Student: {application.member_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Application ID: {application.id}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="cohort">Select Cohort *</Label>
                        <Select value={formData.cohortId} onValueChange={(v) => setFormData({ ...formData, cohortId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a cohort" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCohorts.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">No available cohorts</div>
                                ) : (
                                    availableCohorts.map((cohort) => (
                                        <SelectItem key={cohort.id} value={cohort.id}>
                                            {cohort.cohort_name} (Starts: {new Date(cohort.start_date).toLocaleDateString()})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                        <Input
                            id="enrollmentDate"
                            type="date"
                            value={formData.enrollmentDate}
                            onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || availableCohorts.length === 0}>
                            {loading ? 'Enrolling...' : 'Enroll Student'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
