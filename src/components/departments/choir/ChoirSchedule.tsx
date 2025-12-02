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
  type: 'rehearsal' | 'performance' | 'social' | 'other';
  color?: string;
};

interface ChoirScheduleProps {
  ministryId: string;
}

export const ChoirSchedule: React.FC<ChoirScheduleProps> = ({ ministryId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: 'rehearsal',
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
        title: e.description || 'Untitled Event', // Using description as title for now if name is missing
        start: `${e.event_date}T${e.start_time || '00:00'}`,
        end: e.end_time ? `${e.event_date}T${e.end_time}` : undefined,
        description: e.description,
        location: e.location,
        type: 'rehearsal', // Defaulting for now, should add type to DB
        color: getEventColor('rehearsal'), // Default color
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
      case 'rehearsal':
        return '#3b82f6'; // Blue
      case 'performance':
        return '#8b5cf6'; // Purple
      case 'social':
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
        description: newEvent.title,
        location: newEvent.location,
        // start_time: ... (need to parse from input)
      });

      if (error) throw error;

      toast({ title: 'Event added', description: 'The event has been successfully scheduled.' });
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
            <CardTitle>Choir Calendar</CardTitle>
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Event</DialogTitle>
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
                        <SelectItem value="rehearsal">Rehearsal</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="e.g., Sunday Service Rehearsal"
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
                      placeholder="e.g., Main Sanctuary"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddEvent}>
                    Schedule Event
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

      {/* Side Panel: Upcoming & Duty Roster */}
      <div className="space-y-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
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
                  <div className="text-center text-muted-foreground py-8">No upcoming events</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Duty Roster Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duty Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">Next Service</span>
                  <Badge variant="outline">Sunday</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lead:</span>
                    <span>Sarah J.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uniform:</span>
                    <span>Blue Robes</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                  View Full Roster
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
