import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Radio, Calendar, Play, Eye } from 'lucide-react';
import { streamingApi, type Stream } from '@/services/streaming/streamingApi';
import { StreamPlayer } from '@/components/streaming/StreamPlayer';
import { StreamChat } from '@/components/streaming/StreamChat';
import { useNavigate, useParams } from 'react-router-dom';

export default function StreamingPage() {
  const [liveStreams, setLiveStreams] = useState<Stream[]>([]);
  const [upcomingStreams, setUpcomingStreams] = useState<Stream[]>([]);
  const [pastStreams, setPastStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { streamId } = useParams();

  useEffect(() => {
    loadStreams();
  }, []);

  useEffect(() => {
    if (streamId && liveStreams.length > 0) {
      const stream = [...liveStreams, ...upcomingStreams, ...pastStreams].find(
        (s) => s.id === streamId
      );
      if (stream) {
        setSelectedStream(stream);
      }
    }
  }, [streamId, liveStreams, upcomingStreams, pastStreams]);

  async function loadStreams() {
    setLoading(true);
    const result = await streamingApi.list();
    
    if (result.data) {
      const live = result.data.filter((s) => s.status === 'live');
      const upcoming = result.data.filter((s) => s.status === 'scheduled');
      const past = result.data.filter((s) => s.status === 'ended' || s.status === 'archived');
      
      setLiveStreams(live);
      setUpcomingStreams(upcoming);
      setPastStreams(past);

      if (live.length > 0 && !selectedStream) {
        setSelectedStream(live[0]);
        navigate(`/portal/streaming/${live[0].id}`);
      }
    }
    setLoading(false);
  }

  function handleStreamSelect(stream: Stream) {
    setSelectedStream(stream);
    navigate(`/portal/streaming/${stream.id}`);
  }

  function renderStreamCard(stream: Stream) {
    return (
      <Card
        key={stream.id}
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleStreamSelect(stream)}
      >
        <div className="relative aspect-video bg-muted">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {stream.status === 'live' && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2">{stream.title}</h3>
          {stream.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {stream.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {stream.start_time && (
                <>
                  <Calendar className="w-4 h-4" />
                  {new Date(stream.start_time).toLocaleDateString()}
                </>
              )}
            </div>
            {stream.view_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                {stream.view_count}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Streaming</h1>
          <p className="text-muted-foreground mt-1">
            Watch live services and recorded messages
          </p>
        </div>
      </div>

      {selectedStream && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StreamPlayer stream={selectedStream} />
          </div>
          <div className="lg:col-span-1">
            <StreamChat streamId={selectedStream.id} />
          </div>
        </div>
      )}

      <Tabs defaultValue="live" className="w-full">
        <TabsList>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Live Now ({liveStreams.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingStreams.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Streams ({pastStreams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {liveStreams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No live streams at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later or view upcoming streams
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map(renderStreamCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingStreams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No upcoming streams scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingStreams.map(renderStreamCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastStreams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No past streams available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastStreams.map(renderStreamCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
