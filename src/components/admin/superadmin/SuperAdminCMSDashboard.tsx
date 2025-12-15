import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Image,
  Video,
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Folder,
  Settings,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'page' | 'announcement' | 'sermon';
  status: 'draft' | 'pending' | 'published';
  author: string;
  createdAt: string;
  updatedAt: string;
}

export const SuperAdminCMSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  // Mock data - in production, this would come from Supabase
  const [contentItems] = useState<ContentItem[]>([
    { id: '1', title: 'Welcome to Our Church', type: 'page', status: 'published', author: 'Admin', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '2', title: 'Sunday Service Announcement', type: 'announcement', status: 'published', author: 'Pastor John', createdAt: '2024-01-14', updatedAt: '2024-01-14' },
    { id: '3', title: 'Faith and Hope Sermon', type: 'sermon', status: 'pending', author: 'Pastor John', createdAt: '2024-01-13', updatedAt: '2024-01-13' },
    { id: '4', title: 'Youth Ministry Article', type: 'article', status: 'draft', author: 'Youth Leader', createdAt: '2024-01-12', updatedAt: '2024-01-12' },
  ]);

  const stats = {
    totalContent: contentItems.length,
    published: contentItems.filter(c => c.status === 'published').length,
    pending: contentItems.filter(c => c.status === 'pending').length,
    drafts: contentItems.filter(c => c.status === 'draft').length,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { icon: Clock, variant: 'secondary' as const, label: 'Draft' },
      pending: { icon: AlertCircle, variant: 'outline' as const, label: 'Pending Review' },
      published: { icon: CheckCircle, variant: 'default' as const, label: 'Published' },
    };
    const c = config[status as keyof typeof config] || config.draft;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1">
        <c.icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      article: FileText,
      page: Globe,
      announcement: AlertCircle,
      sermon: Video,
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7" />
            Content Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage website content, pages, and media
          </p>
        </div>
        <Button onClick={() => { setEditingContent(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{stats.totalContent}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{stats.drafts}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">All Content</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Content */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
                <CardDescription>Latest published and updated items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {item.author} • {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common content management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6" />
                    <span>New Article</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Globe className="h-6 w-6" />
                    <span>New Page</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6" />
                    <span>Upload Media</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Video className="h-6 w-6" />
                    <span>Add Sermon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          {stats.pending > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  Pending Approvals ({stats.pending})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentItems.filter(c => c.status === 'pending').map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">by {item.author}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>All Content</CardTitle>
              <CardDescription>Manage all website content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>Manage images, videos, and documents</CardDescription>
                </div>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-16 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Media Library</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop files here or click to upload
                  </p>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                CMS Settings
              </CardTitle>
              <CardDescription>Configure content management settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Content Status</Label>
                  <Select defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (requires manual publish)</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="published">Published (auto-publish)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content Categories</Label>
                  <Textarea 
                    placeholder="Enter categories, one per line"
                    defaultValue="News\nAnnouncements\nSermons\nEvents\nTestimonies"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Approval Workflow</Label>
                  <Select defaultValue="required">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No approval required</SelectItem>
                      <SelectItem value="required">Approval required for all content</SelectItem>
                      <SelectItem value="external">External authors only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContent ? 'Edit Content' : 'Create New Content'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Enter content title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue="article">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="sermon">Sermon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Submit for Review</SelectItem>
                    <SelectItem value="published">Publish Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea placeholder="Write your content here..." rows={10} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Content saved'); setIsDialogOpen(false); }}>
              {editingContent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};