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

type DepartmentFormResult = {
  id: string;
  name: string;
  slug: string;
  leader: string;
  members: number;
  activities: number;
  status: 'Active' | 'Inactive';
  description: string;
};

export const AddDepartmentForm = ({ onAdd }: { onAdd?: (dept: DepartmentFormResult) => void }) => {
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
    // Generate slug from name
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    // Minimal insert into departments table
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({ 
          name: formData.name, 
          slug: slug,
          description: formData.description || null, 
          branch_id: branchId || null 
        })
        .select('id, name, slug');
      if (error) {
        toast({ title: 'Failed to add department', description: error.message });
        throw error;
      }
      const created = data && data[0];
      // Update local UI list if callback provided
      onAdd?.({
        id: created?.id ?? String(Date.now()),
        name: formData.name,
        slug: created?.slug || slug,
        leader: formData.leader || 'TBD',
        members: Number(formData.members || 0),
        activities: Number(formData.activities || 0),
        status: formData.status as 'Active' | 'Inactive',
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
        id: String(Date.now()),
        slug: slug,
        ...formData,
        members: Number(formData.members || 0),
        activities: Number(formData.activities || 0),
        status: formData.status as 'Active' | 'Inactive',
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
