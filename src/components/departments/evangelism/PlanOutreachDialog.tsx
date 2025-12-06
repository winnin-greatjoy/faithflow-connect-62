import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Users, Repeat, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';

interface PlanOutreachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Plan Outreach Dialog - Enhanced event scheduling for outreach activities
 * Features: Duration, date ranges, recurrence options
 */
export const PlanOutreachDialog: React.FC<PlanOutreachDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'door_to_door' as
      | 'door_to_door'
      | 'street'
      | 'hospital'
      | 'prison'
      | 'campus'
      | 'office'
      | 'community',
    location: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    estimatedAttendees: '',
    isRecurring: false,
    recurrenceType: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurrenceEndDate: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.eventType,
        location: formData.location,
        event_date: formData.startDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        end_date: formData.endDate || formData.startDate,
        estimated_attendees: formData.estimatedAttendees
          ? parseInt(formData.estimatedAttendees)
          : null,
        is_recurring: formData.isRecurring,
        recurrence_type: formData.isRecurring ? formData.recurrenceType : null,
        recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null,
        created_by: user.id,
      };

      const { error } = await supabase.from('evangelism_events').insert([eventData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Outreach event planned successfully',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        eventType: 'door_to_door',
        location: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        estimatedAttendees: '',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceEndDate: '',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error planning outreach:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to plan outreach',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Plan Outreach Event
          </DialogTitle>
          <DialogDescription>
            Schedule an outreach activity with duration, location, and recurrence options
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Campus Evangelism at University"
                required
              />
            </div>

            <div>
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => handleChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="door_to_door">Door to Door</SelectItem>
                  <SelectItem value="street">Street Evangelism</SelectItem>
                  <SelectItem value="hospital">Hospital Visit</SelectItem>
                  <SelectItem value="prison">Prison Ministry</SelectItem>
                  <SelectItem value="campus">Campus Outreach</SelectItem>
                  <SelectItem value="office">Office Outreach</SelectItem>
                  <SelectItem value="community">Community Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Details about the outreach event..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., City Center, Hospital Road"
                required
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  min={formData.startDate}
                />
                <p className="text-xs text-gray-500 mt-1">For multi-day events</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  min={formData.startTime}
                />
                <p className="text-xs text-gray-500 mt-1">Event duration</p>
              </div>
            </div>
          </div>

          {/* Recurrence Options */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recurring Event
                </Label>
                <p className="text-xs text-gray-500">Create a series of events</p>
              </div>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleChange('isRecurring', checked)}
              />
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                <div>
                  <Label htmlFor="recurrenceType">Repeat *</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value) => handleChange('recurrenceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recurrenceEndDate">Repeat Until *</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => handleChange('recurrenceEndDate', e.target.value)}
                    min={formData.startDate}
                    required={formData.isRecurring}
                  />
                  <p className="text-xs text-gray-500 mt-1">Last date for recurring events</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="estimatedAttendees">
                <Users className="inline h-4 w-4 mr-1" />
                Estimated Team Size
              </Label>
              <Input
                id="estimatedAttendees"
                type="number"
                value={formData.estimatedAttendees}
                onChange={(e) => handleChange('estimatedAttendees', e.target.value)}
                placeholder="e.g., 10"
                min="1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Planning...' : 'Plan Outreach'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
