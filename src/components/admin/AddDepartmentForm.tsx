'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthz } from '@/hooks/useAuthz';
import { useToast } from '@/hooks/use-toast';

export const AddDepartmentForm = ({ onAdd }: { onAdd?: (dept: any) => void }) => {
  const [open, setOpen] = useState(false);
  const { branchId } = useAuthz();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    leader: '',
    members: '',
    activities: '',
    status: 'Active',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    // Minimal insert into departments table
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({ name: formData.name, description: formData.description || null, branch_id: branchId || null })
        .select('id, name');
      if (error) {
        toast({ title: 'Failed to add department', description: error.message });
        throw error;
      }
      const created = data && data[0];
      // Update local UI list if callback provided
      onAdd?.({
        id: created?.id ?? Date.now(),
        name: formData.name,
        leader: formData.leader || 'TBD',
        members: Number(formData.members || 0),
        activities: Number(formData.activities || 0),
        status: formData.status,
        description: formData.description || '',
      });
      toast({ title: 'Department created', description: `${formData.name} added successfully.` });
      setOpen(false);
      setFormData({
        name: '',
        leader: '',
        members: '',
        activities: '',
        status: 'Active',
        description: '',
      });
    } catch (_) {
      // Silent failover to local add
      const local = {
        id: Date.now(),
        ...formData,
        members: Number(formData.members || 0),
        activities: Number(formData.activities || 0),
      };
      onAdd?.(local);
      toast({ title: 'Saved locally', description: 'Department could not be saved to the server. Showing locally.' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Choir" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="leader">Department Leader</Label>
            <Input id="leader" name="leader" value={formData.leader} onChange={handleChange} placeholder="e.g., Mary Thompson" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="members">Members</Label>
              <Input id="members" name="members" type="number" value={formData.members} onChange={handleChange} placeholder="e.g., 10" />
            </div>
            <div>
              <Label htmlFor="activities">Activities</Label>
              <Input id="activities" name="activities" type="number" value={formData.activities} onChange={handleChange} placeholder="e.g., 5" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={handleStatusChange} value={formData.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Short description about the department..." />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Save Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
