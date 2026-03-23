import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { EventIncident } from '@/services/incidentsApi';

export const useEmergencyNotifications = (incidents: EventIncident[]) => {
  const prevIncidentsCount = useRef(incidents.length);
  const audioContext = useRef<AudioContext | null>(null);

  const playAlertSound = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Slide down to A4

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.warn('Audio alert failed (likely blocked by browser):', error);
    }
  };

  useEffect(() => {
    // Only trigger for NEW incidents (not overall count reduction or initial load)
    if (incidents.length > prevIncidentsCount.current) {
      const newIncident = incidents[0]; // Assuming newest first from order('created_at', { ascending: false })

      if (newIncident && newIncident.status === 'open') {
        playAlertSound();

        const isCritical = newIncident.severity === 'critical' || newIncident.severity === 'high';

        toast.error(`NEW EMERGENCY: ${newIncident.type.toUpperCase()}`, {
          description: `${newIncident.location_details} - ${newIncident.severity.toUpperCase()} PRIORITY`,
          duration: isCritical ? 10000 : 5000,
          action: {
            label: 'View Map',
            onClick: () => {
              // We'll hook into tab switching later if needed via a callback
            },
          },
        });
      }
    }
    prevIncidentsCount.current = incidents.length;
  }, [incidents]);
};
