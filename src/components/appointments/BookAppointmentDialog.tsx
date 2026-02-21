import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appointmentsApi } from '@/services/calendarApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock list of leaders for MVP - ideally fetched from backend
const LEADERS = [
  { id: 'leader-1', name: 'Pastor John Doe' },
  { id: 'leader-2', name: 'Deacon Sarah Smith' },
];

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  appointment?: any; // Passing appointment object if viewing/editing
}

export const BookAppointmentDialog: React.FC<BookAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  appointment,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    leaderId: appointment?.host_id || '',
    date: appointment?.start_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    time: appointment?.start_at?.split('T')[1]?.substring(0, 5) || '10:00',
    notes: appointment?.notes || '',
  });

  const isViewMode = !!appointment?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isViewMode) {
        // If in view mode, we might just be updating status or notes
        const { error } = await appointmentsApi.updateStatus(appointment.id, appointment.status);
        if (error) throw error;
        toast({ title: 'Success', description: 'Appointment status updated.' });
      } else {
        // MVP: Construct timestamps
        const startAt = `${form.date}T${form.time}:00`;
        const endDate = new Date(new Date(startAt).getTime() + 30 * 60000);
        const endAt = endDate.toISOString();

        // throwing the feature coming soon as per original code for now,
        // but preparing the logic
        throw new Error('Appointment Booking System is coming soon! This is a UI preview.');
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: isViewMode ? 'Status Update' : 'Feature Coming Soon',
        description:
          err.message || 'Appointment booking logic will be connected to real leaders soon.',
        variant: 'default',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'cancelled') => {
    if (!appointment?.id) return;
    setLoading(true);
    try {
      const { error } = await appointmentsApi.updateStatus(appointment.id, newStatus);
      if (error) throw error;
      toast({ title: 'Status Updated', description: `Appointment marked as ${newStatus}.` });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isViewMode ? 'Appointment Details' : 'Book Appointment'}</DialogTitle>
          <DialogDescription>
            {isViewMode
              ? 'View and manage appointment status.'
              : 'Schedule a meeting with a church leader.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{isViewMode ? 'Leader' : 'Select Leader'}</Label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-muted/20 text-sm">
                {appointment.host?.full_name || 'Church Leader'}
              </div>
            ) : (
              <Select onValueChange={(v) => setForm((f) => ({ ...f, leaderId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a leader..." />
                </SelectTrigger>
                <SelectContent>
                  {LEADERS.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                disabled={isViewMode}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isViewMode ? 'Notes' : 'Reason (Optional)'}</Label>
            <Input
              placeholder="Brief note..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              disabled={isViewMode}
            />
          </div>

          {isViewMode && (
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    appointment.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : appointment.status === 'rejected'
                        ? 'bg-rose-100 text-rose-700'
                        : appointment.status === 'cancelled'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {isViewMode ? (
              <div className="flex flex-1 gap-2 w-full">
                {appointment.status === 'pending' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-rose-500 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-auto"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={loading || appointment.status === 'cancelled'}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !form.leaderId}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request Booking
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
