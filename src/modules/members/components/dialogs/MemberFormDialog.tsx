// src/modules/members/components/dialogs/MemberFormDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MemberForm } from '@/components/admin/MemberForm';
import type { Member } from '@/types/membership';

interface MemberFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member?: Member | null;
    onSubmit: () => void;
}

export const MemberFormDialog: React.FC<MemberFormDialogProps> = ({
    open,
    onOpenChange,
    member,
    onSubmit,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle>
                        {member ? 'Edit Member' : 'Add New Member'}
                    </DialogTitle>
                </DialogHeader>
                <MemberForm
                    member={member}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
