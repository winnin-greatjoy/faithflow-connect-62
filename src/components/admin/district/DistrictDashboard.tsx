import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuthz } from '@/hooks/useAuthz';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, Activity, Plus, MapPin, UserCog } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface District {
  id: string;
  name: string;
  head_admin_id: string | null;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  pastor_name: string | null;
  created_at: string;
  is_district_hq: boolean;
}

interface MemberOption {
  id: string;
  full_name: string;
}

export const DistrictDashboard: React.FC = () => {
  const { user } = useAuth(); // Correct hook for user
  const { hasRole } = useAuthz(); // Keep for role checks if needed, though not strictly used in this snippet yet
  const { toast } = useToast();
  const [district, setDistrict] = useState<District | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [potentialAssignees, setPotentialAssignees] = useState<MemberOption[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBranches: 0,
    totalDepartments: 0,
  });
  const [loading, setLoading] = useState(true);

  // Create Branch State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBranchData, setNewBranchData] = useState({
    name: '',
    address: '',
    slug: '',
    phone: '',
  });

  // Assign Role State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    branchId: '',
    memberId: '',
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
        return; // Not a district admin or no district assigned
      }

      setDistrict(districtData);

      // 2. Fetch branches in this district
      const { data: branchesData, error: branchError } = await supabase
        .from('church_branches')
        .select('*')
        .eq('district_id', districtData.id)
        .order('name');

      if (branchError) throw branchError;
      setBranches(branchesData as Branch[]);

      // 3. Fetch aggregated stats (approximate for performance)
      // Count members in these branches
      const branchIds = branchesData.map((b) => b.id); // array of UUIDs
      let memberCount = 0;
      let deptCount = 0;

      if (branchIds.length > 0) {
        // We can't do .in() with potentially empty array easily in one go if list is huge,
        // but for a district it should be fine.
        const { count: mCount } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .in('branch_id', branchIds);
        memberCount = mCount || 0;

        const { count: dCount } = await supabase
          .from('departments')
          .select('*', { count: 'exact', head: true })
          .in('branch_id', branchIds);
        deptCount = dCount || 0;

        // Fetch members for assignment (limit to 100 for performance or logic to search)
        // Assuming we want to assign people ALREADY in these branches to admin roles
        const { data: membersData } = await supabase
          .from('members')
          .select('id, full_name')
          .in('branch_id', branchIds)
          .eq('status', 'active')
          .order('full_name')
          .limit(500);

        setPotentialAssignees(membersData || []);
      }

      setStats({
        totalMembers: memberCount,
        totalBranches: branchesData.length,
        totalDepartments: deptCount,
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

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district) return;

    try {
      // Auto-generate slug if empty
      const slug =
        newBranchData.slug ||
        newBranchData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const { error } = await supabase.from('church_branches').insert([
        {
          name: newBranchData.name,
          address: newBranchData.address,
          phone: newBranchData.phone || null,
          slug: slug,
          district_id: district.id,
          branch_type: 'local', // defaulting to local
          parent_id: branches.find((b) => b.is_district_hq)?.id || null, // Parent is the District HQ if exists? Or null?
          // Requirement says "Assign existing and new branches to specific districts".
          // Hierarchy usually implies parent_id. If this district has an HQ, set it as parent.
        },
      ]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch created successfully' });
      setIsCreateOpen(false);
      setNewBranchData({ name: '', address: '', slug: '', phone: '' });
      fetchDistrictData(); // Refresh list
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processAssign()) return;
  };

  // Extracted logic to avoid async promise void return issue in event handler if strict
  const processAssign = async () => {
    try {
      // Note: user_roles usually links to auth.users (user_id).
      // 'members' table has 'id' as UUID?
      // In typical setup, members.id might NOT be auth.users.id unless synced.
      // If members are just records, we can't assign 'user_roles' to them unless they have an account.
      // For this implementation, we assume member.id corresponds to a user_id or we have a way to look it up.
      // But 'members' table usually has 'user_id' generic foreign key if linked.
      // Let's assume for now Member ID is what we use, or better:
      // Does 'members' table have 'user_id' column linked to auth.users?
      // If not, we can only assign roles to profiles/users.
      // The existing MultiBranchManagement fetches from 'members' table: select('id, full_name, email').
      // And inserts into 'user_roles' with user_id: assignmentData.memberId.
      // This implies member.id IS valid for user_roles.user_id (which is uuid referencing auth.users).

      const { error } = await supabase.from('user_roles').insert([
        {
          user_id: assignmentData.memberId,
          role: assignmentData.role,
          branch_id: assignmentData.branchId,
        },
      ]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Role assigned successfully' });
      setIsAssignOpen(false);
      setAssignmentData({ branchId: '', memberId: '', role: 'admin' });
      return true;
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
      return false;
    }
  };

  const openAssignDialog = (branchId: string) => {
    setAssignmentData((prev) => ({ ...prev, branchId }));
    setIsAssignOpen(true);
  };

  if (loading) return <div>Loading dashboard...</div>;

  if (!district) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
        <h2 className="text-xl font-semibold mb-2">No District Assigned</h2>
        <p className="text-muted-foreground">
          You are logged in as a District Admin but no district is linked to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{district.name} Dashboard</h1>
        <p className="text-muted-foreground">District Overview & Management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
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
      </div>

      {/* Branches Management */}
      <div className="space-y-4">
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
                <DialogTitle>Create New Local Branch</DialogTitle>
                <DialogDescription>Add a new branch to {district.name}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBranch} className="space-y-4">
                <div>
                  <Label>Branch Name *</Label>
                  <Input
                    value={newBranchData.name}
                    onChange={(e) => setNewBranchData({ ...newBranchData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Address *</Label>
                  <Textarea
                    value={newBranchData.address}
                    onChange={(e) =>
                      setNewBranchData({ ...newBranchData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newBranchData.phone}
                    onChange={(e) => setNewBranchData({ ...newBranchData, phone: e.target.value })}
                  />
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
              className={branch.is_district_hq ? 'border-blue-200 bg-blue-50/20' : ''}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                  {branch.is_district_hq && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      HQ
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {branch.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mt-2 mb-4">
                  Pastor: {branch.pastor_name || 'Unassigned'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openAssignDialog(branch.id)}
                >
                  <UserCog className="mr-2 h-4 w-4" /> Assign Staff
                </Button>
              </CardContent>
            </Card>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
              No branches in this district yet.
            </div>
          )}
        </div>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to Branch</DialogTitle>
            <DialogDescription>Assign an admin, pastor, or worker to this branch</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignRole} className="space-y-4">
            <div>
              <Label htmlFor="member">Select Member</Label>
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
                  {potentialAssignees.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                  {potentialAssignees.length === 0 && (
                    <div className="p-2 text-sm text-muted">No eligible members found</div>
                  )}
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
    </div>
  );
};
