import React, { useMemo, useState } from 'react';
import { Send, MessageSquare, Shield, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

export const StaffChatModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeChannel, setActiveChannel] = useState('general');
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageChat = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageChat || !hasEventContext;

  const guardAction = (message: string) => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Staff Chat from an event dashboard.');
      return;
    }
    if (actionsDisabled) {
      toast.error('You do not have permission to manage staff chat actions.');
      return;
    }
    toast.success(message);
  };

  const channels = [
    { id: 'general', name: 'Command & Dispatch', icon: Shield, unread: 2 },
    { id: 'security', name: 'Security Protocol', icon: Shield, unread: 0 },
    { id: 'ushering', name: 'Crowd Control', icon: MessageSquare, unread: 5 },
    { id: 'medical', name: 'Medical & Support', icon: Shield, unread: 0 },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden p-6 pt-0">
      {/* Horizontal Channels List */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            disabled={!hasEventContext}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all whitespace-nowrap min-w-fit',
              activeChannel === channel.id
                ? 'bg-primary border-transparent text-white shadow-lg shadow-primary/20'
                : 'bg-white border-primary/5 text-muted-foreground hover:border-primary/20',
              !hasEventContext && 'cursor-not-allowed opacity-60'
            )}
          >
            <div
              className={cn(
                'h-6 w-6 rounded-lg flex items-center justify-center transition-colors',
                activeChannel === channel.id ? 'bg-white/20' : 'bg-muted'
              )}
            >
              <channel.icon className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{channel.name}</span>
            {channel.unread > 0 && activeChannel !== channel.id && (
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 bg-white rounded-[32px] border-none shadow-xl flex flex-col relative overflow-hidden ring-1 ring-primary/5">
        {/* Chat Header */}
        <div className="p-4 border-b border-primary/5 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="title-font text-sm font-serif font-black uppercase tracking-tight">
                {channels.find((c) => c.id === activeChannel)?.name}
              </h4>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Encrypted Secure Line
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-neutral-100">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center py-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 bg-muted/30 px-3 py-1 rounded-full">
              Today, Jan 7
            </span>
          </div>

          {[
            {
              sender: 'System Dispatch',
              text: 'All units report status before commencement.',
              time: '09:00 AM',
              isSystem: true,
            },
            {
              sender: 'Sarah Johnson',
              text: 'Security Detail in position at South Pavilion.',
              time: '09:12 AM',
              avatar: 'SJ',
            },
            {
              sender: 'Mark Tech',
              text: 'AV system check complete. Main stage active.',
              time: '09:15 AM',
              avatar: 'MT',
            },
            {
              sender: 'System Dispatch',
              text: 'Confirmation acknowledged. Operational protocols engaged.',
              time: '09:16 AM',
              isSystem: true,
            },
          ].map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3 max-w-[90%]',
                msg.isSystem ? 'mx-auto w-full max-w-full justify-center' : ''
              )}
            >
              {!msg.isSystem && (
                <div className="h-8 w-8 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center font-black text-[10px] text-primary shadow-inner">
                  {msg.avatar}
                </div>
              )}
              <div className={cn('space-y-1', msg.isSystem ? 'text-center w-full' : '')}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-[9px] font-black uppercase tracking-widest',
                      msg.isSystem ? 'text-primary opacity-60' : 'text-foreground'
                    )}
                  >
                    {msg.sender}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground opacity-40">
                    {msg.time}
                  </span>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm',
                    msg.isSystem
                      ? 'bg-muted/30 border border-primary/5 text-muted-foreground/80 italic text-[10px] inline-block px-4'
                      : 'bg-muted/40 border border-primary/5 text-foreground'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 pt-2 bg-white/80 backdrop-blur-md">
          <div className="bg-muted/30 rounded-[24px] border border-primary/5 p-1.5 flex items-center gap-1 shadow-inner focus-within:bg-white focus-within:shadow-xl focus-within:border-primary/20 transition-all duration-300">
            <Button
              variant="ghost"
              size="icon"
              disabled={actionsDisabled}
              onClick={() => guardAction('Attachment flow coming soon')}
              aria-label="Attach file"
              className="h-10 w-10 rounded-2xl text-muted-foreground hover:bg-neutral-200"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Message team..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0 font-bold h-10 text-xs px-2"
            />
            <Button
              disabled={actionsDisabled}
              onClick={() => guardAction('Message dispatch flow coming soon')}
              aria-label="Send message"
              className="h-10 w-10 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center p-0"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Emergency Button - Compact */}
      <div className="shrink-0">
        <Button
          variant="destructive"
          disabled={actionsDisabled}
          onClick={() => guardAction('Emergency broadcast flow coming soon')}
          className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-destructive/20 bg-destructive/90 hover:bg-destructive text-white border-white/10"
        >
          <Shield className="h-3 w-3 mr-2" />
          Emergency Broadcast
        </Button>
      </div>
    </div>
  );
};
