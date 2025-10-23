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
  Wifi,
  Shield,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TechnicalMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  specialization: string;
  ticketsResolved: number;
  uptimeHours: number;
  certifications: string[];
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'offline' | 'repair';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  assignedTo?: string;
}

interface SupportTicket {
  id: number;
  title: string;
  requester: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  dateCreated: string;
  assignedTo?: string;
  description: string;
  resolution?: string;
}

interface ServiceEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  equipment: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  assignedTo: string;
  notes?: string;
}

// Mock data for Technical department
const mockTechnicalStats = {
  totalMembers: 8,
  activeMembers: 7,
  equipmentCount: 24,
  supportTickets: 15,
  uptimePercentage: 99.2,
  monthlyGrowth: 25,
  openTickets: 3,
  systemHealth: 95
};

const mockTechnicalMembers: TechnicalMember[] = [
  { id: 1, name: 'Mike Davis', role: 'Technical Director', status: 'active', joinDate: '2019-08-15', email: 'mike@example.com', phone: '555-0501', specialization: 'AV Systems', ticketsResolved: 145, uptimeHours: 8760, certifications: ['CTS', 'Dante Level 2', 'Network+'] },
  { id: 2, name: 'Sarah Johnson', role: 'Audio Engineer', status: 'active', joinDate: '2020-11-20', email: 'sarah@example.com', phone: '555-0502', specialization: 'Audio Systems', ticketsResolved: 89, uptimeHours: 4320, certifications: ['Pro Tools', 'Dante Level 1'] },
  { id: 3, name: 'David Wilson', role: 'Video Technician', status: 'active', joinDate: '2021-05-10', email: 'david@example.com', phone: '555-0503', specialization: 'Video Systems', ticketsResolved: 67, uptimeHours: 2880, certifications: ['Blackmagic Certified', 'Streaming Tech'] },
  { id: 4, name: 'Lisa Brown', role: 'IT Support', status: 'active', joinDate: '2022-02-14', email: 'lisa@example.com', phone: '555-0504', specialization: 'Network & IT', ticketsResolved: 123, uptimeHours: 5760, certifications: ['CompTIA A+', 'Network+', 'Security+'] },
  { id: 5, name: 'Robert Smith', role: 'Lighting Technician', status: 'active', joinDate: '2023-01-08', email: 'robert@example.com', phone: '555-0505', specialization: 'Lighting Systems', ticketsResolved: 45, uptimeHours: 2160, certifications: ['ETC Certified', 'DMX Protocol'] },
  { id: 6, name: 'Emily Davis', role: 'Streaming Specialist', status: 'active', joinDate: '2022-09-12', email: 'emily@example.com', phone: '555-0506', specialization: 'Live Streaming', ticketsResolved: 78, uptimeHours: 3600, certifications: ['OBS Specialist', 'YouTube Certified'] },
  { id: 7, name: 'James Wilson', role: 'Maintenance Tech', status: 'inactive', joinDate: '2021-12-05', email: 'james@example.com', phone: '555-0507', specialization: 'Equipment Maintenance', ticketsResolved: 34, uptimeHours: 1440, certifications: ['Electrical Safety', 'Equipment Repair'] }
];

const mockEquipment: Equipment[] = [
  { id: 1, name: 'Main Sound Board', type: 'Audio Mixer', status: 'operational', location: 'Sound Booth', lastMaintenance: '2024-01-15', nextMaintenance: '2024-04-15', assignedTo: 'Sarah Johnson' },
  { id: 2, name: 'Projector 1', type: 'Video Projector', status: 'operational', location: 'Sanctuary', lastMaintenance: '2024-01-10', nextMaintenance: '2024-07-10', assignedTo: 'David Wilson' },
  { id: 3, name: 'Live Stream Encoder', type: 'Streaming Equipment', status: 'maintenance', location: 'Media Room', lastMaintenance: '2024-01-20', nextMaintenance: '2024-01-30', assignedTo: 'Emily Davis' },
  { id: 4, name: 'Wireless Microphone System', type: 'Audio Equipment', status: 'operational', location: 'Storage', lastMaintenance: '2024-01-05', nextMaintenance: '2024-03-05', assignedTo: 'Sarah Johnson' },
  { id: 5, name: 'Network Switch', type: 'Network Equipment', status: 'operational', location: 'Server Room', lastMaintenance: '2024-01-12', nextMaintenance: '2024-06-12', assignedTo: 'Lisa Brown' },
  { id: 6, name: 'Stage Lighting Console', type: 'Lighting Equipment', status: 'offline', location: 'Stage Left', lastMaintenance: '2023-12-20', nextMaintenance: '2024-02-20', assignedTo: 'Robert Smith' }
];

