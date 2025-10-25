import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, 'going'|'maybe'|'not_going'|undefined>>({});
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, { going: number; maybe: number; not_going: number }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().slice(0,10);
        const { data: evs } = await supabase.from('events').select('*').gte('event_date', today).order('event_date', { ascending: true }).limit(20);
        setEvents(evs || []);
        const ids = (evs || []).map(e => e.id);
        const [{ data: myRsvps }, { data: allRsvps }] = await Promise.all([
          supabase.from('event_rsvps').select('event_id, status').eq('member_id', user.id).in('event_id', ids),
          ids.length ? supabase.from('event_rsvps').select('event_id, status').in('event_id', ids) : Promise.resolve({ data: [], error: null } as any)
        ]);
        const map: Record<string, 'going'|'maybe'|'not_going'> = {};
        (myRsvps || []).forEach((r: any) => { map[r.event_id] = r.status; });
        setRsvps(map);
        const c: Record<string, { going: number; maybe: number; not_going: number }> = {};
        (allRsvps || []).forEach((row: any) => {
          const eid = row.event_id;
          if (!c[eid]) c[eid] = { going: 0, maybe: 0, not_going: 0 };
          c[eid][row.status] = (c[eid][row.status] || 0) + 1;
        });
        setCounts(c);
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
    if (!error) {
      setRsvps(prev => ({ ...prev, [eventId]: status }));
      // Optimistically bump counts
      setCounts(prev => {
        const cur = prev[eventId] || { going: 0, maybe: 0, not_going: 0 };
        const prevStatus = rsvps[eventId];
        const next = { ...cur };
        if (prevStatus) next[prevStatus] = Math.max(0, next[prevStatus] - 1);
        next[status] = (next[status] || 0) + 1;
        return { ...prev, [eventId]: next };
      });
    }
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
              <Button size="sm" variant={rsvps[ev.id] === 'going' ? 'default' : 'outline'} disabled={savingId === ev.id} onClick={() => setRsvp(ev.id, 'going')}>
                Going{typeof counts[ev.id]?.going === 'number' ? ` (${counts[ev.id].going})` : ''}
              </Button>
              <Button size="sm" variant={rsvps[ev.id] === 'maybe' ? 'default' : 'outline'} disabled={savingId === ev.id} onClick={() => setRsvp(ev.id, 'maybe')}>
                Maybe{typeof counts[ev.id]?.maybe === 'number' ? ` (${counts[ev.id].maybe})` : ''}
              </Button>
              <Button size="sm" variant={rsvps[ev.id] === 'not_going' ? 'default' : 'outline'} disabled={savingId === ev.id} onClick={() => setRsvp(ev.id, 'not_going')}>
                Not going{typeof counts[ev.id]?.not_going === 'number' ? ` (${counts[ev.id].not_going})` : ''}
              </Button>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-gray-600">No upcoming events.</div>}
      </div>
    </Card>
  );
}
