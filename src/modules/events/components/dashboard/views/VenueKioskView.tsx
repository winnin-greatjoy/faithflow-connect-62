import React, { useState, useEffect } from 'react';
import {
  Scan,
  AlertTriangle,
  Clock,
  Activity,
  Search,
  X,
  ShieldAlert,
  Wifi,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VenueKioskViewProps {
  eventName: string;
  onExit: () => void;
}

export const VenueKioskView = ({ eventName, onExit }: VenueKioskViewProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchMode, setSearchMode] = useState(false);
  const [stats, setStats] = useState({
    present: 1124,
    capacity: 1500,
    pending: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickCheckIn = () => {
    toast.success('Scan Success', {
      description: 'Member verified and checked in.',
      duration: 2000,
    });
    setStats((prev) => ({ ...prev, present: prev.present + 1 }));
  };

  const handleDispatch = () => {
    toast.error('Medical Dispatch Activated', {
      description: 'Rescue team 01 has been dispatched to Sanctuary.',
      icon: <ShieldAlert className="h-4 w-4" />,
      duration: 4000,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-[100] flex flex-col font-sans overflow-hidden pattern-grid-lg">
      {/* Ambient Background */}
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Live Operations
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
        {/* Left: Primary Actions */}
        <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleQuickCheckIn}
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
                    Scan Check-In
                  </span>
                  <span className="block text-xs font-medium uppercase tracking-[0.2em] text-indigo-200">
                    Digital ID / QR
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
                    Search Database
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Stats Card */}
          <Card className="flex-1 min-h-[180px] rounded-3xl border-white/5 bg-slate-900/50 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Headcount Realtime
                </p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl md:text-7xl font-mono font-medium text-white tracking-tighter">
                    {stats.present.toLocaleString()}
                  </h2>
                  <span className="text-xl text-slate-500 font-mono">
                    / {stats.capacity.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {Math.round((stats.present / stats.capacity) * 100)}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Capacity
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-800/50 rounded-full h-4 p-1 mt-6 border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.present / stats.capacity) * 100}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              />
            </div>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          {/* Emergency Module */}
          <Card className="rounded-3xl bg-red-500/5 border border-red-500/20 overflow-hidden">
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Priority Alert</span>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">Medical Assistance</h4>
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    URGENT
                  </span>
                </div>
                <p className="text-sm text-red-200/60 leading-relaxed">
                  Reported incident at Main Sanctuary, Row G, Seat 12. Subject reporting dizziness.
                </p>
              </div>

              <Button
                onClick={handleDispatch}
                className="w-full h-12 bg-red-600 hover:bg-red-500 text-white border-none font-bold tracking-wide transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)]"
              >
                DISPATCH RESPONSE TEAM
              </Button>
            </div>
          </Card>

          {/* Feed */}
          <Card className="flex-1 rounded-3xl bg-slate-900/50 border border-white/5 p-5 md:p-6 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Activity Stream
              </h4>
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[400px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    IN
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                      Walk-in Registration
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-[9px] border-white/10 text-slate-500 px-1.5 py-0 h-4 min-w-fit"
                      >
                        GATE A
                      </Badge>
                      <span className="text-[10px] text-slate-600 truncate">{i * 2} mins ago</span>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Kiosk Footer */}
      <div className="h-12 border-t border-white/5 bg-slate-950/80 backdrop-blur items-center px-6 md:px-8 flex justify-between shrink-0 text-[10px] font-medium text-slate-500 uppercase tracking-widest z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3" />
            <span className="hidden sm:inline">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Synced</span>
          </div>
        </div>
        <div>
          Terminal ID: <span className="text-indigo-400">KSK-01</span>
        </div>
      </div>

      {/* Search Overlay */}
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
                <h2 className="text-3xl font-bold text-white tracking-tight">Search Directory</h2>
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
                  className="w-full h-20 pl-16 rounded-3xl bg-white/5 border border-white/10 text-2xl font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                  placeholder="Search by name, email or ID..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className="flex flex-col text-left p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                      JD
                    </div>
                    <h4 className="text-lg font-bold text-white">John Doe</h4>
                    <p className="text-sm text-slate-400 mb-4">john.doe@example.com</p>
                    <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border-none">
                      REGISTERED
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
