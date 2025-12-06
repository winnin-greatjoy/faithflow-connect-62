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
    {
      id: 1,
      type: 'Email',
      subject: 'Sunday Service Reminder',
      recipients: 342,
      sent: '2024-01-06 10:00',
      status: 'Delivered',
    },
    {
      id: 2,
      type: 'SMS',
      subject: 'Prayer Meeting Tonight',
      recipients: 89,
      sent: '2024-01-05 16:30',
      status: 'Delivered',
    },
    {
      id: 3,
      type: 'Push',
      subject: 'New Sermon Available',
      recipients: 156,
      sent: '2024-01-04 14:15',
      status: 'Delivered',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Communication Hub</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Send messages and stay connected with your congregation.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Message Composer */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-0">
              <CardTitle className="text-lg sm:text-xl">Compose Message</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Send messages to your congregation via email, SMS, or push notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-3">
              <Tabs value={messageType} onValueChange={setMessageType} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
                  <TabsTrigger value="email" className="text-xs sm:text-sm flex items-center">
                    <Mail className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="truncate">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="text-xs sm:text-sm flex items-center">
                    <MessageSquare className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="truncate">SMS</span>
                  </TabsTrigger>
                  <TabsTrigger value="push" className="text-xs sm:text-sm flex items-center">
                    <Bell className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="truncate">Push</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-3 sm:space-y-4 mt-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 sm:p-2.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Message
                    </label>
                    <Textarea
                      placeholder="Type your message here..."
                      className="min-h-[150px] sm:min-h-[200px] text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-3 sm:space-y-4 mt-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      SMS Message (160 characters max)
                    </label>
                    <Textarea
                      placeholder="Type your SMS message here..."
                      className="min-h-[100px] text-sm"
                      maxLength={160}
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Character count: 0/160</p>
                  </div>
                </TabsContent>

                <TabsContent value="push" className="space-y-3 sm:space-y-4 mt-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 sm:p-2.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter notification title..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Message
                    </label>
                    <Textarea
                      placeholder="Type your push notification message..."
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  <Users className="inline mr-1 h-4 w-4" />
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
                    >
                      Save Draft
                    </Button>
                    <Button size="sm" className="text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto">
                      <Send className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Send Message
                    </Button>
                  </div>
                </div>
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

      {/* Recent Messages */}
      <div className="w-full lg:w-1/3">
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="text-lg sm:text-xl">Recent Messages</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your recently sent messages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-3">
            <div className="space-y-3 sm:space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="border-l-2 border-blue-500 pl-3 py-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-medium text-sm sm:text-base line-clamp-1">
                      {message.subject}
                    </h3>
                    <Badge variant="outline" className="text-[10px] sm:text-xs h-5">
                      {message.type}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{message.recipients} recipients</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{message.sent}</span>
                  </div>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex items-center text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                        message.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {message.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
