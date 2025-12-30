// src/modules/bible-school/CohortDetailPage.tsx
// Dedicated page for managing a single cohort
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, ClipboardCheck, GraduationCap, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { BibleCohort } from './types';

// Tab components
import { CohortStudentList, AttendanceGrid, CohortExamList, CohortProgress } from './components/cohort-detail';

export const CohortDetailPage: React.FC = () => {
    const { cohortId } = useParams<{ cohortId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [cohort, setCohort] = useState<any>(null);
    const [program, setProgram] = useState<{ name: string; level_order: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');

    useEffect(() => {
        if (cohortId) {
            fetchCohortDetails();
        }
    }, [cohortId]);

    const fetchCohortDetails = async () => {
        try {
            setLoading(true);

            // Fetch cohort with program info
            const { data: cohortData, error: cohortError } = await supabase
                .from('bible_cohorts')
                .select(`
                    *,
                    bible_programs (name, level_order)
                `)
                .eq('id', cohortId)
                .single();

            if (cohortError) throw cohortError;

            setCohort(cohortData);
            setProgram(cohortData.bible_programs);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load cohort',
                variant: 'destructive',
            });
            navigate('/admin/bible-school');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            planned: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return (
            <Badge className={variants[status] || 'bg-gray-100'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!cohort) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Cohort not found</p>
                <Button variant="link" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{cohort.cohort_name}</h1>
                        {getStatusBadge(cohort.status)}
                    </div>
                    <p className="text-muted-foreground">
                        {program?.name} Program • {new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Max: {cohort.max_students || 'Unlimited'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">Across all lessons</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exams Graded</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0/0</div>
                        <p className="text-xs text-muted-foreground">Total results</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">Students passing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="students">
                        <Users className="h-4 w-4 mr-2" />
                        Students
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="exams">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Exams & Grades
                    </TabsTrigger>
                    <TabsTrigger value="progress">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Progress
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="students">
                    <CohortStudentList cohortId={cohortId!} />
                </TabsContent>

                <TabsContent value="attendance">
                    <AttendanceGrid cohortId={cohortId!} />
                </TabsContent>

                <TabsContent value="exams">
                    <CohortExamList cohortId={cohortId!} programId={cohort.program_id} />
                </TabsContent>

                <TabsContent value="progress">
                    <CohortProgress cohortId={cohortId!} />
                </TabsContent>
            </Tabs>
        </div>
    );
};
