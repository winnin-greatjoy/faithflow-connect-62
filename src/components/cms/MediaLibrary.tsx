
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image, 
  FileText, 
  Film, 
  Music,
  MoreHorizontal,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { mockCMSData } from '@/data/mockCMSData';

export const MediaLibrary = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMedia = mockCMSData.media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alt_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesType;
  });

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Media Library</CardTitle>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
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
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Media Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt={item.alt_text}
                        className="w-full h-full object-cover"
                      />
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
                      {item.usage_count} uses
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.alt_text}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        getFileIcon(item.type)
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(item.size)} • {item.uploaded_by} • {item.created_at}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.usage_count} uses</Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
