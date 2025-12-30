import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface AddFollowUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contact: any) => void;
}

export const AddFollowUpDialog: React.FC<AddFollowUpDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactName: '',
    contactInfo: '',
    status: 'new' as 'new' | 'contacted' | 'interested' | 'converted' | 'not-interested',
    assignedTo: '',
    notes: '',
  });

  const handleSubmit = async () => {
    try {
      if (!formData.contactName || !formData.contactInfo) {
        toast({
          title: 'Validation Error',
          description: 'Please provide contact name and info',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      const newContact = {
        id: Date.now(),
        contactName: formData.contactName,
        contactInfo: formData.contactInfo,
        status: formData.status,
        assignedTo: formData.assignedTo,
        lastContact: new Date().toISOString().split('T')[0],
        notes: formData.notes,
      };

      toast({
        title: 'Contact Added',
        description: `${formData.contactName} added to follow-up list`,
      });

      // Reset form
      setFormData({
        contactName: '',
        contactInfo: '',
        status: 'new',
        assignedTo: '',
        notes: '',
      });

      onSuccess?.(newContact);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
          <DialogTitle>Add Follow-up Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Contact Name *</Label>
            <Input
              placeholder="e.g., John Anderson"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Info *</Label>
            <Input
              placeholder="Phone or Email"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v: any) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="not-interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Input
              placeholder="Team member name"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any details about contact..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
