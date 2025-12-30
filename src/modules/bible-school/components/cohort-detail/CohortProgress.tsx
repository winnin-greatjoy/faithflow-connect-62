// src/modules/bible-school/components/cohort-detail/CohortProgress.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface StudentProgress {
    id: string;
    name: string;
    attendance_percentage: number;
    exams_taken: number;
    exams_passed: number;
    avg_score: number;
    status: 'on_track' | 'at_risk' | 'excellent';
}

interface CohortProgressProps {
    cohortId: string;
}

export const CohortProgress: React.FC<CohortProgressProps> = ({ cohortId }) => {
    const { toast } = useToast();
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, [cohortId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);

            // Get enrolled students with their progress data
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

            if (!enrollmentsData) {
                setStudents([]);
                return;
            }

            // Calculate progress for each student
            const progressList = await Promise.all(
                enrollmentsData.map(async (enrollment: any) => {
                    const studentId = enrollment.bible_students?.id;
                    const studentName = enrollment.bible_students?.members?.full_name || 'Unknown';

                    if (!studentId) return null;

                    // Get attendance percentage
                    const { data: attendanceData } = await supabase
                        .from('bible_attendance')
                        .select('status')
                        .eq('student_id', studentId)
                        .eq('cohort_id', cohortId);

                    const totalLessons = attendanceData?.length || 0;
                    const presentLessons = attendanceData?.filter((a: any) => a.status === 'present').length || 0;
                    const attendancePercentage = totalLessons > 0
                        ? Math.round((presentLessons / totalLessons) * 100)
                        : 0;

                    // Get exam results
                    const { data: examResults } = await supabase
                        .from('bible_exam_results')
                        .select('score, status')
                        .eq('student_id', studentId)
                        .eq('cohort_id', cohortId);

                    const examsTaken = examResults?.length || 0;
                    const examsPassed = examResults?.filter((r: any) => r.status === 'pass').length || 0;
                    const avgScore = examsTaken > 0
                        ? examResults?.reduce((a: number, r: any) => a + r.score, 0) / examsTaken
                        : 0;

                    // Determine status
                    let status: 'on_track' | 'at_risk' | 'excellent' = 'on_track';
                    if (attendancePercentage < 75 || (examsTaken > 0 && examsPassed / examsTaken < 0.5)) {
                        status = 'at_risk';
                    } else if (attendancePercentage >= 90 && (examsTaken === 0 || examsPassed === examsTaken)) {
                        status = 'excellent';
                    }

                    return {
                        id: studentId,
                        name: studentName,
                        attendance_percentage: attendancePercentage,
                        exams_taken: examsTaken,
                        exams_passed: examsPassed,
                        avg_score: Math.round(avgScore * 100) / 100,
                        status,
                    };
                })
            );

            setStudents(progressList.filter(Boolean) as StudentProgress[]);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load progress data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'excellent':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Excellent</Badge>;
            case 'at_risk':
                return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />At Risk</Badge>;
            default:
                return <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="h-3 w-3 mr-1" />On Track</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

    // Summary stats
    const atRiskCount = students.filter(s => s.status === 'at_risk').length;
    const excellentCount = students.filter(s => s.status === 'excellent').length;
    const avgAttendance = Math.round(students.reduce((a, s) => a + s.attendance_percentage, 0) / students.length);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Cohort Avg Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgAttendance}%</div>
                        <Progress value={avgAttendance} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{atRiskCount}</div>
                        <p className="text-xs text-gray-500">Need attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Excellent Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{excellentCount}</div>
                        <p className="text-xs text-gray-500">Top performers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Student Progress Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                    <Card key={student.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <CardTitle className="text-base">{student.name}</CardTitle>
                                </div>
                                {getStatusBadge(student.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Attendance</span>
                                    <span className="font-medium">{student.attendance_percentage}%</span>
                                </div>
                                <Progress
                                    value={student.attendance_percentage}
                                    className={student.attendance_percentage < 75 ? '[&>div]:bg-red-500' : ''}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Exams Passed</span>
                                <span className="font-medium">
                                    {student.exams_passed}/{student.exams_taken}
                                </span>
                            </div>
                            {student.exams_taken > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Avg Score</span>
                                    <span className="font-medium">{student.avg_score}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
