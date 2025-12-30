// src/modules/bible-school/components/StudentTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, Award, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { StudentProgress } from '../types';

interface StudentTableProps {
    students: StudentProgress[];
    onViewProfile?: (student: StudentProgress) => void;
    onPromote?: (student: StudentProgress) => void;
    showPromoteAction?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
    students,
    onViewProfile,
    onPromote,
    showPromoteAction = false,
}) => {
    const getStatusBadge = (status: string) => {
        const variants = {
            enrolled: 'bg-green-100 text-green-800',
            suspended: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            withdrawn: 'bg-gray-100 text-gray-800',
        };
        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100'}>
                {status}
            </Badge>
        );
    };

    if (students.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No students found</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Cohort</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Exam Average</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.student_id}>
                            <TableCell className="font-medium">{student.student_name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {student.current_program || 'N/A'}
                                    {student.level_order && (
                                        <Badge variant="outline" className="text-xs">
                                            L{student.level_order}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                                {student.cohort_name || 'N/A'}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Progress value={student.attendance_percentage} className="w-20 h-2" />
                                        <span className="text-sm font-medium">
                                            {student.attendance_percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium">{student.exam_average.toFixed(1)}</span>
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {onViewProfile && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewProfile(student)}
                                            title="View Profile"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {showPromoteAction && onPromote && student.status === 'enrolled' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onPromote(student)}
                                            title="Promote Student"
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <TrendingUp className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
