import { useState, useEffect, useCallback, useMemo } from 'react';
import { eventsApi } from '@/services/eventsApi';
import { useToast } from '@/hooks/use-toast';
import type { EventItem, EventLevel, EventType } from '../types';

export const useEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await eventsApi.getEvents();
      if (error) throw error;

      const mapped: EventItem[] = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        date: r.start_at ? r.start_at.split('T')[0] : '',
        time: r.start_at ? r.start_at.split('T')[1]?.substring(0, 5) || '10:00' : '10:00',
        location: r.location,
        capacity: r.capacity,
        status: r.status === 'published' ? 'Open' : r.status === 'cancelled' ? 'Cancelled' : 'Open',
        type: r.metadata?.type || 'General',
        frequency: r.metadata?.frequency || 'One-time',
        event_level: r.event_level,
        owner_scope_id: r.owner_scope_id,
        district_id: r.district_id,
        branch_id: r.branch_id,
        requires_registration: r.requires_registration,
        is_paid: r.is_paid,
        registration_fee: r.registration_fee,
        target_audience: r.target_audience,
        visibility: r.visibility,
        recurrencePattern: r.metadata?.recurrencePattern || {},
        end_date: r.end_at ? r.end_at.split('T')[0] : r.start_at ? r.start_at.split('T')[0] : '',
        daysOfWeek: r.daysOfWeek || r.metadata?.daysOfWeek || [],
      }));

      setEvents(mapped);
    } catch (err: any) {
      toast({ title: 'Load failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      national: events.filter((e) => e.event_level === 'NATIONAL').length,
      district: events.filter((e) => e.event_level === 'DISTRICT').length,
      branch: events.filter((e) => e.event_level === 'BRANCH').length,
      upcoming: events.filter((e) => new Date(e.date) >= new Date()).length,
    };
  }, [events]);

  return {
    events,
    loading,
    reload: fetchEvents,
    stats,
  };
};
