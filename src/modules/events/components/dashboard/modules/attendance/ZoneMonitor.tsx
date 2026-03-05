import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import eventsApi from '@/services/eventsApi';
import { attendanceApi, type EventZone } from '@/services/eventModulesApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ZoneStatus = 'critical' | 'high' | 'optimal' | 'low';

type ZoneView = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  current: number;
  utilization: number | null;
  status: ZoneStatus;
};

const getZoneStatus = (utilization: number | null): ZoneStatus => {
  if (utilization === null) return 'low';
  if (utilization >= 95) return 'critical';
  if (utilization >= 75) return 'high';
  if (utilization >= 40) return 'optimal';
  return 'low';
};

export const ZoneMonitor = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [zones, setZones] = useState<EventZone[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const [zonesData, attendanceData] = await Promise.all([
        attendanceApi.getZones(eventId),
        eventsApi.getAttendanceLogs(eventId, 1000),
      ]);
      setZones(zonesData || []);
      setLogs(!attendanceData.error && attendanceData.data ? attendanceData.data : []);
    } catch {
      setZones([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Initial load
  useEffect(() => {
    if (!eventId) return;
    void loadData();
  }, [eventId, loadData]);

  // Supabase Realtime subscriptions
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`zone-monitor-${eventId}`)
      // Listen for zone changes (INSERT/UPDATE/DELETE on event_zones)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'event_zones',
          filter: `event_id=eq.${eventId}`,
        },
        (payload: any) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT') {
            setZones((prev) => [...prev, newRow as EventZone]);
          } else if (eventType === 'UPDATE') {
            setZones((prev) =>
              prev.map((z) => (z.id === newRow.id ? { ...z, ...newRow } : z))
            );
          } else if (eventType === 'DELETE') {
            setZones((prev) => prev.filter((z) => z.id !== oldRow.id));
          }
        }
      )
      // Listen for attendance changes (INSERT/UPDATE on event_attendance)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_attendance',
          filter: `event_id=eq.${eventId}`,
        },
        (payload: any) => {
          const row = payload.new;
          let parsedNotes: any = null;
          if (row.notes) {
            try { parsedNotes = JSON.parse(row.notes); } catch { /* ignore */ }
          }
          const isCheckout = row.status === 'checked_out';
          const normalized = {
            ...row,
            type: isCheckout ? 'out' : 'in',
            method: parsedNotes?.method || 'MANUAL',
            timestamp: isCheckout && row.checked_out_at ? row.checked_out_at : row.checked_in_at,
            zone_id: parsedNotes?.zone_label || row.zone_id || 'Unknown Zone',
            metadata: parsedNotes?.metadata || null,
          };
          setLogs((prev) => [normalized, ...prev]);

          // Update zone occupancy locally
          if (row.zone_id) {
            setZones((prev) =>
              prev.map((z) => {
                if (z.id !== row.zone_id) return z;
                const delta = isCheckout ? -1 : 1;
                return {
                  ...z,
                  current_occupancy: Math.max(0, (z.current_occupancy ?? 0) + delta),
                };
              })
            );
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_attendance',
          filter: `event_id=eq.${eventId}`,
        },
        (payload: any) => {
          const row = payload.new;
          const oldRow = payload.old;
          // Handle checkout updates
          if (row.status === 'checked_out' && oldRow?.status !== 'checked_out' && row.zone_id) {
            setZones((prev) =>
              prev.map((z) => {
                if (z.id !== row.zone_id) return z;
                return {
                  ...z,
                  current_occupancy: Math.max(0, (z.current_occupancy ?? 0) - 1),
                };
              })
            );
          }
        }
      )
      .subscribe((status: string) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          toast.success('Zone Monitor connected to live updates', { duration: 2000 });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setRealtimeConnected(false);
    };
  }, [eventId]);

  const zonesByLogDelta = useMemo(() => {
    const byZone = new Map<string, number>();
    logs.forEach((log) => {
      const key = typeof log?.zone_id === 'string' ? log.zone_id : 'Unknown Zone';
      const delta = log?.type === 'out' ? -1 : 1;
      byZone.set(key, (byZone.get(key) || 0) + delta);
    });
    return byZone;
  }, [logs]);

  const zoneViews = useMemo<ZoneView[]>(() => {
    return zones.map((zone) => {
      const fallbackDelta = zonesByLogDelta.get(zone.name) ?? zonesByLogDelta.get(zone.id) ?? 0;
      const current = Math.max(0, zone.current_occupancy ?? fallbackDelta);
      const capacity = Math.max(0, zone.capacity ?? 0);
      const utilization =
        capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : null;

      return {
        id: zone.id,
        name: zone.name,
        type: zone.zone_type || 'ZONE',
        capacity,
        current,
        utilization,
        status: getZoneStatus(utilization),
      };
    });
  }, [zones, zonesByLogDelta]);

  const totalPresence = useMemo(
    () => zoneViews.reduce((sum, zone) => sum + zone.current, 0),
    [zoneViews]
  );

  const highPressureZone = useMemo(() => {
    return [...zoneViews]
      .filter((zone) => zone.utilization !== null)
      .sort((a, b) => (b.utilization || 0) - (a.utilization || 0))[0];
  }, [zoneViews]);

  const flowRatePerMin = useMemo(() => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentScans = logs.filter((log) => {
      const timestamp = log?.timestamp ? new Date(log.timestamp).getTime() : 0;
      return timestamp >= tenMinutesAgo;
    }).length;
    return Number((recentScans / 10).toFixed(1));
  }, [logs]);

  const flowFill = Math.min(100, Math.max(5, flowRatePerMin * 5));

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 items-stretch">
        <Card className="h-full p-6 md:p-8 bg-gradient-to-br from-primary to-primary/80 border-none rounded-[32px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">
              Total Presence
            </h5>
            <div className="flex items-end gap-3 mb-4 md:mb-6">
              <h2 className="text-4xl md:text-5xl font-serif font-black">{totalPresence}</h2>
              <TrendingUp className="h-6 w-6 text-emerald-300 mb-2" />
            </div>
            <div className="flex items-center gap-4 text-xs font-bold opacity-80">
              <span className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {zoneViews.length} zones live
              </span>
            </div>
          </div>
          <Users className="absolute -right-8 -bottom-8 h-40 w-40 md:h-48 md:w-48 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="h-full p-6 md:p-8 bg-background border border-primary/5 rounded-[32px] shadow-2xl shadow-primary/5 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h4 className="font-serif font-black">Capacity Density</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Live Pressure Signal
              </p>
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed break-words">
            {highPressureZone && (highPressureZone.utilization || 0) >= 85 ? (
              <>
                <strong>{highPressureZone.name}</strong> is at{' '}
                <strong>{highPressureZone.utilization}%</strong> capacity. Consider redirecting
                incoming traffic.
              </>
            ) : (
              'Zone utilization is currently within safe operating range.'
            )}
          </p>
        </Card>

        <Card className="h-full p-6 md:p-8 bg-background border border-primary/5 rounded-[32px] shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h5 className="font-serif font-black">Flow Velocity</h5>
            <Activity className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-primary">{flowRatePerMin}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Scans / Min
              </span>
            </div>
            <Progress value={flowFill} className="h-2 bg-primary/10" />
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h4 className="font-serif font-black text-lg">Zone Occupancy</h4>
          <Badge
            variant="outline"
            className={cn(
              'text-[8px] font-black uppercase tracking-widest py-0.5 px-2 border-none',
              realtimeConnected
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {realtimeConnected ? (
              <Wifi className="h-3 w-3 mr-1" />
            ) : (
              <WifiOff className="h-3 w-3 mr-1" />
            )}
            {realtimeConnected ? 'LIVE' : 'POLLING'}
          </Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
          onClick={() => void loadData()}
          disabled={loading}
        >
          <RefreshCw className={cn('h-3.5 w-3.5 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 items-stretch">
        {zoneViews.map((zone) => (
          <Card
            key={zone.id}
            className="h-full bg-background rounded-[28px] border-none shadow-xl shadow-primary/5 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500"
          >
            <div className="p-5 md:p-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center transition-all',
                    zone.status === 'critical'
                      ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20'
                      : zone.status === 'high'
                        ? 'bg-amber-500/15 text-amber-600'
                        : 'bg-muted text-primary'
                  )}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                  {zone.type}
                </span>
              </div>
              <h4 className="font-serif font-black text-lg mb-1 break-words leading-tight">
                {zone.name}
              </h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-5 opacity-60">
                Max {zone.capacity || '--'}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Occupancy
                  </span>
                  <span
                    className={cn(
                      'text-xs font-black',
                      zone.status === 'critical'
                        ? 'text-destructive'
                        : zone.status === 'high'
                          ? 'text-amber-500'
                          : 'text-primary'
                    )}
                  >
                    {zone.utilization !== null ? `${zone.utilization}%` : '--'}
                  </span>
                </div>
                <Progress
                  value={zone.utilization || 0}
                  className={cn(
                    'h-1.5',
                    zone.status === 'critical'
                      ? 'bg-destructive/10'
                      : zone.status === 'high'
                        ? 'bg-amber-500/10'
                        : 'bg-primary/10'
                  )}
                />
              </div>
            </div>

            <div className="px-5 md:px-6 py-4 mt-auto bg-muted/30 border-t border-primary/5 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 opacity-40" />
                <span className="text-xs font-bold">{zone.current} present</span>
              </div>
              <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
            </div>
          </Card>
        ))}

        {zoneViews.length === 0 && !loading && (
          <Card className="sm:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/10 rounded-[28px] bg-primary/5">
            <MapPin className="h-10 w-10 text-primary/40 mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              No zones provisioned yet
            </p>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Create zones from Scanner Mode to start live occupancy monitoring.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
