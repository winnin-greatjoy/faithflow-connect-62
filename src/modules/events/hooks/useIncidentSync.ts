import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { incidentsApi, EventIncident } from '@/services/incidentsApi';
import { toast } from 'sonner';

export const useIncidentSync = (eventId: string | undefined) => {
  const [incidents, setIncidents] = useState<EventIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(async () => {
    if (!eventId) {
      setIncidents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await incidentsApi.getAllIncidents(eventId);
      setIncidents(data as EventIncident[]);
    } catch (err) {
      console.error('Failed to load incidents:', err);
      toast.error('Failed to load active emergencies.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchIncidents();

    if (!eventId) return;

    // Set up Realtime Subscription
    const subscription = supabase
      .channel(`event_incidents_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_incidents',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newIncident = payload.new as EventIncident;
            setIncidents((prev) => [newIncident, ...prev]);

            // Visual/audio cue for critical incidents
            if (newIncident.severity === 'critical' || newIncident.severity === 'high') {
              toast.error(`🚨 New ${newIncident.severity.toUpperCase()} Emergency!`, {
                description: `${newIncident.type.toUpperCase()} reported. Check Dispatch Dashboard immediately.`,
                duration: 10000,
              });
            } else {
              toast.info(`New ${newIncident.type} reported.`);
            }
          } else if (payload.eventType === 'UPDATE') {
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === payload.new.id ? { ...inc, ...payload.new } : inc))
            );
          } else if (payload.eventType === 'DELETE') {
            setIncidents((prev) => prev.filter((inc) => inc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [eventId, fetchIncidents]);

  return { incidents, loading, fetchIncidents };
};
