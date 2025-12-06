import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus, Edit, Trash2, Users, MapPin, Phone, UserCog, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminContext } from '@/context/AdminContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  pastor_name: string | null;
  is_main: boolean;
  created_at: string;
}

interface Member {
  id: string;
  full_name: string;
  email: string | null;
}

/**
 * Multi-Branch Management Module for Superadmin
 * Allows creating branches, assigning admins, pastors, and workers
 */
export const MultiBranchManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedBranchId } = useAdminContext();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Form states for new branch
  const [newBranch, setNewBranch] = useState({
    name: '',
    slug: '',
    address: '',
    phone: '',
    pastor_name: '',
  });

  // Assignment states
  const [assignmentData, setAssignmentData] = useState({
    branchId: '',
    memberId: '',
    role: 'admin' as 'admin' | 'pastor' | 'leader' | 'worker',
  });

  useEffect(() => {
    fetchBranches();
    fetchMembers();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('church_branches')
        .select('*')
        .order('is_main', { ascending: false })
        .order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('church_branches')
        .insert([
          {
            name: newBranch.name,
            slug: newBranch.slug,
            address: newBranch.address,
            phone: newBranch.phone || null,
            pastor_name: newBranch.pastor_name || null,
            is_main: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Branch "${newBranch.name}" created successfully`,
      });

      setIsCreateOpen(false);
      setNewBranch({ name: '', slug: '', address: '', phone: '', pastor_name: '' });
      fetchBranches();
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create branch',
        variant: 'destructive',
      });
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('user_roles').insert([
        {
          user_id: assignmentData.memberId,
          role: assignmentData.role,
          branch_id: assignmentData.branchId,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });

      setIsAssignOpen(false);
      setAssignmentData({ branchId: '', memberId: '', role: 'admin' });
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (
      !confirm(`Are you sure you want to delete "${branchName}"? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      const { error } = await supabase.from('church_branches').delete().eq('id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Branch "${branchName}" deleted successfully`,
      });

      fetchBranches();
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete branch',
        variant: 'destructive',
      });
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setNewBranch((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            Multi-Branch Management
          </h2>
          <p className="text-gray-600 mt-1">Create and manage church branches across the network</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCog className="mr-2 h-4 w-4" />
                Assign Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to Branch</DialogTitle>
                <DialogDescription>
                  Assign an admin, pastor, or worker to a specific branch
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={assignmentData.branchId}
                    onValueChange={(value) =>
                      setAssignmentData((prev) => ({ ...prev, branchId: value }))
                    }
                  >
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

                <div>
                  <Label htmlFor="member">Member</Label>
                  <Select
                    value={assignmentData.memberId}
                    onValueChange={(value) =>
                      setAssignmentData((prev) => ({ ...prev, memberId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={assignmentData.role}
                    onValueChange={(value: any) =>
                      setAssignmentData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Branch Admin</SelectItem>
                      <SelectItem value="pastor">Pastor</SelectItem>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Assign Role</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogDescription>Add a new church branch to the network</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBranch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Branch Name *</Label>
                    <Input
                      id="name"
                      value={newBranch.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., North Campus"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={newBranch.slug}
                      onChange={(e) => setNewBranch((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g., north-campus"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated from name</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    placeholder="Full branch address"
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newBranch.phone}
                      onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pastor">Pastor Name</Label>
                    <Input
                      id="pastor"
                      value={newBranch.pastor_name}
                      onChange={(e) => setNewBranch({ ...newBranch, pastor_name: e.target.value })}
                      placeholder="Pastor's name"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Branch</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Branch Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Main Branch</p>
                <p className="text-2xl font-bold">{branches.filter((b) => b.is_main).length}</p>
              </div>
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className={branch.is_main ? 'border-amber-400 border-2' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {branch.name}
                    {branch.is_main && (
                      <Badge variant="default" className="bg-amber-500">
                        Main
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {branch.slug}
                    </span>
                  </CardDescription>
                </div>
                {!branch.is_main && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedBranch(branch)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBranch(branch.id, branch.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{branch.address}</span>
              </div>
              {branch.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{branch.phone}</span>
                </div>
              )}
              {branch.pastor_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{branch.pastor_name}</span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setAssignmentData((prev) => ({ ...prev, branchId: branch.id }));
                    setIsAssignOpen(true);
                  }}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Assign Staff
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    navigate('/admin');
                  }}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Manage Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches yet</h3>
            <p className="text-gray-600 mb-4">Create your first branch to get started</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Branch
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
