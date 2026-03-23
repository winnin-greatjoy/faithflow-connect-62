import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Scan,
  AlertTriangle,
  Activity,
  Search,
  X,
  ShieldAlert,
  Wifi,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  PowerOff,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useMembers } from '@/modules/members/hooks/useMembers';
import { useAttendanceSync } from '@/modules/events/hooks/useAttendanceSync';
import {
  isSignedEventCredentialToken,
  parseEventRegistrationCredential,
} from '@/modules/events/utils/CredentialGenerator';
import eventsApi from '@/services/eventsApi';
import eventCredentialsApi from '@/services/eventCredentialsApi';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Sound effect for successful scans
const playSuccessSound = () => {
  try {
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
  } catch (e) {
    // ignore audio errors
  }
};

interface VenueKioskViewProps {
  eventName: string;
  onExit: () => void;
}

export const VenueKioskView = ({ eventName, onExit }: VenueKioskViewProps) => {
  const { eventId } = useParams<{ eventId: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Kiosk UI States
  const [searchMode, setSearchMode] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const { members, loading: membersLoading } = useMembers({ search: searchQuery });

  // Attendance Backends
  const { bufferSize, isOnline, recordAttendance } = useAttendanceSync(eventId || '');
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // Scan Processing States
  const [isScanning, setIsScanning] = useState(false);
  const scanInFlightRef = useRef(false);
  const recentScanRef = useRef<Record<string, number>>({});
  const DUPLICATE_SCAN_WINDOW_MS = 8000;

  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    name?: string;
    message: string;
  } | null>(null);

  // We need an invisible input buffer for hardware scanners that just type
  const [hwBuffer, setHwBuffer] = useState('');
  const hwTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Real-time Stats & Feed ---
  const refreshAttendanceMetrics = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data } = await eventsApi.getAttendanceLogs(eventId, 50);
      if (data) setAttendanceLogs(data);
    } catch (e) {
      console.debug('Metrics refresh failed', e);
    }
  }, [eventId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void refreshAttendanceMetrics();
    const timer = setInterval(refreshAttendanceMetrics, 10000);
    return () => clearInterval(timer);
  }, [refreshAttendanceMetrics]);

  // Derived Stats
  const stats = useMemo(() => {
    const capacity = 3000; // fallback capacity
    const presentCount = attendanceLogs.length;
    return {
      present: presentCount,
      capacity,
    };
  }, [attendanceLogs]);

  // --- Hardware Scanner Listener ---
  // Any keystroke on the kiosk screen goes into a buffer. If standard prefix/suffix, auto submit.
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if we are in search mode (they are typing a name)
      if (searchMode) return;

      // Ignore modifier keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

      if (e.key === 'Enter') {
        if (hwBuffer.length > 5 && !scanInFlightRef.current) {
          void processScan(hwBuffer, 'hw-scanner');
        }
        setHwBuffer('');
        if (hwTimeoutRef.current) clearTimeout(hwTimeoutRef.current);
        return;
      }

      setHwBuffer((prev) => prev + e.key);

      // Auto clear buffer after 500ms of inactivity
      if (hwTimeoutRef.current) clearTimeout(hwTimeoutRef.current);
      hwTimeoutRef.current = setTimeout(() => {
        if (hwBuffer.length > 5 && !scanInFlightRef.current) {
          void processScan(hwBuffer, 'hw-scanner');
        }
        setHwBuffer('');
      }, 500);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [hwBuffer, searchMode, processScan]);

  // --- Scan Processor ---
  const processScan = useCallback(
    async (rawPayload: string, source: 'camera' | 'hw-scanner' | 'manual' = 'manual') => {
      if (scanInFlightRef.current || !eventId) return;
      const payload = rawPayload.trim();
      if (!payload) return;

      scanInFlightRef.current = true;
      setIsScanning(true);

      try {
        let registrationId = '';
        let attendanceMemberId: string | null = null;
        let attendeeName = 'Unknown';

        if (source === 'manual') {
          // payload is actually member ID from manual search
          attendanceMemberId = payload;
          const found = members.find((m) => m.id === payload);
          if (found) attendeeName = found.fullName;
        } else if (isSignedEventCredentialToken(payload)) {
          const { data, error } = await eventCredentialsApi.verifyCredential({
            token: payload,
            eventId,
          });
          if (error || !data) throw new Error('Signed credential verification failed.');
          registrationId = data.registration.id;
          attendanceMemberId = data.attendance_member_id;
          attendeeName = data.registration.name;
        } else {
          const { credential, error: parseError } = parseEventRegistrationCredential(payload);
          if (!credential) throw new Error(parseError || 'Invalid QR payload.');
          if (credential.event_id !== eventId) throw new Error('QR belongs to another event.');

          const { data, error } = await eventsApi.resolveRegistrationForCheckIn({
            event_id: eventId,
            registration_id: credential.registration_id,
          });
          if (error || !data) throw new Error('Could not resolve registration.');
          registrationId = data.registration.id;
          attendanceMemberId = data.attendance_member_id;
          attendeeName = data.registration.name;
        }

        const now = Date.now();
        // Duplicate check
        const dupeKey = registrationId || attendanceMemberId || 'manual-scan';
        if (
          recentScanRef.current[dupeKey] &&
          now - recentScanRef.current[dupeKey] < DUPLICATE_SCAN_WINDOW_MS
        ) {
          throw new Error('Already checked in recently.');
        }

        const attendance = await recordAttendance({
          event_id: eventId,
          member_id: attendanceMemberId,
          zone_id: 'zone-main', // default kiosk zone
          type: 'in',
          method: source === 'camera' ? 'QR' : 'MANUAL',
          metadata: {
            registration_id: registrationId,
            attendee_name: attendeeName,
            scan_source: source,
          },
        });

        recentScanRef.current[dupeKey] = now;

        playSuccessSound();
        setLastScanResult({
          success: true,
          name: attendeeName,
          message: attendance.offline
            ? 'Offline Check-in Saved!'
            : 'Welcome, Checked in successfully!',
        });

        // Auto close search/camera if opened
        setTimeout(() => {
          setSearchMode(false);
          setCameraMode(false);
        }, 1500);

        void refreshAttendanceMetrics();
      } catch (err: any) {
        setLastScanResult({ success: false, message: err?.message || 'Check-in failed.' });
      } finally {
        setIsScanning(false);
        scanInFlightRef.current = false;
        setTimeout(() => {
          setLastScanResult(null);
        }, 4000);
      }
    },
    [eventId, recordAttendance, refreshAttendanceMetrics, members]
  );

  // --- Camera Management ---
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');

  const stopCamera = useCallback(async () => {
    if (
      html5QrCodeRef.current &&
      (html5QrCodeRef.current.getState() === 2 || html5QrCodeRef.current.getState() === 3)
    ) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.debug('Camera stop error', e);
      }
    }
    setCameraState('idle');
    setCameraMode(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (cameraState === 'starting' || cameraState === 'active') return;
    setCameraMode(true);
    setCameraState('starting');

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('kiosk-camera-container', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'user' }, // Front-facing camera for kiosks usually!
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (!scanInFlightRef.current) void processScan(decodedText, 'camera');
        },
        () => {}
      );
      setCameraState('active');
    } catch (err: any) {
      console.error(err);
      toast.error('Camera Access Denied', { description: 'Please check browser permissions.' });
      void stopCamera();
    }
  }, [cameraState, processScan, stopCamera]);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-[100] flex flex-col font-sans overflow-hidden pattern-grid-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950/50 to-slate-950 pointer-events-none" />

      {/* Kiosk Header */}
      <div className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white max-w-[150px] md:max-w-none truncate">
              {eventName}
            </h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  )}
                ></span>
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                ></span>
              </span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                {isOnline ? 'Live Self-Service' : 'Offline Mode'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-right hidden sm:block">
            <div className="text-xl md:text-2xl font-mono font-medium tracking-tight text-white/90">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {currentTime.toLocaleDateString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onExit}
            className="h-10 w-10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto z-10">
        {/* Left: Primary Actions / Camera / Scan state overlays */}
        <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-6 relative">
          {/* Default Big Action Buttons when camera is off */}
          {!cameraMode && !lastScanResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <button
                onClick={startCamera}
                className="group relative h-48 md:h-64 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-1 shadow-2xl shadow-indigo-500/20 overflow-hidden transition-all active:scale-[0.98] border border-white/10"
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />

                <div className="h-full w-full rounded-[20px] bg-indigo-600/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 border border-white/10">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                    <Scan className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="block text-2xl md:text-3xl font-bold tracking-tight text-white">
                      Scan QR Code
                    </span>
                    <span className="block text-xs font-medium uppercase tracking-[0.2em] text-indigo-200">
                      Camera Self-Check-in
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSearchMode(true)}
                className="group relative h-48 md:h-64 rounded-3xl bg-slate-900 border border-white/5 hover:border-white/20 transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <Search className="h-8 w-8 md:h-10 md:w-10 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="block text-2xl md:text-3xl font-bold tracking-tight text-slate-200 group-hover:text-white">
                      Manual Lookup
                    </span>
                    <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400">
                      Type your name
                    </span>
                  </div>
                </div>
              </button>

              {/* Always-on instructions for hardware scanner */}
              <div className="col-span-1 md:col-span-2 text-center text-white/40 pt-2 text-sm uppercase tracking-widest font-bold">
                Holding a badge? Just hold it up to the scanner light below!
              </div>
            </motion.div>
          )}

          {/* Camera View Mode */}
          {cameraMode && !lastScanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[400px] md:h-[500px] w-full bg-black rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={stopCamera}
                className="absolute top-4 right-4 z-30 h-10 w-10 bg-black/50 hover:bg-red-500/80 rounded-full backdrop-blur-md"
              >
                <PowerOff className="h-4 w-4" />
              </Button>

              {cameraState === 'starting' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center z-20 bg-black/50 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                  <p className="text-xl font-serif">Starting Camera...</p>
                </div>
              )}

              {/* HTML5 QR Container */}
              <div
                id="kiosk-camera-container"
                className="w-full h-full [&>img]:hidden [&>video]:object-cover [&>video]:!h-full [&>video]:!w-full border-none"
              />

              {/* Target Overlay */}
              {cameraState === 'active' && (
                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                  <p className="bg-black/50 text-white px-6 py-2 rounded-full backdrop-blur-md mb-8 font-bold text-lg tracking-wide border border-white/10">
                    Show your Phone or Printed QR Ticket
                  </p>
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
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-indigo-500/80 blur-[1px] shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan-beam" />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Huge Scan Feedback Overlay */}
          <AnimatePresence>
            {lastScanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                className={cn(
                  'absolute inset-0 z-40 rounded-[40px] flex flex-col items-center justify-center p-8 text-center backdrop-blur-2xl border-2 overflow-hidden shadow-2xl',
                  lastScanResult.success
                    ? 'bg-emerald-950/90 border-emerald-500/50'
                    : 'bg-red-950/90 border-red-500/50'
                )}
              >
                <div
                  className={cn(
                    'h-40 w-40 rounded-full flex items-center justify-center mb-8 shadow-[0_0_100px_rgba(0,0,0,0.5)]',
                    lastScanResult.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  )}
                >
                  {lastScanResult.success ? (
                    <CheckCircle2 className="h-20 w-20" />
                  ) : (
                    <XCircle className="h-20 w-20" />
                  )}
                </div>
                <h3 className="text-white text-5xl md:text-6xl font-serif font-black mb-4 leading-tight truncate px-4 w-full">
                  {lastScanResult.name}
                </h3>
                <p className="text-white/90 font-bold text-2xl tracking-wide bg-black/20 px-8 py-4 rounded-2xl">
                  {lastScanResult.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Card */}
          <Card className="flex-1 min-h-[180px] rounded-3xl border-white/5 bg-slate-900/50 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between relative overflow-hidden mt-auto">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Total Attendees Scanned
                </p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl md:text-7xl font-mono font-medium text-white tracking-tighter">
                    {stats.present.toLocaleString()}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {Math.round((stats.present / stats.capacity) * 100)}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Of Cap Limit
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-800/50 rounded-full h-4 p-1 mt-6 border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.present / stats.capacity) * 100, 100)}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              />
            </div>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          {/* Real Feed */}
          <Card className="flex-1 rounded-3xl bg-slate-900/50 border border-white/5 p-5 md:p-6 flex flex-col min-h-[300px] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Recent Scans
              </h4>
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[600px] custom-scrollbar">
              {attendanceLogs.length === 0 ? (
                <p className="text-center text-slate-600 text-sm mt-10 uppercase tracking-widest font-bold opacity-50">
                  No check-ins yet...
                </p>
              ) : (
                attendanceLogs.slice(0, 15).map((log, index) => {
                  const name = log.metadata?.attendee_name || 'Member';
                  const method = log.method || 'QR';
                  const timeStr = new Date(log.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <motion.div
                      key={log.id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-transparent group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        IN
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate capitalize">
                          {name.toLowerCase()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[8px] bg-slate-900 text-slate-400 border-none font-black tracking-widest"
                          >
                            {method}
                          </Badge>
                          <span className="text-[10px] text-slate-600 font-bold">{timeStr}</span>
                        </div>
                      </div>
                      <UserCheck className="h-4 w-4 text-emerald-500/70" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Kiosk Footer */}
      <div className="h-12 border-t border-white/5 bg-slate-950/80 backdrop-blur items-center px-6 md:px-8 flex justify-between shrink-0 text-[10px] font-medium text-slate-500 uppercase tracking-widest z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className={cn('h-3 w-3', isOnline ? 'text-emerald-500' : 'text-amber-500')} />
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {bufferSize > 0 && (
            <div className="flex items-center gap-2 text-amber-500">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Syncing {bufferSize} items...</span>
            </div>
          )}
        </div>
        <div>
          Event Dashboard: <span className="text-indigo-400">KIOSK VIEW</span>
        </div>
      </div>

      {/* Manual Search Overlay */}
      <AnimatePresence>
        {searchMode && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[120] bg-slate-950/80 p-6 md:p-12 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white tracking-tight">Search By Name</h2>
                <Button
                  onClick={() => setSearchMode(false)}
                  variant="outline"
                  className="h-12 w-12 rounded-full border-white/10 bg-transparent text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-20 pl-16 rounded-3xl bg-white/5 border border-white/10 text-2xl font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-sans"
                  placeholder="Type your name or email here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar max-h-[60vh] overflow-y-auto">
                {membersLoading ? (
                  <div className="col-span-1 border border-white/10 rounded-2xl flex items-center justify-center text-center p-12 text-slate-500 h-[100px]">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mx-auto mb-2" />
                    Checking database...
                  </div>
                ) : members.length === 0 ? (
                  <div className="col-span-full text-center p-12 text-xl text-slate-400 font-bold border border-white/10 rounded-2xl bg-white/5">
                    No attendees found. Keep typing your name...
                  </div>
                ) : (
                  members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => void processScan(member.id, 'manual')}
                      disabled={isScanning}
                      className="flex flex-col text-left p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group focus:bg-indigo-500/20 outline-none"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                        {member.fullName.charAt(0)}
                      </div>
                      <h4 className="text-lg font-bold text-white capitalize">
                        {member.fullName.toLowerCase()}
                      </h4>
                      <p className="text-xs text-slate-400 mb-4">
                        {member.email || member.phone || 'No direct contact info'}
                      </p>
                      <Badge className="w-fit bg-slate-800 text-white font-black tracking-widest text-[10px] hover:bg-indigo-600 transition-colors uppercase border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:border-indigo-500">
                        Tap To Check In
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Utilities */}
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};
