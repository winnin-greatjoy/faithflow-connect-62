
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Award, 
  BookOpen,
  Heart,
  Megaphone,
  Shield,
  Scale,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle,
  Baby,
  Zap
} from 'lucide-react';
import { CommitteeWorkspace } from '../committee/CommitteeWorkspace';
import { MinistryRouter } from '../ministry/MinistryRouter';

const MensMinistryDashboard = () => {
  const [selectedCommittee, setSelectedCommittee] = useState<number | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState<'womens' | 'youth' | 'childrens' | null>(null);
  const [userRole] = useState<'head' | 'secretary' | 'treasurer' | 'member' | 'observer'>('head');

  const committees = [
    { 
      id: 1, 
      name: 'Finance Committee', 
      description: 'Financial planning, budgets, and reporting',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      members: 8,
      activeTasks: 5,
      nextMeeting: '2024-02-03'
    },
    { 
      id: 2, 
      name: 'Education Committee', 
      description: 'Academic recognition and student awards',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      members: 6,
      activeTasks: 3,
      nextMeeting: '2024-02-05'
    },
    { 
      id: 3, 
      name: 'Welfare Committee', 
      description: 'Member care and support services',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      members: 7,
      activeTasks: 8,
      nextMeeting: '2024-02-04'
    },
    { 
      id: 4, 
      name: 'Treasury Committee', 
      description: 'Cash management and disbursement',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      members: 4,
      activeTasks: 2,
      nextMeeting: '2024-02-06'
    },
    { 
      id: 5, 
      name: 'PR Committee', 
      description: 'Communications and publications',
      icon: Megaphone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      members: 5,
      activeTasks: 4,
      nextMeeting: '2024-02-07'
    },
    { 
      id: 6, 
      name: 'Audit Committee', 
      description: 'Independent oversight and compliance',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      members: 3,
      activeTasks: 1,
      nextMeeting: '2024-02-10'
    },
    { 
      id: 7, 
      name: 'Ethics Committee', 
      description: 'Conduct and grievance management',
      icon: Scale,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      members: 4,
      activeTasks: 2,
      nextMeeting: '2024-02-08'
    }
  ];

  const ministries = [
    {
      id: 'womens',
      name: "Women's Ministry",
      description: 'Spiritual growth, fellowship, and community support',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      members: 156,
      activeGroups: 12,
      nextEvent: '2024-02-08'
    },
    {
      id: 'youth',
      name: 'Youth & Young Adults',
      description: 'Discipleship and leadership development (Ages 13-30)',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      members: 248,
      activeGroups: 8,
      nextEvent: '2024-02-10'
    },
    {
      id: 'childrens',
      name: "Children's Ministry",
      description: 'Safe, age-appropriate discipleship (Ages 2-12)',
      icon: Baby,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      members: 156,
      activeGroups: 6,
      nextEvent: '2024-02-04'
    }
  ];

  // If a ministry is selected, show its dashboard
  if (selectedMinistry) {
    const ministry = ministries.find(m => m.id === selectedMinistry);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedMinistry(null)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="p-6">
          <MinistryRouter 
            ministryType={selectedMinistry}
            userRole={userRole}
          />
        </div>
      </div>
    );
  }

  // If a committee is selected, show its workspace
  if (selectedCommittee) {
    const committee = committees.find(c => c.id === selectedCommittee);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCommittee(null)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="p-6">
          <CommitteeWorkspace 
            committeeId={selectedCommittee}
            committeeName={committee?.name || ''}
            userRole={userRole}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Men's Ministry Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive committee and ministry management</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Ministry Head - Full Access
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {committees.reduce((sum, c) => sum + c.members, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {committees.reduce((sum, c) => sum + c.activeTasks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Committees</p>
                <p className="text-2xl font-bold text-gray-900">{committees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="committees" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="ministries">Other Ministries</TabsTrigger>
          <TabsTrigger value="overview">Ministry Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="committees" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committees.map((committee) => (
              <Card 
                key={committee.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCommittee(committee.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${committee.bgColor}`}>
                      <committee.icon className={`h-6 w-6 ${committee.color}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{committee.name}</CardTitle>
                  <CardDescription>{committee.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{committee.members}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Members</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{committee.activeTasks}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-xs">
                          {new Date(committee.nextMeeting).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Next Meeting</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ministries" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Other Church Ministries</h3>
              <p className="text-sm text-gray-500">Access dashboards for other ministry branches</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministries.map((ministry) => (
              <Card 
                key={ministry.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMinistry(ministry.id as any)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${ministry.bgColor}`}>
                      <ministry.icon className={`h-6 w-6 ${ministry.color}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{ministry.name}</CardTitle>
                  <CardDescription>{ministry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{ministry.members}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Members</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{ministry.activeGroups}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Groups</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-xs">
                          {new Date(ministry.nextEvent).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Next Event</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Ministry Overview</h3>
            <p className="mt-1 text-sm text-gray-500">
              High-level ministry metrics and performance indicators
            </p>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Member Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage committee memberships and role assignments
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Ministry Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive reporting across all committees and ministries
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MensMinistryDashboard;
