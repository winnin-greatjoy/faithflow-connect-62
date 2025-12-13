import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Phone,
  UserCog,
  Shield,
  Network,
} from 'lucide-react';
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
  district_id: string | null;
  is_district_hq: boolean;
  created_at: string;
}

interface Member {
  id: string;
  full_name: string;
  email: string | null;
}

interface MultiBranchViewProps {
  districtId?: string; // Optional: if provided, filters by this district
  defaultDistrictName?: string; // Optional: name of the district for labeling
  filterType?: 'all' | 'by_district' | 'unassigned';
  allDistricts?: { id: string; name: string }[];
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
  district_id: string;
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
  district_id: '',
};

interface BranchFormFieldsProps {
  branchForm: BranchFormData;
  setBranchForm: React.Dispatch<React.SetStateAction<BranchFormData>>;
  handleNameChange: (name: string) => void;
  districtId?: string;
  mainHQ?: Branch;
  districtHQs: Branch[];
  allDistricts?: { id: string; name: string }[];
}

const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  branchForm,
  setBranchForm,
  handleNameChange,
  districtId,
  mainHQ,
  districtHQs,
  allDistricts,
}) => {
  return (
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
            onValueChange={(value: BranchType) =>
              setBranchForm((prev) => ({ ...prev, branch_type: value, parent_id: '' }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {!districtId && <SelectItem value="main_hq">Main HQ</SelectItem>}
              {!districtId && <SelectItem value="district_hq">HQ</SelectItem>}
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Unified Parent District Selection */}
        {!districtId &&
          allDistricts &&
          allDistricts.length > 0 &&
          branchForm.branch_type !== 'main_hq' && (
            <div>
              <Label htmlFor="assign_district">Parent District</Label>
              <Select
                value={branchForm.district_id}
                onValueChange={(value) =>
                  setBranchForm((prev) => ({
                    ...prev,
                    district_id: value === 'none' ? '' : value,
                    district_name: allDistricts.find((d) => d.id === value)?.name || '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {allDistricts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        {branchForm.branch_type === 'district_hq' && !districtId && !allDistricts && (
          <div>
            <Label htmlFor="district_name">District Name *</Label>
            <Input
              id="district_name"
              value={branchForm.district_name}
              onChange={(e) =>
                setBranchForm((prev) => ({ ...prev, district_name: e.target.value }))
              }
              placeholder="e.g., Northern District"
              required
            />
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
};

export const MultiBranchView: React.FC<MultiBranchViewProps> = ({
  districtId,
  defaultDistrictName,
  filterType = 'all',
  allDistricts,
}) => {
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
  }, [districtId, filterType]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const query = supabase.from('church_branches').select('*').order('branch_type').order('name');

      const { data, error } = await query;

      if (error) throw error;

      let fetchedBranches = (data as Branch[]) || [];

      if (districtId) {
        fetchedBranches = fetchedBranches.filter((b) => b.district_id === districtId);
      } else if (filterType === 'unassigned') {
        fetchedBranches = fetchedBranches.filter((b) => !b.district_id);
      }

      setBranches(fetchedBranches);
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
  const districtHQs = branches.filter((b) => b.branch_type === 'district_hq');

  const handleSetHQ = async (branchId: string, currentStatus: boolean) => {
    if (!districtId) return;

    try {
      // If enabling HQ, disable others in this district first (assuming one HQ per district)
      if (!currentStatus) {
        const { error: resetError } = await supabase
          .from('church_branches')
          .update({ is_district_hq: false })
          .eq('district_id', districtId);

        if (resetError) throw resetError;
      }

      const { error } = await supabase
        .from('church_branches')
        .update({ is_district_hq: !currentStatus })
        .eq('id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `District HQ status ${!currentStatus ? 'assigned' : 'removed'}`,
      });

      fetchBranches();
    } catch (error: any) {
      console.error('Error setting HQ:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update HQ status',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        name: branchForm.name,
        slug: branchForm.slug,
        address: branchForm.address,
        phone: branchForm.phone || null,
        pastor_name: branchForm.pastor_name || null,
        is_main: branchForm.branch_type === 'main_hq',
        is_district_hq: branchForm.branch_type === 'district_hq',
        branch_type: branchForm.branch_type,
        parent_id: branchForm.parent_id || null,
        district_name: branchForm.branch_type === 'district_hq' ? branchForm.district_name : null,
      };

      if (districtId) {
        payload.district_id = districtId;
      } else if (branchForm.district_id) {
        payload.district_id = branchForm.district_id;
      }

      const { error } = await supabase.from('church_branches').insert([payload]);

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
      const payload: any = {
        name: branchForm.name,
        slug: branchForm.slug,
        address: branchForm.address,
        phone: branchForm.phone || null,
        pastor_name: branchForm.pastor_name || null,
        branch_type: branchForm.branch_type,
        parent_id: branchForm.parent_id || null,
        district_name: branchForm.branch_type === 'district_hq' ? branchForm.district_name : null,
      };

      // Allow updating district_id if provided from form
      if (branchForm.district_id) {
        payload.district_id = branchForm.district_id;
      } else if (!districtId && branchForm.district_id === '') {
        // Explicit unassign if selected "Unassigned" (value='') in global view
        payload.district_id = null;
      }

      const { error } = await supabase
        .from('church_branches')
        .update(payload)
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
      district_id: branch.district_id || '',
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

  const mainHQ = branches.find((b) => b.branch_type === 'main_hq');
  const districtBranches = branches.filter((b) => b.branch_type === 'district_hq');
  const localBranches = branches.filter((b) => b.branch_type === 'local');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {!districtId && (
            <>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building className="h-6 w-6" />
                Multi-Branch Management
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage church branches with district hierarchy
              </p>
            </>
          )}
          {districtId && (
            <h3 className="text-lg font-semibold">Branches in {defaultDistrictName}</h3>
          )}
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

          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) setBranchForm(defaultBranchForm);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogDescription>
                  Add a new church branch{' '}
                  {districtId ? `to ${defaultDistrictName}` : 'to the network'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBranch} className="space-y-4">
                <BranchFormFields
                  branchForm={branchForm}
                  setBranchForm={setBranchForm}
                  handleNameChange={handleNameChange}
                  districtId={districtId}
                  mainHQ={mainHQ}
                  districtHQs={districtHQs}
                  allDistricts={allDistricts}
                />
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

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedBranch(null);
            setBranchForm(defaultBranchForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBranch} className="space-y-4">
            <BranchFormFields
              branchForm={branchForm}
              setBranchForm={setBranchForm}
              handleNameChange={handleNameChange}
              districtId={districtId}
              mainHQ={mainHQ}
              districtHQs={districtHQs}
              allDistricts={allDistricts}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Branch</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
        {!districtId && (
          <>
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
          </>
        )}
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

      {mainHQ && !districtId && (
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

      {districtId ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {branches.map((branch) => (
              <Card
                key={branch.id}
                className={
                  branch.district_id === districtId && branch.is_district_hq
                    ? 'border-primary border-2'
                    : ''
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(branch)}
                      >
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
                  <CardDescription>
                    {getBranchTypeBadge(branch.branch_type)}
                    {branch.is_district_hq && <Badge className="ml-2 bg-blue-600">HQ</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">{branch.address}</div>
                  {branch.pastor_name && (
                    <div className="text-sm text-muted-foreground">{branch.pastor_name}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {districtId && (
                      <Button
                        variant={branch.is_district_hq ? 'secondary' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => handleSetHQ(branch.id, !!branch.is_district_hq)}
                      >
                        {branch.is_district_hq ? 'Unset HQ' : 'Make HQ'}
                      </Button>
                    )}
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
                      Assign
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
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
      ) : (
        <>
          {districtBranches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-600" />
                Districts
              </h3>
              {districtBranches.map((district) => {
                const childBranches = localBranches.filter((b) => b.parent_id === district.id);
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(district)}
                            >
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

                    {childBranches.length > 0 && (
                      <div className="ml-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {childBranches.map((branch) => (
                          <Card key={branch.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{branch.name}</CardTitle>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditDialog(branch)}
                                  >
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
                              <div className="text-sm font-medium">{branch.address}</div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    setAssignmentData((prev) => ({ ...prev, branchId: branch.id }));
                                    setIsAssignOpen(true);
                                  }}
                                >
                                  Assign
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
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {localBranches.filter((b) => !b.parent_id).length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                Other Branches
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {localBranches
                  .filter((b) => !b.parent_id)
                  .map((branch) => (
                    <Card key={branch.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{branch.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(branch)}
                            >
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
                        <div className="text-sm font-medium">{branch.address}</div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setAssignmentData((prev) => ({ ...prev, branchId: branch.id }));
                              setIsAssignOpen(true);
                            }}
                          >
                            Assign
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
        </>
      )}
    </div>
  );
};
