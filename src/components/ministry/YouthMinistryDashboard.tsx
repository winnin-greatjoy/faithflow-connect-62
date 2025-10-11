
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Zap, 
  BookOpen,
  DollarSign,
  Camera,
  BarChart3,
  UserPlus,
  Clock,
  Award,
  MessageSquare,
  Shield,
  Play,
  Trophy,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface YouthMinistryDashboardProps {
  userRole: 'head' | 'vice_head' | 'committee_head' | 'group_leader' | 'mentor' | 'member';
}

const YouthMinistryDashboard = ({ userRole }: YouthMinistryDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const canManage = ['head', 'vice_head', 'committee_head'].includes(userRole);
  const canLead = ['head', 'vice_head', 'committee_head', 'group_leader'].includes(userRole);

  const stats = {
    totalYouth: 248,
    teens: 89, // 13-17
    youth: 102, // 18-24
    youngAdults: 57, // 25-30
    activeGroups: 8,
    upcomingEvents: 7,
    leadershipPipeline: 15,
    completionRate: 78
  };

  const mockPrograms = [
    {
      id: 1,
      name: 'Leadership Development Track',
      participants: 15,
      ageGroup: '18-30',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      status: 'active',
      completionRate: 85,
      level: 'Advanced'
    },
    {
      id: 2,
      name: 'Teen Discipleship Class',
      participants: 25,
      ageGroup: '13-17',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      status: 'active',
      completionRate: 72,
      level: 'Beginner'
    },
    {
      id: 3,
      name: 'Career Guidance Workshop',
      participants: 32,
      ageGroup: '20-30',
      startDate: '2024-01-08',
      endDate: '2024-03-15',
      status: 'active',
      completionRate: 95,
      level: 'Intermediate'
    }
  ];

  const mockEvents = [
    {
      id: 1,
      title: 'Youth Retreat 2024',
      date: '2024-03-15',
      endDate: '2024-03-17',
      location: 'Camp Galilee',
      registered: 85,
      capacity: 100,
      type: 'Retreat'
    },
    {
      id: 2,
      title: 'Basketball Tournament',
      date: '2024-02-10',
      location: 'Church Sports Hall',
      registered: 32,
      capacity: 40,
      type: 'Sports'
    },
    {
      id: 3,
      title: 'Career Fair',
      date: '2024-02-24',
      location: 'Main Sanctuary',
      registered: 67,
      capacity: 80,
      type: 'Educational'
    }
  ];

  const mockGroups = [
    {
      id: 1,
      name: 'Teen Cell Group Alpha',
      leader: 'Brother James Wilson',
      members: 15,
      ageRange: '13-17',
      nextMeeting: '2024-02-05'
    },
    {
      id: 2,
      name: 'Young Adults Fellowship',
      leader: 'Sister Sarah Johnson',
      members: 22,
      ageRange: '25-30',
      nextMeeting: '2024-02-07'
    },
    {
      id: 3,
      name: 'Youth Worship Band',
      leader: 'Brother David Mensah',
      members: 12,
      ageRange: '16-24',
      nextMeeting: '2024-02-06'
    }
  ];

  const mockCounselingRequests = [
    {
      id: 1,
      name: 'Anonymous Youth',
      type: 'Academic Pressure',
      urgency: 'medium',
      status: 'assigned',
      assignedTo: 'Pastor Michael Brown',
      age: 17
    },
    {
      id: 2,
      name: 'Brother Samuel Osei',
      type: 'Career Guidance',
      urgency: 'low',
      status: 'scheduled',
      assignedTo: 'Sister Grace Addo',
      age: 23
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
          <h1 className="text-2xl font-bold text-gray-900">Youth & Young Adults Ministry</h1>
          <p className="text-gray-600 mt-1">Discipleship, leadership development, and digital engagement (Ages 13-30)</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1).replace('_', ' ')} Access
        </Badge>
      </div>

      {/* Age Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Youth</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalYouth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Teens (13-17)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.teens}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Youth (18-24)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.youth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Young Adults (25-30)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.youngAdults}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="care">Care & Mentoring</TabsTrigger>
          <TabsTrigger value="media">Media & Resources</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for Youth Ministry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {canManage && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Plan Event
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Create Program
                    </Button>
                  </>
                )}
                {canLead && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Heart className="mr-2 h-4 w-4" />
                      Handle Counseling Request
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Media Content
                    </Button>
                  </>
                )}
                <Button className="w-full justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  Issue Achievement Badge
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leadership Pipeline</CardTitle>
                <CardDescription>Youth in leadership development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.leadershipPipeline}</div>
                <p className="text-sm text-gray-500 mt-1">Currently in leadership tracks</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level 1 (Beginner)</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Level 2 (Intermediate)</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Level 3 (Advanced)</span>
                    <span className="font-medium">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-lg">{program.name}</h4>
                        <Badge variant="outline">{program.level}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Participants:</span>
                          <p className="font-medium">{program.participants}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Age Group:</span>
                          <p className="font-medium">{program.ageGroup}</p>
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

        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Upcoming Events</h3>
            {canManage && (
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Plan Event
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <CardDescription>{event.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString()}
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Location:</span>
                      <span className="font-medium">{event.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Registered:</span>
                      <span className="font-medium">{event.registered}/{event.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                    {canLead && (
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Manage Event
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Youth Groups & Cells</h3>
            {canManage && (
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <CardDescription>Ages {group.ageRange}</CardDescription>
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

        <TabsContent value="care" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Counseling & Mentoring</h3>
            {canLead && (
              <Button>
                <Heart className="mr-2 h-4 w-4" />
                New Session
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockCounselingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{request.name}</h4>
                        <Badge variant="outline">Age {request.age}</Badge>
                        <Badge variant={
                          request.urgency === 'high' ? 'destructive' :
                          request.urgency === 'medium' ? 'default' : 'secondary'
                        }>
                          {request.urgency}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{request.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={request.status === 'assigned' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Assigned to:</span>
                          <p className="font-medium">{request.assignedTo}</p>
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

        <TabsContent value="media" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Media & Digital Resources</h3>
            {canLead && (
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Upload Content
              </Button>
            )}
          </div>

          <div className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Media Library</h3>
            <p className="mt-1 text-sm text-gray-500">
              Short videos, blogs, sermon clips, and youth-focused content
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Youth Ministry Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Attendance trends, conversion stats, and engagement analytics
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default YouthMinistryDashboard;
