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
  Megaphone,
  MapPin,
  Target,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Globe,
  BookOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EvangelismMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  outreachArea: string;
  conversions: number;
  eventsLed: number;
}

interface OutreachEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  location: string;
  attendees: number;
  conversions: number;
  status: 'planned' | 'completed' | 'cancelled';
  ledBy: string;
}

interface FollowUp {
  id: number;
  contactName: string;
  contactInfo: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'not-interested';
  assignedTo: string;
  lastContact: string;
  notes: string;
}

// Mock data for Evangelism department
const mockEvangelismStats = {
  totalMembers: 15,
  activeMembers: 13,
  plannedEvents: 6,
  completedOutreaches: 22,
  monthlyGrowth: 18,
  totalConversions: 34
};

const mockEvangelismMembers: EvangelismMember[] = [
  { id: 1, name: 'Paul Smith', role: 'Outreach Coordinator', status: 'active', joinDate: '2021-05-10', email: 'paul@example.com', phone: '555-0301', outreachArea: 'Downtown', conversions: 12, eventsLed: 8 },
  { id: 2, name: 'Grace Johnson', role: 'Street Evangelist', status: 'active', joinDate: '2022-03-15', email: 'grace@example.com', phone: '555-0302', outreachArea: 'North Side', conversions: 8, eventsLed: 12 },
  { id: 3, name: 'Mark Wilson', role: 'Follow-up Coordinator', status: 'active', joinDate: '2020-11-20', email: 'mark@example.com', phone: '555-0303', outreachArea: 'South District', conversions: 6, eventsLed: 6 },
  { id: 4, name: 'Sarah Davis', role: 'Community Outreach', status: 'active', joinDate: '2023-01-08', email: 'sarah@example.com', phone: '555-0304', outreachArea: 'East End', conversions: 4, eventsLed: 4 },
  { id: 5, name: 'James Brown', role: 'Missionary Support', status: 'inactive', joinDate: '2021-09-12', email: 'james@example.com', phone: '555-0305', outreachArea: 'West Side', conversions: 4, eventsLed: 3 }
];

const mockOutreachEvents: OutreachEvent[] = [
  { id: 1, title: 'Downtown Street Outreach', date: '2024-01-30', type: 'Street Ministry', location: 'City Center', attendees: 25, conversions: 3, status: 'planned', ledBy: 'Paul Smith' },
  { id: 2, title: 'Community Block Party', date: '2024-01-27', type: 'Community Event', location: 'North Side Park', attendees: 45, conversions: 5, status: 'planned', ledBy: 'Grace Johnson' },
  { id: 3, title: 'Homeless Ministry', date: '2024-01-25', type: 'Social Service', location: 'Shelter District', attendees: 15, conversions: 2, status: 'completed', ledBy: 'Mark Wilson' },
  { id: 4, title: 'Campus Outreach', date: '2024-01-20', type: 'Campus Ministry', location: 'University Area', attendees: 30, conversions: 4, status: 'completed', ledBy: 'Sarah Davis' },
  { id: 5, title: 'Door-to-Door Witnessing', date: '2024-01-18', type: 'Door-to-Door', location: 'Residential Area', attendees: 20, conversions: 1, status: 'completed', ledBy: 'Paul Smith' }
];

const mockFollowUps: FollowUp[] = [
  { id: 1, contactName: 'John Anderson', contactInfo: '555-1001', status: 'interested', assignedTo: 'Paul Smith', lastContact: '2024-01-24', notes: 'Very receptive, wants to attend service this Sunday' },
  { id: 2, contactName: 'Mary Thompson', contactInfo: '555-1002', status: 'contacted', assignedTo: 'Grace Johnson', lastContact: '2024-01-23', notes: 'Has questions about salvation, scheduled follow-up' },
  { id: 3, contactName: 'David Wilson', contactInfo: '555-1003', status: 'new', assignedTo: 'Mark Wilson', lastContact: '2024-01-22', notes: 'Met at block party, expressed interest in Bible study' },
  { id: 4, contactName: 'Lisa Brown', contactInfo: '555-1004', status: 'converted', assignedTo: 'Sarah Davis', lastContact: '2024-01-20', notes: 'Accepted Christ! Connected with discipleship program' },
  { id: 5, contactName: 'Robert Davis', contactInfo: '555-1005', status: 'not-interested', assignedTo: 'Paul Smith', lastContact: '2024-01-19', notes: 'Not interested at this time, but respectful conversation' }
];

interface EvangelismDashboardProps {
  departmentId: string;
}

