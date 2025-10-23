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
  Music,
  Mic,
  Clock,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseDepartmentDashboard, DepartmentStats, DepartmentMember, DepartmentEvent } from './BaseDepartmentDashboard';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ChoirMember extends DepartmentMember {
  voicePart: string;
  yearsExperience: number;
  attendanceRate: number;
}

interface ChoirEvent extends DepartmentEvent {
  rehearsalType: string;
  songs: string[];
}

// Mock data for Choir department
const mockChoirStats: DepartmentStats = {
  totalMembers: 24,
  activeMembers: 22,
  upcomingEvents: 8,
  completedActivities: 45,
  monthlyGrowth: 8,
  budgetUtilization: 75
};

const mockChoirMembers: ChoirMember[] = [
  { id: 1, name: 'Sarah Johnson', role: 'Soprano Lead', status: 'active', joinDate: '2022-03-15', email: 'sarah@example.com', voicePart: 'Soprano', yearsExperience: 8, attendanceRate: 95 },
  { id: 2, name: 'Michael Brown', role: 'Tenor', status: 'active', joinDate: '2021-11-20', email: 'michael@example.com', voicePart: 'Tenor', yearsExperience: 5, attendanceRate: 88 },
  { id: 3, name: 'Emily Davis', role: 'Alto', status: 'active', joinDate: '2023-01-10', email: 'emily@example.com', voicePart: 'Alto', yearsExperience: 3, attendanceRate: 92 },
  { id: 4, name: 'David Wilson', role: 'Bass', status: 'active', joinDate: '2020-09-05', email: 'david@example.com', voicePart: 'Bass', yearsExperience: 12, attendanceRate: 85 },
  { id: 5, name: 'Lisa Anderson', role: 'Soprano', status: 'inactive', joinDate: '2022-06-12', email: 'lisa@example.com', voicePart: 'Soprano', yearsExperience: 6, attendanceRate: 45 }
];

const mockChoirEvents: ChoirEvent[] = [
  { id: 1, title: 'Sunday Service Choir', date: '2024-01-28', type: 'Service', attendees: 22, status: 'upcoming', rehearsalType: 'Full Rehearsal', songs: ['Amazing Grace', 'How Great Thou Art'] },
  { id: 2, title: 'Christmas Concert Practice', date: '2024-01-25', type: 'Concert Prep', attendees: 20, status: 'upcoming', rehearsalType: 'Sectional', songs: ['Silent Night', 'Joy to the World'] },
  { id: 3, title: 'Easter Sunday Performance', date: '2024-01-20', type: 'Service', attendees: 24, status: 'completed', rehearsalType: 'Full Rehearsal', songs: ['Christ the Lord is Risen', 'Hallelujah Chorus'] },
  { id: 4, title: 'Voice Training Workshop', date: '2024-01-18', type: 'Training', attendees: 18, status: 'completed', rehearsalType: 'Workshop', songs: ['Vocal Exercises', 'Breathing Techniques'] },
  { id: 5, title: 'Wedding Service', date: '2024-01-15', type: 'Special Event', attendees: 16, status: 'completed', rehearsalType: 'Small Group', songs: ['Ave Maria', 'The Lord\'s Prayer'] }
];

export const ChoirDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceFilter, setVoiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter members
  const filteredMembers = useMemo(() => {
    return mockChoirMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVoice = voiceFilter === 'all' || member.voicePart === voiceFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesVoice && matchesStatus;
    });
  }, [searchTerm, voiceFilter, statusFilter]);

  // Quick actions
  const quickActions = [
    { label: 'Add Singer', icon: UserPlus, onClick: () => toast({ title: 'Add Singer', description: 'Add new choir member form would open here' }), variant: 'default' as const },
    { label: 'Schedule Rehearsal', icon: Calendar, onClick: () => toast({ title: 'Schedule Rehearsal', description: 'Rehearsal scheduling form would open here' }), variant: 'outline' as const },
    { label: 'Add Song', icon: Music, onClick: () => toast({ title: 'Add Song', description: 'Song library form would open here' }), variant: 'outline' as const },
    { label: 'Voice Training', icon: Mic, onClick: () => toast({ title: 'Voice Training', description: 'Training session form would open here' }), variant: 'outline' as const }
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
          <h1 className="text-3xl font-bold text-gray-900">Choir Department Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage choir members, rehearsals, performances, and musical activities.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Choir Settings
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
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{mockChoirStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-50 p-2 rounded-full">
                <Music className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Singers</p>
                <p className="text-2xl font-bold text-gray-900">{mockChoirStats.activeMembers}</p>
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
                <p className="text-2xl font-bold text-gray-900">{mockChoirStats.upcomingEvents}</p>
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
                <p className="text-2xl font-bold text-gray-900">{mockChoirStats.completedActivities}</p>
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
                <p className="text-2xl font-bold text-gray-900">+{mockChoirStats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-50 p-2 rounded-full">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold text-gray-900">{mockChoirStats.budgetUtilization}%</p>
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
          <TabsTrigger value="repertoire">Repertoire</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Voice Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Part Distribution</CardTitle>
              <CardDescription>Current distribution of singers by voice part</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Soprano', 'Alto', 'Tenor', 'Bass'].map((voice) => {
                  const count = mockChoirMembers.filter(m => m.voicePart === voice && m.status === 'active').length;
                  return (
                    <div key={voice} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">{voice}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Performances */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performances</CardTitle>
              <CardDescription>Latest choir performances and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockChoirEvents.filter(e => e.status === 'completed').slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} • {event.attendees} attendees</p>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Rehearsals */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Rehearsals</CardTitle>
              <CardDescription>Next scheduled choir practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockChoirEvents.filter(e => e.status === 'upcoming').slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} • {event.rehearsalType}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{event.attendees} singers</div>
                      <div className="text-xs text-gray-500">{event.songs.length} songs</div>
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
            <h3 className="text-lg font-medium">Choir Members</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Singer
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
                placeholder="Search singers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={voiceFilter} onValueChange={setVoiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by voice part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voice Parts</SelectItem>
                <SelectItem value="Soprano">Soprano</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Tenor">Tenor</SelectItem>
                <SelectItem value="Bass">Bass</SelectItem>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Singer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voice Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
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
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{member.voicePart}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.yearsExperience} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.attendanceRate}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${member.attendanceRate}%` }}
                            />
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

        {/* Repertoire Tab */}
        <TabsContent value="repertoire" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Song Repertoire</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Song
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Song repertoire management coming soon</p>
                <p className="text-sm">Add, organize, and manage your choir's song library</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Rehearsal Schedule</h3>
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Event
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Schedule management coming soon</p>
                <p className="text-sm">Plan rehearsals, performances, and special events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Choir Reports</h3>
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
                <p className="text-sm">View attendance, performance metrics, and growth reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
