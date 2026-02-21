import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Copy, Eye, RefreshCw, Radio } from 'lucide-react';
import {
  streamingApi,
  type Stream,
  type StreamChat,
  type StreamQA,
  type StreamPoll,
} from '@/services/streaming/streamingApi';
import { StreamPlayer } from '@/components/streaming/StreamPlayer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  BarChart2,
  CheckCircle2,
  Trash2,
  PlusCircle,
  StopCircle,
} from 'lucide-react';

interface Props {
  streamId: string;
}

export default function StreamControlRoom({ streamId }: Props) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [viewsTotal, setViewsTotal] = useState<number | null>(null);
  const [chats, setChats] = useState<StreamChat[]>([]);
  const [questions, setQuestions] = useState<StreamQA[]>([]);
  const [polls, setPolls] = useState<StreamPoll[]>([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
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
    const [s, c, qa, p] = await Promise.all([
      streamingApi.get(streamId),
      streamingApi.getChats(streamId),
      streamingApi.getQA(streamId),
      streamingApi.getPolls(streamId),
    ]);
    if (!s.error && s.data) setStream(s.data);
    if (!c.error && c.data) setChats(c.data);
    if (!qa.error && qa.data) setQuestions(qa.data);
    if (!p.error && p.data) setPolls(p.data);

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
    });

    const unsubscribeQA = streamingApi.subscribeToQA(streamId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setQuestions((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setQuestions((prev) => prev.map((q) => (q.id === payload.new.id ? payload.new : q)));
      } else if (payload.eventType === 'DELETE') {
        setQuestions((prev) => prev.filter((q) => q.id === payload.old.id));
      }
    });

    const unsubscribePolls = streamingApi.subscribeToPolls(streamId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setPolls((prev) => [payload.new, ...prev]);
      } else {
        setPolls((prev) => {
          const exists = prev.some((p) => p.id === payload.new.id);
          if (!exists && payload.eventType === 'UPDATE') return [payload.new, ...prev];
          return prev.map((p) => (p.id === payload.new.id ? payload.new : p));
        });
      }
    });

    return () => {
      unsubscribeQA();
      unsubscribePolls();
    };
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

  async function handleToggleAnswer(qaId: string, current: boolean) {
    const res = await streamingApi.toggleAnswered(qaId, !current);
    if (res.error) toast.error(res.error.message);
  }

  async function handleDeleteQA(qaId: string) {
    const { error } = await supabase.from('stream_qa').delete().eq('id', qaId);
    if (error) toast.error(error.message);
    else setQuestions((prev) => prev.filter((q) => q.id !== qaId));
  }

  async function handleCreatePoll() {
    if (!newPollQuestion.trim() || newPollOptions.some((o) => !o.trim())) {
      toast.error('Question and all options are required');
      return;
    }
    const res = await streamingApi.createPoll(
      streamId,
      newPollQuestion.trim(),
      newPollOptions.filter((o) => o.trim())
    );
    if (res.error) toast.error(res.error.message);
    else {
      setNewPollQuestion('');
      setNewPollOptions(['', '']);
      toast.success('Poll created as draft');
    }
  }

  async function handleUpdatePollStatus(pollId: string, status: StreamPoll['status']) {
    const res = await streamingApi.updatePollStatus(pollId, status);
    if (res.error) toast.error(res.error.message);
  }

  const getPollResults = (poll: StreamPoll) => {
    const total = poll.votes?.length || 0;
    return poll.options.map((opt, idx) => {
      const count = poll.votes?.filter((v) => v.option_index === idx).length || 0;
      return {
        text: opt.text,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  };

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

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3">
              <CardTitle>Audience Interaction</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <Tabs defaultValue="chat" className="h-full flex flex-col">
                <TabsList className="mx-6 mb-2">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="qa" className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Q&A
                  </TabsTrigger>
                  <TabsTrigger value="polls" className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    Polls
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 overflow-auto px-6 pb-6">
                  <div className="space-y-4">
                    {chats.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-12 text-center">
                        No messages
                      </div>
                    ) : (
                      chats
                        .slice()
                        .reverse()
                        .map((m) => (
                          <div key={m.id} className="flex items-start justify-between gap-3 group">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">
                                  {m.user?.first_name} {m.user?.last_name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(m.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 mt-0.5">{m.message}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteChat(m.id)}
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="flex-1 overflow-auto px-6 pb-6">
                  <div className="space-y-4">
                    {questions.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-12 text-center">
                        No questions asked yet
                      </div>
                    ) : (
                      questions.map((q) => (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border ${q.is_answered ? 'bg-green-50 border-green-100' : 'bg-white'} relative group`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={q.is_answered ? 'secondary' : 'outline'}
                              className={q.is_answered ? 'bg-green-100 text-green-700' : ''}
                            >
                              {q.is_answered ? 'Answered' : 'Pending'}
                            </Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleToggleAnswer(q.id, q.is_answered)}
                              >
                                <CheckCircle2
                                  className={`w-4 h-4 ${q.is_answered ? 'text-green-600' : 'text-muted-foreground'}`}
                                />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleDeleteQA(q.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm font-medium pr-8">{q.question}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-muted-foreground">
                              By {q.user ? `${q.user.first_name} ${q.user.last_name}` : 'Anonymous'}
                            </span>
                            <span className="text-[10px] font-bold text-primary">
                              {q.upvotes?.length || 0} upvotes
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="polls" className="flex-1 overflow-auto px-6 pb-6">
                  <div className="space-y-6">
                    {/* Create Poll */}
                    <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        New Poll
                      </h4>
                      <Input
                        placeholder="Poll question..."
                        value={newPollQuestion}
                        onChange={(e) => setNewPollQuestion(e.target.value)}
                        className="bg-white"
                      />
                      {newPollOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const next = [...newPollOptions];
                              next[idx] = e.target.value;
                              setNewPollOptions(next);
                            }}
                            className="bg-white"
                          />
                          {newPollOptions.length > 2 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setNewPollOptions((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewPollOptions((prev) => [...prev, ''])}
                          className="w-full"
                        >
                          <PlusCircle className="w-3 h-3 mr-2" />
                          Add Option
                        </Button>
                        <Button size="sm" onClick={handleCreatePoll} className="w-full">
                          Create Pool
                        </Button>
                      </div>
                    </div>

                    {/* Active & Draft Polls */}
                    <div className="space-y-4">
                      {polls.map((poll) => (
                        <div
                          key={poll.id}
                          className={`p-4 rounded-xl border ${poll.status === 'active' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Badge
                              variant={
                                poll.status === 'active'
                                  ? 'destructive'
                                  : poll.status === 'ended'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="capitalize"
                            >
                              {poll.status}
                            </Badge>
                            <div className="flex gap-2">
                              {poll.status === 'draft' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdatePollStatus(poll.id, 'active')}
                                >
                                  Launch
                                </Button>
                              )}
                              {poll.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdatePollStatus(poll.id, 'ended')}
                                >
                                  <StopCircle className="w-3 h-3 mr-2" />
                                  End
                                </Button>
                              )}
                            </div>
                          </div>
                          <h5 className="text-sm font-bold mb-3">{poll.question}</h5>

                          {poll.status !== 'draft' && (
                            <div className="space-y-2">
                              {getPollResults(poll).map((res, i) => (
                                <div key={i} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-medium">
                                    <span>{res.text}</span>
                                    <span>
                                      {res.percentage}% ({res.count})
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary"
                                      style={{ width: `${res.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
