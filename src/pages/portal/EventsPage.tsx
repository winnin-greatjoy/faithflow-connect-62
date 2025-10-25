import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, 'going'|'maybe'|'not_going'|undefined>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().slice(0,10);
        const [{ data: evs }, { data: myRsvps }] = await Promise.all([
          supabase.from('events').select('*').gte('event_date', today).order('event_date', { ascending: true }).limit(20),
          supabase.from('event_rsvps').select('event_id, status').eq('member_id', user.id)
        ]);
        setEvents(evs || []);
        const map: Record<string, 'going'|'maybe'|'not_going'> = {};
        (myRsvps || []).forEach((r: any) => { map[r.event_id] = r.status; });
        setRsvps(map);
      }
      setLoading(false);
    })();
  }, []);

  const setRsvp = async (eventId: string, status: 'going'|'maybe'|'not_going') => {
    setSavingId(eventId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingId(null); return; }
    const { error } = await supabase
      .from('event_rsvps')
      .upsert({ event_id: eventId, member_id: user.id, status }, { onConflict: 'event_id,member_id' });
    if (!error) setRsvps(prev => ({ ...prev, [eventId]: status }));
    setSavingId(null);
  };

  if (loading) return <div>Loading…</div>;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-lg font-semibold">My Events</div>
      <div className="space-y-2">
        {events.map(ev => (
          <div key={ev.id} className="flex items-center justify-between border rounded p-3 gap-3">
            <div>
              <div className="font-medium">{ev.title}</div>
              <div className="text-sm text-gray-600">{new Date(ev.event_date).toLocaleDateString()} • {ev.location || 'TBD'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={rsvps[ev.id] === 'going' ? 'default' : 'outline'} disabled={savingId === ev.id} onClick={() => setRsvp(ev.id, 'going')}>Going</Button>
              <Button size="sm" variant={rsvps[ev.id] === 'maybe' ? 'default' : 'outline'} disabled={savingId === ev.id} onClick={() => setRsvp(ev.id, 'maybe')}>Maybe</Button>
              <Button size="sm" variant={rsvps[ev.id] === 'not_going' ? 'default' : 'outline'} disabled={savingId === ev.id} onClick={() => setRsvp(ev.id, 'not_going')}>Not going</Button>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-gray-600">No upcoming events.</div>}
      </div>
    </Card>
  );
}
