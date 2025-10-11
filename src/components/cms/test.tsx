
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Mic, 
  FileImage, 
  Settings, 
  Activity,
  Search,
  Bell,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ContentList } from './ContentList';
import { ContentEditor } from './ContentEditor';
import { MediaLibrary } from './MediaLibrary';
import { ApprovalQueue } from './ApprovalQueue';
import { CMSSettings } from './CMSSettings';
import { mockCMSData } from '@/data/mockCMSData';

export const CMSDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedContent, setSelectedContent] = useState(null);

  const stats = {
    totalContent: mockCMSData.content.length,
    pendingApprovals: mockCMSData.content.filter(c => c.status === 'pending_review').length,
    published: mockCMSData.content.filter(c => c.status === 'published').length,
    drafts: mockCMSData.content.filter(c => c.status === 'draft').length,
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'content':
        return <ContentList onEdit={(content) => {
          setSelectedContent(content);
          setActiveView('editor');
        }} />;
      case 'editor':
        return <ContentEditor content={selectedContent} onBack={() => {
          setSelectedContent(null);
          setActiveView('content');
        }} />;
      case 'media':
        return <MediaLibrary />;
      case 'approvals':
        return <ApprovalQueue />;
      case 'settings':
        return <CMSSettings />;
      default:
        return (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContent}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.drafts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Content</CardTitle>
                  <CardDescription>Latest published and updated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCMSData.content.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          </div>
                        </div>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Content waiting for review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCMSData.content
                      .filter(c => c.status === 'pending_review')
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">by {item.author}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Review</Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveView('editor')}>
                    <Plus className="h-6 w-6" />
                    <span>New Article</span>
                  </Button>
                  <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveView('media')}>
                    <FileImage className="h-6 w-6" />
                    <span>Upload Media</span>
                  </Button>
                  <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveView('approvals')}>
                    <CheckCircle className="h-6 w-6" />
                    <span>Review Queue</span>
                  </Button>
                  <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveView('content')}>
                    <FileText className="h-6 w-6" />
                    <span>Manage Content</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {stats.pendingApprovals > 0 && (
                  <Badge className="ml-2" variant="destructive">{stats.pendingApprovals}</Badge>
                )}
              </Button>
              <Button size="sm" onClick={() => setActiveView('editor')}>
                <Plus className="mr-2 h-4 w-4" />
                New Content
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-2">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('dashboard')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeView === 'content' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('content')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Content
              </Button>
              <Button
                variant={activeView === 'media' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('media')}
              >
                <FileImage className="mr-2 h-4 w-4" />
                Media Library
              </Button>
              <Button
                variant={activeView === 'approvals' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('approvals')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approvals
                {stats.pendingApprovals > 0 && (
                  <Badge className="ml-auto" variant="destructive">{stats.pendingApprovals}</Badge>
                )}
              </Button>
              <Button
                variant={activeView === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
