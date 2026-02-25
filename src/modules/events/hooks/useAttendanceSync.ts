import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '@/services/eventsApi';
import { toast } from 'sonner';

interface PendingRecord {
  id: string;
  payload: {
    event_id: string;
    member_id?: string | null;
    zone_id?: string | null;
    type: 'in' | 'out';
    method: 'QR' | 'NFC' | 'MANUAL' | 'ID-SCAN';
    timestamp: string;
  };
  attempts: number;
}

const STORAGE_KEY = 'attendance_sync_buffer';

export const useAttendanceSync = (eventId: string) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [buffer, setBuffer] = useState<PendingRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load buffer from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBuffer(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse attendance buffer', e);
      }
    }
  }, []);

  // Save buffer to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
  }, [buffer]);

  const syncRecords = useCallback(async () => {
    if (!isOnline || buffer.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const currentBuffer = [...buffer];
    const successfulIds: string[] = [];

    for (const record of currentBuffer) {
      try {
        const { error } = await eventsApi.recordAttendance(record.payload);
        if (!error) {
          successfulIds.push(record.id);
        } else {
          console.error('Sync error for record', record.id, error);
          record.attempts += 1;
        }
      } catch (e) {
        console.error('Sync exception for record', record.id, e);
        record.attempts += 1;
      }
    }

    setBuffer((prev) => prev.filter((r) => !successfulIds.includes(r.id)));
    setIsSyncing(false);

    if (successfulIds.length > 0) {
      toast.success(`Synchronized ${successfulIds.length} attendance records`);
    }
  }, [isOnline, buffer, isSyncing]);

  // Background sync when online status changes or buffer grows
  useEffect(() => {
    if (isOnline && buffer.length > 0) {
      const timer = setTimeout(syncRecords, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, buffer.length, syncRecords]);

  const recordAttendance = async (payload: Omit<PendingRecord['payload'], 'timestamp'>) => {
    const newRecord: PendingRecord = {
      id: crypto.randomUUID(),
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
      attempts: 0,
    };

    // UI Optimistic Update: Add to buffer first
    setBuffer((prev) => [...prev, newRecord]);

    // Attempt immediate sync if online
    if (isOnline) {
      try {
        const { error } = await eventsApi.recordAttendance(newRecord.payload);
        if (!error) {
          // Remove from buffer immediately if successful
          setBuffer((prev) => prev.filter((r) => r.id !== newRecord.id));
          return { success: true };
        }
      } catch (e) {
        console.error('Immediate record failed', e);
      }
    }

    toast.info('Record saved to offline buffer', {
      description: 'Data will sync automatically when connection is restored.',
    });

    return { success: true, offline: true };
  };

  return {
    isOnline,
    bufferSize: buffer.length,
    isSyncing,
    recordAttendance,
    syncNow: syncRecords,
  };
};
