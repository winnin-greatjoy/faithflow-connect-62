// src/components/admin/evangelism/FirstTimerFormDialog.tsx
// Moved from src/modules/members/components/dialogs/FirstTimerFormDialog.tsx
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
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>
                        {firstTimer ? 'Edit First Timer' : 'Add First Timer'}
                    </DialogTitle>
                </DialogHeader>
                <FirstTimerForm
                    firstTimer={firstTimer}
                    onSuccess={() => {
                        onSubmit();
                        onOpenChange(false);
                    }}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
