import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
  type: 'outreach' | 'meeting' | 'training' | 'followup' | 'other';
  color?: string;
};

interface EvangelismScheduleProps {
  ministryId: string;
}

export const EvangelismSchedule: React.FC<EvangelismScheduleProps> = ({ ministryId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: 'outreach',
    start: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEvents();
  }, [ministryId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ministry_events')
        .select('*')
        .eq('ministry_id', ministryId)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const formattedEvents: Event[] = (data || []).map((e: any) => ({
        id: e.id,
        title: e.description || 'Untitled Event',
        start: `${e.event_date}T${e.start_time || '00:00'}`,
        end: e.end_time ? `${e.event_date}T${e.end_time}` : undefined,
        description: e.description,
        location: e.location,
        type: 'outreach', // Defaulting for now
        color: getEventColor('outreach'),
      }));

      setEvents(formattedEvents);
    } catch (error: any) {
      toast({
        title: 'Error fetching events',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'outreach':
        return '#ea580c'; // Orange
      case 'meeting':
        return '#3b82f6'; // Blue
      case 'training':
        return '#8b5cf6'; // Purple
      case 'followup':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const handleAddEvent = async () => {
    try {
      if (!newEvent.start || !newEvent.title) return;

      const { error } = await supabase.from('ministry_events').insert({
        ministry_id: ministryId,
        event_date: newEvent.start,
        title: newEvent.title,
        description: newEvent.description || newEvent.title, // Use title as fallback description
        location: newEvent.location,
      });

      if (error) throw error;

      toast({
        title: 'Event added',
        description: 'The outreach event has been successfully scheduled.',
      });
      setIsAddEventOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Error adding event',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Outreach Calendar</CardTitle>
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Outreach
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Outreach</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(v: any) => setNewEvent({ ...newEvent, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outreach">Outreach</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="e.g., Downtown Street Ministry"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newEvent.start || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., City Center"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddEvent}>
                    Schedule Outreach
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek',
                }}
                height="100%"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel: Upcoming & Team */}
      <div className="space-y-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Outreach</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {events
                  .filter((e) => new Date(e.start) >= new Date())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div
                        className="w-2 h-full rounded-full self-stretch"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(new Date(event.start), 'MMM d, yyyy')}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <MapPin className="mr-1 h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                {events.filter((e) => new Date(e.start) >= new Date()).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No upcoming outreach</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Team Assignments Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">Next Outreach</span>
                  <Badge variant="outline">Saturday</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lead:</span>
                    <span>Paul Smith</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team:</span>
                    <span>Downtown Group</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                  View Assignments
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
