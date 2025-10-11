'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  FileText,
  FileImage,
  CheckCircle,
  AlertCircle,
  Settings,
  Activity
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

  const handleSetActiveView = (view: string) => {
    setActiveView(view);
    setSelectedContent(null);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'content':
        return <ContentList onEdit={(content) => { setSelectedContent(content); handleSetActiveView('editor'); }} />;
      case 'editor':
        return <ContentEditor
          content={selectedContent}
          onBack={() => handleSetActiveView('content')}
          onSave={(newContent) => {
            mockCMSData.content.push(newContent);
            handleSetActiveView('content');
          }}
        />;
      case 'media':
        return <MediaLibrary />;
      case 'approvals':
        return <ApprovalQueue />;
      case 'settings':
        return <CMSSettings />;
      default:
        return (
          <div className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Total Content', icon: <FileText className="h-4 w-4 text-muted-foreground" />, value: stats.totalContent },
                { title: 'Pending Review', icon: <AlertCircle className="h-4 w-4 text-orange-500" />, value: stats.pendingApprovals, color: 'text-orange-600' },
                { title: 'Published', icon: <CheckCircle className="h-4 w-4 text-green-500" />, value: stats.published, color: 'text-green-600' },
                { title: 'Drafts', icon: <Plus className="h-4 w-4 text-muted-foreground" />, value: stats.drafts }
              ].map((item, i) => (
                <Card key={i}>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle>{item.title}</CardTitle>
                    {item.icon}
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${item.color || 'text-gray-900'}`}>{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Content & Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Content</CardTitle>
                  <CardDescription>Latest published and updated content</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockCMSData.content.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      <p>No content yet. Create your first post!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mockCMSData.content.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.type}</p>
                            </div>
                          </div>
                          <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>{item.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Content waiting for review</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.pendingApprovals === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
                      <p>All caught up! No pending approvals.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mockCMSData.content
                        .filter(c => c.status === 'pending_review')
                        .slice(0, 5)
                        .map(item => (
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
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Tabs + Quick Actions */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Content Management</h1>

          <Tabs value={activeView} onValueChange={handleSetActiveView}>
            <div className="flex items-center justify-between mb-4">
              {/* Tabs */}
              <TabsList className="grid grid-cols-5 flex-1">
                <TabsTrigger value="dashboard"><Activity className="mr-2 h-4 w-4 inline"/> Dashboard</TabsTrigger>
                <TabsTrigger value="content"><FileText className="mr-2 h-4 w-4 inline"/> Content</TabsTrigger>
                <TabsTrigger value="media"><FileImage className="mr-2 h-4 w-4 inline"/> Media</TabsTrigger>
                <TabsTrigger value="approvals"><CheckCircle className="mr-2 h-4 w-4 inline"/> Approvals</TabsTrigger>
                <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4 inline"/> Settings</TabsTrigger>
              </TabsList>

              {/* Quick Action Buttons */}
              <div className="flex space-x-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleSetActiveView('editor')}>
                  <Plus className="mr-2 h-4 w-4"/> New Article
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetActiveView('media')}>
                  <FileImage className="mr-2 h-4 w-4"/> Upload Media
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetActiveView('approvals')}>
                  <CheckCircle className="mr-2 h-4 w-4"/> Review Queue
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetActiveView('content')}>
                  <FileText className="mr-2 h-4 w-4"/> Manage Content
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
