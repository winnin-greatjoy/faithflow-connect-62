import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Shield, Search, Plus, Edit, Trash2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  user_id: string;
  role: string;
  branch_id: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  branch?: {
    name: string;
  };
}

/**
 * Global Role Management - Superadmin Only
 * Manage user roles across all branches
 */
export const GlobalRoleManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Assign role form
  const [assignForm, setAssignForm] = useState({
    userEmail: '',
    role: 'member' as 'super_admin' | 'admin' | 'pastor' | 'leader' | 'worker' | 'member',
    branchId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUserRoles(), fetchBranches()]);
    setLoading(false);
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(
          `
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get branch names separately
      const rolesWithBranches = await Promise.all(
        (data || []).map(async (role: any) => {
          if (role.branch_id) {
            const { data: branch } = await supabase
              .from('church_branches')
              .select('name')
              .eq('id', role.branch_id)
              .single();
            return { ...role, branch };
          }
          return role;
        })
      );

      setUserRoles(rolesWithBranches as any);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user roles',
        variant: 'destructive',
      });
    }
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase.from('church_branches').select('*').order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get user by email
      const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
        .select('id')
        .eq('email', assignForm.userEmail)
        .single();

      if (profileError || !profile) {
        throw new Error('User not found with that email');
      }

      // Insert role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: profile.id,
        role: assignForm.role,
        branch_id: assignForm.branchId,
      } as any);

      if (roleError) throw roleError;

      // Update profile role if higher privilege
      if (['super_admin', 'admin', 'pastor'].includes(assignForm.role)) {
        await supabase.from('profiles').update({ role: assignForm.role }).eq('id', profile.id);
      }

      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });

      setIsAssignDialogOpen(false);
      setAssignForm({ userEmail: '', role: 'member', branchId: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeRole = async (userId: string, role: string, branchId: string) => {
    if (!confirm('Are you sure you want to revoke this role?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any)
        .eq('branch_id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role revoked successfully',
      });

      fetchData();
    } catch (error: any) {
      console.error('Error revoking role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke role',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      pastor: 'bg-green-100 text-green-800',
      leader: 'bg-yellow-100 text-yellow-800',
      worker: 'bg-orange-100 text-orange-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.member;
  };

  const filteredRoles = userRoles.filter((userRole) => {
    const fullName = userRole.profiles 
      ? `${userRole.profiles.first_name} ${userRole.profiles.last_name}`.toLowerCase()
      : '';
    const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userRole.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: userRoles.length,
    superAdmins: userRoles.filter((r) => r.role === 'super_admin').length,
    admins: userRoles.filter((r) => r.role === 'admin').length,
    pastors: userRoles.filter((r) => r.role === 'pastor').length,
  };

  if (loading) {
    return <div className="p-6">Loading role management...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7" />
            Global Role Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage user roles across all branches (Superadmin Only)
          </p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to User</DialogTitle>
              <DialogDescription>Grant a role to a user for a specific branch</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <Label>User Email *</Label>
                <Input
                  type="email"
                  value={assignForm.userEmail}
                  onChange={(e) => setAssignForm({ ...assignForm, userEmail: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <Label>Role *</Label>
                <Select
                  value={assignForm.role}
                  onValueChange={(value: any) => setAssignForm({ ...assignForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Branch *</Label>
                <Select
                  value={assignForm.branchId}
                  onValueChange={(value) => setAssignForm({ ...assignForm, branchId: value })}
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

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Assign Role</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Role Assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.superAdmins}</div>
            <p className="text-xs text-muted-foreground">Super Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.pastors}</div>
            <p className="text-xs text-muted-foreground">Pastors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Assignments</CardTitle>
          <CardDescription>Manage roles for all users across all branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRoles.map((userRole) => (
              <div
                key={`${userRole.user_id}-${userRole.role}-${userRole.branch_id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {userRole.profiles 
                          ? `${userRole.profiles.first_name} ${userRole.profiles.last_name}` 
                          : 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        User ID: {userRole.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={getRoleBadgeColor(userRole.role)}>
                      {userRole.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Building className="h-3 w-3" />
                      {userRole.branch?.name || 'Unknown Branch'}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleRevokeRole(userRole.user_id, userRole.role, userRole.branch_id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No role assignments found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
