import React, { useState, useMemo, useEffect } from 'react';
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
  ClipboardList,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { DepartmentTaskBoard } from './DepartmentTaskBoard';
import { useUshering } from '@/hooks/useUshering';

interface UsheringDashboardProps {
  departmentId: string;
  branchId?: string;
}

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

export const UsheringDashboard: React.FC<UsheringDashboardProps> = ({ departmentId, branchId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for data from DB
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    upcomingServices: 0,
    completedServices: 0,
    monthlyGrowth: 0,
    coverageRate: 0,
  });
  const [members, setMembers] = useState<UsherMember[]>([]);
  const [events, setEvents] = useState<UsherEvent[]>([]);

  // Fetch real data using hook
  const {
    members: apiMembers,
    stats: apiStats,
    events: apiEvents,
    loading: apiLoading,
  } = useUshering();

  // Load data from DB
  useEffect(() => {
    if (apiStats) {
      setStats({
        totalMembers: apiStats.totalMembers,
        activeMembers: apiStats.activeMembers,
        upcomingServices: apiStats.upcomingEvents,
        completedServices: apiStats.completedActivities,
        monthlyGrowth: apiStats.monthlyGrowth,
        coverageRate: 85, // Placeholder for now
      });
    }

    if (apiMembers) {
      setMembers(
        apiMembers.map((m) => ({
          id: Math.random(), // Use random number since we don't have a numeric ID in the new schema
          name: m.member?.full_name || 'Unknown',
          role: (m.member as any)?.assigned_department === 'technical' ? 'Technical' : 'Usher',
          status: m.member?.status === 'active' ? 'active' : 'inactive',
          joinDate: m.member?.date_joined || '',
          email: m.member?.email,
          phone: m.member?.phone,
          station: (m as any).station || 'Main Entrance',
          experience: (m as any).years_experience || 0,
          availability: (m as any).availability || [],
        }))
      );
    }

    if (apiEvents) {
      setEvents(apiEvents);
    }
  }, [apiMembers, apiStats, apiEvents]);

  const loading = apiLoading;

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStation = stationFilter === 'all' || member.station === stationFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStation && matchesStatus;
    });
  }, [members, searchTerm, stationFilter, statusFilter]);

  // Quick actions
  const quickActions = [
    {
      label: 'Add Usher',
      icon: UserPlus,
      onClick: () =>
        toast({ title: 'Add Usher', description: 'Add new usher form would open here' }),
      variant: 'default' as const,
    },
    {
      label: 'Assign Service',
      icon: Calendar,
      onClick: () =>
        toast({ title: 'Assign Service', description: 'Service assignment form would open here' }),
      variant: 'outline' as const,
    },
    {
      label: 'Create Schedule',
      icon: ClipboardList,
      onClick: () =>
        toast({ title: 'Create Schedule', description: 'Schedule creation form would open here' }),
      variant: 'outline' as const,
    },
    {
      label: 'Training Session',
      icon: UserCheck,
      onClick: () =>
        toast({ title: 'Training Session', description: 'Training session form would open here' }),
      variant: 'outline' as const,
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Ushering Dashboard</h1>
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
        {[
          { label: 'Total Ushers', value: stats.totalMembers, icon: Users, color: 'blue' },
          { label: 'Active', value: stats.activeMembers, icon: UserCheck, color: 'emerald' },
          { label: 'Services', value: stats.upcomingServices, icon: Calendar, color: 'amber' },
          { label: 'Completed', value: stats.completedServices, icon: Activity, color: 'violet' },
          { label: 'Growth', value: `+${stats.monthlyGrowth}%`, icon: TrendingUp, color: 'indigo' },
          { label: 'Coverage', value: `${stats.coverageRate}%`, icon: MapPin, color: 'rose' },
        ].map((stat, idx) => (
          <Card
            key={idx}
            className="bg-card border border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group rounded-2xl"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`bg-muted/50 p-2.5 rounded-xl group-hover:bg-${stat.color}-500/10 transition-colors duration-300`}
                >
                  <stat.icon
                    className={`h-4 w-4 text-muted-foreground group-hover:text-${stat.color}-600 transition-colors`}
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-foreground leading-none mt-0.5">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
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
                {events
                  .filter((e) => e.status === 'scheduled')
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-card border border-primary/5 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {event.date} • {event.service}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {event.assignedUshers}/{event.totalNeeded} ushers
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(event.assignedUshers / event.totalNeeded) * 100}%`,
                            }}
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
                  { name: "Children's Area", ushers: 0, total: 1, color: 'bg-red-500' },
                  { name: 'Overflow Area', ushers: 0, total: 1, color: 'bg-red-500' },
                ].map((station) => (
                  <div
                    key={station.name}
                    className="p-4 bg-card border border-primary/10 rounded-xl shadow-sm"
                  >
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
                {events
                  .filter((e) => e.status === 'completed')
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-card border border-primary/5 rounded-xl shadow-sm"
                    >
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {event.date} • {event.attendance} attendees
                        </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Station
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
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
                <p className="text-sm">
                  View coverage reports, attendance, and performance metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <DepartmentTaskBoard departmentId={departmentId} branchId={branchId} canEdit={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
