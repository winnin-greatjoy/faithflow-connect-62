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
  Settings,
  AlertCircle,
  PowerOff,
  UserCheck,
  UserMinus,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Sound effect for successful scans
const playSuccessSound = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
};

export const CheckInConsole = () => {
  const DUPLICATE_SCAN_WINDOW_MS = 8000;
  const { eventId } = useParams<{ eventId: string }>();
  const [mode, setMode] = useState<'scan' | 'hw-scanner' | 'manual'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanPayload, setScanPayload] = useState('');
  const [activeZone, setActiveZone] = useState('zone-main');
  const [eventZones, setEventZones] = useState<EventZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesPanelOpen, setZonesPanelOpen] = useState(false);

  // Advanced Configuration States
  const [hwConfig, setHwConfig] = useState({
    submitMode: 'enter',
    delayMs: 300,
    stripWhitespace: true,
  });
  const [showHwConfig, setShowHwConfig] = useState(false);
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Zone Management State
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCapacity, setNewZoneCapacity] = useState('100');
  const [newZoneType, setNewZoneType] = useState('main_hall');
  const [isCreatingZone, setIsCreatingZone] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [avgProcessingMs, setAvgProcessingMs] = useState<number | null>(null);

  // Manual Registration State
  const [showManualRegistration, setShowManualRegistration] = useState(false);
  const [manualRegistrationForm, setManualRegistrationForm] = useState({ fullName: '', phone: '' });
  const [isSavingManualRegistration, setIsSavingManualRegistration] = useState(false);

  // Camera State
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const recentScanByRegistrationRef = useRef<Record<string, number>>({});
  const scanInFlightRef = useRef(false);
  const processingDurationsRef = useRef<number[]>([]);
  const hwAutoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    name?: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const hasEventContext = Boolean(eventId);
  const { bufferSize, isOnline, isSyncing, recordAttendance } = useAttendanceSync(eventId || '');

  // Member Hooks
  const { members, loading: membersLoading } = useMembers({ search: searchQuery });
  const { members: staffCandidates, loading: staffLoading } = useMembers({
    search: staffSearchQuery,
  });

  useEffect(() => {
    scanInFlightRef.current = isScanning;
  }, [isScanning]);

  const stopCameraScanner = useCallback(async (nextState: 'idle' | 'error' = 'idle') => {
    if (
      html5QrCodeRef.current &&
      (html5QrCodeRef.current.getState() === 2 /* SCANNING */ ||
        html5QrCodeRef.current.getState() === 3) /* PAUSED */
    ) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner', err);
      }
    }
    setCameraState(nextState);
  }, []);

  useEffect(() => {
    if (mode !== 'scan') {
      void stopCameraScanner();
    }
  }, [mode, stopCameraScanner]);

  useEffect(
    () => () => {
      void stopCameraScanner();
    },
    [stopCameraScanner]
  );

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
    if (payload.success) playSuccessSound();

    setTimeout(() => {
      setLastScanResult(null);
    }, 4000);
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
      // Keep UI stable
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
    if (!options.has(activeZone)) {
      options.set(activeZone, activeZone);
    }
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [activeZone, eventZones]);

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
      if (scanInFlightRef.current) return;
      const rawPayload = inputPayload.trim();
      if (!rawPayload) return;

      if (!eventId) {
        showScanResult({ success: false, message: 'Missing event context. Refresh and retry.' });
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
          if (error || !data) throw error || new Error('Signed credential verification failed.');
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
          if (!credential) throw new Error(parseError || 'Invalid QR payload.');
          if (credential.event_id !== eventId) throw new Error('QR belongs to another event.');

          const { data, error } = await eventsApi.resolveRegistrationForCheckIn({
            event_id: eventId,
            registration_id: credential.registration_id,
          });
          if (error || !data) throw error || new Error('Could not resolve registration.');

          resolution = data;
          credentialMeta = {
            type: credential.t,
            version: credential.v,
            issued_at: credential.issued_at,
          };
        }

        const now = Date.now();
        const registrationId = resolution.registration.id;

        const lastProcessedAt = recentScanByRegistrationRef.current[registrationId];
        if (lastProcessedAt && now - lastProcessedAt < DUPLICATE_SCAN_WINDOW_MS) {
          throw new Error('Duplicate scan blocked. Already processed recently.');
        }

        const attendance = await recordAttendance({
          event_id: eventId,
          member_id: resolution.attendance_member_id,
          zone_id: activeZone,
          type: 'in',
          method: source === 'camera' ? 'QR' : 'MANUAL',
          metadata: {
            registration_id: resolution.registration.id,
            registration_status: resolution.registration.status,
            attendee_name: resolution.registration.name,
            credential_type: credentialMeta?.type || 'unknown',
            scan_source: source,
            assigned_staff_ids: assignedStaffIds.length > 0 ? assignedStaffIds : undefined,
          },
        });

        recentScanByRegistrationRef.current[registrationId] = now;
        showScanResult({
          success: true,
          name: resolution.registration.name,
          message: attendance.offline
            ? 'Offline check-in saved. Welcome!'
            : 'Check-in successful. Welcome!',
        });

        const avg =
          [...processingDurationsRef.current.slice(-24), performance.now() - startedAt].reduce(
            (s, v) => s + v,
            0
          ) /
          (processingDurationsRef.current.length + 1);
        setAvgProcessingMs(avg);
        void refreshAttendanceMetrics();
      } catch (err: any) {
        showScanResult({ success: false, message: err?.message || 'QR validation failed.' });
      } finally {
        scanInFlightRef.current = false;
        setScanPayload('');
        setIsScanning(false);
        // Pause camera briefly
        if (source === 'camera' && html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.getState() === 2) {
              html5QrCodeRef.current.pause();
              setTimeout(() => {
                if (html5QrCodeRef.current?.getState() === 3 /* PAUSED */) {
                  html5QrCodeRef.current.resume();
                }
              }, 2500);
            }
          } catch (e) {
            console.debug('Failed to pause camera', e);
          }
        }
      }
    },
    [activeZone, eventId, recordAttendance, refreshAttendanceMetrics, assignedStaffIds]
  );

  // Hardware Scanner Auto-Submit Effect
  useEffect(() => {
    if (mode === 'hw-scanner' && hwConfig.submitMode === 'delay' && scanPayload.length > 0) {
      if (hwAutoSubmitTimeoutRef.current) clearTimeout(hwAutoSubmitTimeoutRef.current);
      hwAutoSubmitTimeoutRef.current = setTimeout(() => {
        let finalPayload = scanPayload;
        if (hwConfig.stripWhitespace) finalPayload = finalPayload.replace(/\n|\r/g, '').trim();
        if (finalPayload.length > 0 && !isScanning) {
          void processScanPayload(finalPayload, 'manual');
        }
      }, hwConfig.delayMs);
    }
    return () => {
      if (hwAutoSubmitTimeoutRef.current) clearTimeout(hwAutoSubmitTimeoutRef.current);
    };
  }, [scanPayload, mode, hwConfig, isScanning, processScanPayload]);

  const startCameraScanner = useCallback(async () => {
    if (cameraState === 'starting' || cameraState === 'active') return;
    setCameraError(null);
    setCameraState('starting');

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdgePercentage = 0.7; // 70% of screen
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (!scanInFlightRef.current) {
            void processScanPayload(decodedText, 'camera');
          }
        },
        () => {
          /* ignore read errors */
        }
      );
      setCameraState('active');
    } catch (err: any) {
      console.error(err);
      setCameraError(err?.message || 'Unable to access camera.');
      void stopCameraScanner('error');
    }
  }, [cameraState, processScanPayload, stopCameraScanner]);

  const handleCreateZone = async () => {
    const trimmedName = newZoneName.trim();
    if (!eventId || !trimmedName) return;
    setIsCreatingZone(true);
    try {
      const createdZone = await attendanceApi.createZone({
        event_id: eventId,
        name: trimmedName,
        capacity: Number(newZoneCapacity) || 100,
        current_occupancy: 0,
        zone_type: newZoneType,
      });
      setEventZones((prev) => [...prev, createdZone]);
      setActiveZone(createdZone.id);
      setNewZoneName('');
      setZonesPanelOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create zone.');
    } finally {
      setIsCreatingZone(false);
    }
  };

  const handleManualRegistration = async () => {
    const trimmedName = manualRegistrationForm.fullName.trim();
    if (!trimmedName || !eventId) return;
    setIsSavingManualRegistration(true);
    try {
      await recordAttendance({
        event_id: eventId,
        member_id: null,
        zone_id: activeZone,
        type: 'in',
        method: 'MANUAL',
        metadata: {
          attendee_name: trimmedName,
          phone: manualRegistrationForm.phone.trim() || null,
          assigned_staff_ids: assignedStaffIds.length > 0 ? assignedStaffIds : undefined,
        },
      });
      setShowManualRegistration(false);
      setManualRegistrationForm({ fullName: '', phone: '' });
      void refreshAttendanceMetrics();
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
    } finally {
      setIsSavingManualRegistration(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Interaction Column */}
      <div className="space-y-6 flex flex-col">
        {/* Sleek Header Toggles */}
        <div className="flex items-center justify-between p-2 bg-muted/40 rounded-2xl border border-primary/5">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setMode('scan')}
              className={cn(
                'h-10 px-5 rounded-xl font-bold text-xs transition-all',
                mode === 'scan'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-white/50'
              )}
            >
              <QrCode className="h-4 w-4 mr-2" /> Camera
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMode('hw-scanner')}
              className={cn(
                'h-10 px-5 rounded-xl font-bold text-xs transition-all',
                mode === 'hw-scanner'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-white/50'
              )}
            >
              <Scan className="h-4 w-4 mr-2" /> Scanner
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMode('manual')}
              className={cn(
                'h-10 px-5 rounded-xl font-bold text-xs transition-all',
                mode === 'manual'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-white/50'
              )}
            >
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZonesPanelOpen(true)}
            className="rounded-xl text-primary/70 hover:bg-primary/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera Scanner Mode */}
        {mode === 'scan' && (
          <Card className="flex-1 rounded-[40px] border border-primary/10 bg-black shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[500px]">
            {/* Premium Overlay Elements */}
            <div className="absolute top-6 left-6 z-20 flex gap-2">
              <Badge className="bg-black/40 backdrop-blur-md text-white border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest font-black">
                {activeZoneLabel}
              </Badge>
              {assignedStaffIds.length > 0 && (
                <Badge className="bg-primary/80 backdrop-blur-md text-white border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest font-black">
                  {assignedStaffIds.length} Staff Assigned
                </Badge>
              )}
            </div>

            {/* Feature 1: Camera Stop Control */}
            {cameraState === 'active' && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-6 right-6 z-20 rounded-full h-10 w-10 shadow-lg shadow-black/50 hover:scale-105 active:scale-95 transition-transform"
                onClick={() => void stopCameraScanner()}
                title="Stop Camera"
              >
                <PowerOff className="h-4 w-4" />
              </Button>
            )}

            {/* Camera Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {cameraState !== 'active' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
                  <QrCode className="h-16 w-16 text-white/20 mb-4" />
                  <h3 className="text-white font-serif text-2xl mb-2">Camera Off</h3>
                  <p className="text-white/50 text-sm mb-6 max-w-xs">
                    {cameraError || 'Activate the camera to begin scanning attendee credentials.'}
                  </p>
                  <Button
                    onClick={startCameraScanner}
                    disabled={cameraState === 'starting'}
                    className="rounded-full px-8 font-bold bg-white text-black hover:bg-white/90"
                  >
                    {cameraState === 'starting' ? 'Initializing...' : 'Turn On Camera'}
                  </Button>
                </div>
              )}

              <div
                id="qr-reader-container"
                className="w-full h-full [&>img]:hidden [&>video]:object-cover [&>video]:!h-full [&>video]:!w-full border-none"
              />

              {/* Targeting Reticle Overlay */}
              {cameraState === 'active' && !lastScanResult && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 opacity-70">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 100 100"
                      className="drop-shadow-lg"
                    >
                      <path d="M 25 2 L 2 2 L 2 25" fill="none" stroke="white" strokeWidth="4" />
                      <path d="M 75 2 L 98 2 L 98 25" fill="none" stroke="white" strokeWidth="4" />
                      <path d="M 25 98 L 2 98 L 2 75" fill="none" stroke="white" strokeWidth="4" />
                      <path
                        d="M 75 98 L 98 98 L 98 75"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary/80 blur-[1px] shadow-[0_0_15px_rgba(var(--primary),1)] animate-scan-beam" />
                  </div>
                </div>
              )}

              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300"
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-white font-black tracking-widest uppercase text-xs">
                    Verifying Pass
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {lastScanResult && (
                  <motion.div
                    key="scan-result"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={cn(
                      'absolute inset-4 z-30 rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl border',
                      lastScanResult.success
                        ? 'bg-emerald-950/80 border-emerald-500/30'
                        : 'bg-red-950/80 border-red-500/30'
                    )}
                  >
                    <div
                      className={cn(
                        'h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-2xl',
                        lastScanResult.success
                          ? 'bg-emerald-500 text-white shadow-emerald-500/50'
                          : 'bg-red-500 text-white shadow-red-500/50'
                      )}
                    >
                      {lastScanResult.success ? (
                        <CheckCircle2 className="h-12 w-12" />
                      ) : (
                        <XCircle className="h-12 w-12" />
                      )}
                    </div>
                    <h3 className="text-white text-3xl font-serif font-black mb-2 leading-tight">
                      {lastScanResult.name || 'Unknown'}
                    </h3>
                    <p className="text-white/80 font-bold text-sm tracking-wide bg-black/20 px-4 py-2 rounded-xl">
                      {lastScanResult.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        )}

        {/* Hardware Scanner Mode */}
        {mode === 'hw-scanner' && (
          <Card className="flex-1 rounded-[40px] border border-primary/10 bg-white shadow-2xl p-8 flex flex-col justify-between min-h-[500px]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-20 hover:bg-primary/5 text-muted-foreground hover:text-primary"
              onClick={() => setShowHwConfig(!showHwConfig)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>

            {!showHwConfig ? (
              <div className="max-w-md mx-auto w-full text-center space-y-8 flex-1 flex flex-col justify-center">
                <div className="h-24 w-24 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center">
                  <Scan className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-black mb-2">Hardware Scanner</h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Ensure cursor is in the box below. Scan a QR code with your USB scanner.
                    {hwConfig.submitMode === 'delay'
                      ? ' It will auto-submit after scan.'
                      : ' Press enter to submit.'}
                  </p>
                </div>
                <div className="relative">
                  <Input
                    autoFocus
                    value={scanPayload}
                    onChange={(e) => setScanPayload(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isScanning && hwConfig.submitMode === 'enter') {
                        let finalPayload = scanPayload;
                        if (hwConfig.stripWhitespace)
                          finalPayload = finalPayload.replace(/\n|\r/g, '').trim();
                        void processScanPayload(finalPayload, 'manual');
                      }
                    }}
                    placeholder="Scan payload will appear here..."
                    className="h-14 bg-muted/50 border-primary/20 rounded-2xl text-center font-mono opacity-50 focus:opacity-100 transition-opacity"
                    disabled={isScanning}
                  />
                  {isScanning && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
                <AnimatePresence>
                  {lastScanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-4 rounded-xl text-sm font-bold',
                        lastScanResult.success
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {lastScanResult.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Feature 3: Hardware Configuration Screen
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="font-serif font-black text-xl mb-1 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Hardware Config
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Tune your hardware scanner input behaviors.
                  </p>
                </div>

                <div className="space-y-4 bg-muted/30 p-6 rounded-3xl border border-primary/5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-70">
                      Submit Mode
                    </label>
                    <select
                      value={hwConfig.submitMode}
                      onChange={(e) => setHwConfig((p) => ({ ...p, submitMode: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-primary/20 bg-background px-4 font-bold outline-none text-sm"
                    >
                      <option value="enter">Require Enter Key</option>
                      <option value="delay">Auto-Detect Complete Scan (Delay)</option>
                    </select>
                  </div>

                  {hwConfig.submitMode === 'delay' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest opacity-70">
                        Auto-Submit Delay (ms)
                      </label>
                      <Input
                        type="number"
                        value={hwConfig.delayMs}
                        onChange={(e) =>
                          setHwConfig((p) => ({ ...p, delayMs: Number(e.target.value) || 300 }))
                        }
                        className="h-10 rounded-xl"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Wait time after last keystroke before submitting payload.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-70">
                      Strip Whitespace/Enter
                    </label>
                    <input
                      type="checkbox"
                      checked={hwConfig.stripWhitespace}
                      onChange={(e) =>
                        setHwConfig((p) => ({ ...p, stripWhitespace: e.target.checked }))
                      }
                      className="h-4 w-4 bg-primary text-primary border-primary/20 rounded"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setShowHwConfig(false)}
                  className="w-full rounded-xl font-bold"
                >
                  Done
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Manual Search Mode */}
        {mode === 'manual' && (
          <Card className="flex-1 p-8 rounded-[40px] border border-primary/10 bg-white shadow-2xl flex flex-col min-h-[500px]">
            {/* Same as before... */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input
                placeholder="Search by name, phone, or membership ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 rounded-2xl border-primary/10 bg-muted/30 focus:bg-background font-bold text-base"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {membersLoading ? (
                <div className="flex flex-col items-center justify-center p-12 opacity-40">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 opacity-40 text-center">
                  <UserPlus className="h-12 w-12 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No matching records</p>
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all group"
                  >
                    <div
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => setSelectedPerson(member)}
                    >
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-black text-foreground">{member.fullName}</h5>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {member.phone || 'No Phone'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!eventId) return;
                        try {
                          await recordAttendance({
                            event_id: eventId,
                            member_id: member.id,
                            zone_id: activeZone,
                            type: 'in',
                            method: 'MANUAL',
                            metadata: {
                              assigned_staff_ids:
                                assignedStaffIds.length > 0 ? assignedStaffIds : undefined,
                            },
                          });
                          showScanResult({
                            success: true,
                            name: member.fullName,
                            message: 'Manual check-in confirmed.',
                          });
                        } catch (err: any) {
                          alert(err.message || 'Check-in failed');
                        }
                      }}
                      className="px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
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
                onClick={() => setShowManualRegistration(true)}
                className="w-full text-primary font-black text-[10px] uppercase tracking-widest h-12 rounded-xl"
              >
                Register Walk-in Attendee
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Analytics Column */}
      <div className="space-y-6">
        <Card className="p-8 rounded-[40px] border border-primary/5 bg-white shadow-2xl flex flex-col justify-center min-h-[500px]">
          <h4 className="text-3xl font-serif font-black mb-8 text-neutral-900 leading-tight">
            Session Check-In
            <br />
            Metrics Dashboard
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Scans', value: String(metrics.totalScans), color: 'text-primary' },
              { label: 'Avg Verify Time', value: metrics.avgWaitLabel, color: 'text-emerald-500' },
              {
                label: 'Manual Entries',
                value: String(metrics.manualHits),
                color: 'text-amber-500',
              },
              {
                label: 'Duplicate Prevented',
                value: String(metrics.reEntries),
                color: 'text-neutral-500',
              },
            ].map((m, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 hover:shadow-sm transition-all text-center"
              >
                <p className={cn('text-3xl font-black mb-2', m.color)}>{m.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-3xl bg-neutral-900 text-white shadow-inner flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                Data Pipeline
              </p>
              <h5 className="font-serif text-lg font-black flex items-center gap-2">
                {isOnline ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                )}
                {isOnline ? 'Online Sync Active' : 'Offline Buffer Mode'}
              </h5>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                Queue Size
              </p>
              <p className="font-mono text-xl font-bold">{bufferSize}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Configuration & Assignment Modal */}
      <Dialog open={zonesPanelOpen} onOpenChange={setZonesPanelOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Scanner System Settings</DialogTitle>
            <DialogDescription>Setup your target zone and assign scanning staff.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-70">
                Active Zone Target
              </label>
              <select
                value={activeZone}
                onChange={(e) => setActiveZone(e.target.value)}
                className="w-full h-12 rounded-xl border border-primary/20 bg-background px-4 font-bold outline-none ring-primary transition-all focus:ring-2"
              >
                {zoneOptions.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Feature 2: Staff Assignment */}
            <div className="pt-4 border-t border-border space-y-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-70 flex items-center justify-between">
                <span>Assigned Station Staff</span>
                <Badge variant="outline" className="text-[10px]">
                  {assignedStaffIds.length} Assigned
                </Badge>
              </label>

              <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-2xl border border-primary/5 min-h-[60px]">
                {assignedStaffIds.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No staff assigned.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignedStaffIds.map((id) => (
                      <Badge
                        key={id}
                        className="pl-3 pr-1 py-1 font-bold bg-white text-black border border-primary/20 shadow-sm flex items-center gap-2"
                      >
                        ID: {id.slice(0, 6)}...
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full hover:bg-red-100 hover:text-red-600 ml-1"
                          onClick={() =>
                            setAssignedStaffIds((prev) => prev.filter((s) => s !== id))
                          }
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                <Input
                  placeholder="Search members to assign..."
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl"
                />
              </div>

              {staffSearchQuery && (
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar border rounded-xl p-1 bg-background shadow-sm">
                  {staffLoading ? (
                    <div className="p-4 text-center text-xs opacity-50">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : staffCandidates.length === 0 ? (
                    <div className="p-4 text-center text-xs opacity-50">No results.</div>
                  ) : (
                    staffCandidates.map((candidate) => {
                      const isAssigned = assignedStaffIds.includes(candidate.id);
                      return (
                        <div
                          key={candidate.id}
                          className="flex flex-row items-center justify-between p-2 hover:bg-muted/50 rounded-lg group text-sm"
                        >
                          <div className="font-bold flex items-center gap-2">
                            {isAssigned ? (
                              <UserCheck className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <UserMinus className="h-4 w-4 text-muted-foreground opacity-50" />
                            )}
                            {candidate.fullName}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'h-7 px-3 text-[10px] uppercase font-black',
                              isAssigned
                                ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                                : 'text-primary hover:bg-primary/10'
                            )}
                            onClick={() => {
                              if (isAssigned) {
                                setAssignedStaffIds((prev) =>
                                  prev.filter((id) => id !== candidate.id)
                                );
                              } else {
                                setAssignedStaffIds((prev) => [...prev, candidate.id]);
                              }
                            }}
                          >
                            {isAssigned ? 'Remove' : 'Assign'}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <label className="text-xs font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Quick Create Zone
              </label>
              <Input
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="Zone Name (e.g., VIP Balcony)"
                className="h-10 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={newZoneCapacity}
                  onChange={(e) => setNewZoneCapacity(e.target.value)}
                  placeholder="Capacity"
                  className="h-10 rounded-xl"
                />
                <select
                  value={newZoneType}
                  onChange={(e) => setNewZoneType(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="main_hall">Main Hall</option>
                  <option value="overflow">Overflow</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="children">Children's Area</option>
                  <option value="vip">VIP</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button
                onClick={handleCreateZone}
                disabled={isCreatingZone || !newZoneName.trim()}
                className="w-full font-bold h-10 rounded-xl"
              >
                {isCreatingZone ? 'Creating...' : 'Create & Select'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ... Manul registration ... */}
      <Dialog open={showManualRegistration} onOpenChange={setShowManualRegistration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Walk-in Attendee</DialogTitle>
            <DialogDescription>
              Capture a walk-in attendee and check them in instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Full Name"
              value={manualRegistrationForm.fullName}
              onChange={(e) =>
                setManualRegistrationForm((p) => ({ ...p, fullName: e.target.value }))
              }
            />
            <Input
              placeholder="Phone (Optional)"
              value={manualRegistrationForm.phone}
              onChange={(e) => setManualRegistrationForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowManualRegistration(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualRegistration} disabled={isSavingManualRegistration}>
              Register & Check-In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PersonDetailDrawer
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        person={selectedPerson}
      />

      <style>{`
        @keyframes scan-beam {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-beam {
          animation: scan-beam 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};
