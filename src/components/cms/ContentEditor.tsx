
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Send, 
  Eye, 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Globe, 
  Users, 
  Image,
  Bold,
  Italic,
  Link,
  List
} from 'lucide-react';

interface ContentEditorProps {
  content?: any;
  onBack: () => void;
  onSave: (content: any) => void;
}

export const ContentEditor = ({ content, onBack }: ContentEditorProps) => {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    slug: content?.slug || '',
    summary: content?.summary || '',
    body: content?.body || '',
    type: content?.type || 'article',
    status: content?.status || 'draft',
    visibility: content?.visibility || 'public',
    ministries: content?.ministries || [],
    tags: content?.tags || [],
    featured_image: content?.featured_image || '',
    publish_at: content?.publish_at || '',
    meta_title: content?.meta_title || '',
    meta_description: content?.meta_description || '',
  });

  const contentTypes = [
    { value: 'article', label: 'Article / News Post' },
    { value: 'event', label: 'Event Page' },
    { value: 'sermon', label: 'Sermon' },
    { value: 'publication', label: 'Publication / Bulletin' },
    { value: 'ministry_update', label: 'Ministry Update' },
    { value: 'hero_banner', label: 'Hero Banner / CTA' },
    { value: 'page', label: 'Standalone Page' },
  ];

  const ministries = ['mens', 'womens', 'youth', 'childrens', 'seniors'];
  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'members', label: 'Members Only' },
    { value: 'ministry', label: 'Ministry Only' },
    { value: 'leaders', label: 'Leaders Only' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMinistryToggle = (ministry: string) => {
    setFormData(prev => ({
      ...prev,
      ministries: prev.ministries.includes(ministry)
        ? prev.ministries.filter(m => m !== ministry)
        : [...prev.ministries, ministry]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Button>
          <h2 className="text-2xl font-semibold">
            {content ? 'Edit Content' : 'Create New Content'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Request Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter content title..."
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="content-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief summary of the content..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) => handleInputChange('featured_image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Body</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder="Write your content here..."
                rows={15}
                className="font-mono"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="publish_at">Publish Date</Label>
                <Input
                  id="publish_at"
                  type="datetime-local"
                  value={formData.publish_at}
                  onChange={(e) => handleInputChange('publish_at', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                  {formData.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ministries */}
          <Card>
            <CardHeader>
              <CardTitle>Ministries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ministries.map((ministry) => (
                  <div key={ministry} className="flex items-center space-x-2">
                    <Checkbox
                      id={ministry}
                      checked={formData.ministries.includes(ministry)}
                      onCheckedChange={() => handleMinistryToggle(ministry)}
                    />
                    <Label htmlFor={ministry} className="capitalize">
                      {ministry} Ministry
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO title (60 chars max)"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="SEO description (160 chars max)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
