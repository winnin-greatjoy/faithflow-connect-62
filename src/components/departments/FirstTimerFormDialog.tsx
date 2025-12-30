// src/components/departments/FirstTimerFormDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FirstTimerForm, FirstTimerFormData } from '@/components/admin/FirstTimerForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
    const { toast } = useToast();

    const handleFormSubmit = async (data: FirstTimerFormData) => {
        try {
            if (firstTimer?.id) {
                // Update existing first-timer
                const { error } = await supabase
                    .from('first_timers')
                    .update({
                        full_name: data.fullName,
                        email: data.email || null,
                        phone: data.phone || null,
                        community: data.community,
                        area: data.area,
                        street: data.street,
                        public_landmark: data.publicLandmark || null,
                        service_date: data.serviceDate,
                        first_visit: data.firstVisit,
                        invited_by: data.invitedBy || null,
                        branch_id: data.branchId,
                        status: data.status,
                        follow_up_status: data.followUpStatus,
                        follow_up_notes: data.followUpNotes || null,
                        notes: data.notes || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', firstTimer.id);

                if (error) throw error;

                toast({
                    title: 'Success',
                    description: 'First-timer updated successfully',
                });
            } else {
                // Create new first-timer
                const { error } = await supabase
                    .from('first_timers')
                    .insert({
                        full_name: data.fullName,
                        email: data.email || null,
                        phone: data.phone || null,
                        community: data.community,
                        area: data.area,
                        street: data.street,
                        public_landmark: data.publicLandmark || null,
                        service_date: data.serviceDate,
                        first_visit: data.firstVisit,
                        invited_by: data.invitedBy || null,
                        branch_id: data.branchId,
                        status: data.status,
                        follow_up_status: data.followUpStatus,
                        follow_up_notes: data.followUpNotes || null,
                        notes: data.notes || null,
                    });

                if (error) throw error;

                toast({
                    title: 'Success',
                    description: 'First-timer added successfully',
                });
            }

            onSubmit(); // Trigger parent callback (refresh data)
            onOpenChange(false); // Close dialog
        } catch (error: any) {
            console.error('Error saving first-timer:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to save first-timer',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {firstTimer ? 'Edit First Timer' : 'Add New First Timer'}
                    </DialogTitle>
                </DialogHeader>
                <FirstTimerForm
                    firstTimer={firstTimer}
                    onSubmit={handleFormSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
