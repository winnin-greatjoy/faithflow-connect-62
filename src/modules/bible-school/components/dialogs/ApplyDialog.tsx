// src/modules/bible-school/components/dialogs/ApplyDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Program {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number;
}

interface ApplyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    programs: Program[];
    memberId?: string;
    onSuccess?: () => void;
}

export const ApplyDialog: React.FC<ApplyDialogProps> = ({
    isOpen,
    onClose,
    programs,
    memberId,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        programId: '',
        personalStatement: '',
        previousEducation: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.programId || !memberId) {
            toast({
                title: 'Validation Error',
                description: 'Please select a program',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Get user's branch from their profile or member record
            const { data: memberData } = await supabase
                .from('members')
                .select('branch_id')
                .eq('id', memberId)
                .single();

            if (!memberData?.branch_id) {
                throw new Error('Branch information not found');
            }

            const { error } = await supabase.from('bible_applications').insert({
                member_id: memberId,
                program_id: formData.programId,
                branch_id: memberData.branch_id,
                status: 'pending',
                remarks: `Statement: ${formData.personalStatement}\nPrevious Education: ${formData.previousEducation || 'None'}`,
            });

            if (error) throw error;

            toast({
                title: 'Application Submitted',
                description: 'Your Bible School application has been submitted successfully',
            });

            // Reset form
            setFormData({
                programId: '',
                personalStatement: '',
                previousEducation: '',
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit application',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedProgram = programs.find(p => p.id === formData.programId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Apply for Bible School</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="program">Program *</Label>
                        <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((program) => (
                                    <SelectItem key={program.id} value={program.id}>
                                        {program.name} ({program.duration_weeks} weeks)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedProgram?.description && (
                            <p className="text-sm text-muted-foreground">{selectedProgram.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="personalStatement">Personal Statement / Motivation *</Label>
                        <Textarea
                            id="personalStatement"
                            placeholder="Why do you want to enroll in this program?"
                            value={formData.personalStatement}
                            onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="previousEducation">Previous Education (Optional)</Label>
                        <Textarea
                            id="previousEducation"
                            placeholder="List any previous Bible School or theological training"
                            value={formData.previousEducation}
                            onChange={(e) => setFormData({ ...formData, previousEducation: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
