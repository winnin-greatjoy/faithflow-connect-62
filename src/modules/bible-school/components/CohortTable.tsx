// src/modules/bible-school/components/CohortTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Users, MoreHorizontal, Play, CheckCircle, XCircle } from 'lucide-react';
import type { BibleCohort } from '../types';

interface CohortTableProps {
    cohorts: BibleCohort[];
    onView?: (cohort: BibleCohort) => void;
    onEdit?: (cohort: BibleCohort) => void;
    onActivate?: (cohort: BibleCohort) => void;
    onComplete?: (cohort: BibleCohort) => void;
    onCancel?: (cohort: BibleCohort) => void;
    getBranchName?: (branchId: string | null) => string;
    getProgramName?: (programId: string) => string;
}

export const CohortTable: React.FC<CohortTableProps> = ({
    cohorts,
    onView,
    onEdit,
    onActivate,
    onComplete,
    onCancel,
    getBranchName = () => 'N/A',
    getProgramName = () => 'Unknown',
}) => {
    const getStatusBadge = (status: string) => {
        const variants = {
            planned: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100'}>
                {status}
            </Badge>
        );
    };

    if (cohorts.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No cohorts found</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cohort Name</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Branch/Location</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cohorts.map((cohort) => (
                        <TableRow key={cohort.id}>
                            <TableCell className="font-medium">{cohort.cohort_name}</TableCell>
                            <TableCell>{getProgramName(cohort.program_id)}</TableCell>
                            <TableCell>
                                {cohort.branch_id ? getBranchName(cohort.branch_id) :
                                    <span className="text-blue-600">Central</span>}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                                {new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(cohort.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    {onView && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView(cohort)}
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(cohort)}
                                            title="Edit Cohort"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {cohort.status === 'planned' && onActivate && (
                                                <DropdownMenuItem onClick={() => onActivate(cohort)}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Activate Cohort
                                                </DropdownMenuItem>
                                            )}
                                            {cohort.status === 'active' && onComplete && (
                                                <DropdownMenuItem onClick={() => onComplete(cohort)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark Complete
                                                </DropdownMenuItem>
                                            )}
                                            {(cohort.status === 'planned' || cohort.status === 'active') && onCancel && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => onCancel(cohort)}
                                                        className="text-red-600"
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Cancel Cohort
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
