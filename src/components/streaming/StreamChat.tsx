import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { streamingApi, type StreamChat as StreamChatType } from '@/services/streaming/streamingApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StreamChatProps {
  streamId: string;
}

export function StreamChat({ streamId }: StreamChatProps) {
  const [messages, setMessages] = useState<StreamChatType[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    loadMessages();
    const unsubscribe = streamingApi.subscribeToChat(streamId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const key = user?.id || `anon-${Math.random().toString(36).slice(2)}`;
      presenceChannel = supabase.channel(`stream-presence-${streamId}`, { config: { presence: { key } } });
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel!.presenceState() as Record<string, any[]>;
          const count = Object.values(state).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
          setViewerCount(count);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel!.track({ online_at: new Date().toISOString() });
          }
        });
    })();

    return () => {
      unsubscribe();
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [streamId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages() {
    const result = await streamingApi.getChats(streamId);
    if (result.data) {
      setMessages(result.data);
    }
  }

  async function handleSend() {
    if (!message.trim() || sending) return;

    setSending(true);
    const result = await streamingApi.sendChat(streamId, message.trim());
    setSending(false);

    if (result.error) {
      toast.error(result.error.message || 'Failed to send message');
      return;
    }

    setMessage('');
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Live Chat {viewerCount > 0 ? `• ${viewerCount} online` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Be the first to chat!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.user?.profile_photo} />
                    <AvatarFallback>
                      {msg.user?.first_name?.[0]}{msg.user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">
                        {msg.user?.first_name} {msg.user?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!message.trim() || sending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
