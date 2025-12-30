// src/modules/bible-school/components/dialogs/RecordAttendanceDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
    id: string;
    member_id: string;
    member_name?: string;
}

interface Lesson {
    id: string;
    title: string;
    week_number: number;
}

interface RecordAttendanceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    cohortId?: string;
    students: Student[];
    lessons: Lesson[];
    onSuccess?: () => void;
}

interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent' | 'excused' | 'late';
    remarks: string;
}

export const RecordAttendanceDialog: React.FC<RecordAttendanceDialogProps> = ({
    isOpen,
    onClose,
    cohortId,
    students,
    lessons,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [lessonId, setLessonId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());

    // Initialize attendance records
    useEffect(() => {
        const records = new Map<string, AttendanceRecord>();
        students.forEach(student => {
            records.set(student.id, {
                studentId: student.id,
                status: 'present',
                remarks: '',
            });
        });
        setAttendanceRecords(records);
    }, [students]);

    const updateAttendance = (studentId: string, updates: Partial<AttendanceRecord>) => {
        setAttendanceRecords(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(studentId) || { studentId, status: 'present' as const, remarks: '' };
            newMap.set(studentId, { ...current, ...updates });
            return newMap;
        });
    };

    const markAllPresent = () => {
        setAttendanceRecords(prev => {
            const newMap = new Map(prev);
            newMap.forEach((record, key) => {
                newMap.set(key, { ...record, status: 'present' });
            });
            return newMap;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!lessonId || !cohortId) {
            toast({
                title: 'Validation Error',
                description: 'Please select a lesson',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Prepare bulk insert
            const attendanceData = Array.from(attendanceRecords.values()).map(record => ({
                lesson_id: lessonId,
                student_id: record.studentId,
                cohort_id: cohortId,
                attended_date: attendanceDate,
                status: record.status,
                remarks: record.remarks || null,
                recorded_by: user?.id,
            }));

            const { error } = await supabase
                .from('bible_attendance')
                .upsert(attendanceData, {
                    onConflict: 'lesson_id,student_id,cohort_id',
                });

            if (error) throw error;

            const presentCount = Array.from(attendanceRecords.values()).filter(r => r.status === 'present').length;

            toast({
                title: 'Attendance Recorded',
                description: `Marked ${presentCount}/${students.length} students as present`,
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to record attendance',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lesson">Lesson / Session *</Label>
                            <Select value={lessonId} onValueChange={setLessonId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select lesson" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lessons.map((lesson) => (
                                        <SelectItem key={lesson.id} value={lesson.id}>
                                            Week {lesson.week_number}: {lesson.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <h3 className="font-medium">Students ({students.length})</h3>
                        <Button type="button" variant="outline" size="sm" onClick={markAllPresent}>
                            Mark All Present
                        </Button>
                    </div>

                    <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                        {students.map((student) => {
                            const record = attendanceRecords.get(student.id);
                            return (
                                <div key={student.id} className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{student.member_name || 'Student'}</span>
                                        <div className="flex gap-2">
                                            {(['present', 'absent', 'excused', 'late'] as const).map((status) => (
                                                <label key={status} className="flex items-center gap-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`status-${student.id}`}
                                                        checked={record?.status === status}
                                                        onChange={() => updateAttendance(student.id, { status })}
                                                        className="cursor-pointer"
                                                    />
                                                    <span className="text-sm capitalize">{status}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Remarks (optional)"
                                        value={record?.remarks || ''}
                                        onChange={(e) => updateAttendance(student.id, { remarks: e.target.value })}
                                        className="text-sm"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Recording...' : 'Record Attendance'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
