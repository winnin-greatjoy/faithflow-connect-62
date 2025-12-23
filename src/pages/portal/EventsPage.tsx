import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, 'going' | 'maybe' | 'not_going' | undefined>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<
    Record<string, { going: number; maybe: number; not_going: number }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: evs } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .limit(20);
        setEvents(evs || []);
        const ids = (evs || []).map((e) => e.id);
        const [{ data: myRsvps }, { data: allRsvps }] = await Promise.all([
          supabase
            .from('event_rsvps')
            .select('event_id, status')
            .eq('member_id', user.id)
            .in('event_id', ids),
          ids.length
            ? supabase.from('event_rsvps').select('event_id, status').in('event_id', ids)
            : Promise.resolve({ data: [], error: null } as any),
        ]);
        const map: Record<string, 'going' | 'maybe' | 'not_going'> = {};
        (myRsvps || []).forEach((r: any) => {
          map[r.event_id] = r.status;
        });
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

  const setRsvp = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    setSavingId(eventId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSavingId(null);
      return;
    }
    const { error } = await supabase
      .from('event_rsvps')
      .upsert(
        { event_id: eventId, member_id: user.id, status },
        { onConflict: 'event_id,member_id' }
      );
    if (!error) {
      setRsvps((prev) => ({ ...prev, [eventId]: status }));
      // Optimistically bump counts
      setCounts((prev) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {events.map((ev) => (
          <Card key={ev.id} className="overflow-hidden border-l-4 border-l-primary/50">
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-xl">{ev.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                  <div className="bg-muted px-2 py-1 rounded">
                    {new Date(ev.event_date || ev.start_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <span>•</span>
                  <span>{ev.location || 'Online / TBD'}</span>
                </div>
                {ev.description && (
                  <p className="text-sm text-balance mt-3 line-clamp-2">{ev.description}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant={rsvps[ev.id] === 'going' ? 'default' : 'outline'}
                    className="flex-1 sm:flex-initial gap-1"
                    disabled={savingId === ev.id}
                    onClick={() => setRsvp(ev.id, 'going')}
                  >
                    Going
                    {counts[ev.id]?.going > 0 && (
                      <span className="ml-1 opacity-70">({counts[ev.id].going})</span>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant={rsvps[ev.id] === 'maybe' ? 'default' : 'outline'}
                    className="flex-1 sm:flex-initial gap-1"
                    disabled={savingId === ev.id}
                    onClick={() => setRsvp(ev.id, 'maybe')}
                  >
                    Maybe
                    {counts[ev.id]?.maybe > 0 && (
                      <span className="ml-1 opacity-70">({counts[ev.id].maybe})</span>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant={rsvps[ev.id] === 'not_going' ? 'default' : 'outline'}
                    className="flex-1 sm:flex-initial gap-1"
                    disabled={savingId === ev.id}
                    onClick={() => setRsvp(ev.id, 'not_going')}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {events.length === 0 && (
          <div className="p-12 text-center border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No upcoming events found at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
