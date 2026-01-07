import React, { useState } from 'react';
import {
    Scan,
    Map as MapIcon,
    History,
    Calendar,
    ChevronDown,
    Download,
    Share2,
    AlertTriangle,
    Stethoscope
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckInConsole } from './attendance/CheckInConsole';
import { ZoneMonitor } from './attendance/ZoneMonitor';
import { AttendanceLogs } from './attendance/AttendanceLogs';
import { motion, AnimatePresence } from 'framer-motion';

import { toast } from 'sonner';

export const AttendanceManagerModule = () => {
    const [view, setView] = useState<'console' | 'monitor' | 'logs'>('console');
    const [selectedSession, setSelectedSession] = useState('Morning Service');

    const handleDispatch = () => {
        toast.success('Medical Dispatch Activated', {
            description: 'Emergency response team has been notified and is en route to Sanctuary.',
            icon: <Stethoscope className="h-4 w-4 text-emerald-500" />,
        });
    };

    const tabs = [
        { id: 'console', label: 'Check-In Console', icon: Scan },
        { id: 'monitor', label: 'Zone Monitor', icon: MapIcon },
        { id: 'logs', label: 'Presence Logs', icon: History },
    ];

    return (
        <div className="space-y-8 min-h-[800px]">
            {/* ... Header Bar remains the same ... */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-primary/5">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <Scan className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-black text-foreground tracking-tight">Attendance Ops</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                LIVE Sync Active
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                <Calendar className="h-3 w-3" />
                                Jan 7, 2026
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] shadow-xl shadow-primary/5 border border-primary/5">
                    <div className="px-4">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Active Session</p>
                        <h4 className="text-xs font-black text-primary">{selectedSession}</h4>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/50">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="w-[1px] h-8 bg-primary/5 mx-1" />
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Internal Navigation & Integrated Alerts */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex gap-2 p-1.5 bg-muted/30 rounded-[28px] border border-primary/5 w-fit shrink-0">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            onClick={() => setView(tab.id as any)}
                            className={cn(
                                "h-12 px-8 rounded-[22px] font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                view === tab.id
                                    ? "bg-white text-primary shadow-xl shadow-primary/5 ring-1 ring-primary/5"
                                    : "text-muted-foreground hover:bg-white/50"
                            )}
                        >
                            <tab.icon className="h-4 w-4 mr-3" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Integrated Healthcare Alert - Pushed to right */}
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-auto md:min-w-[400px]"
                    >
                        <div className="bg-destructive/10 border border-destructive/20 p-1.5 pl-4 pr-1.5 rounded-full flex items-center justify-between gap-4 backdrop-blur-sm group hover:bg-destructive/15 transition-all shadow-lg shadow-destructive/5">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-2 w-2 rounded-full bg-destructive animate-ping shrink-0" />
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-[10px] font-black text-destructive uppercase tracking-widest shrink-0">Priority 1:</span>
                                    <span className="text-xs font-bold text-foreground truncate">John D. (Sanctuary)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    onClick={handleDispatch}
                                    className="h-9 px-4 rounded-full bg-destructive text-white hover:bg-destructive/90 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20 border-none transition-all active:scale-95"
                                >
                                    Dispatch
                                </Button>
                                <Button variant="ghost" className="h-9 w-9 rounded-full bg-white/50 border border-destructive/10 text-destructive flex items-center justify-center hover:bg-white transition-all">
                                    <Stethoscope className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Viewport content */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {view === 'console' && <CheckInConsole />}
                        {view === 'monitor' && <ZoneMonitor />}
                        {view === 'logs' && <AttendanceLogs />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
