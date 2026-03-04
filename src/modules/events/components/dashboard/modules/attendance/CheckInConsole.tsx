import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  QrCode,
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  Loader2,
  Keyboard,
  Scan,
  Maximize2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMembers } from '@/modules/members/hooks/useMembers';
import { useAttendanceSync } from '@/modules/events/hooks/useAttendanceSync';
import { PersonDetailDrawer } from './PersonDetailDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  isSignedEventCredentialToken,
  parseEventRegistrationCredential,
} from '@/modules/events/utils/CredentialGenerator';
import eventsApi from '@/services/eventsApi';
import eventCredentialsApi from '@/services/eventCredentialsApi';
import { attendanceApi, type EventZone } from '@/services/eventModulesApi';

export const CheckInConsole = () => {
  const DUPLICATE_SCAN_WINDOW_MS = 8000;
  const CAMERA_DUPLICATE_PAYLOAD_WINDOW_MS = 1500;
  const CAMERA_DETECTION_INTERVAL_MS = 400;
  const { eventId } = useParams<{ eventId: string }>();
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanPayload, setScanPayload] = useState('');
  const [activeZone, setActiveZone] = useState('zone-main');
  const [eventZones, setEventZones] = useState<EventZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesPanelOpen, setZonesPanelOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCapacity, setNewZoneCapacity] = useState('100');
  const [newZoneType, setNewZoneType] = useState('ENTRY');
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneCapacity, setEditZoneCapacity] = useState('100');
  const [editZoneType, setEditZoneType] = useState('ENTRY');
  const [isUpdatingZone, setIsUpdatingZone] = useState(false);
  const [deletingZoneId, setDeletingZoneId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [avgProcessingMs, setAvgProcessingMs] = useState<number | null>(null);
  const [cameraState, setCameraState] = useState<
    'idle' | 'starting' | 'active' | 'unsupported' | 'error'
  >('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const recentScanByRegistrationRef = useRef<Record<string, number>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<{
    detect: (input: any) => Promise<Array<{ rawValue?: string }>>;
  } | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraFrameRef = useRef<number | null>(null);
  const scanInFlightRef = useRef(false);
  const lastDetectionAtRef = useRef(0);
  const processingDurationsRef = useRef<number[]>([]);
  const lastCameraPayloadRef = useRef<{ value: string; at: number } | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    name?: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const { bufferSize, isOnline, isSyncing, recordAttendance } = useAttendanceSync(eventId || '');

  const { members, loading: membersLoading } = useMembers({ search: searchQuery });
  const cameraSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof (window as any).BarcodeDetector !== 'undefined';

  useEffect(() => {
    scanInFlightRef.current = isScanning;
  }, [isScanning]);

  const stopCameraScanner = useCallback((nextState: 'idle' | 'error' = 'idle') => {
    if (cameraFrameRef.current !== null) {
      cancelAnimationFrame(cameraFrameRef.current);
      cameraFrameRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState(nextState);
  }, []);

  useEffect(() => {
    if (mode !== 'scan') {
      stopCameraScanner();
    }
  }, [mode, stopCameraScanner]);

  useEffect(() => () => stopCameraScanner(), [stopCameraScanner]);

  const showScanResult = (payload: {
    success: boolean;
    name?: string;
    message: string;
    timestamp?: string;
  }) => {
    setLastScanResult({
      ...payload,
      timestamp: payload.timestamp || new Date().toLocaleTimeString(),
    });
    setTimeout(() => setLastScanResult(null), 3500);
  };

  const refreshZones = useCallback(async () => {
    if (!eventId) return;
    setZonesLoading(true);
    try {
      const zones = await attendanceApi.getZones(eventId);
      setEventZones(zones || []);
    } catch {
      setEventZones([]);
    } finally {
      setZonesLoading(false);
    }
  }, [eventId]);

  const refreshAttendanceMetrics = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data, error } = await eventsApi.getAttendanceLogs(eventId, 500);
      if (!error && data) {
        setAttendanceLogs(data);
      }
    } catch {
      // Keep UI stable even when attendance logs are unavailable.
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    void refreshZones();
    void refreshAttendanceMetrics();
    const timer = window.setInterval(() => {
      void refreshAttendanceMetrics();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [eventId, refreshAttendanceMetrics, refreshZones]);

  const zoneOptions = useMemo(() => {
    const options = new Map<string, string>();
    options.set('zone-main', 'Main Portal');
    eventZones.forEach((zone) => {
      options.set(zone.id, zone.name);
    });
    attendanceLogs.forEach((log) => {
      const zoneValue =
        typeof log?.zone_id === 'string' && log.zone_id.trim().length > 0 ? log.zone_id.trim() : '';
      if (zoneValue && !options.has(zoneValue)) options.set(zoneValue, zoneValue);
    });
    if (!options.has(activeZone)) {
      options.set(activeZone, activeZone);
    }
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [activeZone, attendanceLogs, eventZones]);

  useEffect(() => {
    if (zoneOptions.length === 0) return;
    const hasCurrent = zoneOptions.some((zone) => zone.value === activeZone);
    if (!hasCurrent) {
      setActiveZone(zoneOptions[0].value);
    }
  }, [activeZone, zoneOptions]);

  const activeZoneLabel = useMemo(() => {
    const found = zoneOptions.find((zone) => zone.value === activeZone);
    return found?.label || activeZone;
  }, [activeZone, zoneOptions]);

  const metrics = useMemo(() => {
    const totalScans = attendanceLogs.length;
    const manualHits = attendanceLogs.filter((log) => log.method === 'MANUAL').length;
    const checkInsByMember = new Map<string, number>();
    attendanceLogs.forEach((log) => {
      if (log.type === 'in' && log.member_id) {
        checkInsByMember.set(log.member_id, (checkInsByMember.get(log.member_id) || 0) + 1);
      }
    });
    const reEntries = Array.from(checkInsByMember.values()).reduce(
      (sum, count) => sum + (count > 1 ? count - 1 : 0),
      0
    );

    return {
      totalScans,
      manualHits,
      reEntries,
      avgWaitLabel: avgProcessingMs !== null ? `${Math.round(avgProcessingMs)}ms` : '--',
    };
  }, [attendanceLogs, avgProcessingMs]);

  const processScanPayload = useCallback(
    async (inputPayload: string, source: 'manual' | 'camera' = 'manual') => {
      const rawPayload = inputPayload.trim();
      if (!rawPayload) {
        showScanResult({
          success: false,
          message: 'Paste or scan a QR payload to continue.',
        });
        return;
      }
      if (!eventId) {
        showScanResult({
          success: false,
          message: 'Missing event context. Refresh and retry.',
        });
        return;
      }

      scanInFlightRef.current = true;
      setIsScanning(true);
      const startedAt = performance.now();
      try {
        let resolution: {
          registration: { id: string; name: string; status: string };
          attendance_member_id: string | null;
        } | null = null;
        let credentialMeta: { type: string; version: number; issued_at: string } | null = null;

        if (isSignedEventCredentialToken(rawPayload)) {
          const { data, error } = await eventCredentialsApi.verifyCredential({
            token: rawPayload,
            eventId,
          });
          if (error || !data) {
            throw error || new Error('Signed credential verification failed.');
          }
          resolution = {
            registration: data.registration,
            attendance_member_id: data.attendance_member_id,
          };
          credentialMeta = {
            type: 'event_registration_signed',
            version: data.credential.version,
            issued_at: data.credential.issued_at,
          };
        } else {
          const { credential, error: parseError } = parseEventRegistrationCredential(rawPayload);
          if (!credential) {
            throw new Error(parseError || 'Invalid QR payload.');
          }

          if (credential.event_id !== eventId) {
            throw new Error('This QR code belongs to another event.');
          }

          const { data, error } = await eventsApi.resolveRegistrationForCheckIn({
            event_id: eventId,
            registration_id: credential.registration_id,
          });
          if (error || !data) {
            throw error || new Error('Could not resolve registration.');
          }
          resolution = data;
          credentialMeta = {
            type: credential.t,
            version: credential.v,
            issued_at: credential.issued_at,
          };
        }

        const now = Date.now();
        const registrationId = resolution.registration.id;
        Object.keys(recentScanByRegistrationRef.current).forEach((id) => {
          if (now - recentScanByRegistrationRef.current[id] > DUPLICATE_SCAN_WINDOW_MS) {
            delete recentScanByRegistrationRef.current[id];
          }
        });
        const lastProcessedAt = recentScanByRegistrationRef.current[registrationId];
        if (lastProcessedAt && now - lastProcessedAt < DUPLICATE_SCAN_WINDOW_MS) {
          throw new Error('Duplicate scan blocked. This pass was already processed moments ago.');
        }

        const attendance = await recordAttendance({
          event_id: eventId,
          member_id: resolution.attendance_member_id,
          zone_id: activeZone,
          type: 'in',
          method: 'QR',
          metadata: {
            registration_id: resolution.registration.id,
            registration_status: resolution.registration.status,
            attendee_name: resolution.registration.name,
            credential_type: credentialMeta?.type || 'unknown',
            credential_version: credentialMeta?.version || 1,
            credential_issued_at: credentialMeta?.issued_at || new Date().toISOString(),
            credential_signed: credentialMeta?.type === 'event_registration_signed',
            scan_source: source,
          },
        });
        recentScanByRegistrationRef.current[registrationId] = now;

        showScanResult({
          success: true,
          name: resolution.registration.name,
          message: attendance.offline ? 'Offline check-in saved.' : 'Check-in successful. Welcome!',
        });
        const durationMs = performance.now() - startedAt;
        processingDurationsRef.current = [...processingDurationsRef.current.slice(-24), durationMs];
        const avg =
          processingDurationsRef.current.reduce((sum, value) => sum + value, 0) /
          processingDurationsRef.current.length;
        setAvgProcessingMs(avg);
        void refreshAttendanceMetrics();
      } catch (err: any) {
        showScanResult({
          success: false,
          message: err?.message || 'QR validation failed.',
        });
      } finally {
        scanInFlightRef.current = false;
        setScanPayload('');
        setIsScanning(false);
      }
    },
    [activeZone, eventId, recordAttendance, refreshAttendanceMetrics]
  );

  const handleProcessScan = async () => {
    const rawPayload = scanPayload.trim();
    if (!rawPayload) {
      await processScanPayload(rawPayload, 'manual');
      return;
    }
    await processScanPayload(rawPayload, 'manual');
  };

  const runCameraScanFrame = useCallback(async () => {
    if (cameraState !== 'active') return;
    if (!videoRef.current || !detectorRef.current || !cameraStreamRef.current) {
      cameraFrameRef.current = requestAnimationFrame(() => {
        void runCameraScanFrame();
      });
      return;
    }
    try {
      const now = Date.now();
      if (now - lastDetectionAtRef.current < CAMERA_DETECTION_INTERVAL_MS) {
        cameraFrameRef.current = requestAnimationFrame(() => {
          void runCameraScanFrame();
        });
        return;
      }
      lastDetectionAtRef.current = now;

      if (!scanInFlightRef.current) {
        const detections = await detectorRef.current.detect(videoRef.current);
        const payload = detections
          .map((d) => (typeof d.rawValue === 'string' ? d.rawValue.trim() : ''))
          .find((value) => value.length > 0);
        if (payload) {
          const now = Date.now();
          const lastPayload = lastCameraPayloadRef.current;
          if (
            !lastPayload ||
            lastPayload.value !== payload ||
            now - lastPayload.at > CAMERA_DUPLICATE_PAYLOAD_WINDOW_MS
          ) {
            lastCameraPayloadRef.current = { value: payload, at: now };
            setScanPayload(payload);
            await processScanPayload(payload, 'camera');
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'NotSupportedError' && err?.name !== 'InvalidStateError') {
        setCameraError(err?.message || 'Camera scan failed.');
      }
    } finally {
      cameraFrameRef.current = requestAnimationFrame(() => {
        void runCameraScanFrame();
      });
    }
  }, [CAMERA_DUPLICATE_PAYLOAD_WINDOW_MS, cameraState, processScanPayload]);

  const startCameraScanner = useCallback(async () => {
    if (!cameraSupported) {
      setCameraState('unsupported');
      setCameraError('Camera scanning is not supported in this browser.');
      return;
    }
    if (cameraState === 'starting' || cameraState === 'active') {
      return;
    }

    setCameraError(null);
    setCameraState('starting');
    try {
      const BarcodeDetectorCtor = (window as any).BarcodeDetector as
        | (new (options?: { formats?: string[] }) => {
            detect: (input: any) => Promise<Array<{ rawValue?: string }>>;
          })
        | undefined;
      if (!BarcodeDetectorCtor) {
        throw new Error('Barcode detector is unavailable.');
      }
      if (!detectorRef.current) {
        detectorRef.current = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState('active');
      cameraFrameRef.current = requestAnimationFrame(() => {
        void runCameraScanFrame();
      });
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to start camera scanner.');
      stopCameraScanner('error');
    }
  }, [cameraState, cameraSupported, runCameraScanFrame, stopCameraScanner]);

  const handleCreateZone = async () => {
    const trimmedName = newZoneName.trim();
    if (!eventId || !trimmedName) {
      showScanResult({
        success: false,
        message: 'Provide a zone name before creating.',
      });
      return;
    }

    setIsCreatingZone(true);
    try {
      const createdZone = await attendanceApi.createZone({
        event_id: eventId,
        name: trimmedName,
        capacity: Number(newZoneCapacity) > 0 ? Number(newZoneCapacity) : 100,
        current_occupancy: 0,
        zone_type: newZoneType,
      });
      setEventZones((prev) => [...prev, createdZone]);
      setActiveZone(createdZone.id);
      setNewZoneName('');
      setNewZoneCapacity('100');
      setNewZoneType('ENTRY');
      setZonesPanelOpen(false);
    } catch (err: any) {
      showScanResult({
        success: false,
        message: err?.message || 'Failed to create zone.',
      });
    } finally {
      setIsCreatingZone(false);
    }
  };

  const startEditZone = (zone: EventZone) => {
    setEditingZoneId(zone.id);
    setEditZoneName(zone.name || '');
    setEditZoneCapacity(String(zone.capacity ?? 100));
    setEditZoneType(zone.zone_type || 'ENTRY');
  };

  const cancelEditZone = () => {
    setEditingZoneId(null);
    setEditZoneName('');
    setEditZoneCapacity('100');
    setEditZoneType('ENTRY');
  };

  const handleUpdateZone = async (zoneId: string) => {
    const trimmedName = editZoneName.trim();
    if (!trimmedName) {
      showScanResult({
        success: false,
        message: 'Zone name is required.',
      });
      return;
    }

    setIsUpdatingZone(true);
    try {
      const updated = await attendanceApi.updateZone(zoneId, {
        name: trimmedName,
        capacity: Number(editZoneCapacity) > 0 ? Number(editZoneCapacity) : 100,
        zone_type: editZoneType,
      });
      setEventZones((prev) => prev.map((zone) => (zone.id === zoneId ? updated : zone)));
      cancelEditZone();
    } catch (err: any) {
      showScanResult({
        success: false,
        message: err?.message || 'Failed to update zone.',
      });
    } finally {
      setIsUpdatingZone(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    const canDelete =
      typeof window === 'undefined'
        ? true
        : window.confirm('Delete this zone? This cannot be undone.');
    if (!canDelete) return;
    setDeletingZoneId(zoneId);
    try {
      await attendanceApi.deleteZone(zoneId);
      setEventZones((prev) => prev.filter((zone) => zone.id !== zoneId));
      if (activeZone === zoneId) {
        setActiveZone('zone-main');
      }
      if (editingZoneId === zoneId) {
        cancelEditZone();
      }
    } catch (err: any) {
      showScanResult({
        success: false,
        message: err?.message || 'Failed to delete zone.',
      });
    } finally {
      setDeletingZoneId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Primary Interaction Zone */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-muted/40 rounded-2xl border border-primary/5 w-fit">
          <Button
            variant="ghost"
            onClick={() => setMode('scan')}
            className={cn(
              'h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all',
              mode === 'scan' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
            )}
          >
            <Scan className="h-3.5 w-3.5 mr-2" />
            Scanner Mode
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMode('manual')}
            className={cn(
              'h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all',
              mode === 'manual' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
            )}
          >
            <Keyboard className="h-3.5 w-3.5 mr-2" />
            Manual Search
          </Button>
        </div>

        {mode === 'scan' ? (
          <Card className="aspect-square lg:aspect-video rounded-[40px] border-none bg-neutral-900 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-white ring-8 ring-primary/5">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 w-full h-1 bg-primary/40 animate-scan" />
            </div>

            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-4"
                >
                  <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">
                    Validating Token...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center space-y-8"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full" />
                    <QrCode className="h-32 w-32 relative text-primary" />
                    <div className="absolute top-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-4 border-neutral-900" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-serif font-black">Scanner Active</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Position QR code within the frame for <br /> instant verification
                    </p>
                  </div>
                  <div className="w-full max-w-md px-4 space-y-3">
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50">
                          Scanner Zone
                        </p>
                        <Badge className="bg-white/10 text-white/70 border-none text-[8px] font-black tracking-widest py-1">
                          {activeZoneLabel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <select
                          aria-label="Active zone selector"
                          value={activeZone}
                          onChange={(e) => setActiveZone(e.target.value)}
                          disabled={zonesLoading}
                          className="h-10 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold text-white outline-none disabled:opacity-60"
                        >
                          {zoneOptions.map((zone) => (
                            <option key={zone.value} value={zone.value} className="text-black">
                              {zone.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-10 w-full sm:w-auto px-3 rounded-xl text-[9px] font-black uppercase tracking-widest"
                          onClick={() => setZonesPanelOpen((open) => !open)}
                        >
                          {zonesPanelOpen ? 'Close' : 'Manage'}
                        </Button>
                      </div>
                      {zonesPanelOpen && (
                        <div className="rounded-xl border border-white/15 bg-white/5 p-3 space-y-2">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                              Add New Zone
                            </p>
                            <Input
                              value={newZoneName}
                              onChange={(e) => setNewZoneName(e.target.value)}
                              placeholder="Zone name"
                              className="h-9 rounded-lg border-white/20 bg-white/10 text-white placeholder:text-white/40"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min={1}
                                value={newZoneCapacity}
                                onChange={(e) => setNewZoneCapacity(e.target.value)}
                                placeholder="Capacity"
                                className="h-9 rounded-lg border-white/20 bg-white/10 text-white placeholder:text-white/40"
                              />
                              <select
                                value={newZoneType}
                                onChange={(e) => setNewZoneType(e.target.value)}
                                className="h-9 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-bold text-white outline-none"
                              >
                                <option value="ENTRY" className="text-black">
                                  ENTRY
                                </option>
                                <option value="HALL" className="text-black">
                                  HALL
                                </option>
                                <option value="ROOM" className="text-black">
                                  ROOM
                                </option>
                                <option value="CLINIC" className="text-black">
                                  CLINIC
                                </option>
                              </select>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                onClick={() => void refreshZones()}
                              >
                                Refresh
                              </Button>
                              <Button
                                type="button"
                                className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                onClick={() => void handleCreateZone()}
                                disabled={isCreatingZone}
                              >
                                {isCreatingZone ? 'Saving...' : 'Create Zone'}
                              </Button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                              Existing Zones
                            </p>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {eventZones.length === 0 ? (
                                <p className="text-[10px] text-white/50">
                                  No zones configured yet.
                                </p>
                              ) : (
                                eventZones.map((zone) => (
                                  <div
                                    key={zone.id}
                                    className="rounded-lg border border-white/10 bg-black/20 p-2 space-y-2"
                                  >
                                    {editingZoneId === zone.id ? (
                                      <>
                                        <Input
                                          value={editZoneName}
                                          onChange={(e) => setEditZoneName(e.target.value)}
                                          placeholder="Edit zone name"
                                          className="h-8 rounded-md border-white/20 bg-white/10 text-white placeholder:text-white/40"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                          <Input
                                            type="number"
                                            min={1}
                                            value={editZoneCapacity}
                                            onChange={(e) => setEditZoneCapacity(e.target.value)}
                                            placeholder="Edit capacity"
                                            className="h-8 rounded-md border-white/20 bg-white/10 text-white placeholder:text-white/40"
                                          />
                                          <select
                                            value={editZoneType}
                                            onChange={(e) => setEditZoneType(e.target.value)}
                                            className="h-8 rounded-md border border-white/20 bg-white/10 px-2 text-[10px] font-bold text-white outline-none"
                                          >
                                            <option value="ENTRY" className="text-black">
                                              ENTRY
                                            </option>
                                            <option value="HALL" className="text-black">
                                              HALL
                                            </option>
                                            <option value="ROOM" className="text-black">
                                              ROOM
                                            </option>
                                            <option value="CLINIC" className="text-black">
                                              CLINIC
                                            </option>
                                          </select>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-white/70"
                                            onClick={cancelEditZone}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            type="button"
                                            className="h-7 px-2 rounded-md text-[9px] font-black uppercase tracking-widest"
                                            onClick={() => void handleUpdateZone(zone.id)}
                                            disabled={isUpdatingZone}
                                          >
                                            {isUpdatingZone ? 'Saving...' : 'Save'}
                                          </Button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="text-[10px] font-black text-white truncate">
                                            {zone.name}
                                          </p>
                                          <p className="text-[9px] text-white/50 uppercase tracking-widest">
                                            {(zone.zone_type || 'ZONE').toUpperCase()} · cap{' '}
                                            {zone.capacity || '--'}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-white/70"
                                            onClick={() => startEditZone(zone)}
                                          >
                                            Edit
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-red-300 hover:text-red-200"
                                            onClick={() => void handleDeleteZone(zone.id)}
                                            disabled={deletingZoneId === zone.id}
                                          >
                                            {deletingZoneId === zone.id ? '...' : 'Delete'}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-black/60 overflow-hidden">
                      {cameraState === 'active' ? (
                        <video
                          ref={videoRef}
                          muted
                          playsInline
                          autoPlay
                          className="w-full h-44 object-cover"
                        />
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center gap-2 text-white/60 p-4 text-center">
                          <QrCode className="h-8 w-8 text-white/50" />
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            {cameraState === 'unsupported'
                              ? 'Camera scanner unsupported'
                              : cameraState === 'starting'
                                ? 'Starting camera...'
                                : cameraState === 'error'
                                  ? 'Camera unavailable'
                                  : 'Camera preview is off'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          if (cameraState === 'active' || cameraState === 'starting') {
                            stopCameraScanner();
                          } else {
                            void startCameraScanner();
                          }
                        }}
                        disabled={cameraState === 'starting'}
                        variant="secondary"
                        className="h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest"
                      >
                        {cameraState === 'active' || cameraState === 'starting'
                          ? 'Stop Camera'
                          : 'Start Camera'}
                      </Button>
                      <Badge className="bg-white/10 text-white/70 border-none text-[8px] font-black tracking-widest py-1">
                        {cameraState.toUpperCase()}
                      </Badge>
                    </div>
                    {cameraError && (
                      <p className="text-[10px] text-red-300 font-bold leading-relaxed">
                        {cameraError}
                      </p>
                    )}
                    <Input
                      value={scanPayload}
                      onChange={(e) => setScanPayload(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isScanning) {
                          void handleProcessScan();
                        }
                      }}
                      placeholder="Paste scanned QR payload and press Enter"
                      className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary"
                    />
                    <Button
                      onClick={handleProcessScan}
                      disabled={isScanning}
                      className="h-11 w-full rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest"
                    >
                      Validate QR Data
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-6 left-6 flex items-center gap-2">
              <Badge
                className={cn(
                  'border-none text-[8px] font-black tracking-widest py-1',
                  isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                )}
              >
                {isOnline ? 'DEVICE CONNECTED' : 'OFFLINE MODE ACTIVE'}
              </Badge>
              <Badge className="bg-white/10 text-white/40 border-none text-[8px] font-black tracking-widest py-1">
                LOGS ENCRYPTED
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-all"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </Card>
        ) : (
          <Card className="p-8 pb-4 rounded-[40px] border-none bg-white shadow-2xl flex flex-col h-[500px]">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input
                placeholder="Search by name, phone, or membership ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 rounded-2xl border-primary/5 bg-muted/30 focus:bg-background transition-all font-bold"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {membersLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground opacity-40">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Searching Records...
                  </p>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground opacity-40">
                  <UserPlus className="h-12 w-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    No matching members
                  </p>
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() =>
                      setSelectedPerson({
                        id: member.id,
                        fullName: member.fullName,
                        role: 'ATTENDEE',
                        status: 'ACTIVE',
                        currentZone: 'Main Entrance',
                        phone: member.phone,
                      })
                    }
                    className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-primary shadow-inner">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-foreground">{member.fullName}</h5>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                          {member.phone || 'No Phone Registered'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!eventId) {
                          showScanResult({
                            success: false,
                            name: member.fullName,
                            message: 'Event context missing.',
                          });
                          return;
                        }
                        try {
                          const result = await recordAttendance({
                            event_id: eventId,
                            member_id: member.id,
                            zone_id: activeZone,
                            type: 'in',
                            method: 'MANUAL',
                          });
                          showScanResult({
                            success: true,
                            name: member.fullName,
                            message: result.offline
                              ? 'Offline check-in saved.'
                              : 'Manual check-in confirmed.',
                          });
                          void refreshAttendanceMetrics();
                        } catch (err: any) {
                          showScanResult({
                            success: false,
                            name: member.fullName,
                            message: err?.message || 'Manual check-in failed.',
                          });
                        }
                      }}
                      className="h-9 px-4 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Check-In
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-primary/5">
              <Button
                variant="ghost"
                className="w-full text-primary font-black text-[10px] uppercase tracking-widest h-10 rounded-xl"
              >
                Register New Attendee
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Real-time Feedback & Metrics */}
      <div className="space-y-6">
        <AnimatePresence>
          {lastScanResult && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'p-8 rounded-[40px] flex items-center gap-6 shadow-2xl relative overflow-hidden',
                lastScanResult.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              )}
            >
              <div className="h-20 w-20 rounded-[28px] bg-white/20 flex items-center justify-center shrink-0">
                {lastScanResult.success ? (
                  <CheckCircle2 className="h-10 w-10 text-white" />
                ) : (
                  <XCircle className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black leading-tight">
                  {lastScanResult.name || 'Access Denied'}
                </h3>
                <p className="text-sm font-bold opacity-80 mt-1">{lastScanResult.message}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge className="bg-white/20 border-none text-[8px] font-black tracking-widest py-1">
                    TIME: {lastScanResult.timestamp}
                  </Badge>
                  {lastScanResult.success && (
                    <Badge className="bg-white/20 border-none text-[8px] font-black tracking-widest py-1">
                      ZONE: {activeZoneLabel.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                {lastScanResult.success ? <CheckCircle2 size={160} /> : <XCircle size={160} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="p-8 rounded-[40px] border border-primary/5 bg-white shadow-2xl shadow-primary/5">
          <h4 className="text-xl font-serif font-black mb-6">Session Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Scans', value: String(metrics.totalScans), color: 'text-primary' },
              { label: 'Wait Time', value: metrics.avgWaitLabel, color: 'text-emerald-500' },
              { label: 'Manual Hits', value: String(metrics.manualHits), color: 'text-amber-500' },
              { label: 'Re-entries', value: String(metrics.reEntries), color: 'text-primary' },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-3xl bg-muted/30 border border-primary/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                  {m.label}
                </p>
                <p className={cn('text-xl font-black', m.color)}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-primary/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Sync Pipeline
              </span>
              <span
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  isSyncing
                    ? 'text-primary animate-pulse'
                    : bufferSize > 0
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                )}
              >
                {isSyncing
                  ? 'Synchronizing...'
                  : bufferSize > 0
                    ? `${bufferSize} Pending`
                    : 'Synchronized'}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full transition-all duration-1000',
                  isSyncing ? 'bg-primary' : bufferSize > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                animate={{ width: bufferSize > 0 ? '60%' : '100%' }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-8 rounded-[40px] border border-primary/5 bg-white shadow-2xl shadow-primary/5 relative overflow-hidden group">
          <div className="relative z-10">
            <h5 className="font-serif font-black mb-4">Offline Buffer</h5>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
              {bufferSize > 0
                ? `There are ${bufferSize} records currently buffered. They will be pushed to the server as soon as connection is stable.`
                : 'No pending records. Your device is communicating directly with the Supabase Real-time cluster.'}
            </p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {isOnline ? 'Service Reachable' : 'Local Buffer Active'}
              </span>
            </div>
          </div>
          <Loader2
            className={cn(
              'absolute -right-4 -bottom-4 h-32 w-32 text-primary opacity-5 transition-transform duration-[2000ms]',
              isSyncing && 'animate-spin'
            )}
          />
        </Card>
      </div>

      <PersonDetailDrawer
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        person={selectedPerson}
      />

      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
          position: absolute;
          z-index: 5;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
