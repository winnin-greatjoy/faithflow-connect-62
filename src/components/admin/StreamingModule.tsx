import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Video, Radio } from 'lucide-react';
import { streamingApi, type Stream } from '@/services/streaming/streamingApi';
import { useBranches } from '@/hooks/useBranches';
import { toast } from 'sonner';
import { uploadFile } from '@/utils/api';

export function StreamingModule() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const { branches } = useBranches();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'youtube' as Stream['platform'],
    embed_url: '',
    video_url: '',
    thumbnail_url: '',
    privacy: 'public' as Stream['privacy'],
    status: 'scheduled' as Stream['status'],
    start_time: '',
    category: '',
    branch_id: '',
    storage_path: '',
  });
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadStreams();
  }, []);

  async function loadStreams() {
    setLoading(true);
    const result = await streamingApi.list();
    if (result.data) {
      setStreams(result.data);
    }
    setLoading(false);
  }

  function openCreateDialog() {
    setEditingStream(null);
    setFormData({
      title: '',
      description: '',
      platform: 'youtube',
      embed_url: '',
      video_url: '',
      thumbnail_url: '',
      privacy: 'public',
      status: 'scheduled',
      start_time: '',
      category: '',
      branch_id: '',
      storage_path: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(stream: Stream) {
    setEditingStream(stream);
    setFormData({
      title: stream.title,
      description: stream.description || '',
      platform: stream.platform,
      embed_url: stream.embed_url || '',
      video_url: stream.video_url || '',
      thumbnail_url: stream.thumbnail_url || '',
      privacy: stream.privacy,
      status: stream.status,
      start_time: stream.start_time ? new Date(stream.start_time).toISOString().slice(0, 16) : '',
      category: stream.category || '',
      branch_id: stream.branch_id || '',
      storage_path: stream.storage_path || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const streamData: Partial<Stream> = {
      ...formData,
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : undefined,
      is_featured: false,
    };

    const result = editingStream
      ? await streamingApi.update(editingStream.id, streamData)
      : await streamingApi.create(streamData as any);

    if (result.error) {
      toast.error(result.error.message || 'Failed to save stream');
      return;
    }

    toast.success(`Stream ${editingStream ? 'updated' : 'created'} successfully`);
    setIsDialogOpen(false);
    loadStreams();
  }

  async function handleUpload() {
    if (!file) {
      toast.error('Select a video file to upload');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }
    try {
      setUploading(true);
      const bucket = formData.privacy === 'public' ? 'public-videos' : 'private-videos';
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const slugBase = formData.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'video';
      const path = `${slugBase}-${Date.now()}.${ext}`;
      const res = await uploadFile(bucket, path, file, { contentType: file.type || undefined });
      if (res.error) {
        toast.error(res.error.message || 'Upload failed');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        platform: 'supabase',
        storage_path: path,
        embed_url: '',
        video_url: '',
      }));
      toast.success('Uploaded to storage');
    } catch (e: any) {
      toast.error(String(e?.message || e));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this stream?')) return;

    const result = await streamingApi.delete(id);
    if (result.error) {
      toast.error(result.error.message || 'Failed to delete stream');
      return;
    }

    toast.success('Stream deleted successfully');
    loadStreams();
  }

  async function handleStatusChange(stream: Stream, newStatus: Stream['status']) {
    const updates: Partial<Stream> = { status: newStatus };
    if (newStatus === 'live' && !stream.start_time) {
      updates.start_time = new Date().toISOString();
    }
    if (newStatus === 'ended' && !stream.end_time) {
      updates.end_time = new Date().toISOString();
    }

    const result = await streamingApi.update(stream.id, updates);
    if (result.error) {
      toast.error(result.error.message || 'Failed to update status');
      return;
    }

    toast.success('Stream status updated');
    loadStreams();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Streaming Management
              </CardTitle>
              <CardDescription>Manage live streams and recorded services</CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              New Stream
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading streams...
                  </TableCell>
                </TableRow>
              ) : streams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No streams found. Create your first stream to get started.
                  </TableCell>
                </TableRow>
              ) : (
                streams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">{stream.title}</TableCell>
                    <TableCell className="capitalize">{stream.platform}</TableCell>
                    <TableCell>
                      <Select
                        value={stream.status}
                        onValueChange={(value) => handleStatusChange(stream, value as Stream['status'])}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {stream.privacy.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{stream.view_count}</TableCell>
                    <TableCell>
                      {stream.start_time
                        ? new Date(stream.start_time).toLocaleString()
                        : 'Not set'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/portal/streaming/${stream.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(stream)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(stream.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStream ? 'Edit Stream' : 'Create New Stream'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Sunday Service - Week 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Service description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platform: value as Stream['platform'] })
                  }
                >
                  <SelectTrigger id="platform">
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
                <Label htmlFor="privacy">Privacy</Label>
                <Select
                  value={formData.privacy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, privacy: value as Stream['privacy'] })
                  }
                >
                  <SelectTrigger id="privacy">
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
              <Label htmlFor="embed_url">Embed/Stream URL</Label>
              <Input
                id="embed_url"
                value={formData.embed_url}
                onChange={(e) => setFormData({ ...formData, embed_url: e.target.value })}
                placeholder="https://youtube.com/embed/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage_upload">Upload video to Supabase Storage</Label>
              <div className="flex items-center gap-2">
                <Input id="storage_upload" type="file" accept="video/*,application/vnd.apple.mpegurl,video/mp2t" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="secondary" onClick={handleUpload} disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {formData.storage_path && (
                <div className="text-sm text-muted-foreground">Stored as: {formData.storage_path}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Sunday Service, Bible Study..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingStream ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
