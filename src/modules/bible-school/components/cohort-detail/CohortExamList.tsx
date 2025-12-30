// src/modules/bible-school/components/cohort-detail/CohortExamList.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Eye } from 'lucide-react';

interface Exam {
    id: string;
    title: string;
    description: string;
    total_marks: number;
    pass_mark: number;
    exam_type: string;
    is_final: boolean;
    results_count?: number;
    avg_score?: number;
}

interface CohortExamListProps {
    cohortId: string;
    programId: string;
}

export const CohortExamList: React.FC<CohortExamListProps> = ({ cohortId, programId }) => {
    const { toast } = useToast();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, [programId, cohortId]);

    const fetchExams = async () => {
        try {
            setLoading(true);

            // Get exams for this program
            const { data: examsData, error } = await supabase
                .from('bible_exams')
                .select('*')
                .eq('program_id', programId)
                .order('is_final')
                .order('created_at');

            if (error) throw error;

            // Get result counts for each exam in this cohort
            const examsWithStats = await Promise.all(
                (examsData || []).map(async (exam) => {
                    const { data: results } = await supabase
                        .from('bible_exam_results')
                        .select('score')
                        .eq('exam_id', exam.id)
                        .eq('cohort_id', cohortId);

                    const scores = results?.map((r: any) => r.score) || [];
                    const avgScore = scores.length > 0
                        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
                        : 0;

                    return {
                        ...exam,
                        results_count: results?.length || 0,
                        avg_score: Math.round(avgScore * 100) / 100,
                    };
                })
            );

            setExams(examsWithStats);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load exams',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getExamTypeBadge = (type: string) => {
        const variants: Record<string, string> = {
            written: 'bg-blue-100 text-blue-800',
            oral: 'bg-purple-100 text-purple-800',
            practical: 'bg-green-100 text-green-800',
            project: 'bg-orange-100 text-orange-800',
        };
        return <Badge className={variants[type] || 'bg-gray-100'}>{type}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Exams & Grades</h3>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                </Button>
            </div>

            {exams.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border rounded-lg">
                    <p className="mb-2">No exams defined for this program yet.</p>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Exam
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Card key={exam.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base">{exam.title}</CardTitle>
                                    <div className="flex gap-1">
                                        {getExamTypeBadge(exam.exam_type)}
                                        {exam.is_final && (
                                            <Badge className="bg-red-100 text-red-800">Final</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {exam.description || 'No description'}
                                </p>
                                <div className="flex justify-between text-sm">
                                    <span>Pass Mark: {exam.pass_mark}/{exam.total_marks}</span>
                                    <span>Graded: {exam.results_count}</span>
                                </div>
                                {exam.results_count > 0 && (
                                    <div className="text-sm">
                                        Avg Score: <span className="font-medium">{exam.avg_score}</span>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="mr-1 h-4 w-4" />
                                        View Grades
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit className="mr-1 h-4 w-4" />
                                        Enter Grades
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
