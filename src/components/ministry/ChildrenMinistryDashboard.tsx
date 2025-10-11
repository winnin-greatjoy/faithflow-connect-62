
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Baby, 
  BookOpen,
  Shield,
  Camera,
  BarChart3,
  UserPlus,
  Clock,
  AlertTriangle,
  Star,
  QrCode,
  Heart,
  FileText,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChildrensMinistryDashboardProps {
  userRole: 'head' | 'vice_head' | 'teacher' | 'volunteer' | 'observer';
}

const ChildrensMinistryDashboard = ({ userRole }: ChildrensMinistryDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const canManage = ['head', 'vice_head'].includes(userRole);
  const canTeach = ['head', 'vice_head', 'teacher'].includes(userRole);
  const canVolunteer = ['head', 'vice_head', 'teacher', 'volunteer'].includes(userRole);

  const stats = {
    totalChildren: 156,
    toddlers: 28, // 2-3
    preschool: 45, // 4-5
    primary: 63, // 6-10
    juniors: 20, // 11-12
    checkedInToday: 89,
    volunteersOnDuty: 12,
    incidentsThisMonth: 2
  };

  const mockClasses = [
    {
      id: 1,
      name: 'Tiny Tots (2-3 years)',
      teacher: 'Sister Mary Johnson',
      assistants: ['Brother Paul Wilson'],
      capacity: 15,
      enrolled: 14,
      avgAttendance: 12,
      nextClass: '2024-02-04T10:00:00Z'
    },
    {
      id: 2,
      name: 'Little Learners (4-5 years)',
      teacher: 'Sister Grace Mensah',
      assistants: ['Sister Ruth Addo', 'Brother James Osei'],
      capacity: 20,
      enrolled: 18,
      avgAttendance: 16,
      nextClass: '2024-02-04T10:00:00Z'
    },
    {
      id: 3,
      name: 'Primary Kids (6-10 years)',
      teacher: 'Brother David Thompson',
      assistants: ['Sister Alice Brown', 'Sister Janet Wilson'],
      capacity: 25,
      enrolled: 23,
      avgAttendance: 20,
      nextClass: '2024-02-04T10:00:00Z'
    }
  ];

  const mockVolunteers = [
    {
      id: 1,
      name: 'Sister Mary Johnson',
      role: 'Lead Teacher',
      dbsStatus: 'valid',
      dbsExpiry: '2025-06-15',
      assignments: ['Tiny Tots'],
      hoursThisMonth: 24
    },
    {
      id: 2,
      name: 'Brother Paul Wilson',
      role: 'Assistant',
      dbsStatus: 'valid',
      dbsExpiry: '2024-12-20',
      assignments: ['Tiny Tots', 'Setup Team'],
      hoursThisMonth: 16
    },
    {
      id: 3,
      name: 'Sister Grace Mensah',
      role: 'Lead Teacher',
      dbsStatus: 'pending',
      dbsExpiry: '2024-03-10',
      assignments: ['Little Learners'],
      hoursThisMonth: 20
    }
  ];

  const mockCheckIns = [
    {
      id: 1,
      childName: 'Emma Johnson',
      age: 4,
      guardianName: 'Sister Mary Johnson',
      checkedInAt: '2024-02-04T09:45:00Z',
      class: 'Little Learners',
      specialNotes: 'Allergic to nuts',
      pickupCode: 'EJ2024'
    },
    {
      id: 2,
      childName: 'Samuel Wilson',
      age: 7,
      guardianName: 'Brother Paul Wilson',
      checkedInAt: '2024-02-04T09:50:00Z',
      class: 'Primary Kids',
      specialNotes: 'Needs inhaler',
      pickupCode: 'SW2024'
    }
  ];

  const mockIncidents = [
    {
      id: 1,
      childName: 'Michael Brown',
      incidentType: 'Minor Injury',
      description: 'Small cut on finger during craft time',
      reportedBy: 'Sister Alice Brown',
      actionTaken: 'First aid applied, guardian notified',
      timestamp: '2024-01-28T11:30:00Z',
      severity: 'low'
    },
    {
      id: 2,
      childName: 'Sarah Mensah',
      incidentType: 'Behavioral',
      description: 'Difficulty following instructions',
      reportedBy: 'Brother David Thompson',
      actionTaken: 'One-on-one guidance provided',
      timestamp: '2024-01-25T10:15:00Z',
      severity: 'low'
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
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin</span>
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Children's Ministry Dashboard</h1>
          <p className="text-gray-600 mt-1">Safe, age-appropriate discipleship and care (Ages 2-12)</p>
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
              <Baby className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Checked In Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.checkedInToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Volunteers On Duty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.volunteersOnDuty}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Incidents This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.incidentsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Age Group Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.toddlers}</div>
              <p className="text-sm text-gray-500">Toddlers (2-3)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.preschool}</div>
              <p className="text-sm text-gray-500">Preschool (4-5)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.primary}</div>
              <p className="text-sm text-gray-500">Primary (6-10)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.juniors}</div>
              <p className="text-sm text-gray-500">Juniors (11-12)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checkin">Check-in/Out</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="safety">Health & Safety</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for Children's Ministry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {canVolunteer && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <QrCode className="mr-2 h-4 w-4" />
                      Quick Check-in
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Report Incident
                    </Button>
                  </>
                )}
                {canTeach && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Lesson Plans
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Class Photos
                    </Button>
                  </>
                )}
                {canManage && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Volunteer
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Review DBS Status
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">9:30 AM - Setup & Volunteer Briefing</p>
                      <p className="text-xs text-gray-500">Main Classroom</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">10:00 AM - Children's Service Begins</p>
                      <p className="text-xs text-gray-500">All Classrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">11:30 AM - Service Ends & Pickup</p>
                      <p className="text-xs text-gray-500">Main Foyer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checkin" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Today's Check-ins</h3>
            {canVolunteer && (
              <Button>
                <QrCode className="mr-2 h-4 w-4" />
                New Check-in
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockCheckIns.map((checkin) => (
              <Card key={checkin.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{checkin.childName}</h4>
                        <Badge variant="outline">Age {checkin.age}</Badge>
                        <Badge variant="default">{checkin.class}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Guardian:</span>
                          <p className="font-medium">{checkin.guardianName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Check-in Time:</span>
                          <p className="font-medium">{new Date(checkin.checkedInAt).toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Pickup Code:</span>
                          <p className="font-medium font-mono">{checkin.pickupCode}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Special Notes:</span>
                          <p className="font-medium text-red-600">{checkin.specialNotes}</p>
                        </div>
                      </div>
                    </div>
                    {canVolunteer && (
                      <Button variant="outline" size="sm">
                        Check Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Class Rosters</h3>
            {canManage && (
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockClasses.map((classItem) => (
              <Card key={classItem.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{classItem.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Lead Teacher:</span>
                          <p className="font-medium">{classItem.teacher}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Assistants:</span>
                          <p className="font-medium">{classItem.assistants.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Enrollment:</span>
                          <p className="font-medium">{classItem.enrolled}/{classItem.capacity}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Attendance:</span>
                          <p className="font-medium">{classItem.avgAttendance}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Next Class: </span>
                        <span className="font-medium text-sm">
                          {new Date(classItem.nextClass).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {canTeach && (
                      <Button variant="outline" size="sm">
                        Manage Class
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Volunteer Roster</h3>
            {canManage && (
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Volunteer
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockVolunteers.map((volunteer) => (
              <Card key={volunteer.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{volunteer.name}</h4>
                        <Badge variant="outline">{volunteer.role}</Badge>
                        <Badge variant={
                          volunteer.dbsStatus === 'valid' ? 'default' :
                          volunteer.dbsStatus === 'pending' ? 'secondary' : 'destructive'
                        }>
                          DBS {volunteer.dbsStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Assignments:</span>
                          <p className="font-medium">{volunteer.assignments.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">DBS Expiry:</span>
                          <p className="font-medium">{new Date(volunteer.dbsExpiry).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Hours This Month:</span>
                          <p className="font-medium">{volunteer.hoursThisMonth}h</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={
                            new Date(volunteer.dbsExpiry) > new Date() ? 'default' : 'destructive'
                          }>
                            {new Date(volunteer.dbsExpiry) > new Date() ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {canManage && (
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

        <TabsContent value="resources" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Teaching Resources</h3>
            {canTeach && (
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Upload Resource
              </Button>
            )}
          </div>

          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Resource Library</h3>
            <p className="mt-1 text-sm text-gray-500">
              Lesson plans, activity guides, craft lists, and media resources
            </p>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Incident Reports</h3>
            {canVolunteer && (
              <Button>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockIncidents.map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{incident.childName}</h4>
                        <Badge variant={
                          incident.severity === 'high' ? 'destructive' :
                          incident.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {incident.incidentType}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Description:</span>
                          <p className="font-medium">{incident.description}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Action Taken:</span>
                          <p className="font-medium">{incident.actionTaken}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-500">Reported by:</span>
                            <p className="font-medium">{incident.reportedBy}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <p className="font-medium">{new Date(incident.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Children's Ministry Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Attendance by class, volunteer coverage, and safety reports
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildrensMinistryDashboard;
