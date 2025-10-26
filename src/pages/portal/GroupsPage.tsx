import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const GroupsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2025-01-01');
  const [endDate, setEndDate] = useState<string>('2025-12-31');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async (s?: string, e?: string) => {
    setLoading(true);
    try {
      const start = s ?? startDate;
      const end = e ?? endDate;
      // Best-effort: fetch groups or group events in range
      const res: any = await (supabase as any)
        .from('groups')
        .select('*')
        .order('name', { ascending: true });

      // If there is a separate group_events table, prefer to fetch it
      // and map to group-like display. Try group_events (graceful fallback).
      if (!res || !res.data || res.data.length === 0) {
        const evs: any = await (supabase as any)
          .from('group_events')
          .select('*')
          .gte('event_date', start)
          .lte('event_date', end)
          .order('event_date', { ascending: false });

        setGroups(evs.data || []);
      } else {
        setGroups(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching groups', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleFilter = () => fetchGroups(startDate, endDate);

  const fmtDate = (dStr?: string) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return dStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-sm text-muted-foreground">Browse groups and upcoming group events</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <Button onClick={handleFilter} className="h-9">Filter</Button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent>No groups found.</CardContent>
          </Card>
        ) : (
          groups.map((g: any) => (
            <Card key={g.id || g.group_id || g.name} className="rounded-lg">
              <CardContent className="py-4 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{g.name || g.title || 'Group'}</div>
                    <div className="text-xs text-gray-600 mt-1">{g.description || g.summary || ''}</div>
                    {g.next_event_date && (
                      <div className="text-xs text-muted-foreground mt-2">Next meeting: {fmtDate(g.next_event_date)} {g.next_event_time ? `· ${g.next_event_time}` : ''}</div>
                    )}
                  </div>
                  <div className="text-sm text-right">
                    <div className="text-xs text-muted-foreground">{g.leader || g.contact || ''}</div>
                    <div className="text-sm mt-2">{g.location || g.venue || ''}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupsPage;