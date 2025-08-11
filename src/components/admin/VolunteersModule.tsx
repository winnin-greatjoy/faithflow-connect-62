
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { UserCheck, Clock, Calendar, Plus, Bell, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const volunteerRoles = [
  { id: 1, role: 'Usher Team', leader: 'John Smith', members: 8, nextShift: '2024-01-14 09:30', status: 'Fully Staffed' },
  { id: 2, role: 'Welcome Team', leader: 'Sarah Johnson', members: 6, nextShift: '2024-01-14 09:45', status: 'Need 2 More' },
  { id: 3, role: 'Audio/Visual', leader: 'Mike Davis', members: 4, nextShift: '2024-01-14 09:00', status: 'Fully Staffed' },
  { id: 4, role: 'Children\'s Ministry', leader: 'Emma Wilson', members: 12, nextShift: '2024-01-14 10:15', status: 'Need 1 More' },
  { id: 5, role: 'Prayer Team', leader: 'David Brown', members: 15, nextShift: 'Ongoing', status: 'Fully Staffed' },
];

const upcomingShifts = [
  { id: 1, volunteer: 'John Smith', role: 'Usher Team', date: '2024-01-14', time: '09:30 AM', confirmed: true },
  { id: 2, volunteer: 'Sarah Johnson', role: 'Welcome Team', date: '2024-01-14', time: '09:45 AM', confirmed: true },
  { id: 3, volunteer: 'Mike Davis', role: 'Audio/Visual', date: '2024-01-14', time: '09:00 AM', confirmed: false },
  { id: 4, volunteer: 'Emma Wilson', role: 'Children\'s Ministry', date: '2024-01-14', time: '10:15 AM', confirmed: true },
];

export const VolunteersModule = () => {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    if (status.includes('Need')) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const handleAddRole = () => {
    toast({
      title: "Add Volunteer Role",
      description: "Opening new volunteer role form...",
    });
    console.log('Adding new volunteer role');
  };

  const handleManageRole = (roleId: number) => {
    toast({
      title: "Manage Role",
      description: `Managing volunteer role ID: ${roleId}`,
    });
    console.log('Managing role:', roleId);
  };

  const handleRemindVolunteer = (shiftId: number) => {
    toast({
      title: "Reminder Sent",
      description: "Volunteer reminder has been sent successfully.",
    });
    console.log('Sending reminder for shift:', shiftId);
  };

  const handleEditShift = (shiftId: number) => {
    toast({
      title: "Edit Shift",
      description: `Opening edit form for shift ID: ${shiftId}`,
    });
    console.log('Editing shift:', shiftId);
  };

  const handleDeleteShift = (shiftId: number) => {
    toast({
      title: "Delete Shift",
      description: `Are you sure you want to delete shift ID: ${shiftId}?`,
      variant: "destructive",
    });
    console.log('Deleting shift:', shiftId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Coordinate volunteers and their service schedules.</p>
        </div>
        <Button onClick={handleAddRole} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Volunteer Role
        </Button>
      </div>

      {/* Volunteer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Volunteers</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">+5 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Positions Needed</CardTitle>
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Urgent openings</p>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Volunteer Roles</CardTitle>
          <CardDescription className="text-sm">Manage volunteer positions and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Role</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Team Leader</TableHead>
                  <TableHead className="min-w-[100px]">Members</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Next Shift</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteerRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.role}</TableCell>
                    <TableCell className="hidden sm:table-cell">{role.leader}</TableCell>
                    <TableCell>{role.members} volunteers</TableCell>
                    <TableCell className="hidden md:table-cell">{role.nextShift}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(role.status)}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleManageRole(role.id)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Upcoming Volunteer Shifts</CardTitle>
          <CardDescription className="text-sm">Next week's volunteer schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium truncate">{shift.volunteer}</h4>
                    <p className="text-sm text-gray-600 truncate">{shift.role}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {shift.date}
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="mr-1 h-4 w-4" />
                      {shift.time}
                    </div>
                  </div>
                  
                  <Badge className={shift.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {shift.confirmed ? 'Confirmed' : 'Pending'}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemindVolunteer(shift.id)}
                    >
                      <Bell className="mr-1 h-4 w-4" />
                      <span className="hidden sm:inline">Remind</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditShift(shift.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteShift(shift.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