const mockSupportTickets: SupportTicket[] = [
  { id: 1, title: 'Sound System Feedback', requester: 'Pastor Mark', priority: 'high', status: 'in-progress', category: 'Audio', dateCreated: '2024-01-25', assignedTo: 'Sarah Johnson', description: 'High-pitched feedback during Sunday service', resolution: 'Adjusted EQ settings and checked microphone placement' },
  { id: 2, title: 'Projector Not Turning On', requester: 'Media Team', priority: 'medium', status: 'resolved', category: 'Video', dateCreated: '2024-01-24', assignedTo: 'David Wilson', description: 'Main sanctuary projector failed to power on', resolution: 'Replaced faulty power supply' },
  { id: 3, title: 'WiFi Connection Issues', requester: 'Office Staff', priority: 'low', status: 'open', category: 'Network', dateCreated: '2024-01-23', assignedTo: 'Lisa Brown', description: 'Intermittent WiFi connectivity in admin office' },
  { id: 4, title: 'Streaming Quality Poor', requester: 'Online Ministry', priority: 'medium', status: 'in-progress', category: 'Streaming', dateCreated: '2024-01-22', assignedTo: 'Emily Davis', description: 'Low resolution and buffering during live stream' },
  { id: 5, title: 'Stage Light Flickering', requester: 'Worship Team', priority: 'low', status: 'open', category: 'Lighting', dateCreated: '2024-01-21', assignedTo: 'Robert Smith', description: 'Left stage light flickering during rehearsal' }
];

const mockServiceEvents: ServiceEvent[] = [
  { id: 1, title: 'Sunday Service Setup', date: '2024-01-28', type: 'Service Support', equipment: ['Main Sound Board', 'Projector 1', 'Wireless Microphone System'], status: 'scheduled', assignedTo: 'Mike Davis', notes: 'Full AV setup for 9AM and 11AM services' },
  { id: 2, title: 'Equipment Maintenance', date: '2024-01-26', type: 'Maintenance', equipment: ['Live Stream Encoder'], status: 'scheduled', assignedTo: 'Emily Davis', notes: 'Monthly maintenance and software updates' },
  { id: 3, title: 'Youth Service AV', date: '2024-01-25', type: 'Youth Ministry', equipment: ['Projector 1', 'Sound System'], status: 'completed', assignedTo: 'Sarah Johnson', notes: 'Setup completed successfully' },
  { id: 4, title: 'Concert Sound Check', date: '2024-01-20', type: 'Special Event', equipment: ['Main Sound Board', 'Stage Lighting Console'], status: 'completed', assignedTo: 'Mike Davis', notes: 'Full system test completed' },
  { id: 5, title: 'Network Security Update', date: '2024-01-18', type: 'IT Maintenance', equipment: ['Network Switch'], status: 'completed', assignedTo: 'Lisa Brown', notes: 'Security patches applied successfully' }
];

export const TechnicalDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return mockSupportTickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.requester.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  // Quick actions
  const quickActions = [
    { label: 'Add Member', icon: UserPlus, onClick: () => toast({ title: 'Add Member', description: 'Add new technical team member form would open here' }), variant: 'default' as const },
    { label: 'New Ticket', icon: AlertTriangle, onClick: () => toast({ title: 'New Ticket', description: 'Support ticket form would open here' }), variant: 'outline' as const },
    { label: 'Add Equipment', icon: Monitor, onClick: () => toast({ title: 'Add Equipment', description: 'Equipment registration form would open here' }), variant: 'outline' as const },
    { label: 'Schedule Maintenance', icon: Wrench, onClick: () => toast({ title: 'Schedule Maintenance', description: 'Maintenance scheduling form would open here' }), variant: 'outline' as const }
  ];

  const handleBack = () => {
    navigate('/admin/departments');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'repair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Team</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-50 p-2 rounded-full">
                <Monitor className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.equipmentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-50 p-2 rounded-full">
                <Headphones className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.supportTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-50 p-2 rounded-full">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.uptimePercentage}%</p>
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
                <p className="text-2xl font-bold text-gray-900">+{mockTechnicalStats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-50 p-2 rounded-full">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.openTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-50 p-2 rounded-full">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Health</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.systemHealth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-red-50 p-2 rounded-full">
                <Activity className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{mockTechnicalStats.activeMembers}</p>
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
                  { system: 'Audio Systems', status: 'operational', uptime: '99.8%', issues: 0, color: 'bg-green-500' },
                  { system: 'Video Systems', status: 'operational', uptime: '99.5%', issues: 1, color: 'bg-green-500' },
                  { system: 'Network Infrastructure', status: 'operational', uptime: '99.9%', issues: 0, color: 'bg-green-500' },
                  { system: 'Streaming Platform', status: 'maintenance', uptime: '98.2%', issues: 2, color: 'bg-yellow-500' }
                ].map((system) => (
                  <div key={system.system} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{system.system}</span>
                      <div className={`w-3 h-3 rounded-full ${system.color}`} />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Uptime: {system.uptime}</div>
                      <div>Status: <Badge className={getStatusColor(system.status)}>{system.status}</Badge></div>
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
                {mockEquipment.slice(0, 6).map((equipment) => (
                  <div key={equipment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{equipment.name}</span>
                      <Badge className={getStatusColor(equipment.status)}>
                        {equipment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{equipment.type}</div>
                      <div>Location: {equipment.location}</div>
                      <div>Next Maintenance: {equipment.nextMaintenance}</div>
                      {equipment.assignedTo && <div>Assigned: {equipment.assignedTo}</div>}
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
                {mockSupportTickets.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                      <div>
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">{ticket.requester} • {ticket.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getTicketStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {ticket.dateCreated}
                      </div>
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

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Equipment management coming soon</p>
                <p className="text-sm">Register, track, and manage all technical equipment</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Support Tickets</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
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
                <SelectItem value="in-progress">In Progress</SelectItem>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                            <span className="text-sm capitalize">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getTicketStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{ticket.category}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.assignedTo || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.dateCreated}
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

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Team management coming soon</p>
                <p className="text-sm">Manage technical team members and certifications</p>
              </div>
            </CardContent>
          </Card>
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
