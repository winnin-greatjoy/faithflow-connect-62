import React, { useState } from 'react';
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

export const CheckInConsole = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    name?: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const { bufferSize, isOnline, isSyncing, recordAttendance } = useAttendanceSync(eventId || '');

  const { members, loading: membersLoading } = useMembers({ search: searchQuery });

  const simulateScan = async () => {
    setIsScanning(true);
    // Simulate local processing
    setTimeout(async () => {
      setIsScanning(false);

      const name = 'Elder Samuel Mensah';
      const result = await recordAttendance({
        event_id: eventId || '',
        member_id: null,
        zone_id: 'zone-main',
        type: 'in',
        method: 'QR',
      });

      setLastScanResult({
        success: true,
        name,
        message: result.offline ? 'Offline check-in saved.' : 'Check-in successful. Welcome!',
        timestamp: new Date().toLocaleTimeString(),
      });

      // Clear after 3 seconds
      setTimeout(() => setLastScanResult(null), 3000);
    }, 1500);
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
                  <Button
                    onClick={simulateScan}
                    className="h-12 px-8 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest"
                  >
                    Simulate Capture
                  </Button>
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
                        const result = await recordAttendance({
                          event_id: eventId || '',
                          member_id: member.id,
                          zone_id: 'zone-main',
                          type: 'in',
                          method: 'MANUAL',
                        });
                        setLastScanResult({
                          success: true,
                          name: member.fullName,
                          message: result.offline
                            ? 'Offline check-in saved.'
                            : 'Manual check-in confirmed.',
                          timestamp: new Date().toLocaleTimeString(),
                        });
                        setTimeout(() => setLastScanResult(null), 3000);
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
                      ZONE: MAIN PORTAL
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
              { label: 'Total Scans', value: '1,248', color: 'text-primary' },
              { label: 'Wait Time', value: '2.4s', color: 'text-emerald-500' },
              { label: 'Manual Hits', value: '142', color: 'text-amber-500' },
              { label: 'Re-entries', value: '86', color: 'text-primary' },
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
