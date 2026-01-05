import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Calendar,
  Monitor,
  Headphones,
  Wrench,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Loader2,
  Activity,
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
import { technicalApi } from '@/services/departments/technicalApi';
import type { DepartmentMember, DepartmentStats } from '@/types/api';

interface TechnicalMember extends Omit<DepartmentMember, 'skill_level'> {
  specialization: string;
  certifications: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tickets_resolved: number;
  uptime_hours: number;
  availability: string[];
}

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  category: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  status: string;
  location: string;
  assigned_to?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  notes?: string;
  specifications?: Record<string, any>;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  assigned_to?: string;
  created_date: string;
  updated_date: string;
  resolved_date?: string;
  resolution_notes?: string;
  equipment_id?: string;
  event_id?: string;
  estimated_time?: number;
  actual_time?: number;
}

interface TechnicalDashboardProps {
  departmentId: string;
}

export const TechnicalDashboard: React.FC<TechnicalDashboardProps> = ({ departmentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // API state
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load stats and data in parallel
        const [statsResult, membersResult, equipmentResult, ticketsResult] = await Promise.all([
          technicalApi.getTechnicalStats(),
          technicalApi.getTechnicalMembers({
            sort: { field: 'member.full_name', direction: 'asc' },
          }),
          technicalApi.getEquipment(),
          technicalApi.getSupportTickets(),
        ]);

        if (statsResult.error) {
          throw new Error(statsResult.error.message);
        }

        if (membersResult.error) {
          throw new Error(membersResult.error.message);
        }

        if (equipmentResult.error) {
          throw new Error(equipmentResult.error.message);
        }

        if (ticketsResult.error) {
          throw new Error(ticketsResult.error.message);
        }

        setStats(statsResult.data);
        setMembers(membersResult.data || []);
        setEquipment(equipmentResult.data || []);
        setTickets(ticketsResult.data || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  // Transform members to include technical-specific fields
  const technicalMembers: TechnicalMember[] = members.map((member) => ({
    ...member,
    specialization: 'av_systems', // Would come from API response
    certifications: ['CTS', 'Dante Level 2'], // Would come from API response
    skill_level: 'expert', // Would come from API response
    tickets_resolved: 145, // Would be calculated
    uptime_hours: 8760, // Would be calculated
    availability: ['Sunday', 'Wednesday'], // Would come from API response
  }));

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Quick actions
  const quickActions = [
    {
      label: 'Add Member',
      icon: UserPlus,
      onClick: () =>
        toast({
          title: 'Add Member',
          description: 'Add new technical team member form would open here',
        }),
      variant: 'default' as const,
    },
    {
      label: 'New Ticket',
      icon: Headphones,
      onClick: () =>
        toast({ title: 'New Ticket', description: 'Support ticket form would open here' }),
      variant: 'outline' as const,
    },
    {
      label: 'Add Equipment',
      icon: Monitor,
      onClick: () =>
        toast({
          title: 'Add Equipment',
          description: 'Equipment registration form would open here',
        }),
      variant: 'outline' as const,
    },
    {
      label: 'Schedule Maintenance',
      icon: Wrench,
      onClick: () =>
        toast({
          title: 'Schedule Maintenance',
          description: 'Maintenance scheduling form would open here',
        }),
      variant: 'outline' as const,
    },
  ];

  const handleBack = () => {
    navigate('/admin/departments');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading technical dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Technical Department Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage AV systems, equipment, technical support, and technology infrastructure.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Technical Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Team', value: stats?.totalMembers || 0, icon: Users, color: 'blue' },
          { label: 'Equipment', value: equipment.length, icon: Monitor, color: 'emerald' },
          { label: 'Tickets', value: tickets.length, icon: Headphones, color: 'amber' },
          { label: 'Uptime', value: '99.2%', icon: Activity, color: 'violet' },
          { label: 'Health', value: '95%', icon: Activity, color: 'rose' },
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
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="tickets">Support</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>Current status of all technical systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    system: 'Audio Systems',
                    status: 'operational',
                    uptime: '99.8%',
                    issues: 0,
                    color: 'bg-green-500',
                  },
                  {
                    system: 'Video Systems',
                    status: 'operational',
                    uptime: '99.5%',
                    issues: 1,
                    color: 'bg-green-500',
                  },
                  {
                    system: 'Network Infrastructure',
                    status: 'operational',
                    uptime: '99.9%',
                    issues: 0,
                    color: 'bg-green-500',
                  },
                  {
                    system: 'Streaming Platform',
                    status: 'maintenance',
                    uptime: '98.2%',
                    issues: 2,
                    color: 'bg-yellow-500',
                  },
                ].map((system) => (
                  <div
                    key={system.system}
                    className="p-4 bg-card border border-primary/10 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{system.system}</span>
                      <div className={`w-3 h-3 rounded-full ${system.color}`} />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Uptime: {system.uptime}</div>
                      <div>
                        Status:{' '}
                        <Badge
                          className={
                            system.status === 'operational'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }
                        >
                          {system.status}
                        </Badge>
                      </div>
                      <div>Open Issues: {system.issues}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status</CardTitle>
              <CardDescription>Current operational status of key equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-card border border-primary/10 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge
                        className={
                          item.status === 'operational'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{item.type}</div>
                      <div>Location: {item.location}</div>
                      <div>Next Maintenance: {item.next_maintenance}</div>
                      {item.assigned_to && <div>Assigned: {item.assigned_to}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>Latest technical support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-card border border-primary/5 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${ticket.priority === 'critical' ? 'bg-red-500' : ticket.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                      />
                      <div>
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">
                          {ticket.requester} • {ticket.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          ticket.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }
                      >
                        {ticket.status}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">{ticket.created_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Equipment Management</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.name}</span>
                    <Badge
                      className={
                        item.status === 'operational'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>
                      {item.type} • {item.category}
                    </div>
                    <div>Location: {item.location}</div>
                    <div>Next Maintenance: {item.next_maintenance}</div>
                    {item.assigned_to && <div>Assigned: {item.assigned_to}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Support Tickets</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <Headphones className="mr-2 h-4 w-4" />
                New Ticket
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export Tickets
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
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
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                            <div className="text-sm text-gray-500">{ticket.requester}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${ticket.priority === 'critical' ? 'bg-red-500' : ticket.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                            />
                            <span className="text-sm capitalize">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              ticket.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{ticket.category}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.assigned_to || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.created_date}
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
            <h3 className="text-lg font-medium">Technical Team</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{member.member.full_name}</h4>
                      <p className="text-sm text-gray-600">{member.member.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium capitalize">
                        {(member as any).specialization?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tickets Resolved:</span>
                      <span className="font-medium">{(member as any).tickets_resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certifications:</span>
                      <span className="font-medium">
                        {(member as any).certifications?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant={member.status === 'approved' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Technical Schedule</h3>
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
                <p className="text-sm">Plan maintenance, events, and technical support</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
