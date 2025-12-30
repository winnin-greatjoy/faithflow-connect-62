// src/modules/bible-school/components/dialogs/GradeExamDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Exam {
    id: string;
    title: string;
    total_marks: number;
    pass_mark: number;
    exam_type: string;
    is_final: boolean;
}

interface Student {
    id: string;
    member_name?: string;
}

interface GradeExamDialogProps {
    isOpen: boolean;
    onClose: () => void;
    exam?: Exam;
    exams: Exam[];
    students: Student[];
    cohortId?: string;
    studentId?: string;
    onSuccess?: () => void;
}

export const GradeExamDialog: React.FC<GradeExamDialogProps> = ({
    isOpen,
    onClose,
    exam: preselectedExam,
    exams,
    students,
    cohortId,
    studentId: preselectedStudentId,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        examId: preselectedExam?.id || '',
        studentId: preselectedStudentId || '',
        score: '',
        remarks: '',
    });

    const selectedExam = exams.find(e => e.id === formData.examId) || preselectedExam;
    const score = parseFloat(formData.score) || 0;
    const isPassing = selectedExam ? score >= selectedExam.pass_mark : false;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.examId || !formData.studentId || !formData.score || !cohortId) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedExam) {
            toast({
                title: 'Error',
                description: 'Selected exam not found',
                variant: 'destructive',
            });
            return;
        }

        if (score < 0 || score > selectedExam.total_marks) {
            toast({
                title: 'Validation Error',
                description: `Score must be between 0 and ${selectedExam.total_marks}`,
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Calculate pass/fail status
            const passStatus = score >= selectedExam.pass_mark ? 'pass' : 'fail';

            const { error } = await supabase.from('bible_exam_results').upsert({
                exam_id: formData.examId,
                student_id: formData.studentId,
                cohort_id: cohortId,
                score: parseFloat(formData.score),
                status: passStatus,
                remarks: formData.remarks || null,
                graded_by: user?.id,
                graded_at: new Date().toISOString(),
            }, {
                onConflict: 'exam_id,student_id,cohort_id',
            });

            if (error) throw error;

            // Send notification to student
            try {
                const student = students.find(s => s.id === formData.studentId);
                await supabase.from('notification_logs').insert({
                    recipient_id: formData.studentId,
                    type: 'exam_result',
                    subject: 'Exam Result Available',
                    message: `Your exam "${selectedExam.title}" has been graded. Score: ${formData.score}/${selectedExam.total_marks} (${isPassing ? 'Pass' : 'Fail'})`,
                    status: 'pending',
                });
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }

            toast({
                title: 'Exam Graded',
                description: `Score: ${formData.score}/${selectedExam.total_marks} - ${isPassing ? 'Pass' : 'Fail'}`,
            });

            // Reset form
            setFormData({
                examId: preselectedExam?.id || '',
                studentId: preselectedStudentId || '',
                score: '',
                remarks: '',
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to grade exam',
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
                    <DialogTitle>Grade Exam</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="exam">Exam *</Label>
                        <Select
                            value={formData.examId}
                            onValueChange={(v) => setFormData({ ...formData, examId: v })}
                            disabled={!!preselectedExam}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select exam" />
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.id}>
                                        {exam.title} ({exam.total_marks} marks)
                                        {exam.is_final && ' - FINAL'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="student">Student *</Label>
                        <Select
                            value={formData.studentId}
                            onValueChange={(v) => setFormData({ ...formData, studentId: v })}
                            disabled={!!preselectedStudentId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.member_name || 'Student'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedExam && (
                        <div className="p-3 bg-muted rounded-md space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Total Marks:</span>
                                <span className="font-medium">{selectedExam.total_marks}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Pass Mark:</span>
                                <span className="font-medium">{selectedExam.pass_mark}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Exam Type:</span>
                                <span className="font-medium capitalize">{selectedExam.exam_type}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="score">Score * {selectedExam && `(Max: ${selectedExam.total_marks})`}</Label>
                        <Input
                            id="score"
                            type="number"
                            step="0.01"
                            min="0"
                            max={selectedExam?.total_marks}
                            value={formData.score}
                            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                            required
                        />
                        {formData.score && selectedExam && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Result:</span>
                                <Badge variant={isPassing ? 'default' : 'destructive'}>
                                    {isPassing ? 'PASS' : 'FAIL'}
                                </Badge>
                                <span className="text-sm">
                                    ({((score / selectedExam.total_marks) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks / Feedback</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Optional feedback for the student"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Grading...' : 'Submit Grade'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
