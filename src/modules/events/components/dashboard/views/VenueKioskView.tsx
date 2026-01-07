import React, { useState, useEffect } from 'react';
import {
    Scan,
    Users,
    AlertTriangle,
    Clock,
    Activity,
    ChevronRight,
    Search,
    X,
    Maximize2,
    ShieldAlert
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
        pending: 12
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleQuickCheckIn = () => {
        toast.success("Scan Success", {
            description: "Member verified and checked in.",
            duration: 2000
        });
        setStats(prev => ({ ...prev, present: prev.present + 1 }));
    };

    return (
        <div className="fixed inset-0 bg-[#0F172A] text-white z-[100] flex flex-col font-sans overflow-hidden">
            {/* Kiosk Header */}
            <div className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-white/2 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">{eventName}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-80">Venue Operational Kiosk</p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="text-right">
                        <div className="text-3xl font-black tabular-nums tracking-tighter">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={onExit}
                        className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-none transition-all group"
                    >
                        <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="flex-1 grid grid-cols-12 gap-1 px-12 py-8">

                {/* Left: Primary Actions / QR Scanner Simulation */}
                <div className="col-span-8 flex flex-col gap-8 pr-12">
                    <div className="grid grid-cols-2 gap-6">
                        <button
                            onClick={handleQuickCheckIn}
                            className="aspect-[4/3] rounded-[48px] bg-primary group relative overflow-hidden flex flex-col items-center justify-center gap-6 transition-all active:scale-95 shadow-2xl shadow-primary/20 border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-32 w-32 rounded-[40px] bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Scan className="h-16 w-16 text-white" />
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-black tracking-tight">TAP TO SCAN</span>
                                <span className="text-xs font-black uppercase tracking-[0.4em] opacity-60">Digital ID / QR Code</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setSearchMode(true)}
                            className="aspect-[4/3] rounded-[48px] bg-white/5 group relative overflow-hidden flex flex-col items-center justify-center gap-6 transition-all active:scale-95 border border-white/10 hover:bg-white/10"
                        >
                            <div className="h-32 w-32 rounded-[40px] bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Search className="h-16 w-16 text-white/40 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-black tracking-tight text-white/80 group-hover:text-white transition-colors">MANUAL</span>
                                <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-60 transition-opacity">Find by Name / Phone</span>
                            </div>
                        </button>
                    </div>

                    {/* Live Headcount Visualization */}
                    <Card className="flex-1 rounded-[56px] border-none bg-gradient-to-br from-white/5 to-white/[0.02] p-12 flex flex-col justify-center border border-white/5">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-2">Live Headcount</p>
                                <h2 className="text-8xl font-black tabular-nums tracking-tighter">
                                    {stats.present}
                                    <span className="text-2xl font-bold text-white/20 ml-4 tracking-normal">/ {stats.capacity}</span>
                                </h2>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-emerald-500">{Math.round((stats.present / stats.capacity) * 100)}%</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Occupancy</div>
                            </div>
                        </div>
                        <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden p-1.5 border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.present / stats.capacity) * 100}%` }}
                                className="h-full bg-primary rounded-full shadow-lg shadow-primary/40"
                            />
                        </div>
                    </Card>
                </div>

                {/* Right: Sidebar Metrics & Alerts */}
                <div className="col-span-4 flex flex-col gap-6">
                    {/* Emergency Alert Context */}
                    <Card className="p-8 rounded-[48px] bg-destructive/10 border-2 border-destructive/20 shadow-2xl shadow-destructive/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-destructive flex items-center justify-center animate-pulse">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-destructive">HEALTHCARE ALERT</span>
                        </div>
                        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 mb-6">
                            <h4 className="text-lg font-black mb-1">John Doe (Sanctuary)</h4>
                            <p className="text-sm font-medium opacity-60">Allergic Reaction reported 4m ago.</p>
                        </div>
                        <Button className="w-full h-16 rounded-3xl bg-destructive text-white border-none font-black text-sm uppercase tracking-widest shadow-xl shadow-destructive/20 hover:bg-destructive/90 transition-all">
                            ACKNOWLEDGE
                        </Button>
                    </Card>

                    {/* Operational Feed */}
                    <Card className="flex-1 p-8 rounded-[48px] bg-white/5 border border-white/10 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Recent Activity</h4>
                            <Clock className="h-4 w-4 opacity-20" />
                        </div>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black">Member Check-In</p>
                                        <p className="text-[10px] font-bold opacity-40">Main Entry • 2m ago</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-10" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Safe Area / Footer */}
            <div className="h-16 px-12 flex items-center justify-between bg-black/40 backdrop-blur-md">
                <div className="flex gap-8">
                    <div className="flex items-center gap-2 opacity-40">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sync Active</span>
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">
                    FF Command • V1.0.4-LOCKED
                </div>
            </div>

            {/* Manual Search Modal Overlay */}
            <AnimatePresence>
                {searchMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-[#0F172A]/90 backdrop-blur-2xl p-24"
                    >
                        <div className="max-w-4xl mx-auto flex flex-col gap-12">
                            <div className="flex items-center justify-between">
                                <h2 className="text-6xl font-black tracking-tighter">Enter Name</h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => setSearchMode(false)}
                                    className="h-20 w-20 rounded-[32px] bg-white/5 hover:bg-white/10 text-white border-none"
                                >
                                    <X className="h-10 w-10" />
                                </Button>
                            </div>
                            <input
                                autoFocus
                                className="w-full bg-white/5 border-b-8 border-primary p-8 text-7xl font-black uppercase tracking-tight focus:outline-none transition-all placeholder:opacity-10"
                                placeholder="TYPE HERE..."
                            />
                            <div className="grid grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Card key={i} className="p-8 rounded-[40px] bg-white/5 border border-white/10 hover:bg-primary transition-all cursor-pointer group">
                                        <h4 className="text-2xl font-black group-hover:text-white transition-colors">Isaac Newton</h4>
                                        <p className="text-sm font-bold opacity-40 group-hover:opacity-60 transition-opacity uppercase tracking-widest">0244 123 45{i}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
