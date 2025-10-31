import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Radio, Calendar, Eye, BarChart2, LayoutGrid } from 'lucide-react';
import { streamingApi, type Stream } from '@/services/streaming/streamingApi';
import { supabase } from '@/integrations/supabase/client';

export default function StreamingDashboard() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [views30d, setViews30d] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const res = await streamingApi.list();
    if (res.data) setStreams(res.data);

    // total views last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('stream_views' as any)
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', since);
    setViews30d(count ?? 0);

    setLoading(false);
  }

  const live = useMemo(() => streams.filter(s => s.status === 'live'), [streams]);
  const upcoming = useMemo(() => streams.filter(s => s.status === 'scheduled'), [streams]);
  const recent = useMemo(() => streams.slice(0, 8), [streams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutGrid className="w-5 h-5"/> Streaming Dashboard</h2>
          <p className="text-muted-foreground">Overview of live, upcoming and recent streams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/admin/streaming', '_self')}>Manage Streams</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <CardDescription>Streams currently live</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500"/> {live.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CardDescription>Scheduled streams</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5"/> {upcoming.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Views (30d)</CardTitle>
            <CardDescription>All streams</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5"/> {views30d ?? '—'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Streams</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : live.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No live streams</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {live.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell>{s.start_time ? new Date(s.start_time).toLocaleString() : '—'}</TableCell>
                    <TableCell>{s.view_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => window.open(`/admin/streaming/control/${s.id}`, '_self')}>Control Room</Button>
                        <Button size="sm" variant="ghost" onClick={() => window.open(`/portal/streaming/${s.id}`, '_blank')}>
                          <Eye className="w-4 h-4"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Streams</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No streams found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Privacy</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell className="capitalize">{s.status}</TableCell>
                    <TableCell className="capitalize">{s.privacy.replace('_',' ')}</TableCell>
                    <TableCell>{s.start_time ? new Date(s.start_time).toLocaleString() : '—'}</TableCell>
                    <TableCell>{s.view_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => window.open(`/admin/streaming/control/${s.id}`, '_self')}>Control Room</Button>
                        <Button size="sm" variant="ghost" onClick={() => window.open(`/portal/streaming/${s.id}`, '_blank')}>
                          <Eye className="w-4 h-4"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