export const EvangelismDashboard: React.FC<EvangelismDashboardProps> = ({ departmentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter members
  const filteredMembers = useMemo(() => {
    return mockEvangelismMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArea = areaFilter === 'all' || member.outreachArea === areaFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [searchTerm, areaFilter, statusFilter]);

  // Quick actions
  const quickActions = [
    { label: 'Add Member', icon: UserPlus, onClick: () => toast({ title: 'Add Member', description: 'Add new evangelism team member form would open here' }), variant: 'default' as const },
    { label: 'Plan Outreach', icon: Calendar, onClick: () => toast({ title: 'Plan Outreach', description: 'Outreach planning form would open here' }), variant: 'outline' as const },
    { label: 'Add Follow-up', icon: Target, onClick: () => toast({ title: 'Add Follow-up', description: 'Follow-up contact form would open here' }), variant: 'outline' as const },
    { label: 'Training', icon: BookOpen, onClick: () => toast({ title: 'Training', description: 'Evangelism training form would open here' }), variant: 'outline' as const }
  ];

  const handleBack = () => {
    navigate('/admin/departments');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'bg-green-100 text-green-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'not-interested': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Evangelism Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage outreach activities, follow-ups, and community evangelism efforts.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Evangelism Settings
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
                <p className="text-sm font-medium text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvangelismStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-50 p-2 rounded-full">
                <Megaphone className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvangelismStats.activeMembers}</p>
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
                <p className="text-2xl font-bold text-gray-900">{mockEvangelismStats.plannedEvents}</p>
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
                <p className="text-sm font-medium text-gray-600">Outreaches</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvangelismStats.completedOutreaches}</p>
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
                <p className="text-2xl font-bold text-gray-900">+{mockEvangelismStats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-50 p-2 rounded-full">
                <Target className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvangelismStats.totalConversions}</p>
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
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Outreach Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Outreach Areas</CardTitle>
              <CardDescription>Current evangelism coverage areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { area: 'Downtown', members: 3, events: 8, conversions: 12, color: 'bg-blue-500' },
                  { area: 'North Side', members: 2, events: 6, conversions: 8, color: 'bg-green-500' },
                  { area: 'South District', members: 2, events: 4, conversions: 6, color: 'bg-yellow-500' },
                  { area: 'East End', members: 1, events: 3, conversions: 4, color: 'bg-purple-500' },
                  { area: 'West Side', members: 1, events: 2, conversions: 4, color: 'bg-red-500' },
                  { area: 'University', members: 1, events: 1, conversions: 2, color: 'bg-indigo-500' }
                ].map((area) => (
                  <div key={area.area} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{area.area}</span>
                      <div className={`w-3 h-3 rounded-full ${area.color}`} />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{area.members} members • {area.events} events</div>
                      <div>{area.conversions} conversions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Outreach Events</CardTitle>
              <CardDescription>Scheduled evangelism activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOutreachEvents.filter(e => e.status === 'planned').map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} • {event.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{event.attendees} expected</div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Pipeline</CardTitle>
              <CardDescription>Current status of evangelism contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { status: 'New', count: 5, color: 'bg-gray-500' },
                  { status: 'Contacted', count: 8, color: 'bg-yellow-500' },
                  { status: 'Interested', count: 6, color: 'bg-blue-500' },
                  { status: 'Converted', count: 3, color: 'bg-green-500' },
                  { status: 'Not Interested', count: 2, color: 'bg-red-500' }
                ].map((pipeline) => (
                  <div key={pipeline.status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${pipeline.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-gray-900">{pipeline.count}</div>
                    <div className="text-sm text-gray-600">{pipeline.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Evangelism Team</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
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
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="Downtown">Downtown</SelectItem>
                <SelectItem value="North Side">North Side</SelectItem>
                <SelectItem value="South District">South District</SelectItem>
                <SelectItem value="East End">East End</SelectItem>
                <SelectItem value="West Side">West Side</SelectItem>
                <SelectItem value="University">University</SelectItem>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events Led</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
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
                          <Badge variant="outline">{member.outreachArea}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.eventsLed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.conversions}
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

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Outreach Events</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Plan Event
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Outreach planning coming soon</p>
                <p className="text-sm">Schedule and manage evangelism events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up Tab */}
        <TabsContent value="followup" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Follow-up Contacts</h3>
            <Button size="sm">
              <Target className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Follow-up management coming soon</p>
                <p className="text-sm">Track and manage evangelism contacts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Evangelism Reports</h3>
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
                <p className="text-sm">View outreach effectiveness and conversion metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
