'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, easeIn, easeOut } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, FileImage, CheckCircle, AlertCircle, Settings, Activity } from 'lucide-react';

import { ContentList } from './ContentList';
import { ContentEditor } from './ContentEditor';
import { MediaLibrary } from './MediaLibrary';
import { ApprovalQueue } from './ApprovalQueue';
import { CMSSettings } from './CMSSettings';

export const CMSDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedContent, setSelectedContent] = useState(null);
  const [content, setContent] = useState<any[]>([]);

  const stats = {
    totalContent: content.length,
    pendingApprovals: content.filter(c => c.status === 'pending_review').length,
    published: content.filter(c => c.status === 'published').length,
    drafts: content.filter(c => c.status === 'draft').length,
  };

  const handleSetActiveView = (view: string) => {
    setActiveView(view);
    setSelectedContent(null);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'content':
        return (
          <ContentList
            onEdit={(content) => {
              setSelectedContent(content);
              handleSetActiveView('editor');
            }}
            onView={(content) => {
              // For now, just show an alert. In a real app, this would open a view modal or navigate to a view page
              alert(`Viewing content: ${content.title}`);
            }}
            onDelete={(contentId) => {
              setContent(prev => prev.filter(c => c.id !== contentId));
              // Force re-render by updating state or triggering a refresh
              window.location.reload(); // Simple refresh for demo purposes
            }}
          />
        );
      case 'editor':
        return (
          <ContentEditor
            content={selectedContent}
            onBack={() => handleSetActiveView('content')}
            onSave={(newContent) => {
              setContent(prev => [...prev, newContent]);
              handleSetActiveView('content');
            }}
          />
        );
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Total Content', icon: <FileText className="h-4 w-4 text-muted-foreground" />, value: stats.totalContent },
                { title: 'Pending Review', icon: <AlertCircle className="h-4 w-4 text-orange-500" />, value: stats.pendingApprovals, color: 'text-orange-600' },
                { title: 'Published', icon: <CheckCircle className="h-4 w-4 text-green-500" />, value: stats.published, color: 'text-green-600' },
                { title: 'Drafts', icon: <Plus className="h-4 w-4 text-muted-foreground" />, value: stats.drafts }
              ].map((item, i) => (
                <Card key={i} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${item.color || 'text-gray-900'}`}>
                      {item.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Content & Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Content</CardTitle>
                  <CardDescription>Latest published and updated content</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {content.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      <p>No content yet. Create your first post!</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto px-6 pb-6">
                      <div className="space-y-3">
                        {content.slice(0, 10).map(item => (
                          <div key={item.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' : item.status === 'pending_review' ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                                <Badge variant={item.status === 'published' ? 'default' : item.status === 'pending_review' ? 'secondary' : 'outline'} className="text-xs">
                                  {item.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.type}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                <span>By {item.author}</span>
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pending Approvals</CardTitle>
                  <CardDescription>Content waiting for review</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {stats.pendingApprovals === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
                      <p>All caught up! No pending approvals.</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto px-6 pb-6">
                      <div className="space-y-3">
                        {content
                          .filter(c => c.status === 'pending_review')
                          .slice(0, 10)
                          .map(item => (
                            <div key={item.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.status.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                    <span>By {item.author}</span>
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetActiveView('approvals')}
                                    className="h-7 px-2 text-xs"
                                  >
                                    Review
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  // Animation variants for page transitions
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.25, ease: easeIn } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">

          {/* Top Row: Title + Quick Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleSetActiveView('editor')}>
                <Plus className="mr-2 h-4 w-4" /> New Article
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSetActiveView('media')}>
                <FileImage className="mr-2 h-4 w-4" /> Upload Media
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSetActiveView('approvals')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Review Queue
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSetActiveView('content')}>
                <FileText className="mr-2 h-4 w-4" /> Manage Content
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full">
            <Tabs value={activeView} onValueChange={handleSetActiveView}>
              <TabsList className="grid grid-cols-5 gap-1 w-full">
                <TabsTrigger value="dashboard"><Activity className="mr-2 h-4 w-4 inline" /> Dashboard</TabsTrigger>
                <TabsTrigger value="content"><FileText className="mr-2 h-4 w-4 inline" /> Content</TabsTrigger>
                <TabsTrigger value="media"><FileImage className="mr-2 h-4 w-4 inline" /> Media</TabsTrigger>
                <TabsTrigger value="approvals"><CheckCircle className="mr-2 h-4 w-4 inline" /> Approvals</TabsTrigger>
                <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4 inline" /> Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Animated Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
