import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  UserCheck,
  MapPin,
  Clock,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UsherMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  station: string;
  experience: number;
  availability: string[];
}

interface UsherEvent {
  id: number;
  title: string;
  date: string;
  service: string;
  assignedUshers: number;
  totalNeeded: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendance: number;
}

// Mock data for Ushering department
const mockUsherStats = {
  totalMembers: 12,
  activeMembers: 10,
  upcomingServices: 4,
  completedServices: 28,
  monthlyGrowth: 15,
  coverageRate: 85
};

const mockUsherMembers: UsherMember[] = [
  { id: 1, name: 'James Wilson', role: 'Head Usher', status: 'active', joinDate: '2021-08-10', email: 'james@example.com', phone: '555-0101', station: 'Main Entrance', experience: 5, availability: ['Sunday 9AM', 'Sunday 11AM'] },
  { id: 2, name: 'Mary Thompson', role: 'Assistant Usher', status: 'active', joinDate: '2022-02-15', email: 'mary@example.com', phone: '555-0102', station: 'Sanctuary Doors', experience: 3, availability: ['Sunday 9AM'] },
  { id: 3, name: 'Robert Davis', role: 'Usher', status: 'active', joinDate: '2023-01-20', email: 'robert@example.com', phone: '555-0103', station: 'Parking Lot', experience: 2, availability: ['Sunday 11AM'] },
  { id: 4, name: 'Sarah Johnson', role: 'Usher', status: 'active', joinDate: '2022-11-05', email: 'sarah@example.com', phone: '555-0104', station: 'Welcome Desk', experience: 4, availability: ['Sunday 9AM', 'Sunday 11AM'] },
  { id: 5, name: 'Michael Brown', role: 'Usher', status: 'inactive', joinDate: '2021-06-12', email: 'michael@example.com', phone: '555-0105', station: 'Children\'s Area', experience: 6, availability: [] }
];

const mockUsherEvents: UsherEvent[] = [
  { id: 1, title: 'Sunday Service 9AM', date: '2024-01-28', service: 'Main Service', assignedUshers: 4, totalNeeded: 4, status: 'scheduled', attendance: 0 },
  { id: 2, title: 'Sunday Service 11AM', date: '2024-01-28', service: 'Main Service', assignedUshers: 4, totalNeeded: 4, status: 'scheduled', attendance: 0 },
  { id: 3, title: 'Wednesday Bible Study', date: '2024-01-24', service: 'Bible Study', assignedUshers: 2, totalNeeded: 2, status: 'scheduled', attendance: 0 },
  { id: 4, title: 'Sunday Service 9AM', date: '2024-01-21', service: 'Main Service', assignedUshers: 4, totalNeeded: 4, status: 'completed', attendance: 156 },
  { id: 5, title: 'Sunday Service 11AM', date: '2024-01-21', service: 'Main Service', assignedUshers: 4, totalNeeded: 4, status: 'completed', attendance: 203 }
];

export const UsheringDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter members
  const filteredMembers = useMemo(() => {
    return mockUsherMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStation = stationFilter === 'all' || member.station === stationFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStation && matchesStatus;
    });
  }, [searchTerm, stationFilter, statusFilter]);

  // Quick actions
  const quickActions = [
    { label: 'Add Usher', icon: UserPlus, onClick: () => toast({ title: 'Add Usher', description: 'Add new usher form would open here' }), variant: 'default' as const },
    { label: 'Assign Service', icon: Calendar, onClick: () => toast({ title: 'Assign Service', description: 'Service assignment form would open here' }), variant: 'outline' as const },
    { label: 'Create Schedule', icon: ClipboardList, onClick: () => toast({ title: 'Create Schedule', description: 'Schedule creation form would open here' }), variant: 'outline' as const },
    { label: 'Training Session', icon: UserCheck, onClick: () => toast({ title: 'Training Session', description: 'Training session form would open here' }), variant: 'outline' as const }
  ];

  const handleBack = () => {
    navigate('/admin/departments');
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Departments
        </Button>
      </div>

      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ushering Department Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage usher assignments, service coverage, and hospitality coordination.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Ushering Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ushers</p>
                <p className="text-2xl font-bold text-gray-900">{mockUsherStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-50 p-2 rounded-full">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{mockUsherStats.activeMembers}</p>
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
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">{mockUsherStats.upcomingServices}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{mockUsherStats.completedServices}</p>
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
                <p className="text-2xl font-bold text-gray-900">+{mockUsherStats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-50 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{mockUsherStats.coverageRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="h-20 flex-col space-y-2"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Service Coverage */}
          <Card>
            <CardHeader>
              <CardTitle>Service Coverage This Week</CardTitle>
              <CardDescription>Current and upcoming service assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsherEvents.filter(e => e.status === 'scheduled').map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.date} • {event.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {event.assignedUshers}/{event.totalNeeded} ushers
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(event.assignedUshers / event.totalNeeded) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Station Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Station Assignments</CardTitle>
              <CardDescription>Current usher station coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Main Entrance', ushers: 2, total: 2, color: 'bg-green-500' },
                  { name: 'Sanctuary Doors', ushers: 1, total: 2, color: 'bg-yellow-500' },
                  { name: 'Welcome Desk', ushers: 1, total: 1, color: 'bg-green-500' },
                  { name: 'Parking Lot', ushers: 1, total: 1, color: 'bg-green-500' },
                  { name: 'Children\'s Area', ushers: 0, total: 1, color: 'bg-red-500' },
                  { name: 'Overflow Area', ushers: 0, total: 1, color: 'bg-red-500' }
                ].map((station) => (
                  <div key={station.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{station.name}</span>
                      <div className={`w-3 h-3 rounded-full ${station.color}`} />
                    </div>
                    <div className="text-sm text-gray-600">
                      {station.ushers}/{station.total} ushers assigned
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Services</CardTitle>
              <CardDescription>Completed service assignments and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUsherEvents.filter(e => e.status === 'completed').slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} • {event.attendance} attendees</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{event.service}</Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.assignedUshers} ushers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Usher Team</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Usher
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export List
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search ushers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                <SelectItem value="Main Entrance">Main Entrance</SelectItem>
                <SelectItem value="Sanctuary Doors">Sanctuary Doors</SelectItem>
                <SelectItem value="Welcome Desk">Welcome Desk</SelectItem>
                <SelectItem value="Parking Lot">Parking Lot</SelectItem>
                <SelectItem value="Children's Area">Children's Area</SelectItem>
                <SelectItem value="Overflow Area">Overflow Area</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{member.station}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.experience} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {member.availability.slice(0, 2).map((avail, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {avail}
                              </Badge>
                            ))}
                            {member.availability.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{member.availability.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Service Schedule</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Service scheduling coming soon</p>
                <p className="text-sm">Assign ushers to services and manage coverage</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stations Tab */}
        <TabsContent value="stations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Station Management</h3>
            <Button size="sm" variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Add Station
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Station management coming soon</p>
                <p className="text-sm">Configure usher stations and requirements</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ushering Reports</h3>
            <Button size="sm" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Reports and analytics coming soon</p>
                <p className="text-sm">View coverage reports, attendance, and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
