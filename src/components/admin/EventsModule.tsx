
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Bell } from 'lucide-react';

const upcomingEvents = [
  { 
    id: 1, 
    title: 'Sunday Morning Service', 
    date: '2024-01-14', 
    time: '10:00 AM', 
    location: 'Main Sanctuary', 
    attendees: 89,
    capacity: 150,
    status: 'Open'
  },
  { 
    id: 2, 
    title: 'Men\'s Prayer Breakfast', 
    date: '2024-01-13', 
    time: '8:00 AM', 
    location: 'Fellowship Hall', 
    attendees: 23,
    capacity: 40,
    status: 'Open'
  },
  { 
    id: 3, 
    title: 'Youth Bible Study', 
    date: '2024-01-15', 
    time: '7:00 PM', 
    location: 'Youth Room', 
    attendees: 15,
    capacity: 25,
    status: 'Open'
  },
  { 
    id: 4, 
    title: 'Women\'s Conference', 
    date: '2024-01-20', 
    time: '9:00 AM', 
    location: 'Main Sanctuary', 
    attendees: 45,
    capacity: 100,
    status: 'Registration Required'
  },
];

export const EventsModule = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Registration Required': return 'bg-blue-100 text-blue-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage church events, registrations, and attendance.</p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Create New Event</span>
        </Button>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Registrations</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">172</div>
            <p className="text-xs text-muted-foreground">+24% from last month</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Attendance</CardTitle>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
              <span className="text-xs sm:text-sm font-medium">£</span>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">2,340</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Overview */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Church Calendar
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Monthly view of all church events and activities</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4">
          <div className="h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-50 rounded text-center p-4">
            <p className="text-sm sm:text-base text-gray-500">Calendar component placeholder</p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl">Upcoming Events</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Events scheduled for the next 30 days</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4">
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg">{event.title}</h3>
                    
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{event.time}</span>
                      </div>
                      <div className="flex items-center col-span-2 sm:col-auto">
                        <MapPin className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{event.attendees}/{event.capacity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 sm:mt-0">
                    <Badge className={`${getStatusColor(event.status)} text-xs sm:text-sm h-5 sm:h-6`}>
                      {event.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9">
                        <Bell className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
                        <span className="sm:sr-only lg:not-sr-only">Remind</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9">
                        <span>View</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar for capacity */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Registration</span>
                    <span>{Math.round((event.attendees / event.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
