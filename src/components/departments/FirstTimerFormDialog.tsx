// src/modules/members/components/dialogs/FirstTimerFormDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FirstTimerForm } from '@/components/admin/FirstTimerForm';
import type { FirstTimer } from '@/types/membership';

interface FirstTimerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    firstTimer?: FirstTimer | null;
    onSubmit: () => void;
}

export const FirstTimerFormDialog: React.FC<FirstTimerFormDialogProps> = ({
    open,
    onOpenChange,
    firstTimer,
    onSubmit,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {firstTimer ? 'Edit First Timer' : 'Add New First Timer'}
                    </DialogTitle>
                </DialogHeader>
                <FirstTimerForm
                    firstTimer={firstTimer}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
