import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Radio, Calendar, Play } from 'lucide-react';
import type { Stream } from '@/services/streaming/streamingApi';
import { streamingApi } from '@/services/streaming/streamingApi';

interface StreamPlayerProps {
  stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPlayerUrl(null);
    hasLoggedRef.current = false;
    streamingApi.getPlaybackUrl(stream.id).then((res) => {
      if (!mounted) return;
      if (!res.error) {
        setPlayerUrl(res.data || null);
      } else {
        setPlayerUrl(stream.embed_url || stream.video_url || null);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [stream.id]);

  useEffect(() => {
    if (playerUrl && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      streamingApi.logView(stream.id);
    }
  }, [playerUrl, stream.id]);

  const isYouTube = playerUrl?.includes('youtube.com') || playerUrl?.includes('youtu.be');
  const isFacebook = playerUrl?.includes('facebook.com');
  const isVimeo = playerUrl?.includes('vimeo.com');

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black aspect-video">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : playerUrl ? (
          <>
            {isYouTube && (
              <iframe
                src={playerUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
            {isFacebook && (
              <iframe
                src={playerUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            )}
            {isVimeo && (
              <iframe
                src={playerUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            )}
            {!isYouTube && !isFacebook && !isVimeo && (
              <video
                controls
                className="w-full h-full"
                src={playerUrl}
                poster={stream.thumbnail_url}
              >
                Your browser does not support the video tag.
              </video>
            )}
            {stream.status === 'live' && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  LIVE
                </Badge>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white px-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {stream.status === 'scheduled' ? (
                  <Calendar className="w-8 h-8 opacity-50" />
                ) : (
                  <Play className="w-8 h-8 opacity-50" />
                )}
              </div>
              <p className="text-lg font-bold">
                {stream.status === 'scheduled' ? 'Going Live Soon' : 'Stream Not Available'}
              </p>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                {stream.status === 'scheduled'
                  ? `Scheduled for ${stream.start_time ? new Date(stream.start_time).toLocaleString() : 'later'}. Stay tuned!`
                  : stream.status === 'ended'
                    ? 'The live stream has concluded. A recording will be available shortly.'
                    : 'No video source is currently available for this stream.'}
              </p>
              {stream.status === 'scheduled' && (
                <Button
                  variant="outline"
                  className="mt-6 border-white/20 hover:bg-white/10 text-white"
                >
                  Set Reminder
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{stream.title}</h2>
            {stream.description && (
              <p className="text-muted-foreground mt-2">{stream.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={stream.status === 'live' ? 'destructive' : 'secondary'}>
              {stream.status}
            </Badge>
            {stream.view_count > 0 && (
              <span className="text-sm text-muted-foreground">{stream.view_count} views</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
