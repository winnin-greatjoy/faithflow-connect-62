import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Radio } from 'lucide-react';
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
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <p className="text-lg font-medium">Stream Not Available</p>
              <p className="text-sm text-gray-400 mt-2">
                {stream.status === 'scheduled' ? 'Stream has not started yet' : 'No video URL available'}
              </p>
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
              <span className="text-sm text-muted-foreground">
                {stream.view_count} views
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
