
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Heart, 
  BookOpen,
  DollarSign,
  FileText,
  BarChart3,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WomensMinistryDashboardProps {
  userRole: 'head' | 'vice_head' | 'committee_head' | 'group_leader' | 'mentor' | 'member';
}

const WomensMinistryDashboard = ({ userRole }: WomensMinistryDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const canManage = ['head', 'vice_head', 'committee_head'].includes(userRole);
  const canLead = ['head', 'vice_head', 'committee_head', 'group_leader'].includes(userRole);

  const stats = {
    totalMembers: 156,
    activeGroups: 12,
    upcomingEvents: 5,
    activeCases: 8,
    monthlyBudget: 3500,
    spent: 2100,
    publications: 6,
    completionRate: 89
  };

  const mockGroups = [
    {
      id: 1,
      name: 'Prayer Warriors',
      leader: 'Sister Mary Johnson',
      members: 15,
      nextMeeting: '2024-02-05',
      type: 'Prayer Group'
    },
    {
      id: 2,
      name: 'Young Mothers Circle',
      leader: 'Sister Grace Addo',
      members: 22,
      nextMeeting: '2024-02-07',
      type: 'Fellowship'
    },
    {
      id: 3,
      name: 'Bible Study - Wednesday',
      leader: 'Sister Ruth Mensah',
      members: 18,
      nextMeeting: '2024-02-06',
      type: 'Bible Study'
    }
  ];

  const mockPrograms = [
    {
      id: 1,
      name: 'Discipleship Class Level 1',
      participants: 25,
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      status: 'active',
      completionRate: 85
    },
    {
      id: 2,
      name: 'Vocational Skills Training',
      participants: 18,
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      status: 'active',
      completionRate: 60
    },
    {
      id: 3,
      name: 'Leadership Development',
      participants: 12,
      startDate: '2024-01-08',
      endDate: '2024-02-29',
      status: 'active',
      completionRate: 95
    }
  ];

  const mockWelfareCases = [
    {
      id: 1,
      name: 'Sister Alice Boateng',
      type: 'Medical Support',
      urgency: 'medium',
      status: 'approved',
      amount: 500,
      assignedTo: 'Sister Mary Johnson'
    },
    {
      id: 2,
      name: 'Sister Janet Owusu',
      type: 'Educational Support',
      urgency: 'low',
      status: 'assessment',
      amount: 300,
      assignedTo: 'Sister Grace Addo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/departments')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Women's Ministry Dashboard</h1>
          <p className="text-gray-600 mt-1">Spiritual growth, fellowship, and community support</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1).replace('_', ' ')} Access
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Groups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="welfare">Welfare & Care</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for Women's Ministry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {canManage && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Group
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Program
                    </Button>
                  </>
                )}
                {canLead && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Heart className="mr-2 h-4 w-4" />
                      Handle Welfare Case
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Publication
                    </Button>
                  </>
                )}
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">New member joined Prayer Warriors group</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">Vocational Skills Training registration opened</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">Monthly devotional published</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Fellowship Groups</h3>
            {canManage && (
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Group
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <CardDescription>{group.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Leader:</span>
                      <span className="font-medium">{group.leader}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Members:</span>
                      <span className="font-medium">{group.members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Meeting:</span>
                      <span className="font-medium">{new Date(group.nextMeeting).toLocaleDateString()}</span>
                    </div>
                    {canLead && (
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Manage Group
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Training Programs</h3>
            {canManage && (
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Create Program
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockPrograms.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{program.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Participants:</span>
                          <p className="font-medium">{program.participants}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">
                            {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                            {program.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Completion:</span>
                          <p className="font-medium">{program.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                    {canLead && (
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="welfare" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Welfare & Care Cases</h3>
            {canLead && (
              <Button>
                <Heart className="mr-2 h-4 w-4" />
                New Case
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockWelfareCases.map((caseItem) => (
              <Card key={caseItem.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{caseItem.name}</h4>
                        <Badge variant={
                          caseItem.urgency === 'high' ? 'destructive' :
                          caseItem.urgency === 'medium' ? 'default' : 'secondary'
                        }>
                          {caseItem.urgency}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{caseItem.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={caseItem.status === 'approved' ? 'default' : 'secondary'}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium">£{caseItem.amount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Assigned to:</span>
                          <p className="font-medium">{caseItem.assignedTo}</p>
                        </div>
                      </div>
                    </div>
                    {canLead && (
                      <Button variant="outline" size="sm">
                        <Shield className="mr-2 h-3 w-3" />
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">£{stats.monthlyBudget}</div>
                <p className="text-sm text-gray-500">Allocated for February</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spent This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">£{stats.spent}</div>
                <p className="text-sm text-gray-500">{Math.round((stats.spent / stats.monthlyBudget) * 100)}% of budget used</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">£{stats.monthlyBudget - stats.spent}</div>
                <p className="text-sm text-gray-500">Available for programs</p>
              </CardContent>
            </Card>
          </div>

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Expense tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="publications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Publications & Resources</h3>
            {canLead && (
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Create Publication
              </Button>
            )}
          </div>

          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Publications Module</h3>
            <p className="mt-1 text-sm text-gray-500">
              Devotionals, testimonies, and announcements management
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Ministry Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Participation, program outcomes, and financial reports
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WomensMinistryDashboard;
