import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  FileText, 
  DollarSign, 
  Megaphone, 
  MessageSquare,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { mockCommitteeWorkspaces } from '@/data/mockCommitteeData';
import { CommitteeTaskBoard } from './CommitteeTaskBoard';
import { CommitteeMeetings } from './CommitteeMeetings';
import { CommitteeFinance } from './CommitteeFinance';

interface CommitteeWorkspaceProps {
  committeeId: number;
  committeeName: string;
  userRole: 'head' | 'secretary' | 'treasurer' | 'member' | 'observer';
}

export const CommitteeWorkspace = ({ committeeId, committeeName, userRole }: CommitteeWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState('home');
  
  // Find the workspace data (in real app, this would be fetched based on committeeId)
  const workspace = mockCommitteeWorkspaces.find(w => w.id === committeeId) || mockCommitteeWorkspaces[0];

  const getPermissionLevel = (role: string) => {
    switch (role) {
      case 'head': return 'full';
      case 'secretary': case 'treasurer': return 'manage';
      case 'member': return 'edit';
      case 'observer': return 'read';
      default: return 'read';
    }
  };

  const canManage = ['head', 'secretary', 'treasurer'].includes(userRole);
  const canEdit = ['head', 'secretary', 'treasurer', 'member'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
          <p className="text-gray-600 mt-1">{workspace.description}</p>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Badge>
            <Badge variant={getPermissionLevel(userRole) === 'full' ? 'default' : 'secondary'}>
              {getPermissionLevel(userRole)} access
            </Badge>
          </div>
        </div>
        {canManage && (
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Manage Committee
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Tasks</p>
                <p className="text-lg font-bold">{workspace.stats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold">{workspace.stats.pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Overdue</p>
                <p className="text-lg font-bold">{workspace.stats.overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Meetings</p>
                <p className="text-lg font-bold">{workspace.stats.upcomingMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-gray-600">Budget</p>
                <p className="text-lg font-bold">£{workspace.stats.monthlyBudget}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Spent</p>
                <p className="text-lg font-bold">£{workspace.stats.spent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-600">Publications</p>
                <p className="text-lg font-bold">{workspace.stats.publications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Progress</p>
                <p className="text-lg font-bold">
                  {Math.round((workspace.stats.completedTasks / workspace.stats.totalTasks) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="home" className="flex items-center space-x-1">
            <Home className="h-3 w-3" />
            <span className="hidden sm:inline">Home</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-1">
            <CheckSquare className="h-3 w-3" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Meetings</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="publications" className="flex items-center space-x-1">
            <Megaphone className="h-3 w-3" />
            <span className="hidden sm:inline">Publications</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-1">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for {committeeName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {canEdit && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Create New Task
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  </>
                )}
                {canManage && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Record Expense
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Megaphone className="mr-2 h-4 w-4" />
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
                      <p className="text-sm">Task "Prepare Monthly Report" completed by David Clark</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">New meeting scheduled for February 3rd</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">Finance update published to ministry page</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <CommitteeTaskBoard 
            committeeId={committeeId} 
            userRole={userRole}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="meetings">
          <CommitteeMeetings 
            committeeId={committeeId}
            userRole={userRole}
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="documents">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Documents Module</h3>
            <p className="mt-1 text-sm text-gray-500">Coming soon - File management and templates</p>
          </div>
        </TabsContent>

        <TabsContent value="finance">
          <CommitteeFinance 
            committeeId={committeeId}
            userRole={userRole}
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="publications">
          <div className="text-center py-8">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Publications Module</h3>
            <p className="mt-1 text-sm text-gray-500">Coming soon - Content management and publishing</p>
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chat Module</h3>
            <p className="mt-1 text-sm text-gray-500">Coming soon - Team communication and notes</p>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports Module</h3>
            <p className="mt-1 text-sm text-gray-500">Coming soon - Analytics and downloadable reports</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
