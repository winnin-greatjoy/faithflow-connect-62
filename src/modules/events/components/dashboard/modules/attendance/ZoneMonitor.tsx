import React from 'react';
import {
    Users,
    MapPin,
    AlertTriangle,
    TrendingUp,
    MoreHorizontal,
    Activity,
    ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const ZoneMonitor = () => {
    const zones = [
        { name: 'Main Sanctuary', capacity: 1200, current: 845, type: 'SANCTUARY', status: 'optimal' },
        { name: 'Youth Hall', capacity: 250, current: 238, type: 'HALL', status: 'critical' },
        { name: 'Breakout Room A', capacity: 50, current: 12, type: 'ROOM', status: 'low' },
        { name: 'First Aid Station', capacity: 20, current: 4, type: 'CLINIC', status: 'optimal' },
    ];

    return (
        <div className="space-y-8">
            {/* Overview Headcounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 bg-gradient-to-br from-primary to-primary/80 border-none rounded-[40px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Total Presence</h5>
                        <div className="flex items-end gap-3 mb-6">
                            <h2 className="text-5xl font-serif font-black">1,124</h2>
                            <TrendingUp className="h-6 w-6 text-emerald-300 mb-2" />
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold opacity-80">
                            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> 982 Attendees</span>
                            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> 142 Staff</span>
                        </div>
                    </div>
                    <Users className="absolute -right-8 -bottom-8 h-48 w-48 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
                </Card>

                <Card className="p-8 bg-white border border-primary/5 rounded-[40px] shadow-2xl shadow-primary/5 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="font-serif font-black">Capacity Density</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">High Pressure Warning</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        <strong>Youth Hall</strong> has reached 95% capacity. Redirecting new arrivals to <strong>Overflow Area B</strong>.
                    </p>
                </Card>

                <Card className="p-8 bg-white border border-primary/5 rounded-[40px] shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-8">
                        <h5 className="font-serif font-black">Flow Velocity</h5>
                        <Activity className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-black text-primary">42</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Scans / Min</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/40 w-[65%]" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Zone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {zones.map((zone, i) => (
                    <Card key={i} className="bg-white rounded-[32px] border-none shadow-xl shadow-primary/5 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                        <div className="p-6 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                    zone.status === 'critical' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-muted text-primary"
                                )}>
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <MoreHorizontal className="h-4 w-4 opacity-40" />
                                </Button>
                            </div>
                            <h4 className="font-serif font-black text-lg mb-1">{zone.name}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 opacity-60">
                                {zone.type} · Max {zone.capacity}
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Occupancy</span>
                                    <span className={cn(
                                        "text-xs font-black",
                                        zone.status === 'critical' ? "text-red-500" : "text-primary"
                                    )}>
                                        {Math.round((zone.current / zone.capacity) * 100)}%
                                    </span>
                                </div>
                                <Progress
                                    value={(zone.current / zone.capacity) * 100}
                                    className={cn(
                                        "h-1.5",
                                        zone.status === 'critical' ? "bg-red-500/10" : "bg-primary/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 mt-auto bg-muted/30 border-t border-primary/5 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                            <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 opacity-40" />
                                <span className="text-xs font-bold">{zone.current} present</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </div>
                    </Card>
                ))}

                <Card className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/10 rounded-[32px] bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6 text-primary opacity-40" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Provision Zone</span>
                </Card>
            </div>
        </div>
    );
};
