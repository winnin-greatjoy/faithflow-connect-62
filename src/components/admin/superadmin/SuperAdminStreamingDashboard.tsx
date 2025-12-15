import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Video,
  Radio,
  Eye,
  Edit,
  Trash2,
  Plus,
  Play,
  Pause,
  Calendar,
  Users,
  Clock,
  Loader2,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Stream = Tables<'streams'> & {
  branch?: { name: string } | null;
};

export const SuperAdminStreamingDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    platform: 'youtube' | 'facebook' | 'vimeo' | 'custom' | 'supabase';
    embed_url: string;
    privacy: 'public' | 'members_only' | 'private';
    status: 'scheduled' | 'live' | 'ended' | 'archived';
    start_time: string;
    category: string;
    branch_id: string;
  }>({
    title: '',
    description: '',
    platform: 'youtube',
    embed_url: '',
    privacy: 'public',
    status: 'scheduled',
    start_time: '',
    category: '',
    branch_id: '',
  });

  // Fetch streams
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['streams-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          branch:church_branches(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Stream[];
    },
  });

  // Fetch branches for dropdown
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await supabase.from('church_branches').select('id, name');
      return data || [];
    },
  });

  // Create/Update stream mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Stream>) => {
      if (editingStream) {
        const { error } = await supabase
          .from('streams')
          .update(data)
          .eq('id', editingStream.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('streams').insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams-admin'] });
      toast.success(`Stream ${editingStream ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save stream');
    },
  });

  // Delete stream mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('streams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams-admin'] });
      toast.success('Stream deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete stream');
    },
  });

  // Update stream status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Partial<Stream> = { status: status as any };
      if (status === 'live') updates.start_time = new Date().toISOString();
      if (status === 'ended') updates.end_time = new Date().toISOString();
      
      const { error } = await supabase.from('streams').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams-admin'] });
      toast.success('Stream status updated');
    },
  });

  const stats = {
    total: streams.length,
    live: streams.filter(s => s.status === 'live').length,
    scheduled: streams.filter(s => s.status === 'scheduled').length,
    archived: streams.filter(s => s.status === 'archived' || s.status === 'ended').length,
    totalViews: streams.reduce((sum, s) => sum + (s.view_count || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      live: { color: 'bg-red-500 text-white', icon: <Radio className="h-3 w-3 animate-pulse" /> },
      scheduled: { color: 'bg-blue-100 text-blue-700', icon: <Calendar className="h-3 w-3" /> },
      ended: { color: 'bg-gray-100 text-gray-700', icon: <Pause className="h-3 w-3" /> },
      archived: { color: 'bg-gray-100 text-gray-700', icon: <Clock className="h-3 w-3" /> },
    };
    const c = config[status] || config.ended;
    return (
      <Badge className={`${c.color} flex items-center gap-1`}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const openCreateDialog = () => {
    setEditingStream(null);
    setFormData({
      title: '',
      description: '',
      platform: 'youtube',
      embed_url: '',
      privacy: 'public',
      status: 'scheduled',
      start_time: '',
      category: '',
      branch_id: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (stream: Stream) => {
    setEditingStream(stream);
    setFormData({
      title: stream.title,
      description: stream.description || '',
      platform: stream.platform,
      embed_url: stream.embed_url || '',
      privacy: stream.privacy,
      status: stream.status,
      start_time: stream.start_time ? new Date(stream.start_time).toISOString().slice(0, 16) : '',
      category: stream.category || '',
      branch_id: stream.branch_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const data: Partial<Stream> = {
      ...formData,
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
      branch_id: formData.branch_id || null,
    };

    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-7 w-7" />
            Streaming Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage live streams and recorded services across all branches
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Stream
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Now</p>
                <p className="text-2xl font-bold text-red-600">{stats.live}</p>
              </div>
              <Radio className="h-8 w-8 text-red-600 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">{stats.archived}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Streams Alert */}
      {stats.live > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Radio className="h-5 w-5 animate-pulse" />
              Live Now ({stats.live})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {streams.filter(s => s.status === 'live').map((stream) => (
                <div key={stream.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
                      <Radio className="h-5 w-5 text-red-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-medium">{stream.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {stream.branch?.name || 'All Branches'}
                        <span>•</span>
                        <Eye className="h-3 w-3" />
                        {stream.view_count || 0} viewers
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(`/portal/streaming/${stream.id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-1" /> Watch
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatusMutation.mutate({ id: stream.id, status: 'ended' })}>
                      <Pause className="h-4 w-4 mr-1" /> End
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Streams</CardTitle>
          <CardDescription>Manage all live and recorded streams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Privacy</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No streams found. Create your first stream to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  streams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell className="font-medium">{stream.title}</TableCell>
                      <TableCell>{stream.branch?.name || 'All Branches'}</TableCell>
                      <TableCell className="capitalize">{stream.platform}</TableCell>
                      <TableCell>{getStatusBadge(stream.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {stream.privacy.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{stream.view_count || 0}</TableCell>
                      <TableCell>
                        {stream.start_time ? new Date(stream.start_time).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {stream.status === 'scheduled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: stream.id, status: 'live' })}
                              title="Go Live"
                            >
                              <Play className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {stream.status === 'live' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: stream.id, status: 'ended' })}
                              title="End Stream"
                            >
                              <Pause className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(stream)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Delete this stream?')) {
                                deleteMutation.mutate(stream.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStream ? 'Edit Stream' : 'Create New Stream'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Sunday Service - Week 1"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Service description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="custom">Custom RTMP</SelectItem>
                    <SelectItem value="supabase">Supabase Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Privacy</Label>
                <Select
                  value={formData.privacy}
                  onValueChange={(value: any) => setFormData({ ...formData, privacy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members_only">Members Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Embed/Stream URL</Label>
              <Input
                value={formData.embed_url}
                onChange={(e) => setFormData({ ...formData, embed_url: e.target.value })}
                placeholder="https://youtube.com/embed/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Sunday Service, Bible Study..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingStream ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};