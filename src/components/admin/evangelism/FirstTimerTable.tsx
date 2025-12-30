// src/components/admin/evangelism/FirstTimerTable.tsx
// Moved from src/modules/members/components/FirstTimerTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FirstTimer } from '@/types/membership';

interface FirstTimerTableProps {
    firstTimers: FirstTimer[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onEdit: (first Timer: FirstTimer) => void;
    onDelete: (id: string) => void;
    getBranchName: (branchId: string) => string;
}

export const FirstTimerTable: React.FC<FirstTimerTableProps> = ({
    firstTimers,
    selectedIds,
    onSelectionChange,
    onEdit,
    onDelete,
    getBranchName,
}) => {
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(firstTimers.map(ft => ft.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            contacted: 'bg-yellow-100 text-yellow-800',
            followed_up: 'bg-green-100 text-green-800',
            converted: 'bg-purple-100 text-purple-800',
        };
        return (
            <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    if (firstTimers.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <UserPlus className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No first-timers found</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedIds.length === firstTimers.length && firstTimers.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Visit Date</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {firstTimers.map((ft) => (
                        <TableRow key={ft.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.includes(ft.id)}
                                    onCheckedChange={(checked) => handleSelectOne(ft.id, checked as boolean)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{ft.fullName}</div>
                                        <div className="text-sm text-gray-500">
                                            {ft.phone || ft.email || '-'}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    {new Date(ft.serviceDate).toLocaleDateString()}
                                </div>
                            </TableCell>
                            <TableCell>{getBranchName(ft.branchId)}</TableCell>
                            <TableCell>{getStatusBadge(ft.status)}</TableCell>
                            <TableCell>
                                <Badge variant={ft.followUpStatus === 'completed' ? 'default' : 'secondary'}>
                                    {ft.followUpStatus}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(ft)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(ft)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(ft.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
