// src/modules/members/components/MemberTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, Mail, Users, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Member } from '@/types/membership';

interface MemberTableProps {
    members: Member[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onView: (member: Member) => void;
    onEdit: (member: Member) => void;
    onDelete: (id: string) => void;
    getBranchName: (branchId: string) => string;
}

export const MemberTable: React.FC<MemberTableProps> = ({
    members,
    selectedIds,
    onSelectionChange,
    onView,
    onEdit,
    onDelete,
    getBranchName,
}) => {
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(members.map(m => m.id));
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

    const getMembershipBadge = (member: Member) => {
        if (member.membershipLevel === 'convert') {
            return <Badge variant="secondary">Convert</Badge>;
        }
        if (member.baptizedSubLevel === 'worker') {
            return <Badge className="bg-green-100 text-green-800">Worker</Badge>;
        }
        if (member.baptizedSubLevel === 'disciple') {
            return <Badge className="bg-purple-100 text-purple-800">Disciple</Badge>;
        }
        if (member.baptizedSubLevel === 'leader') {
            return <Badge className="bg-orange-100 text-orange-800">Leader</Badge>;
        }
        if (member.leaderRole === 'pastor' || member.leaderRole === 'assistant_pastor') {
            return <Badge className="bg-blue-100 text-blue-800">Pastor</Badge>;
        }
        return <Badge variant="outline">Member</Badge>;
    };

    if (members.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No members found</p>
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
                                checked={selectedIds.length === members.length && members.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.includes(member.id)}
                                    onCheckedChange={(checked) => handleSelectOne(member.id, checked as boolean)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {member.profilePhoto ? (
                                        <img
                                            src={member.profilePhoto}
                                            alt={member.fullName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                            {member.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium">{member.fullName}</div>
                                        <div className="text-sm text-gray-500">{member.community || '-'}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    {member.phone && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Phone className="h-3 w-3" />
                                            {member.phone}
                                        </div>
                                    )}
                                    {member.email && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Mail className="h-3 w-3" />
                                            {member.email}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{getBranchName(member.branchId)}</TableCell>
                            <TableCell>{getMembershipBadge(member)}</TableCell>
                            <TableCell>
                                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onView(member)}
                                        title="View Profile"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(member)}
                                        title="Edit Member"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(member.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Delete Member"
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
