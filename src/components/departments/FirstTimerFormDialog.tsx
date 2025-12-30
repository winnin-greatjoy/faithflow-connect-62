// src/components/departments/FirstTimerFormDialog.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/useBranches';
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
    const { branches } = useBranches();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        community: '',
        area: '',
        street: '',
        publicLandmark: '',
        serviceDate: '',
        firstVisit: '',
        invitedBy: '',
        branchId: '',
        status: 'new' as 'new' | 'contacted' | 'followed_up' | 'converted',
        followUpStatus: 'pending' as 'pending' | 'called' | 'visited' | 'completed',
        followUpNotes: '',
        notes: '',
    });

    useEffect(() => {
        if (firstTimer) {
            setFormData({
                fullName: firstTimer.fullName || '',
                email: firstTimer.email || '',
                phone: firstTimer.phone || '',
                community: firstTimer.community || '',
                area: firstTimer.area || '',
                street: firstTimer.street || '',
                publicLandmark: firstTimer.publicLandmark || '',
                serviceDate: firstTimer.serviceDate || '',
                firstVisit: firstTimer.firstVisit || '',
                invitedBy: firstTimer.invitedBy || '',
                branchId: firstTimer.branchId?.toString() || '',
                status: (firstTimer.status as any) || 'new',
                followUpStatus: (firstTimer.followUpStatus as any) || 'pending',
                followUpNotes: firstTimer.followUpNotes || '',
                notes: firstTimer.notes || '',
            });
        } else if (branches.length > 0) {
            setFormData(prev => ({ ...prev, branchId: branches[0].id }));
        }
    }, [firstTimer, branches, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.community || !formData.area || !formData.street || !formData.serviceDate || !formData.firstVisit || !formData.branchId) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                full_name: formData.fullName,
                email: formData.email || null,
                phone: formData.phone || null,
                community: formData.community,
                area: formData.area,
                street: formData.street,
                public_landmark: formData.publicLandmark || null,
                service_date: formData.serviceDate,
                first_visit: formData.firstVisit,
                invited_by: formData.invitedBy || null,
                branch_id: formData.branchId,
                status: formData.status,
                follow_up_status: formData.followUpStatus,
                follow_up_notes: formData.followUpNotes || null,
                notes: formData.notes || null,
            };

            if (firstTimer?.id) {
                const { error } = await supabase
                    .from('first_timers')
                    .update({ ...payload, updated_at: new Date().toISOString() })
                    .eq('id', firstTimer.id);

                if (error) throw error;

                toast({
                    title: 'Success',
                    description: 'First-timer updated successfully',
                });
            } else {
                const { error } = await supabase
                    .from('first_timers')
                    .insert(payload);

                if (error) throw error;

                toast({
                    title: 'Success',
                    description: 'First-timer added successfully',
                });
            }

            onSubmit();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error saving first-timer:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to save first-timer',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {firstTimer ? 'Edit First Timer' : 'Add New First Timer'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="community">Community *</Label>
                            <Input
                                id="community"
                                value={formData.community}
                                onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="area">Area *</Label>
                            <Input
                                id="area"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="street">Street *</Label>
                            <Input
                                id="street"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publicLandmark">Public Landmark</Label>
                            <Input
                                id="publicLandmark"
                                value={formData.publicLandmark}
                                onChange={(e) => setFormData({ ...formData, publicLandmark: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serviceDate">Service Date *</Label>
                            <Input
                                id="serviceDate"
                                type="date"
                                value={formData.serviceDate}
                                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstVisit">First Visit *</Label>
                            <Input
                                id="firstVisit"
                                type="date"
                                value={formData.firstVisit}
                                onChange={(e) => setFormData({ ...formData, firstVisit: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invitedBy">Invited By</Label>
                            <Input
                                id="invitedBy"
                                value={formData.invitedBy}
                                onChange={(e) => setFormData({ ...formData, invitedBy: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="branchId">Branch *</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="followed_up">Followed Up</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="followUpStatus">Follow-up Status</Label>
                            <Select value={formData.followUpStatus} onValueChange={(v: any) => setFormData({ ...formData, followUpStatus: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="called">Called</SelectItem>
                                    <SelectItem value="visited">Visited</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                        <Textarea
                            id="followUpNotes"
                            value={formData.followUpNotes}
                            onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : firstTimer ? 'Update' : 'Add'} First-Timer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
