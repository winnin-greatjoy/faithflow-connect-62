import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Settings,
  FileText,
  Plus,
  UserPlus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DepartmentSettingsDialog from './DepartmentSettingsDialog';
import { AddMemberToDepartmentDialog } from './AddMemberToDepartmentDialog';

interface Props {
  departmentId: string;
  departmentName: string;
  branchId?: string;
}

interface DepartmentMember {
  id: string;
  full_name: string;
}

interface DepartmentStats {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  completedActivities: number;
  monthlyGrowth: number;
  budgetUtilization?: number;
}

interface DepartmentEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  attendees: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export const DepartmentDashboard: React.FC<Props> = ({
  departmentId,
  departmentName,
  branchId,
}) => {
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({
    totalMembers: 0,
    activeMembers: 0,
    upcomingEvents: 0,
    completedActivities: 0,
    monthlyGrowth: 0,
  });
  const [recentEvents, setRecentEvents] = useState<DepartmentEvent[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [branchName, setBranchName] = useState<string>('');
  const { toast } = useToast();

  const loadMembers = useCallback(async () => {
    // Query members assigned to this department
    const { data } = await supabase
      .from('members')
      .select('id, full_name')
      .eq('assigned_department', departmentId);

    const memberList = (data as DepartmentMember[]) || [];
    setMembers(memberList);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalMembers: memberList.length,
      activeMembers: memberList.length, // Assuming all are active for now
    }));
  }, [departmentId]);

  useEffect(() => {
    loadMembers();
    if (branchId) {
      supabase
        .from('church_branches')
        .select('name')
        .eq('id', branchId)
        .single()
        .then(({ data }) => {
          if (data) setBranchName(data.name);
        });
    }
  }, [loadMembers, branchId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{departmentName} Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage department members, tasks, and activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => setIsAddMemberDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Members
          </Button>
        </div>
      </div> */}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-50 p-2 rounded-full">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-50 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-50 p-2 rounded-full">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-50 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.budgetUtilization !== undefined && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-50 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.budgetUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Department Members</CardTitle>
          <CardDescription>All members assigned to this department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No members assigned yet. Click "Add Members" to get started.
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{member.full_name}</h4>
                    <p className="text-sm text-gray-600">Member</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      event.status === 'upcoming'
                        ? 'bg-blue-500'
                        : event.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {event.date} • {event.attendees} attendees
                    </p>
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DepartmentSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        departmentId={departmentId}
        departmentName={departmentName}
        branchId={branchId}
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
        branchId={branchId}
        onMembersAdded={loadMembers}
      />
    </div>
  );
};

export default DepartmentDashboard;
