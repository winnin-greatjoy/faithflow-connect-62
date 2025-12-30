// src/modules/bible-school/components/cohort-detail/AttendanceGrid.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertCircle, Save } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    week_number: number;
    lesson_order: number;
}

interface Student {
    id: string;
    name: string;
}

interface AttendanceRecord {
    lesson_id: string;
    student_id: string;
    status: 'present' | 'absent' | 'excused' | 'late';
}

interface AttendanceGridProps {
    cohortId: string;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({ cohortId }) => {
    const { toast } = useToast();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchData();
    }, [cohortId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get cohort to find program
            const { data: cohortData } = await supabase
                .from('bible_cohorts')
                .select('program_id')
                .eq('id', cohortId)
                .single();

            if (!cohortData) return;

            // Get lessons for the program
            const { data: lessonsData } = await supabase
                .from('bible_lessons')
                .select('id, title, week_number, lesson_order')
                .eq('program_id', cohortData.program_id)
                .order('week_number')
                .order('lesson_order');

            setLessons(lessonsData || []);

            // Get enrolled students
            const { data: enrollmentsData } = await supabase
                .from('bible_enrollments')
                .select(`
                    bible_students (
                        id,
                        members (full_name)
                    )
                `)
                .eq('cohort_id', cohortId)
                .eq('status', 'active');

            const studentList = enrollmentsData?.map((e: any) => ({
                id: e.bible_students?.id,
                name: e.bible_students?.members?.full_name || 'Unknown',
            })).filter((s: any) => s.id) || [];

            setStudents(studentList);

            // Get existing attendance
            const { data: attendanceData } = await supabase
                .from('bible_attendance')
                .select('student_id, lesson_id, status')
                .eq('cohort_id', cohortId);

            // Convert to lookup object
            const attendanceLookup: Record<string, Record<string, string>> = {};
            attendanceData?.forEach((a: any) => {
                if (!attendanceLookup[a.student_id]) {
                    attendanceLookup[a.student_id] = {};
                }
                attendanceLookup[a.student_id][a.lesson_id] = a.status;
            });

            setAttendance(attendanceLookup);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load attendance data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId: string, lessonId: string) => {
        const statusCycle = ['present', 'absent', 'late', 'excused'];
        const current = attendance[studentId]?.[lessonId] || '';
        const currentIndex = statusCycle.indexOf(current);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [lessonId]: nextStatus,
            },
        }));
        setHasChanges(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <Check className="h-4 w-4 text-green-600" />;
            case 'absent':
                return <X className="h-4 w-4 text-red-600" />;
            case 'late':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'excused':
                return <AlertCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <span className="text-gray-400">—</span>;
        }
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();

            const records: any[] = [];
            Object.entries(attendance).forEach(([studentId, lessons]) => {
                Object.entries(lessons).forEach(([lessonId, status]) => {
                    records.push({
                        lesson_id: lessonId,
                        student_id: studentId,
                        cohort_id: cohortId,
                        status,
                        attended_date: new Date().toISOString().split('T')[0],
                        recorded_by: user?.id,
                    });
                });
            });

            const { error } = await supabase
                .from('bible_attendance')
                .upsert(records, { onConflict: 'lesson_id,student_id,cohort_id' });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Attendance saved successfully',
            });
            setHasChanges(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save attendance',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 border rounded-lg">
                <p>No lessons defined for this program yet.</p>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 border rounded-lg">
                <p>No students enrolled in this cohort yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Attendance Grid</h3>
                    <p className="text-sm text-gray-500">Click cells to cycle: Present → Absent → Late → Excused</p>
                </div>
                <Button onClick={saveAttendance} disabled={!hasChanges || saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 bg-white z-10">Student</TableHead>
                            {lessons.slice(0, 12).map((lesson) => (
                                <TableHead key={lesson.id} className="text-center min-w-[60px]">
                                    W{lesson.week_number}L{lesson.lesson_order}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="sticky left-0 bg-white font-medium">
                                    {student.name}
                                </TableCell>
                                {lessons.slice(0, 12).map((lesson) => (
                                    <TableCell
                                        key={lesson.id}
                                        className="text-center cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleAttendance(student.id, lesson.id)}
                                    >
                                        {getStatusIcon(attendance[student.id]?.[lesson.id] || '')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-600" /> Present</span>
                <span className="flex items-center gap-1"><X className="h-4 w-4 text-red-600" /> Absent</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-yellow-600" /> Late</span>
                <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4 text-blue-600" /> Excused</span>
            </div>
        </div>
    );
};
