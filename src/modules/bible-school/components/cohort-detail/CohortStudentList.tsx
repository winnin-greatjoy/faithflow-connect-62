// src/modules/bible-school/components/cohort-detail/CohortStudentList.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, UserMinus, Eye } from 'lucide-react';

interface Student {
    id: string;
    member_id: string;
    status: string;
    enrolled_at: string;
    member?: {
        full_name: string;
        phone: string;
        email?: string;
    };
}

interface CohortStudentListProps {
    cohortId: string;
}

export const CohortStudentList: React.FC<CohortStudentListProps> = ({ cohortId }) => {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, [cohortId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);

            // Get enrollments for this cohort with student and member info
            const { data, error } = await supabase
                .from('bible_enrollments')
                .select(`
                    id,
                    enrolled_at,
                    status,
                    bible_students (
                        id,
                        member_id,
                        status,
                        members (
                            full_name,
                            phone,
                            email
                        )
                    )
                `)
                .eq('cohort_id', cohortId)
                .eq('status', 'active');

            if (error) throw error;

            // Transform data
            const studentList = data?.map((enrollment: any) => ({
                id: enrollment.bible_students?.id,
                member_id: enrollment.bible_students?.member_id,
                status: enrollment.bible_students?.status,
                enrolled_at: enrollment.enrolled_at,
                member: enrollment.bible_students?.members,
            })) || [];

            setStudents(studentList);
        } catch (error: any) {
            console.error('Error fetching students:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load students',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            enrolled: 'bg-green-100 text-green-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800',
            withdrawn: 'bg-red-100 text-red-800',
        };
        return <Badge className={variants[status] || 'bg-gray-100'}>{status}</Badge>;
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
                <h3 className="text-lg font-semibold">Enrolled Students ({students.length})</h3>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll Student
                </Button>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border rounded-lg">
                    <p className="mb-2">No students enrolled in this cohort yet.</p>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Enroll First Student
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Enrolled</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">
                                        {student.member?.full_name || 'Unknown'}
                                    </TableCell>
                                    <TableCell>{student.member?.phone || '-'}</TableCell>
                                    <TableCell>{student.member?.email || '-'}</TableCell>
                                    <TableCell>
                                        {new Date(student.enrolled_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" title="View Progress">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" title="Withdraw">
                                                <UserMinus className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};
