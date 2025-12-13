import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  is_district_hq: boolean;
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

interface DistrictStaffProps {
  branches: Branch[];
  staffAssignments: StaffAssignment[];
  availableProfiles: ProfileOption[];
  onRefresh: () => void;
}

export const DistrictStaff: React.FC<DistrictStaffProps> = ({
  branches,
  staffAssignments,
  availableProfiles,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    branchId: '',
    userId: '',
    role: 'admin' as 'admin' | 'pastor' | 'leader' | 'worker',
  });

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
      onRefresh();
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
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive',
      });
    }
  };

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
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h3 className="text-lg font-medium">District Directory</h3>
          <p className="text-sm text-muted-foreground">
            Manage staff assignments across your branches.
          </p>
        </div>
        <Button onClick={() => setIsAssignOpen(true)}>
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
                  <Badge variant={getRoleBadgeVariant(assignment.role)}>{assignment.role}</Badge>
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
                          This will remove the {assignment.role} role from {assignment.user_name}.
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
                onValueChange={(value) => setAssignmentData((prev) => ({ ...prev, userId: value }))}
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
              <Button type="submit" disabled={!assignmentData.branchId || !assignmentData.userId}>
                Assign Role
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
