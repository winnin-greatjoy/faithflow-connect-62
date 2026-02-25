import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, QrCode, MessageCircle, Menu, Loader2, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AgendaView } from '@/modules/events/components/mobile/AgendaView';
import { DigitalBadge } from '@/modules/events/components/mobile/DigitalBadge';
import { InteractionHub } from '@/modules/events/components/mobile/InteractionHub';
import eventsApi, { EventRecord } from '@/services/eventsApi';
import type { EventRegistration } from '@/services/registrationsApi';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const HomeView = ({
  event,
  registration,
}: {
  event: EventRecord | null;
  registration: EventRegistration | null;
}) => {
  if (!event) {
    return <div className="p-6 text-center text-muted-foreground">Event data unavailable.</div>;
  }

  const start = event.start_at ? new Date(event.start_at) : null;
  const end = event.end_at ? new Date(event.end_at) : null;
  const dateLabel = start
    ? start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBA';
  const timeLabel = start
    ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`
    : 'Time TBA';

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
            {event.event_level}
          </Badge>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
            {event.status}
          </Badge>
        </div>
        <h2 className="text-2xl font-serif font-bold leading-tight">{event.title}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {event.description || 'Event details will be shared shortly.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" /> Schedule
          </div>
          <div className="text-sm font-semibold">{dateLabel}</div>
          <div className="text-xs text-muted-foreground">{timeLabel}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <MapPin className="h-3.5 w-3.5" /> Venue
          </div>
          <div className="text-sm font-semibold">{event.location || 'To be announced'}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Registration Status
        </div>
        {registration ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{registration.name}</div>
              <div className="text-xs text-muted-foreground">{registration.email}</div>
            </div>
            <Badge
              className={cn(
                'uppercase text-[10px]',
                registration.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : registration.status === 'waitlist'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
              )}
            >
              {registration.status}
            </Badge>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            You are not registered yet. Use the registration page to enroll.
          </div>
        )}
      </div>
    </div>
  );
};

export default function MobileEventApp() {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<'home' | 'agenda' | 'badge' | 'interact'>('home');
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [userInitials, setUserInitials] = useState('FF');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppData = async () => {
      if (!eventId) {
        setError('Missing event id.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: ev, error: evError } = await eventsApi.getEvent(eventId);
        if (evError) throw evError;
        if (!ev) {
          setEvent(null);
          setError('Event not found.');
          return;
        }
        setEvent(ev as EventRecord);

        const { data: authData } = await supabase.auth.getUser();
        const uid = authData.user?.id || null;
        let displayName = 'FaithFlow';
        let email: string | null = authData.user?.email || null;

        if (uid) {
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('full_name, email')
            .eq('id', uid)
            .maybeSingle();
          if (profile?.full_name) displayName = profile.full_name;
          if (profile?.email) email = profile.email;

          const { data: regByMember } = await (supabase as any)
            .from('event_registrations')
            .select('*')
            .eq('event_id', eventId)
            .eq('member_id', uid)
            .maybeSingle();
          if (regByMember) {
            setRegistration(regByMember as EventRegistration);
          } else if (email) {
            const { data: regByEmail } = await (supabase as any)
              .from('event_registrations')
              .select('*')
              .eq('event_id', eventId)
              .eq('email', email)
              .maybeSingle();
            setRegistration((regByEmail as EventRegistration) || null);
          } else {
            setRegistration(null);
          }
        } else {
          setRegistration(null);
        }

        const initials = displayName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n: string) => n[0]?.toUpperCase())
          .join('');
        setUserInitials(initials || 'FF');
      } catch (err: any) {
        setError(err.message || 'Failed to load mobile app data.');
      } finally {
        setLoading(false);
      }
    };
    loadAppData();
  }, [eventId]);

  const streamId = useMemo(() => {
    const maybeStreamId = (event?.metadata as any)?.stream_id;
    return typeof maybeStreamId === 'string' ? maybeStreamId : undefined;
  }, [event?.metadata]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'badge', icon: QrCode, label: 'Badge', isPrimary: true },
    { id: 'interact', icon: MessageCircle, label: 'Live' },
    { id: 'menu', icon: Menu, label: 'More' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center text-muted-foreground">
        {error || 'Event unavailable.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative shadow-2xl border-x border-gray-100">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4 max-w-md mx-auto">
        <h1 className="font-serif font-bold text-base text-primary truncate max-w-[210px]">
          {event.title}
        </h1>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
          {userInitials}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-[80vh]"
          >
            {activeTab === 'home' && <HomeView event={event} registration={registration} />}
            {activeTab === 'agenda' && <AgendaView event={event} />}
            {activeTab === 'badge' && <DigitalBadge event={event} registration={registration} />}
            {activeTab === 'interact' && <InteractionHub streamId={streamId} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-2 safe-area-pb z-50 max-w-md mx-auto">
        {navItems.map((item) => (
          <div key={item.id} className="relative flex flex-col items-center">
            {item.isPrimary ? (
              <Button
                onClick={() => setActiveTab('badge' as any)}
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full -mt-8 shadow-xl shadow-primary/30 border-4 border-gray-50 transition-transform active:scale-95"
              >
                <item.icon className="h-6 w-6 text-white" />
              </Button>
            ) : (
              <Button
                onClick={() => item.id !== 'menu' && setActiveTab(item.id as any)}
                variant="ghost"
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2 hover:bg-transparent',
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground/60'
                )}
              >
                <item.icon
                  className={cn('h-6 w-6 transition-all', activeTab === item.id ? 'scale-110' : '')}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
