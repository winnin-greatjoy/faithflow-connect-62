import { useState, useEffect } from 'react';
import { evangelismApi } from '@/services/departments/evangelismApi';
import type { DepartmentMember, DepartmentStats } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export function useEvangelism() {
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [outreachEvents, setOutreachEvents] = useState<any[]>([]);
  const [followUpContacts, setFollowUpContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersRes, statsRes, eventsRes, followUpRes] = await Promise.all([
        evangelismApi.getEvangelismMembers(),
        evangelismApi.getEvangelismStats(),
        evangelismApi.getOutreachEvents(),
        evangelismApi.getFollowUpContacts(),
      ]);

      if (membersRes.data) setMembers(membersRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (eventsRes.data) setOutreachEvents(eventsRes.data);
      if (followUpRes.data) setFollowUpContacts(followUpRes.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load evangelism data',
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
    outreachEvents,
    followUpContacts,
    loading,
    reload: loadData,
  };
}
