import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Copy, Eye, RefreshCw, Radio } from 'lucide-react';
import { streamingApi, type Stream, type StreamChat } from '@/services/streaming/streamingApi';
import { StreamPlayer } from '@/components/streaming/StreamPlayer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  streamId: string;
}

export default function StreamControlRoom({ streamId }: Props) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [viewsTotal, setViewsTotal] = useState<number | null>(null);
  const [chats, setChats] = useState<StreamChat[]>([]);
  const presenceRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Live chat updates
  useEffect(() => {
    const unsubscribe = streamingApi.subscribeToChat(streamId, (newMessage) => {
      setChats((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });
    return () => unsubscribe();
  }, [streamId]);

  useEffect(() => {
    load();
  }, [streamId]);

  async function load() {
    setLoading(true);
    const [s, c] = await Promise.all([streamingApi.get(streamId), streamingApi.getChats(streamId)]);
    if (!s.error && s.data) setStream(s.data);
    if (!c.error && c.data) setChats(c.data);

    // Fetch admin-only credentials (rtmp_server, stream_key) via Edge Function
    const creds = await streamingApi.getAdminCredentials(streamId);
    if (!creds.error && creds.data && s?.data) {
      setStream({ ...s.data, ...creds.data } as Stream);
    }

    const { count } = await supabase
      .from('stream_views' as any)
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', streamId);
    setViewsTotal(count ?? 0);
    setLoading(false);

    // presence
    const key =
      (await supabase.auth.getUser()).data.user?.id ||
      `anon-${Math.random().toString(36).slice(2)}`;
    const ch = supabase.channel(`stream-presence-${streamId}`, { config: { presence: { key } } });
    presenceRef.current = ch;
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState() as Record<string, any[]>;
      const count = Object.values(state).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      );
      setViewerCount(count);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ online_at: new Date().toISOString() });
      }
    });
  }

  useEffect(
    () => () => {
      if (presenceRef.current) supabase.removeChannel(presenceRef.current);
    },
    []
  );

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  }

  async function handleStatus(newStatus: Stream['status']) {
    if (!stream) return;
    const prevCreds = { stream_key: stream.stream_key, rtmp_server: stream.rtmp_server };
    const updates: Partial<Stream> = { status: newStatus };
    if (newStatus === 'live' && !stream.start_time) updates.start_time = new Date().toISOString();
    if (newStatus === 'ended' && !stream.end_time) updates.end_time = new Date().toISOString();
    const res = await streamingApi.update(stream.id, updates);
    if (!res.error && res.data) {
      // update() response omits restricted columns; preserve creds
      setStream({ ...(res.data as any), ...prevCreds } as Stream);
      toast.success(`Status updated to ${newStatus}`);

      // Refresh creds from Edge Function in case they changed
      const creds = await streamingApi.getAdminCredentials(stream.id);
      if (!creds.error && creds.data) {
        setStream((prev) => (prev ? ({ ...prev, ...creds.data } as Stream) : prev));
      }
    } else if (res.error) {
      toast.error(res.error.message);
    }
  }

  async function handleRegenerateKey() {
    if (!stream) return;
    const res = await streamingApi.regenerateStreamKey(stream.id);
    if (!res.error && res.data) {
      setStream(res.data);
      toast.success('Stream key regenerated');
    } else if (res.error) {
      toast.error(res.error.message);
    }
  }

  async function handleDeleteChat(id: string) {
    const res = await streamingApi.deleteChat(id);
    if (res.error) {
      toast.error(res.error.message || 'Failed to delete message');
    } else {
      setChats((prev) => prev.filter((m) => m.id !== id));
    }
  }

  if (loading || !stream) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Control Room</h2>
          <p className="text-muted-foreground">Manage stream, monitor viewers, and moderate chat</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/admin/streaming/dashboard', '_self')}
          >
            Dashboard
          </Button>
          <Button variant="secondary" onClick={() => window.open('/admin/streaming', '_self')}>
            Manage Streams
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{stream.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {stream.status === 'live' ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    LIVE
                  </Badge>
                ) : (
                  <Badge variant="outline">{stream.status}</Badge>
                )}
                <span className="text-muted-foreground">{viewerCount} online</span>
                <span className="text-muted-foreground">{viewsTotal ?? '—'} total views</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StreamPlayer stream={stream} />
              <div className="mt-4 flex gap-2">
                {stream.status !== 'live' && (
                  <Button onClick={() => handleStatus('live')}>Start</Button>
                )}
                {stream.status === 'live' && (
                  <Button variant="destructive" onClick={() => handleStatus('ended')}>
                    End
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(`/portal/streaming/${stream.id}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" /> View Public Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Ingest</CardTitle>
              <CardDescription>Use in OBS/Streamlabs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">RTMP Server</div>
                <div className="flex gap-2">
                  <Input readOnly value={stream.rtmp_server || ''} />
                  <Button variant="secondary" onClick={() => copy(stream.rtmp_server || '')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Stream Key</div>
                <div className="flex gap-2">
                  <Input readOnly value={stream.stream_key || ''} />
                  <Button variant="secondary" onClick={() => copy(stream.stream_key || '')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={handleRegenerateKey}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Moderation</CardTitle>
              <CardDescription>Delete inappropriate messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[360px] overflow-auto">
                {chats.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">No messages</div>
                ) : (
                  chats.map((m) => (
                    <div key={m.id} className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">
                          {m.user?.first_name} {m.user?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(m.created_at).toLocaleTimeString()}
                        </div>
                        <div className="text-sm mt-1">{m.message}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteChat(m.id)}>
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
