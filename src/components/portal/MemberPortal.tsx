
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Heart, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  Bell, 
  FileText,
  Settings,
  LogOut,
  Home,
  Church,
  Users,
  BookOpen,
  Gift,
  MessageSquare
} from 'lucide-react';

interface MemberPortalProps {
  memberId: number;
  memberName: string;
  membershipLevel: 'baptized' | 'convert' | 'visitor';
  baptizedSubLevel?: 'leader' | 'worker';
  ministry: string;
  department?: string;
}

export const MemberPortal = ({ 
  memberId, 
  memberName, 
  membershipLevel, 
  baptizedSubLevel,
  ministry,
  department 
}: MemberPortalProps) => {
  const [activeTab, setActiveTab] = useState('home');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const canAccessCommittees = membershipLevel === 'baptized';
  const isLeaderOrWorker = baptizedSubLevel === 'leader' || baptizedSubLevel === 'worker';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback>{getInitials(memberName)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{memberName}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{membershipLevel}</Badge>
                  {baptizedSubLevel && (
                    <Badge variant="secondary">{baptizedSubLevel}</Badge>
                  )}
                  <Badge variant="outline">{ministry}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="home" className="flex items-center space-x-1">
              <Home className="h-3 w-3" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3" />
              <span className="hidden sm:inline">Giving</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            {canAccessCommittees && (
              <TabsTrigger value="tasks" className="flex items-center space-x-1">
                <CheckSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="resources" className="flex items-center space-x-1">
              <BookOpen className="h-3 w-3" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="prayer" className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Prayer</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Welcome back, {memberName.split(' ')[0]}!</CardTitle>
                  <CardDescription>Here's what's happening in your church community</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Church className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">3</p>
                      <p className="text-sm text-gray-600">Upcoming Events</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">GH₵2,450</p>
                      <p className="text-sm text-gray-600">YTD Giving</p>
                    </div>
                    {canAccessCommittees && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <CheckSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">2</p>
                        <p className="text-sm text-gray-600">Pending Tasks</p>
                      </div>
                    )}
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Heart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">1</p>
                      <p className="text-sm text-gray-600">Prayer Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Make Contribution
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Register for Event
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="mr-2 h-4 w-4" />
                    Submit Prayer Request
                  </Button>
                  {canAccessCommittees && (
                    <Button className="w-full justify-start" variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      View My Tasks
                    </Button>
                  )}
                  <Button className="w-full justify-start" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">Contributed GH₵500 to Building Fund</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">Registered for Men's Fellowship Retreat</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                  </div>
                  {canAccessCommittees && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm">Completed task: Monthly Financial Report</p>
                        <p className="text-xs text-gray-500">1 week ago</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Profile Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal information and church details
              </p>
            </div>
          </TabsContent>

          <TabsContent value="contributions">
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Giving & Contributions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Track your giving history and manage pledges
              </p>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Events & Meetings</h3>
              <p className="mt-1 text-sm text-gray-500">
                View upcoming events and manage your registrations
              </p>
            </div>
          </TabsContent>

          {canAccessCommittees && (
            <TabsContent value="tasks">
              <div className="text-center py-8">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">My Tasks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your committee and department tasks
                </p>
              </div>
            </TabsContent>
          )}

          <TabsContent value="resources">
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Resources</h3>
              <p className="mt-1 text-sm text-gray-500">
                Access sermon notes, study materials, and church documents
              </p>
            </div>
          </TabsContent>

          <TabsContent value="prayer">
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Prayer & Care</h3>
              <p className="mt-1 text-sm text-gray-500">
                Submit prayer requests and receive pastoral care
              </p>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Messages</h3>
              <p className="mt-1 text-sm text-gray-500">
                Receive announcements and communicate with leadership
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
