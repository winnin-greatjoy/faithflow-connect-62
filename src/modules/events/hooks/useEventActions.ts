import { eventsApi } from '@/services/eventsApi';
import { useToast } from '@/hooks/use-toast';
import type { EventItem } from '../types';

export const useEventActions = () => {
  const { toast } = useToast();

  const createEvent = async (payload: any) => {
    try {
      const { data, error } = await eventsApi.createEvent(payload);
      if (error) throw error;
      toast({ title: 'Success', description: 'Event created successfully' });
      return { success: true, data };
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return { success: false, error: err };
    }
  };

  const updateEvent = async (id: string, payload: any) => {
    try {
      const { data, error } = await eventsApi.updateEvent(id, payload);
      if (error) throw error;
      toast({ title: 'Success', description: 'Event updated successfully' });
      return { success: true, data };
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return { success: false, error: err };
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return { success: false };
    try {
      const { error } = await eventsApi.deleteEvent(id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Event deleted' });
      return { success: true };
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return { success: false, error: err };
    }
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
