
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Clock, 
  User, 
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';

export const ApprovalQueue = () => {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [content, setContent] = useState<any[]>([]);

  const pendingContent = content.filter(c => c.status === 'pending_review');

  const handleApprove = (contentId: string) => {
    console.log(`Approving content ${contentId}`);
    // In real app, this would update the content status
  };

  const handleReject = (contentId: string) => {
    console.log(`Rejecting content ${contentId} with comment: ${reviewComment}`);
    // In real app, this would update the content status and add comments
    setReviewComment('');
  };

  const handleRequestChanges = (contentId: string) => {
    console.log(`Requesting changes for content ${contentId} with comment: ${reviewComment}`);
    setReviewComment('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approval Queue</span>
            <Badge variant="secondary">{pendingContent.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingContent.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No content pending approval at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingContent.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline">{item.type}</Badge>
                        {item.ministries.map((ministry) => (
                          <Badge key={ministry} variant="secondary" className="text-xs">
                            {ministry}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{item.updated_at}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Submitted for review</span>
                        </div>
                      </div>
                    </div>
                    
                    {item.featured_image && (
                      <img 
                        src={item.featured_image} 
                        alt={item.title}
                        className="w-20 h-20 rounded object-cover ml-4"
                      />
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedContent(selectedContent === item.id ? null : item.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {selectedContent === item.id ? 'Hide Details' : 'Review'}
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRequestChanges(item.id)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Request Changes
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReject(item.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Publish
                        </Button>
                      </div>
                    </div>
                    
                    {selectedContent === item.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Content Preview</h5>
                          <div className="prose prose-sm max-w-none">
                            <p>{item.body}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Review Comments
                            </label>
                            <Textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Add comments for the author..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content
              .filter(c => c.status === 'published' || c.status === 'rejected')
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'published' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">by {item.author}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'published' ? 'default' : 'destructive'}>
                    {item.status === 'published' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
