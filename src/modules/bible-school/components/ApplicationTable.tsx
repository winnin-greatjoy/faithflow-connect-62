// src/modules/bible-school/components/ApplicationTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, FileText } from 'lucide-react';
import type { BibleApplication } from '../types';

interface ApplicationTableProps {
    applications: BibleApplication[];
    onView?: (application: BibleApplication) => void;
    onApprove?: (applicationId: string) => void;
    onReject?: (applicationId: string) => void;
    getMemberName?: (memberId: string) => string;
    getProgramName?: (programId: string) => string;
    getBranchName?: (branchId: string) => string;
    showActions?: boolean;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
    applications,
    onView,
    onApprove,
    onReject,
    getMemberName = () => 'Unknown',
    getProgramName = () => 'Unknown',
    getBranchName = () => 'Unknown',
    showActions = true,
}) => {
    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            withdrawn: 'bg-gray-100 text-gray-800',
        };
        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100'}>
                {status}
            </Badge>
        );
    };

    if (applications.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No applications found</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        {showActions && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((application) => (
                        <TableRow key={application.id}>
                            <TableCell className="font-medium">
                                {getMemberName(application.member_id)}
                            </TableCell>
                            <TableCell>{getProgramName(application.program_id)}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                                {getBranchName(application.branch_id)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                                {new Date(application.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(application.status)}</TableCell>
                            {showActions && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {onView && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onView(application)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {application.status === 'pending' && (
                                            <>
                                                {onApprove && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onApprove(application.id)}
                                                        title="Approve"
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onReject && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onReject(application.id)}
                                                        title="Reject"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
