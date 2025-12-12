import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus, Edit, Trash2, Users, MapPin, Phone, UserCog, Shield, Network } from 'lucide-react';
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

type BranchType = 'main_hq' | 'district_hq' | 'local';

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  pastor_name: string | null;
  is_main: boolean;
  branch_type: BranchType;
  parent_id: string | null;
  district_name: string | null;
  created_at: string;
}

interface Member {
  id: string;
  full_name: string;
  email: string | null;
}

interface BranchFormData {
  name: string;
  slug: string;
  address: string;
  phone: string;
  pastor_name: string;
  branch_type: BranchType;
  parent_id: string;
  district_name: string;
}

const defaultBranchForm: BranchFormData = {
  name: '',
  slug: '',
  address: '',
  phone: '',
  pastor_name: '',
  branch_type: 'local',
  parent_id: '',
  district_name: '',
};

/**
 * Multi-Branch Management Module for Superadmin
 * Supports hierarchical structure: Main HQ > District HQs > Local Branches
 */
export const MultiBranchManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedBranchId } = useAdminContext();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Form states
  const [branchForm, setBranchForm] = useState<BranchFormData>(defaultBranchForm);

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
        .order('branch_type')
        .order('name');

      if (error) throw error;
      setBranches((data as Branch[]) || []);
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

  // Get district HQ branches for parent selection
  const districtHQs = branches.filter(b => b.branch_type === 'district_hq');

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('church_branches')
        .insert([
          {
            name: branchForm.name,
            slug: branchForm.slug,
            address: branchForm.address,
            phone: branchForm.phone || null,
            pastor_name: branchForm.pastor_name || null,
            is_main: branchForm.branch_type === 'main_hq',
            branch_type: branchForm.branch_type,
            parent_id: branchForm.parent_id || null,
            district_name: branchForm.branch_type === 'district_hq' ? branchForm.district_name : null,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Branch "${branchForm.name}" created successfully`,
      });

      setIsCreateOpen(false);
      setBranchForm(defaultBranchForm);
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

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    try {
      const { error } = await supabase
        .from('church_branches')
        .update({
          name: branchForm.name,
          slug: branchForm.slug,
          address: branchForm.address,
          phone: branchForm.phone || null,
          pastor_name: branchForm.pastor_name || null,
          branch_type: branchForm.branch_type,
          parent_id: branchForm.parent_id || null,
          district_name: branchForm.branch_type === 'district_hq' ? branchForm.district_name : null,
        })
        .eq('id', selectedBranch.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Branch "${branchForm.name}" updated successfully`,
      });

      setIsEditOpen(false);
      setSelectedBranch(null);
      setBranchForm(defaultBranchForm);
      fetchBranches();
    } catch (error: any) {
      console.error('Error updating branch:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update branch',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setBranchForm({
      name: branch.name,
      slug: branch.slug,
      address: branch.address,
      phone: branch.phone || '',
      pastor_name: branch.pastor_name || '',
      branch_type: branch.branch_type,
      parent_id: branch.parent_id || '',
      district_name: branch.district_name || '',
    });
    setIsEditOpen(true);
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
    setBranchForm((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  const getBranchTypeBadge = (type: BranchType) => {
    switch (type) {
      case 'main_hq':
        return <Badge className="bg-amber-500">Main HQ</Badge>;
      case 'district_hq':
        return <Badge className="bg-blue-500">District HQ</Badge>;
      default:
        return <Badge variant="secondary">Local</Badge>;
    }
  };

  const getParentBranchName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = branches.find(b => b.id === parentId);
    return parent?.name || 'Unknown';
  };

  // Group branches by hierarchy
  const mainHQ = branches.find(b => b.branch_type === 'main_hq');
  const districtBranches = branches.filter(b => b.branch_type === 'district_hq');
  const localBranches = branches.filter(b => b.branch_type === 'local');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading branches...</div>
      </div>
    );
  }

  const BranchFormFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Branch Name *</Label>
          <Input
            id="name"
            value={branchForm.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., North Campus"
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={branchForm.slug}
            onChange={(e) => setBranchForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="e.g., north-campus"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-generated from name</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="branch_type">Branch Type *</Label>
          <Select
            value={branchForm.branch_type}
            onValueChange={(value: BranchType) => setBranchForm((prev) => ({ ...prev, branch_type: value, parent_id: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main_hq">Main HQ (Central Administration)</SelectItem>
              <SelectItem value="district_hq">District HQ</SelectItem>
              <SelectItem value="local">Local Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {branchForm.branch_type === 'district_hq' && (
          <div>
            <Label htmlFor="district_name">District Name *</Label>
            <Input
              id="district_name"
              value={branchForm.district_name}
              onChange={(e) => setBranchForm((prev) => ({ ...prev, district_name: e.target.value }))}
              placeholder="e.g., Northern District"
              required
            />
          </div>
        )}

        {branchForm.branch_type === 'local' && (
          <div>
            <Label htmlFor="parent_id">District HQ *</Label>
            <Select
              value={branchForm.parent_id}
              onValueChange={(value) => setBranchForm((prev) => ({ ...prev, parent_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {districtHQs.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.district_name || district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={branchForm.address}
          onChange={(e) => setBranchForm((prev) => ({ ...prev, address: e.target.value }))}
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
            value={branchForm.phone}
            onChange={(e) => setBranchForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="pastor">Pastor Name</Label>
          <Input
            id="pastor"
            value={branchForm.pastor_name}
            onChange={(e) => setBranchForm((prev) => ({ ...prev, pastor_name: e.target.value }))}
            placeholder="Pastor's name"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            Multi-Branch Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage church branches with district hierarchy</p>
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

          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setBranchForm(defaultBranchForm);
          }}>
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
                <BranchFormFields />
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

      {/* Edit Branch Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setSelectedBranch(null);
          setBranchForm(defaultBranchForm);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBranch} className="space-y-4">
            <BranchFormFields />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Branch</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Branch Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Main HQ</p>
                <p className="text-2xl font-bold">{mainHQ ? 1 : 0}</p>
              </div>
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Districts</p>
                <p className="text-2xl font-bold">{districtBranches.length}</p>
              </div>
              <Network className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Local Branches</p>
                <p className="text-2xl font-bold">{localBranches.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main HQ */}
      {mainHQ && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Central Administration
          </h3>
          <Card className="border-amber-400 border-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {mainHQ.name}
                    {getBranchTypeBadge(mainHQ.branch_type)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                      {mainHQ.slug}
                    </span>
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(mainHQ)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{mainHQ.address}</span>
              </div>
              {mainHQ.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{mainHQ.phone}</span>
                </div>
              )}
              {mainHQ.pastor_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{mainHQ.pastor_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* District HQs and their branches */}
      {districtBranches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            Districts
          </h3>
          {districtBranches.map((district) => {
            const childBranches = localBranches.filter(b => b.parent_id === district.id);
            return (
              <div key={district.id} className="space-y-3">
                <Card className="border-blue-400 border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {district.district_name || district.name}
                          {getBranchTypeBadge(district.branch_type)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          HQ: {district.name} • {childBranches.length} local branches
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(district)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBranch(district.id, district.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{district.address}</span>
                    </div>
                    {district.pastor_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{district.pastor_name}</span>
                      </div>
                    )}
                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAssignmentData((prev) => ({ ...prev, branchId: district.id }));
                          setIsAssignOpen(true);
                        }}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Assign Staff
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedBranchId(district.id);
                          navigate('/admin');
                        }}
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Local branches under this district */}
                {childBranches.length > 0 && (
                  <div className="ml-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {childBranches.map((branch) => (
                      <Card key={branch.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{branch.name}</CardTitle>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(branch)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteBranch(branch.id, branch.name)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-start gap-2 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{branch.address}</span>
                          </div>
                          {branch.pastor_name && (
                            <div className="flex items-center gap-2 text-xs">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{branch.pastor_name}</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setSelectedBranchId(branch.id);
                              navigate('/admin');
                            }}
                          >
                            Manage
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned local branches (no parent) */}
      {localBranches.filter(b => !b.parent_id).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Unassigned Branches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localBranches.filter(b => !b.parent_id).map((branch) => (
              <Card key={branch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {branch.name}
                        {getBranchTypeBadge(branch.branch_type)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          {branch.slug}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(branch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBranch(branch.id, branch.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{branch.phone}</span>
                    </div>
                  )}
                  {branch.pastor_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{branch.pastor_name}</span>
                    </div>
                  )}
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
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
                      className="flex-1"
                      onClick={() => {
                        setSelectedBranchId(branch.id);
                        navigate('/admin');
                      }}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {branches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No branches yet</h3>
            <p className="text-muted-foreground mb-4">Create your first branch to get started</p>
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
