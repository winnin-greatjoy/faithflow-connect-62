// src/modules/bible-school/components/dialogs/CreateCohortDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/useBranches';
import { supabase } from '@/integrations/supabase/client';

interface Program {
    id: string;
    name: string;
    duration_weeks: number;
}

interface CreateCohortDialogProps {
    isOpen: boolean;
    onClose: () => void;
    programs: Program[];
    onSuccess?: () => void;
}

export const CreateCohortDialog: React.FC<CreateCohortDialogProps> = ({
    isOpen,
    onClose,
    programs,
    onSuccess,
}) => {
    const { toast } = useToast();
    const { branches } = useBranches();
    const [loading, setLoading] = useState(false);
    const [formData, set FormData] = useState({
        programId: '',
        branchId: '',
        cohortName: '',
        startDate: '',
        endDate: '',
        maxStudents: '30',
    });

    // Auto-calculate end date when program or start date changes
    useEffect(() => {
        if (formData.programId && formData.startDate) {
            const program = programs.find(p => p.id === formData.programId);
            if (program) {
                const start = new Date(formData.startDate);
                const end = new Date(start);
                end.setDate(end.getDate() + (program.duration_weeks * 7));
                setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
            }
        }
    }, [formData.programId, formData.startDate, programs]);

    // Auto-generate cohort name
    useEffect(() => {
        if (formData.programId && formData.startDate) {
            const program = programs.find(p => p.id === formData.programId);
            const year = new Date(formData.startDate).getFullYear();
            const month = new Date(formData.startDate).toLocaleString('default', { month: 'short' });
            if (program) {
                setFormData(prev => ({ ...prev, cohortName: `${program.name} ${month} ${year}` }));
            }
        }
    }, [formData.programId, formData.startDate, programs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.programId || !formData.branchId || !formData.startDate || !formData.endDate) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('bible_cohorts').insert({
                program_id: formData.programId,
                branch_id: formData.branchId,
                cohort_name: formData.cohortName,
                start_date: formData.startDate,
                end_date: formData.endDate,
                status: 'planned',
                max_students: parseInt(formData.maxStudents),
                created_by: user?.id,
            });

            if (error) throw error;

            toast({
                title: 'Cohort Created',
                description: `${formData.cohortName} has been created successfully`,
            });

            // Reset form
            setFormData({
                programId: '',
                branchId: '',
                cohortName: '',
                startDate: '',
                endDate: '',
                maxStudents: '30',
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create cohort',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Cohort</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="program">Program *</Label>
                            <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map((program) => (
                                        <SelectItem key={program.id} value={program.id}>
                                            {program.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branch">Branch *</Label>
                            <Select value={formData.branchId} onValueChange={(v) => setFormData({ ...formData, branchId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="cohortName">Cohort Name</Label>
                            <Input
                                id="cohortName"
                                value={formData.cohortName}
                                onChange={(e) => setFormData({ ...formData, cohortName: e.target.value })}
                                placeholder="Auto-generated or custom"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxStudents">Maximum Students</Label>
                            <Input
                                id="maxStudents"
                                type="number"
                                min="1"
                                value={formData.maxStudents}
                                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Cohort'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
