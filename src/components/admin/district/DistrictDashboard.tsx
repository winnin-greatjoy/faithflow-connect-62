import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Users,
  Activity,
  Plus,
  MapPin,
  UserCog,
  Crown,
  Edit,
  Trash2,
  Phone,
  Shield,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface District {
  id: string;
  name: string;
  head_admin_id: string | null;
  location: string | null;
}

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  pastor_name: string | null;
  is_district_hq: boolean;
  created_at: string;
}

interface StaffAssignment {
  id: string;
  user_id: string;
  role: string;
  branch_id: string;
  branch_name?: string;
  user_name?: string;
  user_email?: string;
}

interface ProfileOption {
  id: string;
  full_name: string;
  email: string | null;
}

export const DistrictDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [district, setDistrict] = useState<District | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<ProfileOption[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBranches: 0,
    totalDepartments: 0,
    totalStaff: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('branches');

  // Create Branch State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    slug: '',
    phone: '',
    pastor_name: '',
  });

  // Assign Role State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    branchId: '',
    userId: '',
    role: 'admin' as 'admin' | 'pastor' | 'leader' | 'worker',
  });

  useEffect(() => {
    if (user?.id) {
      fetchDistrictData();
    }
  }, [user?.id]);

  const fetchDistrictData = async () => {
    setLoading(true);
    try {
      // 1. Find the district this user manages
      const { data: districtData, error: distError } = await supabase
        .from('districts')
        .select('*')
        .eq('head_admin_id', user?.id)
        .single();

      if (distError && distError.code !== 'PGRST116') throw distError;

      if (!districtData) {
        setLoading(false);
        return;
      }

      setDistrict(districtData);

      // 2. Fetch branches in this district
      const { data: branchesData, error: branchError } = await supabase
        .from('church_branches')
        .select('*')
        .eq('district_id', districtData.id)
        .order('is_district_hq', { ascending: false })
        .order('name');

      if (branchError) throw branchError;
      setBranches(branchesData as Branch[]);

      // 3. Fetch aggregated stats
      const branchIds = branchesData.map((b) => b.id);
      let memberCount = 0;
      let deptCount = 0;

      if (branchIds.length > 0) {
        const [membersRes, deptsRes] = await Promise.all([
          supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .in('branch_id', branchIds),
          supabase
            .from('departments')
            .select('*', { count: 'exact', head: true })
            .in('branch_id', branchIds),
        ]);

        memberCount = membersRes.count || 0;
        deptCount = deptsRes.count || 0;
      }

      // 4. Fetch staff assignments in district branches
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('id, user_id, role, branch_id')
        .in('branch_id', branchIds);

      // 5. Fetch profiles for assignment dropdown and to enrich staff list
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');

      const profileMap = new Map<string, string>();
      const profiles: ProfileOption[] = [];
      (profilesData || []).forEach((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.trim();
        profileMap.set(p.id, fullName);
        profiles.push({ id: p.id, full_name: fullName, email: null });
      });

      setAvailableProfiles(profiles);

      // Enrich staff assignments with names
      const enrichedStaff: StaffAssignment[] = (rolesData || []).map((r) => ({
        ...r,
        user_name: profileMap.get(r.user_id) || 'Unknown',
        branch_name: branchesData.find((b) => b.id === r.branch_id)?.name || 'Unknown',
      }));
      setStaffAssignments(enrichedStaff);

      setStats({
        totalMembers: memberCount,
        totalBranches: branchesData.length,
        totalDepartments: deptCount,
        totalStaff: enrichedStaff.length,
      });
    } catch (error: any) {
      console.error('Error loading district dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load district data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ================== Branch Operations ==================

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district) return;

    try {
      const slug =
        branchForm.slug ||
        branchForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const { error } = await supabase.from('church_branches').insert([
        {
          name: branchForm.name,
          address: branchForm.address,
          phone: branchForm.phone || null,
          pastor_name: branchForm.pastor_name || null,
          slug,
          district_id: district.id,
          branch_type: 'local',
          is_district_hq: false,
        },
      ]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch created successfully' });
      setIsCreateOpen(false);
      setBranchForm({ name: '', address: '', slug: '', phone: '', pastor_name: '' });
      fetchDistrictData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
          address: branchForm.address,
          phone: branchForm.phone || null,
          pastor_name: branchForm.pastor_name || null,
          slug: branchForm.slug,
        })
        .eq('id', selectedBranch.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch updated successfully' });
      setIsEditOpen(false);
      setSelectedBranch(null);
      setBranchForm({ name: '', address: '', slug: '', phone: '', pastor_name: '' });
      fetchDistrictData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const { error } = await supabase.from('church_branches').delete().eq('id', branchId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch deleted successfully' });
      fetchDistrictData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete branch',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setBranchForm({
      name: branch.name,
      address: branch.address,
      slug: branch.slug,
      phone: branch.phone || '',
      pastor_name: branch.pastor_name || '',
    });
    setIsEditOpen(true);
  };

  // ================== Set HQ Toggle ==================

  const handleSetHQ = async (branchId: string, currentStatus: boolean) => {
    if (!district) return;

    try {
      // If enabling HQ, first unset any existing HQ in this district
      if (!currentStatus) {
        const { error: resetError } = await supabase
          .from('church_branches')
          .update({ is_district_hq: false })
          .eq('district_id', district.id);

        if (resetError) throw resetError;
      }

      // Set or unset the selected branch
      const { error } = await supabase
        .from('church_branches')
        .update({ is_district_hq: !currentStatus })
        .eq('id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: !currentStatus
          ? 'Branch set as District HQ'
          : 'District HQ status removed',
      });
      fetchDistrictData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update HQ status',
        variant: 'destructive',
      });
    }
  };

  // ================== Staff Assignment ==================

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('user_roles').insert([
        {
          user_id: assignmentData.userId,
          role: assignmentData.role,
          branch_id: assignmentData.branchId,
        },
      ]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Role assigned successfully' });
      setIsAssignOpen(false);
      setAssignmentData({ branchId: '', userId: '', role: 'admin' });
      fetchDistrictData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveRole = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from('user_roles').delete().eq('id', assignmentId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Role removed successfully' });
      fetchDistrictData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive',
      });
    }
  };

  const openAssignDialog = (branchId?: string) => {
    setAssignmentData((prev) => ({ ...prev, branchId: branchId || '' }));
    setIsAssignOpen(true);
  };

  // ================== Render ==================

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="p-8 text-center bg-muted/20 rounded-lg border-2 border-dashed">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No District Assigned</h2>
        <p className="text-muted-foreground">
          You are logged in as a District Admin but no district is linked to your account.
        </p>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'pastor':
        return 'secondary';
      case 'leader':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            {district.name}
          </h1>
          <p className="text-muted-foreground">
            {district.location || 'District'} • District Administration
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="staff">Staff Assignments</TabsTrigger>
        </TabsList>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">District Branches</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Branch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Branch</DialogTitle>
                  <DialogDescription>Add a new local branch to {district.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBranch} className="space-y-4">
                  <div>
                    <Label>Branch Name *</Label>
                    <Input
                      value={branchForm.name}
                      onChange={(e) =>
                        setBranchForm({
                          ...branchForm,
                          name: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, ''),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={branchForm.slug}
                      onChange={(e) => setBranchForm({ ...branchForm, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Address *</Label>
                    <Textarea
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Pastor Name</Label>
                      <Input
                        value={branchForm.pastor_name}
                        onChange={(e) =>
                          setBranchForm({ ...branchForm, pastor_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Branch</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <Card
                key={branch.id}
                className={branch.is_district_hq ? 'border-primary/50 bg-primary/5' : ''}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {branch.name}
                        {branch.is_district_hq && (
                          <Badge variant="default" className="text-xs">
                            HQ
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {branch.address}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(branch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{branch.name}". This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" /> {branch.phone}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Pastor:</span>{' '}
                    {branch.pastor_name || 'Unassigned'}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`hq-${branch.id}`} className="text-sm cursor-pointer">
                        District HQ
                      </Label>
                      <Switch
                        id={`hq-${branch.id}`}
                        checked={branch.is_district_hq}
                        onCheckedChange={() => handleSetHQ(branch.id, branch.is_district_hq)}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openAssignDialog(branch.id)}>
                      <UserCog className="h-3 w-3 mr-1" /> Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {branches.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                No branches in this district yet.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Staff Assignments</h2>
            <Button onClick={() => openAssignDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Assign Role
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.user_name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(assignment.role)}>
                        {assignment.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{assignment.branch_name}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the {assignment.role} role from{' '}
                              {assignment.user_name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveRole(assignment.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {staffAssignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No staff assignments yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBranch} className="space-y-4">
            <div>
              <Label>Branch Name *</Label>
              <Input
                value={branchForm.name}
                onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={branchForm.slug}
                onChange={(e) => setBranchForm({ ...branchForm, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Address *</Label>
              <Textarea
                value={branchForm.address}
                onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Pastor Name</Label>
                <Input
                  value={branchForm.pastor_name}
                  onChange={(e) => setBranchForm({ ...branchForm, pastor_name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Assign a staff role to a branch</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignRole} className="space-y-4">
            <div>
              <Label>Branch *</Label>
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
                      {branch.name} {branch.is_district_hq && '(HQ)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>User *</Label>
              <Select
                value={assignmentData.userId}
                onValueChange={(value) =>
                  setAssignmentData((prev) => ({ ...prev, userId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Role *</Label>
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
              <Button
                type="submit"
                disabled={!assignmentData.branchId || !assignmentData.userId}
              >
                Assign Role
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
