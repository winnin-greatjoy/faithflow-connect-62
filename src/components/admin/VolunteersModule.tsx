
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
import { UserCheck, Clock, Calendar, Plus, Bell, Edit, Trash2, MoreHorizontal } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Coordinate volunteers and their service schedules.</p>
        </div>
        <Button onClick={handleAddRole} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Add Volunteer Role</span>
        </Button>
      </div>

      {/* Volunteer Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Volunteers</CardTitle>
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">+5 new this month</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Upcoming Shifts</CardTitle>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Positions Needed</CardTitle>
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Urgent openings</p>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Roles */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl">Volunteer Roles</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage volunteer positions and assignments</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="hidden sm:table-header-group">
                <TableRow>
                  <TableHead className="min-w-[150px] text-xs sm:text-sm">Role</TableHead>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm hidden sm:table-cell">Team Leader</TableHead>
                  <TableHead className="min-w-[100px] text-xs sm:text-sm">Members</TableHead>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm hidden md:table-cell">Next Shift</TableHead>
                  <TableHead className="min-w-[100px] text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="min-w-[100px] text-xs sm:text-sm text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteerRoles.map((role) => (
                  <TableRow key={role.id} className="block sm:table-row border-b last:border-0">
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Role:</span>
                        <span className="font-medium text-sm sm:text-base">{role.role}</span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Leader:</span>
                        <span className="text-sm sm:text-base hidden sm:block">{role.leader}</span>
                        <span className="text-sm sm:hidden">{role.leader.split(' ')[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Members:</span>
                        <span className="text-sm sm:text-base">{role.members} {role.members === 1 ? 'volunteer' : 'volunteers'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Next Shift:</span>
                        <span className="text-sm sm:text-base hidden md:block">{role.nextShift}</span>
                        <span className="text-sm sm:text-base md:hidden">
                          {role.nextShift === 'Ongoing' ? 'Ongoing' : role.nextShift.split(' ')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between items-center sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Status:</span>
                        <Badge className={`${getStatusColor(role.status)} text-xs sm:text-sm h-5 sm:h-6`}>
                          {role.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-4"
                          onClick={() => handleManageRole(role.id)}
                        >
                          <span className="sr-only sm:not-sr-only sm:mr-2">Manage</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
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
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl">Upcoming Volunteer Shifts</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Next week's volunteer schedule</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4">
          <div className="space-y-3 sm:space-y-4">
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg gap-4 bg-white shadow-sm hover:shadow transition-shadow">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{shift.volunteer}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{shift.role}</p>
                    
                    {/* Mobile: Show date and time under name on small screens */}
                    <div className="sm:hidden mt-2 flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>{shift.date} • {shift.time}</span>
                      </div>
                      <div className="mt-1">
                        <Badge 
                          className={`${shift.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs h-5`}
                        >
                          {shift.confirmed ? 'Confirmed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop: Right-aligned content */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-sm text-gray-600 flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{shift.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{shift.time}</span>
                    </div>
                  </div>
                  
                  <Badge 
                    className={`${shift.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs h-6`}
                  >
                    {shift.confirmed ? 'Confirmed' : 'Pending'}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                      onClick={() => handleRemindVolunteer(shift.id)}
                      title="Send Reminder"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1.5">Remind</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 sm:h-9"
                      onClick={() => handleEditShift(shift.id)}
                      title="Edit Shift"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 sm:h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteShift(shift.id)}
                      title="Delete Shift"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Mobile: Action buttons */}
                <div className="sm:hidden flex justify-end gap-2 pt-2 border-t mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={() => handleRemindVolunteer(shift.id)}
                  >
                    <Bell className="mr-1.5 h-3.5 w-3.5" />
                    Remind
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={() => handleEditShift(shift.id)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 px-2.5 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteShift(shift.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
