import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EventRecord } from '@/services/eventsApi';

interface AgendaViewProps {
  event: EventRecord | null;
}

type AgendaSession = {
  id: string;
  time: string;
  title: string;
  location: string;
  type: string;
  isKeynote?: boolean;
};

const formatTime = (iso?: string | null) => {
  if (!iso) return 'TBA';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const AgendaView: React.FC<AgendaViewProps> = ({ event }) => {
  const fromMetadata = Array.isArray((event?.metadata as any)?.agenda)
    ? ((event?.metadata as any).agenda as any[])
    : [];

  const sessions: AgendaSession[] =
    fromMetadata.length > 0
      ? fromMetadata.map((s, index) => ({
          id: String(s.id || index + 1),
          time: s.time || formatTime(s.start_at || s.startAt || null),
          title: s.title || `Session ${index + 1}`,
          location: s.location || event?.location || 'TBA',
          type: s.type || 'Session',
          isKeynote: Boolean(s.isKeynote || s.is_keynote),
        }))
      : [
          {
            id: '1',
            time: formatTime(event?.start_at || null),
            title: event?.title || 'Event Session',
            location: event?.location || 'TBA',
            type: 'Main Session',
            isKeynote: true,
          },
          ...(event?.end_at
            ? [
                {
                  id: '2',
                  time: formatTime(event.end_at),
                  title: 'Closing Session',
                  location: event.location || 'TBA',
                  type: 'Closing',
                  isKeynote: false,
                },
              ]
            : []),
        ];

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Your Agenda</h2>
        <Badge
          variant="outline"
          className="border-primary/20 text-primary uppercase tracking-widest text-[10px]"
        >
          Day 1
        </Badge>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="p-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                {session.time}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-yellow-500"
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="font-bold text-lg leading-tight mb-2">{session.title}</h3>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {session.location}
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <Badge
                variant="secondary"
                className="text-[10px] h-5 bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {session.type}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
