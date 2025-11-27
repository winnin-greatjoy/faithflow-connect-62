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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DepartmentSettingsDialog from './DepartmentSettingsDialog';
import { AddMemberToDepartmentDialog } from './AddMemberToDepartmentDialog';

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
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{departmentName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            Settings
          </Button>
          <Button onClick={() => setIsAddMemberDialogOpen(true)}>Add Members</Button>
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
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No members assigned yet
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.full_name}</TableCell>
                      <TableCell className="text-right">View</TableCell>
                    </TableRow>
                  ))
                )}
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
        members={members}
        onUpdated={(n) => {
          /* optionally handle name change */
        }}
        onDeleted={() => {
          /* optionally navigate away */
        }}
        onMembersChanged={loadMembers}
      />

      <AddMemberToDepartmentDialog
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        departmentId={departmentId}
        onMembersAdded={loadMembers}
      />
    </div>
  );
};

export default DepartmentDashboard;
