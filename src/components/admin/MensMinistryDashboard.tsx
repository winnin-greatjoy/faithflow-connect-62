
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  UserPlus,
  Settings
} from 'lucide-react';
import { 
  mockMinistryMembers, 
  mockCommittees, 
  mockContributions, 
  mockPledges,
  mockPublications,
  mockMinistryEvents,
  mockFinancialSummary 
} from '@/data/mockMinistryData';

export const MensMinistryDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate stats
  const stats = {
    totalMembers: mockMinistryMembers.filter(m => m.isActive).length,
    totalCommittees: mockCommittees.filter(c => c.isActive).length,
    monthlyContributions: mockFinancialSummary.totalContributions,
    activePledges: mockPledges.filter(p => p.status === 'active').length,
    upcomingEvents: mockMinistryEvents.filter(e => e.status === 'planned').length,
    publishedArticles: mockPublications.filter(p => p.status === 'published').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Men's Ministry Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage the Men's Ministry operations, committees, and activities.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Ministry Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Committees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCommittees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.monthlyContributions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Pledges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePledges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Publications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Leadership Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Leadership Structure</CardTitle>
              <CardDescription>Current ministry leadership and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMinistryMembers.filter(m => m.role !== 'member' && m.role !== 'committee_member').map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{leader.fullName}</h4>
                      <p className="text-sm text-gray-600">{leader.leadershipPosition}</p>
                    </div>
                    <Badge variant="outline">{leader.role.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <UserPlus className="h-6 w-6" />
              <span>Add Member</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span>Record Contribution</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Create Publication</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Event</span>
            </Button>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New publication: "Men's Ministry Monthly Newsletter - January 2024"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">£200 pledge payment received from David Clark</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Men's Prayer Breakfast scheduled for January 21</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ministry Members</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Committees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockMinistryMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{member.role.replace('_', ' ')}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {member.committeeAssignments.map((committee, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {committee}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.dateJoined}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
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

        <TabsContent value="committees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Committees</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Committee
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCommittees.map((committee) => (
              <Card key={committee.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {committee.name}
                    <Badge variant={committee.isActive ? "default" : "secondary"}>
                      {committee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{committee.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Head: </span>
                      {committee.headId 
                        ? mockMinistryMembers.find(m => m.id === committee.headId)?.fullName || 'TBD'
                        : 'TBD'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Members: </span>
                      {committee.members.length}
                    </div>
                    <div>
                      <span className="font-medium">Meeting: </span>
                      {committee.meetingSchedule || 'TBD'}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Financial Management</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Contribution
            </Button>
          </div>

          {/* Financial Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Contributions</p>
                  <p className="text-2xl font-bold text-green-600">£{mockFinancialSummary.totalContributions}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Monthly Dues</p>
                  <p className="text-2xl font-bold text-blue-600">£{mockFinancialSummary.monthlyDues}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pledge Payments</p>
                  <p className="text-2xl font-bold text-purple-600">£{mockFinancialSummary.pledgePayments}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Net Balance</p>
                  <p className="text-2xl font-bold text-primary">£{mockFinancialSummary.netBalance}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contributions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockContributions.map((contribution) => (
                      <tr key={contribution.id} className="border-b">
                        <td className="p-2">{contribution.date}</td>
                        <td className="p-2">
                          {mockMinistryMembers.find(m => m.id === contribution.memberId)?.fullName}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{contribution.type.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-2 font-medium">£{contribution.amount}</td>
                        <td className="p-2 text-sm text-gray-600">{contribution.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Publications & News</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Publication
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPublications.map((publication) => (
              <Card key={publication.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{publication.title}</CardTitle>
                    <Badge variant={
                      publication.status === 'published' ? 'default' :
                      publication.status === 'draft' ? 'secondary' : 'outline'
                    }>
                      {publication.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{mockMinistryMembers.find(m => m.id === publication.authorId)?.fullName}</span>
                    <span>•</span>
                    <span>{publication.publishDate || publication.createdAt}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {publication.content.substring(0, 150)}...
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {publication.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Events & Programs</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMinistryEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={
                      event.status === 'completed' ? 'default' :
                      event.status === 'planned' ? 'secondary' :
                      event.status === 'active' ? 'default' : 'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.startDate} {event.startDate !== event.endDate && `- ${event.endDate}`}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location: </span>
                      {event.location}
                    </div>
                    <div>
                      <span className="font-medium">Organizer: </span>
                      {mockMinistryMembers.find(m => m.id === event.organizerId)?.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Attendees: </span>
                      {event.attendees.length}
                    </div>
                    {event.budget && (
                      <div>
                        <span className="font-medium">Budget: </span>
                        £{event.budget}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
