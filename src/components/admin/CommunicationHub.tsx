
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Bell, Send, Users, Clock } from 'lucide-react';

export const CommunicationHub = () => {
  const [messageType, setMessageType] = useState('email');

  const recentMessages = [
    { id: 1, type: 'Email', subject: 'Sunday Service Reminder', recipients: 342, sent: '2024-01-06 10:00', status: 'Delivered' },
    { id: 2, type: 'SMS', subject: 'Prayer Meeting Tonight', recipients: 89, sent: '2024-01-05 16:30', status: 'Delivered' },
    { id: 3, type: 'Push', subject: 'New Sermon Available', recipients: 156, sent: '2024-01-04 14:15', status: 'Delivered' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
        <p className="text-gray-600 mt-2">Send messages and stay connected with your congregation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>Send messages to your congregation via email, SMS, or push notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={messageType} onValueChange={setMessageType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email" className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    SMS
                  </TabsTrigger>
                  <TabsTrigger value="push" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    Push
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      placeholder="Enter email subject..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea 
                      placeholder="Type your message here..."
                      className="min-h-[200px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SMS Message (160 characters max)</label>
                    <Textarea 
                      placeholder="Type your SMS message here..."
                      className="min-h-[100px]"
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500 mt-1">Character count: 0/160</p>
                  </div>
                </TabsContent>

                <TabsContent value="push" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Notification Title</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      placeholder="Enter notification title..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea 
                      placeholder="Type your push notification message..."
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  <Users className="inline mr-1 h-4 w-4" />
                  Sending to: All members (342 recipients)
                </div>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates and Recipients */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Use pre-made templates for common messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                Sunday Service Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Event Registration Open
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Prayer Request Update
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                New Member Welcome
              </Button>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Choose who receives your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" size="sm">
                All Members <Badge variant="secondary">342</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" size="sm">
                Men's Ministry <Badge variant="secondary">45</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" size="sm">
                Women's Ministry <Badge variant="secondary">52</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" size="sm">
                Youth Ministry <Badge variant="secondary">28</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" size="sm">
                Volunteers <Badge variant="secondary">67</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>View your message history and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{message.type}</Badge>
                  <div>
                    <h4 className="font-medium">{message.subject}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Users className="mr-1 h-3 w-3" />
                      {message.recipients} recipients
                      <Clock className="ml-3 mr-1 h-3 w-3" />
                      {message.sent}
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">{message.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
