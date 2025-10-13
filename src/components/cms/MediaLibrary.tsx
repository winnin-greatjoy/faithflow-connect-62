'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Grid3X3,
  List,
  Image,
  FileText,
  Film,
  Music,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { mockCMSData } from '@/data/mockCMSData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MediaLibrary = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [uploadFiles, setUploadFiles] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState(mockCMSData.media);

  // Helpers
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Film className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Filtered view
  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.alt_text || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Upload handling (selected files preview & rename)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selected = Array.from(files).map((file) => {
      const type = file.type.startsWith('image')
        ? 'image'
        : file.type.startsWith('video')
        ? 'video'
        : file.type.startsWith('audio')
        ? 'audio'
        : 'document';
      return {
        id: Date.now() + Math.random(),
        file,
        filename: file.name,
        size: file.size,
        type,
        previewUrl: URL.createObjectURL(file),
      };
    });
    setUploadFiles(selected);
  };

  const handleRename = (id: number, newName: string) => {
    setUploadFiles((prev) => prev.map((f) => (f.id === id ? { ...f, filename: newName } : f)));
  };

  const handleConfirmUpload = () => {
    if (uploadFiles.length === 0) return;
    const newMedia = uploadFiles.map((f) => ({
      id: f.id,
      filename: f.filename,
      alt_text: f.filename,
      size: f.size,
      type: f.type,
      url: f.previewUrl,
      usage_count: 0,
      uploaded_by: 'You',
      created_at: new Date().toLocaleString(),
    }));
    setMediaItems((prev) => [...newMedia, ...prev]);
    setUploadFiles([]);
    setUploadOpen(false);
  };

  // Preview modal
  const openPreview = (item: any) => {
    setSelectedMedia(item);
    setPreviewOpen(true);
  };

  // Download action (works for both remote URLs and blob URLs)
  const handleDownload = (item: any) => {
    try {
      const link = document.createElement('a');
      link.href = item.url;
      // if url is remote, browser will attempt to download; setting download attribute for same-origin/blobs
      link.setAttribute('download', item.filename || 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // Fallback: open in new tab (useful for cross-origin remote URLs)
      window.open(item.url, '_blank', 'noopener');
    }
  };

  // Delete action with cleanup for blob URLs
  const handleDelete = (id: string | number) => {
    const toDelete = mediaItems.find((m) => m.id === id);
    if (!toDelete) return;
    if (!confirm(`Delete "${toDelete.filename}"? This action cannot be undone.`)) return;

    // Revoke object URL if it was created locally
    try {
      if (toDelete.url && typeof toDelete.url === 'string' && toDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(toDelete.url);
      }
    } catch (e) {
      // ignore
    }

    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    // if the currently opened preview is the deleted item, close it
    if (selectedMedia?.id === id) {
      setPreviewOpen(false);
      setSelectedMedia(null);
    }
  };

  // Remove selected upload (before confirm)
  const removePendingUpload = (id: number) => {
    // revoke preview URL to avoid memory leaks
    const f = uploadFiles.find((u) => u.id === id);
    if (f?.previewUrl?.startsWith?.('blob:')) {
      try {
        URL.revokeObjectURL(f.previewUrl);
      } catch {}
    }
    setUploadFiles((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Media Library</CardTitle>

            {/* Upload trigger */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload New Media</DialogTitle>
                  <DialogDescription>
                    Select files and optionally rename them before confirming.
                  </DialogDescription>
                </DialogHeader>

                <Input type="file" multiple onChange={handleFileSelect} className="mb-4" />

                {uploadFiles.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-2">
                    {uploadFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 p-2 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                            {file.type === 'image' ? (
                              <img src={file.previewUrl} alt={file.filename} className="w-full h-full object-cover" />
                            ) : file.type === 'video' ? (
                              <Film className="h-6 w-6 text-gray-500" />
                            ) : file.type === 'audio' ? (
                              <Music className="h-6 w-6 text-gray-500" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-500" />
                            )}
                          </div>

                          <div>
                            <Input
                              value={file.filename}
                              onChange={(e) => handleRename(file.id, e.target.value)}
                              className="text-sm font-medium w-64"
                            />
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => removePendingUpload(file.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No files selected yet.</p>
                )}

                <div className="mt-4 flex gap-2">
                  <Button className="w-full" disabled={uploadFiles.length === 0} onClick={handleConfirmUpload}>
                    Confirm Upload
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // cleanup preview URLs for pending files
                      uploadFiles.forEach((f) => {
                        if (f.previewUrl?.startsWith?.('blob:')) {
                          try {
                            URL.revokeObjectURL(f.previewUrl);
                          } catch {}
                        }
                      });
                      setUploadFiles([]);
                      setUploadOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>

              <div className="flex border rounded-md">
                <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'} onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Media Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.alt_text || item.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        {getFileIcon(item.type)}
                        <span className="text-xs mt-1 uppercase">{item.type}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-medium truncate">{item.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.usage_count ?? 0} uses
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPreview(item)}>
                          <Eye className="h-4 w-4 mr-2" /> Preview
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleDownload(item)}>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.alt_text || item.filename} className="w-full h-full object-cover rounded" />
                      ) : (
                        getFileIcon(item.type)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(item.size)} • {item.uploaded_by ?? '—'} • {item.created_at ?? '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.usage_count ?? 0} uses</Badge>
                    <Button size="sm" variant="ghost" onClick={() => openPreview(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(item)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal (smaller & constrained height) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{selectedMedia?.filename}</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt_text || selectedMedia.filename}
                  className="w-full rounded-lg max-h-[50vh] object-contain"
                />
              ) : selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} controls className="w-full rounded-lg max-h-[50vh]" />
              ) : selectedMedia.type === 'audio' ? (
                <audio src={selectedMedia.url} controls className="w-full" />
              ) : (
                <div className="flex items-center justify-center text-gray-500">
                  <FileText className="h-8 w-8 mr-2" /> Document Preview Unavailable
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p><strong>Type:</strong> {selectedMedia.type}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedMedia.size)}</p>
                <p><strong>Uploaded by:</strong> {selectedMedia.uploaded_by ?? '—'}</p>
                <p><strong>Created:</strong> {selectedMedia.created_at ?? '—'}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => handleDownload(selectedMedia)}>Download</Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedMedia.id)}>Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
