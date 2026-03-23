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

    // Set up Incident Subscription
    const incidentSub = supabase
      .channel(`event_incidents_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_incidents',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            await fetchIncidents(); // Refetch to get joined reporter
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

    // Set up Responders Subscription
    const responderSub = supabase
      .channel(`event_responders_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_incident_responders',
        },
        async () => {
          // Simplest way to handle joined updates is a refetch
          await fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incidentSub);
      supabase.removeChannel(responderSub);
    };
  }, [eventId, fetchIncidents]);

  return { incidents, loading, fetchIncidents };
};
