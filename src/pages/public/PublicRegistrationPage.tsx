import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Share2, Info, Loader2, AlertTriangle } from 'lucide-react';
import { EventRegistrationForm } from '@/components/events/EventRegistrationForm';
import { motion, AnimatePresence } from 'framer-motion';
import eventsApi, { EventRecord } from '@/services/eventsApi';
import registrationsApi from '@/services/registrationsApi';

export const PublicRegistrationPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('Missing event ID.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [{ data: eventData, error: eventError }, { count, error: countError }] =
          await Promise.all([
            eventsApi.getEvent(eventId),
            registrationsApi.getRegistrationCount(eventId),
          ]);
        if (eventError) throw eventError;
        if (!eventData) {
          setError('Event not found.');
          setEvent(null);
          return;
        }
        if (countError) throw countError;
        setEvent(eventData as EventRecord);
        setRegistrationCount(count || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load event details.');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const startDate = useMemo(
    () => (event?.start_at ? new Date(event.start_at) : null),
    [event?.start_at]
  );
  const endDate = useMemo(() => (event?.end_at ? new Date(event.end_at) : null), [event?.end_at]);
  const eventDateLabel = useMemo(() => {
    if (!startDate) return 'Date to be announced';
    const start = startDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!endDate) return start;
    const end = endDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return start === end ? start : `${start} - ${end}`;
  }, [startDate, endDate]);

  const eventTimeLabel = useMemo(() => {
    if (!startDate) return 'Time to be announced';
    const start = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!endDate) return start;
    const end = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${start} - ${end}`;
  }, [startDate, endDate]);

  const spotsLeft = useMemo(() => {
    if (!event?.capacity) return null;
    return Math.max(0, event.capacity - registrationCount);
  }, [event?.capacity, registrationCount]);

  const coverImage = useMemo(() => {
    const fromMetadata = (event?.metadata as any)?.cover_image;
    return fromMetadata || '/faithhealing.png';
  }, [event]);

  const shareEvent = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: event?.title || 'Event Registration',
        text: event?.description || 'Register for this event',
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border p-8 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold">Unable to load event</h2>
          <p className="text-muted-foreground">{error || 'This event is not available.'}</p>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border shadow-sm p-6 md:p-8">
          <Button variant="outline" className="mb-4" onClick={() => setIsRegistering(false)}>
            Back to Event
          </Button>
          <EventRegistrationForm
            eventId={event.id}
            eventTitle={event.title}
            capacity={event.capacity || undefined}
            onSuccess={() => {
              setTimeout(() => setIsRegistering(false), 1200);
              setRegistrationCount((prev) => prev + 1);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <img src={coverImage} alt="Event Cover" className="w-full h-full object-cover opacity-80" />
        <div className="absolute bottom-8 left-8 z-20 text-white p-4">
          <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
            Featured Event
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="flex-1 md:h-screen overflow-y-auto bg-white p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Date & Time</h3>
                <p className="text-muted-foreground">{eventDateLabel}</p>
                <p className="text-muted-foreground text-sm">{eventTimeLabel}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Location</h3>
                <p className="text-muted-foreground">{event.location || 'To be announced'}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-gray">
            <h3 className="font-bold text-lg mb-2">About Event</h3>
            <p className="text-muted-foreground leading-relaxed">
              {event.description || 'Event details will be shared by the organizers shortly.'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
              <span>Registration</span>
              <span>{event.requires_registration ? 'Open' : 'Not Required'}</span>
            </div>
            {event.capacity ? (
              <>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{
                      width: `${Math.min((registrationCount / event.capacity) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-orange-600 mt-2 font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {spotsLeft === 0
                    ? 'Event is full'
                    : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} remaining`}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No capacity limit set for this event.</p>
            )}
          </div>

          <AnimatePresence>
            {event.is_paid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-700"
              >
                This is a paid event. Registration fee:{' '}
                <strong>GHS {(event.registration_fee || 0).toFixed(2)}</strong>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold rounded-xl"
              onClick={() => setIsRegistering(true)}
              disabled={event.capacity ? registrationCount >= event.capacity : false}
            >
              Register Now
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={shareEvent}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" className="flex-1 rounded-xl">
                <Info className="mr-2 h-4 w-4" />{' '}
                {event.visibility === 'public' ? 'Public' : 'Private'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
