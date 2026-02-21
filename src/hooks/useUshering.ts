import { useState, useEffect } from 'react';
import { usheringApi } from '@/services/departments/usheringApi';
import type { DepartmentMember, DepartmentStats } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export function useUshering() {
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersRes, statsRes, eventsRes] = await Promise.all([
        usheringApi.getUsherMembers(),
        usheringApi.getUsheringStats(),
        usheringApi.getUsheringEvents(),
      ]);

      if (membersRes.data) setMembers(membersRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load ushering data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    members,
    stats,
    events,
    loading,
    reload: loadData,
  };
}
