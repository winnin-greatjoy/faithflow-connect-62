
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appointmentsApi } from '@/services/calendarApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock list of leaders for MVP - ideally fetched from backend
const LEADERS = [
    { id: 'leader-1', name: 'Pastor John Doe' },
    { id: 'leader-2', name: 'Deacon Sarah Smith' },
];

interface BookAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const BookAppointmentDialog: React.FC<BookAppointmentDialogProps> = ({ open, onOpenChange, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [form, setForm] = useState({
        leaderId: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        notes: ''
    });

    // In a real app, we'd fetch actual leaders visible to this user
    // For now, we'll just require a valid UUID for the host_id in the form, 
    // or we can simulate it if we had real user IDs.
    // To avoid FK errors, we might need a real user ID.
    // Since we don't have an easy way to get a list of valid member IDs in this isolated component
    // without a massive fetch, we will display a warning or use a placeholder if not connected to real data.

    // NOTE for MVP: This might fail if 'leader-1' is not a valid UUID in `members` table.
    // We will assume the user will pick a valid member in potential future enhancements.
    // For strictly this task, we will try to implement the UI flow.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // MVP: Construct timestamps
            const startAt = `${form.date}T${form.time}:00`;
            // Default 30 min duration
            const endDate = new Date(new Date(startAt).getTime() + 30 * 60000);
            const endAt = endDate.toISOString();

            // WARNING: This will fail if leaderId is not a valid UUID in members table.
            // We need a real ID. For this demo, we'll try to find one or just show success toast mock?
            // "host_id is uuid".
            // Let's rely on the user understanding this is a placeholder dialog as per plan "Create BookAppointmentDialog (Placeholder)"

            throw new Error("Appointment Booking System is coming soon! This is a UI preview.");

            // Code for real implementation:
            /*
            const { error } = await appointmentsApi.createAppointment({
                 host_id: form.leaderId,
                 start_at: new Date(startAt).toISOString(),
                 end_at: endAt,
                 status: 'pending',
                 notes: form.notes
            });
            if (error) throw error;
            */

        } catch (err: any) {
            toast({
                title: 'Feature Coming Soon',
                description: 'Appointment booking logic will be connected to real leaders soon.',
                variant: 'default'
            });
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>Schedule a meeting with a church leader.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Leader</Label>
                        <Select onValueChange={v => setForm(f => ({ ...f, leaderId: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a leader..." />
                            </SelectTrigger>
                            <SelectContent>
                                {LEADERS.map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                                type="time"
                                value={form.time}
                                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Input
                            placeholder="Brief note..."
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !form.leaderId}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Request Booking
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
