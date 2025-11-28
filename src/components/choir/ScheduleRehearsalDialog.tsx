import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Calendar, Clock } from 'lucide-react';

interface ScheduleRehearsalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  onRehearsalScheduled: () => void;
}

export const ScheduleRehearsalDialog: React.FC<ScheduleRehearsalDialogProps> = ({
  open,
  onOpenChange,
  departmentId,
  onRehearsalScheduled,
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [rehearsal, setRehearsal] = useState({
    title: '',
    date: '',
    time: '18:00',
    duration: 120,
    type: 'full_rehearsal',
    location: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!rehearsal.title.trim() || !rehearsal.date) {
      toast({
        title: 'Missing Information',
        description: 'Title and date are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('department_tasks').insert({
        department_id: departmentId,
        title: rehearsal.title,
        description: `${rehearsal.type.replace('_', ' ')} - ${rehearsal.notes}`,
        due_date: `${rehearsal.date}T${rehearsal.time}:00`,
        status: 'backlog',
        priority: 'medium',
      });

      if (error) throw error;

      toast({
        title: 'Rehearsal Scheduled',
        description: `${rehearsal.title} scheduled for ${rehearsal.date}`,
      });

      resetForm();
      onRehearsalScheduled();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to schedule rehearsal',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setRehearsal({
      title: '',
      date: '',
      time: '18:00',
      duration: 120,
      type: 'full_rehearsal',
      location: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Rehearsal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Rehearsal Title *</Label>
            <Input
              id="title"
              value={rehearsal.title}
              onChange={(e) => setRehearsal({ ...rehearsal, title: e.target.value })}
              placeholder="e.g., Weekly Choir Practice"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={rehearsal.date}
                onChange={(e) => setRehearsal({ ...rehearsal, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={rehearsal.time}
                onChange={(e) => setRehearsal({ ...rehearsal, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Rehearsal Type</Label>
              <Select
                value={rehearsal.type}
                onValueChange={(v) => setRehearsal({ ...rehearsal, type: v })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_rehearsal">Full Rehearsal</SelectItem>
                  <SelectItem value="sectional">Sectional Rehearsal</SelectItem>
                  <SelectItem value="dress_rehearsal">Dress Rehearsal</SelectItem>
                  <SelectItem value="voice_training">Voice Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="30"
                max="240"
                value={rehearsal.duration}
                onChange={(e) =>
                  setRehearsal({ ...rehearsal, duration: parseInt(e.target.value) || 120 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={rehearsal.location}
              onChange={(e) => setRehearsal({ ...rehearsal, location: e.target.value })}
              placeholder="e.g., Main Sanctuary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={rehearsal.notes}
              onChange={(e) => setRehearsal({ ...rehearsal, notes: e.target.value })}
              placeholder="Special instructions, songs to practice, etc."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Scheduling...' : 'Schedule Rehearsal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
