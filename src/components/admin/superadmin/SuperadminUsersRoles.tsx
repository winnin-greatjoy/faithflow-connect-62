import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Shield,
  Search,
  Plus,
  Trash2,
  Building,
  Loader2,
  UserCog,
  Crown,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { MemberForm, MemberFormData } from '@/components/admin/MemberForm';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  branch_id: string | null;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  branch?: {
    name: string;
  };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string | null;
  email?: string;
}

interface Branch {
  id: string;
  name: string;
}

export const SuperadminUsersRoles: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  const [assignForm, setAssignForm] = useState({
    userId: '',
    role: 'member' as string,
    branchId: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, profilesRes, branchesRes] = await Promise.all([
        supabase.from('user_roles').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, first_name, last_name, role').order('first_name'),
        supabase.from('church_branches').select('id, name').order('name'),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (branchesRes.error) throw branchesRes.error;

      // Enrich roles with profile and branch info
      const enrichedRoles = (rolesRes.data || []).map((role) => {
        const profile = (profilesRes.data as any)?.find((p: any) => p.id === role.user_id);
        const branch = branchesRes.data?.find((b) => b.id === role.branch_id);
        return {
          ...role,
          profile: profile
            ? {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email,
            }
            : undefined,
          branch: branch ? { name: branch.name } : undefined,
        };
      });

      setUserRoles(enrichedRoles);
      setProfiles((profilesRes.data as unknown as Profile[]) || []);
      setBranches(branchesRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load user roles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetCredentials = async (email: string) => {
    if (!confirm(`Are you sure you want to send a password reset email to ${email}?`)) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'RESET_PASSWORD',
        resource: 'auth',
        details: `Sent password reset email to ${email}`,
        severity: 'info',
      });

      toast({ title: 'Success', description: 'Reset email sent successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('user_roles').insert([
        {
          user_id: assignForm.userId,
          role: assignForm.role as any,
          branch_id:
            assignForm.branchId === 'global' || !assignForm.branchId ? null : assignForm.branchId,
        },
      ]);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'ASSIGN_ROLE',
        resource: 'user_roles',
        details: `Assigned role ${assignForm.role} to user ${assignForm.userId}`,
        severity: 'warning',
      });

      toast({ title: 'Success', description: 'Role assigned successfully' });
      setIsAssignOpen(false);
      setAssignForm({ userId: '', role: 'member', branchId: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to revoke this role assignment?')) return;

    try {
      const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'REVOKE_ROLE',
        resource: 'user_roles',
        details: `Revoked role assignment ${roleId}`,
        severity: 'warning',
      });

      toast({ title: 'Success', description: 'Role revoked successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke role',
        variant: 'destructive',
      });
    }
  };

  // Handler for creating a new admin via MemberForm
  const handleCreateAdmin = async (formData: MemberFormData) => {
    try {
      // Call the member-operations Edge Function to create member with admin role
      const { data, error } = await supabase.functions.invoke('member-operations', {
        body: {
          operation: 'create',
          data: {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender,
            marital_status: formData.maritalStatus,
            branch_id: formData.branchId || null,
            membership_level: 'baptized', // Admins should be baptized members
            createAccount: true,
            username: formData.email, // Use email as username
            password: formData.password || 'TemporaryPassword123!', // Edge Function should handle this
            // Admin role data
            assignAdminRole: formData.assignAdminRole,
            adminRole: formData.adminRole,
            adminBranchId: formData.adminBranchId,
            adminDistrictId: formData.adminDistrictId,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Admin created successfully. ${formData.assignAdminRole ? 'Admin role assigned.' : ''}`,
      });

      setIsCreateAdminOpen(false);
      fetchData(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create admin',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      district_admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      admin: 'bg-blue-100 text-blue-800 border-blue-200',
      pastor: 'bg-green-100 text-green-800 border-green-200',
      leader: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      worker: 'bg-orange-100 text-orange-800 border-orange-200',
      member: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return classes[role] || classes.member;
  };

  const filteredRoles = userRoles.filter((ur) => {
    const fullName = ur.profile
      ? `${ur.profile.first_name} ${ur.profile.last_name}`.toLowerCase()
      : '';
    const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || ur.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: userRoles.length,
    superAdmins: userRoles.filter((r) => r.role === 'super_admin').length,
    districtAdmins: userRoles.filter((r) => r.role === 'district_admin').length,
    branchAdmins: userRoles.filter((r) => r.role === 'admin').length,
    pastors: userRoles.filter((r) => r.role === 'pastor').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7" />
            Users & Roles
          </h1>
          <p className="text-muted-foreground mt-1">System-wide user registry and access control</p>
        </div>

        <div className="flex gap-2">
          {/* Create New Admin Button */}
          <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Create a new member with administrative privileges
                </DialogDescription>
              </DialogHeader>
              <MemberForm
                onSubmit={handleCreateAdmin}
                onCancel={() => setIsCreateAdminOpen(false)}
                showAdminRoleSelector={true}
              />
            </DialogContent>
          </Dialog>

          {/* Promote Existing Member Button */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Promote Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>
                  Grant a role to a user, optionally scoped to a branch
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <Label>User *</Label>
                  <Select
                    value={assignForm.userId}
                    onValueChange={(v) => setAssignForm({ ...assignForm, userId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.first_name} {p.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Role *</Label>
                  <Select
                    value={assignForm.role}
                    onValueChange={(v) => setAssignForm({ ...assignForm, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="district_admin">District Admin</SelectItem>
                      <SelectItem value="admin">Branch Admin</SelectItem>
                      <SelectItem value="pastor">Pastor</SelectItem>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Branch (optional)</Label>
                  <Select
                    value={assignForm.branchId}
                    onValueChange={(v) => setAssignForm({ ...assignForm, branchId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Global (no branch)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (no branch)</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Assign Role</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Assignments</p>
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
              <div className="text-2xl font-bold text-indigo-600">{stats.districtAdmins}</div>
              <p className="text-xs text-muted-foreground">District Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.branchAdmins}</div>
              <p className="text-xs text-muted-foreground">Branch Admins</p>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="district_admin">District Admin</SelectItem>
                  <SelectItem value="admin">Branch Admin</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Role Assignments ({filteredRoles.length})</CardTitle>
            <CardDescription>Manage user roles across all branches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch Scope</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No role assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((ur) => (
                      <TableRow key={ur.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {ur.role === 'super_admin' ? (
                                <Crown className="h-4 w-4 text-purple-600" />
                              ) : (
                                <UserCog className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {ur.profile
                                  ? `${ur.profile.first_name} ${ur.profile.last_name}`
                                  : 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ur.profile?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeClass(ur.role)}>
                            {ur.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ur.branch ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Building className="h-3.5 w-3.5 text-muted-foreground" />
                              {ur.branch.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">Global</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ur.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Reset Password"
                              onClick={() =>
                                ur.profile?.email && handleResetCredentials(ur.profile.email)
                              }
                              disabled={!ur.profile?.email}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRevokeRole(ur.id)}
                              className="text-destructive hover:text-destructive"
                              title="Revoke Role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      );
};
