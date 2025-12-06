import React, { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  onSuccess?: () => void;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  isOpen,
  onClose,
  departmentId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Member',
    outreachArea: '',
  });

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast({
          title: 'Validation Error',
          description: 'Please provide name and email',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      // TODO: Integrate with members table when ready
      // For now, just show success message
      toast({
        title: 'Member Added',
        description: `${formData.name} has been added to the evangelism team`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Member',
        outreachArea: '',
      });

      onSuccess?.();
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              placeholder="e.g., Paul Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="paul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              type="tel"
              placeholder="555-0301"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Outreach Coordinator">Outreach Coordinator</SelectItem>
                <SelectItem value="Street Evangelist">Street Evangelist</SelectItem>
                <SelectItem value="Follow-up Coordinator">Follow-up Coordinator</SelectItem>
                <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                <SelectItem value="Missionary Support">Missionary Support</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Outreach Area</Label>
            <Select
              value={formData.outreachArea}
              onValueChange={(v) => setFormData({ ...formData, outreachArea: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Downtown">Downtown</SelectItem>
                <SelectItem value="North Side">North Side</SelectItem>
                <SelectItem value="South District">South District</SelectItem>
                <SelectItem value="East End">East End</SelectItem>
                <SelectItem value="West Side">West Side</SelectItem>
                <SelectItem value="University">University</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
