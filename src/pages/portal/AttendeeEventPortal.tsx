import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Siren,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { ReportEmergencyDialog } from '@/modules/events/components/dashboard/modules/dispatch/ReportEmergencyDialog';

// ── AttendeeEventPortal ─────────────────────────────────────────
const AttendeeEventPortal: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Fetch event + user registration
  useEffect(() => {
    if (!eventId || !user?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // 1. Fetch event details
        const { data: ev, error: evErr } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        if (evErr) throw evErr;
        if (mounted) setEvent(ev);

        // 2. Find the user's registration
        const { data: reg } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', eventId)
          .eq('member_id', user.id)
          .maybeSingle();
        if (mounted) setRegistration(reg);
      } catch (err: any) {
        console.error('Failed to load event portal:', err);
        toast.error('Could not load event details.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId, user?.id]);

  const qrPayload = useMemo(() => {
    if (!eventId || !user?.id) return '';
    return JSON.stringify({
      type: 'event_checkin',
      event_id: eventId,
      registration_id: registration?.id || null,
      member_id: user.id,
    });
  }, [eventId, user?.id, registration]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-muted-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading event portal...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center p-20 text-muted-foreground">
        <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/portal')}>
          Return to Portal
        </Button>
      </div>
    );
  }

  const eventDate = event.event_date ? new Date(event.event_date) : null;
  const isUpcoming = eventDate && !isPast(eventDate);
  const program: { time: string; title: string; speaker?: string }[] =
    event.metadata?.program || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Nav */}
      <Button
        variant="ghost"
        onClick={() => navigate('/portal')}
        className="group -ml-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
        to Portal
      </Button>

      {/* Event Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                  {event.event_level || 'Event'}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight">
                  {event.title}
                </h1>
              </div>
              <Badge variant={isUpcoming ? 'default' : 'secondary'} className="shrink-0">
                {isUpcoming ? 'Upcoming' : 'Past'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {eventDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </div>
              )}
              {event.start_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {event.start_time}
                  {event.end_time ? ` – ${event.end_time}` : ''}
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.venue}
                </div>
              )}
            </div>

            {eventDate && isUpcoming && (
              <div className="mt-4 text-sm font-bold text-primary">
                Starts {formatDistanceToNow(eventDate, { addSuffix: true })}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* QR Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="h-5 w-5 text-primary" /> My Check-In QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6 text-center">
            {qrPayload ? (
              <div className="p-4 bg-white rounded-2xl shadow-inner border inline-block mx-auto">
                <QRCodeSVG value={qrPayload} size={220} level="H" includeMargin={false} />
              </div>
            ) : (
              <div className="h-56 w-56 bg-muted/30 rounded-2xl flex items-center justify-center text-muted-foreground text-sm">
                QR Code Unavailable
              </div>
            )}
            <p className="text-xs text-muted-foreground max-w-sm mt-4">
              Show this QR code at the kiosk or check-in station to record your attendance.
              <br />
              {registration ? (
                <Badge variant="outline" className="mt-2 text-emerald-600 border-emerald-300">
                  Registered
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                  Walk-in
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Program */}
      {program.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" /> Event Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {program.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="text-sm font-mono font-bold text-primary w-20 shrink-0">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{item.title}</div>
                      {item.speaker && (
                        <div className="text-xs text-muted-foreground">{item.speaker}</div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Program Placeholder */}
      {program.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-xl">
            <CardContent className="text-center p-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-bold">No program published yet</p>
              <p className="text-sm">The event organizers haven't posted a schedule.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 🚨 Emergency Button - Always Visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setEmergencyOpen(true)}
          className="w-full group relative rounded-2xl bg-red-600 hover:bg-red-700 text-white p-5 transition-all active:scale-[0.98] shadow-xl shadow-red-500/20 flex items-center justify-center gap-3"
        >
          <Siren className="h-6 w-6 group-hover:animate-pulse" />
          <span className="text-lg font-bold uppercase tracking-wider">
            🚨 Emergency Assistance
          </span>
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Tap if you need medical, security, or other emergency help. Type and location are
          optional.
        </p>
      </motion.div>

      {/* Emergency Dialog */}
      {eventId && (
        <ReportEmergencyDialog
          open={emergencyOpen}
          onClose={() => setEmergencyOpen(false)}
          eventId={eventId}
          reporterId={user?.id}
        />
      )}
    </div>
  );
};

export default AttendeeEventPortal;
