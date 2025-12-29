// src/modules/members/components/dialogs/ConvertFormDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConvertForm, ConvertFormData } from '@/components/admin/ConvertForm';
import type { Member } from '@/types/membership';

interface ConvertFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    convert?: Partial<Member> | null;
    branches: { id: string; name: string }[];
    onSubmit: (data: ConvertFormData) => void;
}

export const ConvertFormDialog: React.FC<ConvertFormDialogProps> = ({
    open,
    onOpenChange,
    convert,
    branches,
    onSubmit,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {convert ? 'Edit Convert' : 'Add New Convert'}
                    </DialogTitle>
                </DialogHeader>
                <ConvertForm
                    convert={convert}
                    branches={branches}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
