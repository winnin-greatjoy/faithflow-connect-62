// src/modules/bible-school/components/dialogs/PromoteDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Program {
    id: string;
    name: string;
    level_order: number;
}

interface Student {
    id: string;
    member_id: string;
    member_name?: string;
    current_program_id: string;
}

interface EligibilityCheck {
    attendancePercentage: number;
    passedExams: boolean;
    canPromote: boolean;
    issues: string[];
}

interface PromoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    student?: Student;
    programs: Program[];
    onSuccess?: () => void;
}

export const PromoteDialog: React.FC<PromoteDialogProps> = ({
    isOpen,
    onClose,
    student,
    programs,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
    const [formData, setFormData] = useState({
        toProgramId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        remarks: '',
    });

    const currentProgram = programs.find(p => p.id === student?.current_program_id);
    const nextProgram = programs.find(p => p.level_order === (currentProgram?.level_order || 0) + 1);
    const selectedToProgram = programs.find(p => p.id === formData.toProgramId);

    // Check eligibility when dialog opens
    useEffect(() => {
        if (isOpen && student) {
            checkEligibility();
        }
    }, [isOpen, student]);

    const checkEligibility = async () => {
        if (!student) return;

        setChecking(true);
        try {
            // Check attendance
            const { data: attendanceData } = await supabase
                .rpc('get_student_attendance_percentage', { student_id: student.id })
                .single();

            const attendancePercentage = attendanceData?.percentage || 0;

            // Check exam results
            const { data: examResults } = await supabase
                .from('bible_exam_results')
                .select('status, exam:bible_exams(is_final)')
                .eq('student_id', student.id);

            const finalExams = examResults?.filter(r => r.exam?.is_final) || [];
            const passedExams = finalExams.length > 0 && finalExams.every(r => r.status === 'pass');

            const issues: string[] = [];
            if (attendancePercentage < 75) {
                issues.push(`Attendance below 75% (${attendancePercentage.toFixed(1)}%)`);
            }
            if (!passedExams) {
                issues.push('Has not passed all final exams');
            }

            setEligibility({
                attendancePercentage,
                passedExams,
                canPromote: issues.length === 0,
                issues,
            });
        } catch (error) {
            console.error('Error checking eligibility:', error);
            setEligibility({
                attendancePercentage: 0,
                passedExams: false,
                canPromote: false,
                issues: ['Failed to verify eligibility'],
            });
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!student || !formData.toProgramId) {
            toast({
                title: 'Validation Error',
                description: 'Please select a program',
                variant: 'destructive',
            });
            return;
        }

        if (eligibility && !eligibility.canPromote) {
            toast({
                title: 'Promotion Not Allowed',
                description: 'Student does not meet promotion requirements',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Create promotion record
            const { error: promoteError } = await supabase.from('bible_promotions').insert({
                student_id: student.id,
                from_program_id: student.current_program_id,
                to_program_id: formData.toProgramId,
                approved_by: user?.id,
                effective_date: formData.effectiveDate,
                remarks: formData.remarks || null,
            });

            if (promoteError) throw promoteError;

            // Update student's current program
            const { error: updateError } = await supabase
                .from('bible_students')
                .update({
                    current_program_id: formData.toProgramId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', student.id);

            if (updateError) throw updateError;

            // Send notification
            try {
                await supabase.from('notification_logs').insert({
                    recipient_id: student.member_id,
                    type: 'promotion',
                    subject: 'Bible School Promotion',
                    message: `Congratulations! You have been promoted to ${selectedToProgram?.name} program.`,
                    status: 'pending',
                });
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }

            toast({
                title: 'Student Promoted',
                description: `Successfully promoted to ${selectedToProgram?.name}`,
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to promote student',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Promote Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {student && (
                        <div className="p-3 bg-muted rounded-md">
                            <p className="font-medium">{student.member_name || 'Student'}</p>
                            <p className="text-sm text-muted-foreground">
                                Current Program: {currentProgram?.name || 'Unknown'}
                            </p>
                        </div>
                    )}

                    {/* Eligibility Check */}
                    {checking ? (
                        <div className="p-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">Checking eligibility...</p>
                        </div>
                    ) : eligibility && (
                        <Alert variant={eligibility.canPromote ? 'default' : 'destructive'}>
                            <div className="flex items-start gap-2">
                                {eligibility.canPromote ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5" />
                                )}
                                <div className="flex-1 space-y-2">
                                    <AlertDescription>
                                        <div className="font-medium mb-2">
                                            {eligibility.canPromote ? 'Eligible for Promotion' : 'Not Eligible for Promotion'}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={eligibility.attendancePercentage >= 75 ? 'default' : 'destructive'}>
                                                    Attendance: {eligibility.attendancePercentage.toFixed(1)}%
                                                </Badge>
                                                {eligibility.attendancePercentage >= 75 ? '✓' : '✗'} Required: 75%
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={eligibility.passedExams ? 'default' : 'destructive'}>
                                                    Final Exams
                                                </Badge>
                                                {eligibility.passedExams ? '✓ All Passed' : '✗ Not all passed'}
                                            </div>
                                        </div>
                                        {eligibility.issues.length > 0 && (
                                            <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                                                <strong>Issues:</strong>
                                                <ul className="list-disc list-inside">
                                                    {eligibility.issues.map((issue, i) => (
                                                        <li key={i}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label>Promote To *</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {nextProgram && (
                                <Button
                                    type="button"
                                    variant={formData.toProgramId === nextProgram.id ? 'default' : 'outline'}
                                    onClick={() => setFormData({ ...formData, toProgramId: nextProgram.id })}
                                    className="justify-start"
                                >
                                    {nextProgram.name} (Next Level)
                                </Button>
                            )}
                            {programs
                                .filter(p => p.level_order > (currentProgram?.level_order || 0) && p.id !== nextProgram?.id)
                                .map(program => (
                                    <Button
                                        key={program.id}
                                        type="button"
                                        variant={formData.toProgramId === program.id ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, toProgramId: program.id })}
                                        className="justify-start"
                                    >
                                        {program.name}
                                    </Button>
                                ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="effectiveDate">Effective Date *</Label>
                        <Input
                            id="effectiveDate"
                            type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Optional notes about the promotion"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !eligibility?.canPromote}
                        >
                            {loading ? 'Promoting...' : 'Promote Student'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
