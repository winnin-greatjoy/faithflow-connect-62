import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AttendancePage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2025-01-01');
  const [endDate, setEndDate] = useState<string>('2025-12-31');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fetchEvents = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const s = start ?? startDate;
      const e = end ?? endDate;
      // query events in date range (best-effort fields)
      const res = await supabase
        .from('events')
        .select('*')
        .gte('event_date', s)
        .lte('event_date', e)
        .order('event_date', { ascending: false });

      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching events', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFilter = () => {
    fetchEvents(startDate, endDate);
  };

  const fmtDateTime = (ev: any) => {
    try {
      const d = ev.event_date ? new Date(ev.event_date) : null;
      const date = d ? `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` : '';
      const time = ev.start_time || ev.time || '';
      return `${date} - ${time}`.trim();
    } catch {
      return ev.title || 'Event';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Filter and browse your attendance events</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted-foreground'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted-foreground'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          <Button onClick={handleFilter} className="h-9">
            Filter
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent>No events found for the selected range.</CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          events.map((ev: any) => (
            <Card key={ev.id || ev.event_id || ev.title} className="rounded-lg">
              <CardContent className="py-4 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{fmtDateTime(ev)}</div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                      <span>{ev.department || ev.group || ev.tag || 'Department'}</span>
                      <span className="text-green-600">➜ {ev.start_time || '12:00 AM'}</span>
                    </div>
                    <div className="text-sm mt-1">
                      {ev.location || ev.venue || 'The Anchor Stone'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev: any) => (
              <Card key={ev.id || ev.event_id || ev.title} className="rounded-lg">
                <CardContent className="p-4">
                  <div className="text-sm font-semibold mb-1">{fmtDateTime(ev)}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {ev.department || ev.group || ev.tag || 'Department'}
                  </div>
                  <div className="text-sm font-medium">{ev.title || ev.name}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {ev.location || ev.venue || 'The Anchor Stone'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
