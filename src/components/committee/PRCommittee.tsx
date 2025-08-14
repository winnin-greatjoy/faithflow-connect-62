
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Megaphone, 
  Calendar, 
  FileText, 
  Image, 
  Video, 
  BarChart3,
  Eye,
  MousePointer,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Users
} from 'lucide-react';
import { mockPublications, mockMediaAssets } from '@/data/mockCommitteeData';
import { Publication, MediaAsset } from '@/types/committees';

interface PRCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const PRCommittee = ({ userRole, canManage }: PRCommitteeProps) => {
  const [publications] = useState<Publication[]>(mockPublications);
  const [mediaAssets] = useState<MediaAsset[]>(mockMediaAssets);

  const getPublicationsByStatus = (status: Publication['status']) => {
    return publications.filter(pub => pub.status === status);
  };

  const getStatusColor = (status: Publication['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'event_promo': return <Calendar className="h-4 w-4" />;
      case 'newsletter': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'ministry_only': return <Users className="h-4 w-4" />;
      case 'church_wide': return <Globe className="h-4 w-4" />;
      case 'public': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const PublicationCard = ({ publication }: { publication: Publication }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(publication.type)}
            <div className="flex-1">
              <CardTitle className="text-sm">{publication.title}</CardTitle>
              <CardDescription className="text-xs">
                by {publication.authorName} • {new Date(publication.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(publication.status)}>
            {publication.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{publication.content}</p>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            {getAudienceIcon(publication.audience)}
            <span className="capitalize">{publication.audience.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Type: {publication.type.replace('_', ' ')}</span>
          </div>
        </div>

        {publication.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {publication.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {publication.status === 'published' && (
          <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gray-50 rounded">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-xs">
                <Eye className="h-3 w-3" />
                <span>{publication.analytics.views}</span>
              </div>
              <p className="text-xs text-gray-500">Views</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-xs">
                <MousePointer className="h-3 w-3" />
                <span>{publication.analytics.clicks}</span>
              </div>
              <p className="text-xs text-gray-500">Clicks</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-xs">
                <Share2 className="h-3 w-3" />
                <span>{publication.analytics.shares}</span>
              </div>
              <p className="text-xs text-gray-500">Shares</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {publication.publishDate && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Publish: {new Date(publication.publishDate).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              Edit
            </Button>
            {publication.status === 'draft' && canManage && (
              <Button size="sm" variant="outline">
                Submit for Review
              </Button>
            )}
            {publication.status === 'review' && canManage && (
              <Button size="sm" variant="outline">
                Approve
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="publications" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="publications">Publications</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="media">Media Library</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="publications" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Publications</h3>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Publication
            </Button>
          )}
        </div>

        {/* Status Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['draft', 'review', 'approved', 'published', 'archived'].map((status) => {
            const statusPublications = getPublicationsByStatus(status as Publication['status']);
            return (
              <div key={status} className="min-h-96">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm capitalize">{status}</h4>
                  <Badge variant="secondary">{statusPublications.length}</Badge>
                </div>
                <div className="space-y-2">
                  {statusPublications.map(publication => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Content Calendar</h3>
          <p className="mt-1 text-sm text-gray-500">
            Plan and schedule your content publishing
          </p>
        </div>
      </TabsContent>

      <TabsContent value="media" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Media Library</h3>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaAssets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {asset.type === 'image' && <Image className="h-4 w-4" />}
                  {asset.type === 'video' && <Video className="h-4 w-4" />}
                  {asset.type === 'document' && <FileText className="h-4 w-4" />}
                  <span className="font-medium text-sm">{asset.filename}</span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{asset.description}</p>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{(asset.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                </div>
                
                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {asset.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Content Analytics</h3>
          <p className="mt-1 text-sm text-gray-500">
            Track engagement and performance metrics
          </p>
        </div>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Content Templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pre-designed templates for quick content creation
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
