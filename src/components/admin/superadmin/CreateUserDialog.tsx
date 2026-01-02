import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<
    { id: string; name: string; district_id: string | null }[]
  >([]);

  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'member',
    districtId: '',
    branchId: '',
  });

  const districtRoles = ['district_admin', 'district_overseer'];
  const showDistrictSelector = districtRoles.includes(newUserForm.role);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data: d } = await supabase.from('districts').select('id, name').order('name');
      const { data: b } = await supabase
        .from('church_branches')
        .select('id, name, district_id')
        .order('name');

      if (d) setDistricts(d);
      if (b) setBranches(b);
    };

    if (open) {
      fetchLocations();
    }
  }, [open]);

  const filteredBranches = newUserForm.districtId
    ? branches.filter((b) => b.district_id === newUserForm.districtId)
    : branches;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Only require branch for non-district roles
    if (!showDistrictSelector && !newUserForm.branchId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a branch',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Require district for district roles
    if (showDistrictSelector && !newUserForm.districtId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a district for this role',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('You must be logged in to perform this action.');
      }

      const { data, error } = await supabase.functions.invoke('admin-create-member', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'insert',
          data: {
            full_name: `${newUserForm.firstName} ${newUserForm.lastName}`,
            email: newUserForm.email,
            phone: newUserForm.phone || 'N/A',
            status: 'active',
            createAccount: true,
            username: newUserForm.email,
            password: newUserForm.password,
            role: newUserForm.role,
            branch_id: newUserForm.branchId || null,
            district_id: showDistrictSelector ? newUserForm.districtId : null,
            // Defaults for required fields
            gender: 'Male',
            marital_status: 'Single',
            membership_level: 'Member',
            street: 'N/A',
            area: 'N/A',
            community: 'N/A',
          },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Audit log (best-effort)
      try {
        const userId = session.user.id;
        await supabase.from('audit_logs').insert({
          user_id: userId,
          action: 'CREATE_USER',
          table_name: 'profiles',
          record_id: null,
          details: {
            email: newUserForm.email,
            role: newUserForm.role,
            branch_id: newUserForm.branchId,
          },
        });
      } catch (e) {
        console.warn('Audit log insert failed:', e);
      }

      toast({
        title: 'Success',
        description: `User ${newUserForm.firstName} created successfully`,
      });

      onOpenChange(false);
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'member',
        districtId: '',
        branchId: '',
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account and associated member profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={newUserForm.firstName}
                onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={newUserForm.lastName}
                onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Password *</Label>
            <Input
              type="password"
              value={newUserForm.password}
              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>District {showDistrictSelector ? '*' : ''}</Label>
              <Select
                value={newUserForm.districtId}
                onValueChange={(val) =>
                  setNewUserForm({ ...newUserForm, districtId: val, branchId: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Branch {showDistrictSelector ? '' : '*'}</Label>
              <Select
                value={newUserForm.branchId}
                onValueChange={(val) => setNewUserForm({ ...newUserForm, branchId: val })}
                disabled={showDistrictSelector && !newUserForm.districtId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Role</Label>
            <Select
              value={newUserForm.role}
              onValueChange={(val) => setNewUserForm({ ...newUserForm, role: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
                <SelectItem value="admin">Branch Admin</SelectItem>
                <SelectItem value="district_admin">District Admin</SelectItem>
                <SelectItem value="district_overseer">District Overseer</SelectItem>
                <SelectItem value="general_overseer">General Overseer</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
