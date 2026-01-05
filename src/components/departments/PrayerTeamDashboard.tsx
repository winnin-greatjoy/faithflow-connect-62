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
  Clock,
  MessageSquare,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Heart,
  BookOpen,
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

interface PrayerMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  specialization: string;
  prayerHours: number;
  requestsHandled: number;
}

interface PrayerRequest {
  id: number;
  title: string;
  requester: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in-progress' | 'answered' | 'closed';
  dateReceived: string;
  assignedTo?: string;
  description: string;
}

interface PrayerSession {
  id: number;
  title: string;
  date: string;
  type: string;
  attendees: number;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Mock data for Prayer Team department
const mockPrayerStats = {
  totalMembers: 18,
  activeMembers: 16,
  pendingRequests: 12,
  completedSessions: 34,
  monthlyGrowth: 22,
  answeredPrayers: 28,
};

const mockPrayerMembers: PrayerMember[] = [
  {
    id: 1,
    name: 'Ruth Johnson',
    role: 'Prayer Coordinator',
    status: 'active',
    joinDate: '2020-11-15',
    email: 'ruth@example.com',
    phone: '555-0201',
    specialization: 'Healing',
    prayerHours: 25,
    requestsHandled: 45,
  },
  {
    id: 2,
    name: 'Pastor Mark',
    role: 'Senior Intercessor',
    status: 'active',
    joinDate: '2019-03-20',
    email: 'pastor@example.com',
    phone: '555-0202',
    specialization: 'Family',
    prayerHours: 30,
    requestsHandled: 67,
  },
  {
    id: 3,
    name: 'Sarah Williams',
    role: 'Intercessor',
    status: 'active',
    joinDate: '2022-08-10',
    email: 'sarah@example.com',
    phone: '555-0203',
    specialization: 'Youth',
    prayerHours: 18,
    requestsHandled: 23,
  },
  {
    id: 4,
    name: 'David Brown',
    role: 'Intercessor',
    status: 'active',
    joinDate: '2021-12-05',
    email: 'david@example.com',
    phone: '555-0204',
    specialization: 'Marriage',
    prayerHours: 22,
    requestsHandled: 31,
  },
  {
    id: 5,
    name: 'Mary Davis',
    role: 'Intercessor',
    status: 'inactive',
    joinDate: '2020-06-18',
    email: 'mary@example.com',
    phone: '555-0205',
    specialization: 'Career',
    prayerHours: 12,
    requestsHandled: 18,
  },
];

const mockPrayerRequests: PrayerRequest[] = [
  {
    id: 1,
    title: 'Healing for Cancer',
    requester: 'Anonymous',
    category: 'Health',
    urgency: 'urgent',
    status: 'assigned',
    dateReceived: '2024-01-25',
    assignedTo: 'Ruth Johnson',
    description: 'Please pray for complete healing and strength during treatment.',
  },
  {
    id: 2,
    title: 'Job Search',
    requester: 'John Smith',
    category: 'Career',
    urgency: 'medium',
    status: 'new',
    dateReceived: '2024-01-24',
    description: 'Seeking new employment opportunities and guidance.',
  },
  {
    id: 3,
    title: 'Marriage Restoration',
    requester: 'Anonymous',
    category: 'Family',
    urgency: 'high',
    status: 'in-progress',
    dateReceived: '2024-01-23',
    assignedTo: 'Pastor Mark',
    description: 'Prayers for healing and reconciliation in marriage.',
  },
  {
    id: 4,
    title: 'Financial Breakthrough',
    requester: 'Sarah Johnson',
    category: 'Finance',
    urgency: 'medium',
    status: 'answered',
    dateReceived: '2024-01-20',
    description: 'Trusting God for financial provision and wisdom.',
  },
  {
    id: 5,
    title: 'Youth Ministry Growth',
    requester: 'Pastor Daniel',
    category: 'Ministry',
    urgency: 'low',
    status: 'new',
    dateReceived: '2024-01-22',
    description: 'Prayers for the youth ministry and young people.',
  },
];

const mockPrayerSessions: PrayerSession[] = [
  {
    id: 1,
    title: 'Morning Prayer Meeting',
    date: '2024-01-28',
    type: 'Group Prayer',
    attendees: 12,
    duration: 60,
    status: 'scheduled',
  },
  {
    id: 2,
    title: 'Healing Service Prayer',
    date: '2024-01-26',
    type: 'Service Support',
    attendees: 8,
    duration: 45,
    status: 'scheduled',
  },
  {
    id: 3,
    title: 'Intercessory Prayer',
    date: '2024-01-24',
    type: 'Intercession',
    attendees: 6,
    duration: 90,
    status: 'completed',
  },
  {
    id: 4,
    title: 'Wednesday Night Prayer',
    date: '2024-01-17',
    type: 'Group Prayer',
    attendees: 14,
    duration: 60,
    status: 'completed',
  },
  {
    id: 5,
    title: 'Youth Prayer Walk',
    date: '2024-01-15',
    type: 'Special Event',
    attendees: 10,
    duration: 120,
    status: 'completed',
  },
];

interface PrayerTeamDashboardProps {
  departmentId: string;
}

export const PrayerTeamDashboard: React.FC<PrayerTeamDashboardProps> = ({ departmentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return mockPrayerRequests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
      const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [searchTerm, categoryFilter, urgencyFilter]);

  // Quick actions
  const quickActions = [
    {
      label: 'Add Member',
      icon: UserPlus,
      onClick: () =>
        toast({
          title: 'Add Member',
          description: 'Add new prayer team member form would open here',
        }),
      variant: 'default' as const,
    },
    {
      label: 'New Request',
      icon: Heart,
      onClick: () =>
        toast({ title: 'New Request', description: 'Prayer request form would open here' }),
      variant: 'outline' as const,
    },
    {
      label: 'Schedule Session',
      icon: Calendar,
      onClick: () =>
        toast({
          title: 'Schedule Session',
          description: 'Prayer session scheduling form would open here',
        }),
      variant: 'outline' as const,
    },
    {
      label: 'Prayer Guide',
      icon: BookOpen,
      onClick: () =>
        toast({ title: 'Prayer Guide', description: 'Prayer resources form would open here' }),
      variant: 'outline' as const,
    },
  ];

  const handleBack = () => {
    navigate('/admin/departments');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'assigned':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'new':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'closed':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Prayer Team Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage prayer requests, coordinate intercession, and organize prayer sessions.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Prayer Team Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Members', value: mockPrayerStats.totalMembers, icon: Users, color: 'blue' },
          { label: 'Active', value: mockPrayerStats.activeMembers, icon: Heart, color: 'rose' },
          {
            label: 'Pending',
            value: mockPrayerStats.pendingRequests,
            icon: MessageSquare,
            color: 'amber',
          },
          {
            label: 'Sessions',
            value: mockPrayerStats.completedSessions,
            icon: Calendar,
            color: 'violet',
          },
          {
            label: 'Growth',
            value: `+${mockPrayerStats.monthlyGrowth}%`,
            icon: TrendingUp,
            color: 'indigo',
          },
          {
            label: 'Answered',
            value: mockPrayerStats.answeredPrayers,
            icon: Heart,
            color: 'emerald',
          },
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Prayer Requests by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Prayer Requests by Category</CardTitle>
              <CardDescription>Distribution of current prayer requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { category: 'Health', count: 3, color: 'bg-red-500' },
                  { category: 'Family', count: 1, color: 'bg-blue-500' },
                  { category: 'Career', count: 1, color: 'bg-green-500' },
                  { category: 'Ministry', count: 1, color: 'bg-purple-500' },
                ].map((item) => (
                  <div
                    key={item.category}
                    className="text-center p-4 bg-card border border-primary/10 rounded-xl shadow-sm"
                  >
                    <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Urgent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Urgent Prayer Requests</CardTitle>
              <CardDescription>Requests requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPrayerRequests
                  .filter((r) => r.urgency === 'urgent' || r.urgency === 'high')
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-card border border-rose-500/20 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getUrgencyColor(request.urgency)}`}
                        />
                        <div>
                          <h4 className="font-medium">{request.title}</h4>
                          <p className="text-sm text-gray-600">
                            {request.requester} • {request.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        <div className="text-xs text-gray-500 mt-1">{request.dateReceived}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Prayer Sessions</CardTitle>
              <CardDescription>Scheduled prayer meetings and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPrayerSessions
                  .filter((s) => s.status === 'scheduled')
                  .map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-card border border-blue-500/20 rounded-xl shadow-sm"
                    >
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-600">
                          {session.date} • {session.duration} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{session.attendees} attendees</div>
                        <Badge variant="outline">{session.type}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Prayer Requests</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <Heart className="mr-2 h-4 w-4" />
                New Request
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export Requests
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Career">Career</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Ministry">Ministry</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.title}</div>
                            <div className="text-sm text-gray-500">{request.requester}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{request.category}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getUrgencyColor(request.urgency)}`}
                            />
                            <span className="text-sm capitalize">{request.urgency}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.assignedTo || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.dateReceived}
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

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Prayer Team Members</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Member management coming soon</p>
                <p className="text-sm">Manage prayer team members and their specializations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Prayer Sessions</h3>
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Session scheduling coming soon</p>
                <p className="text-sm">Plan and manage prayer sessions and meetings</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Prayer Reports</h3>
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
                  View answered prayers, request trends, and team performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
