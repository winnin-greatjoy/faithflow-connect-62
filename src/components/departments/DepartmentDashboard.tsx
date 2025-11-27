import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MemberForm, type MemberFormData } from '@/components/admin/MemberForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DepartmentSettingsDialog from './DepartmentSettingsDialog';

interface Props {
  departmentId: string;
  departmentName: string;
}

interface DepartmentMember {
  id: string;
  full_name: string;
}

export const DepartmentDashboard: React.FC<Props> = ({ departmentId, departmentName }) => {
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const { toast } = useToast();

  const loadMembers = useCallback(async () => {
    // Query members assigned to this department
    const { data } = await supabase
      .from('members')
      .select('id, full_name')
      .eq('assigned_department', departmentId);
    setMembers((data as DepartmentMember[]) || []);
  }, [departmentId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove member from department?')) return;
    try {
      const { error } = await supabase
        .from('members')
        .update({ assigned_department: null })
        .eq('id', memberId);
      if (error) throw error;
      toast({ title: 'Removed', description: 'Member removed from department' });
      await loadMembers();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: 'Remove failed', description: msg, variant: 'destructive' });
    }
  };

  const handleAddMember = async (data: MemberFormData) => {
    try {
      const payload = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        branch_id: data.branchId || null,
        date_joined: data.joinDate || null,
        status: 'active',
        assigned_department: departmentId,
      };
      const { error } = await supabase.from('members').insert(payload as any);
      if (error) throw error;
      toast({ title: 'Added', description: 'Member created and assigned.' });
      setIsAddMemberOpen(false);
      await loadMembers();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Add failed',
        description: msg || 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{departmentName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            Settings
          </Button>
          <Button onClick={() => setIsAddMemberOpen(true)}>Add Member</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.full_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(m.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Department: {departmentName}</p>
            <p className="text-sm text-gray-600 mt-2">Total Members: {members.length}</p>
          </CardContent>
        </Card>
      </div>

      <DepartmentSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        departmentId={departmentId}
        departmentName={departmentName}
        onUpdated={(n) => {
          /* optionally handle name change */
        }}
        onDeleted={() => {
          /* optionally navigate away */
        }}
      />

      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Member to Department</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <MemberForm onCancel={() => setIsAddMemberOpen(false)} onSubmit={handleAddMember} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentDashboard;
