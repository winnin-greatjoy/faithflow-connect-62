import React from 'react';
import { Heart, Activity, ShieldAlert, UserCheck, Bell, Clock, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ChildSafetyManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-8 bg-destructive rounded-[32px] text-white border-none shadow-2xl shadow-destructive/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                    <Activity className="h-8 w-8 mb-4 opacity-40" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Active Medical Alerts</p>
                    <h3 className="text-3xl font-black mb-6">02</h3>
                    <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-none">
                        View Alerts
                    </Button>
                </Card>

                <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                    <UserCheck className="h-6 w-6 text-primary mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Live Check-ins</p>
                    <h3 className="text-2xl font-black text-foreground mb-1">128 / 150</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-6">Capacity: 85%</p>
                    <Button className="w-full h-11 rounded-xl bg-primary text-white font-black text-[9px] uppercase tracking-widest">
                        New Check-In
                    </Button>
                </Card>

                <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5 flex flex-col items-center justify-center text-center">
                    <ShieldAlert className="h-8 w-8 text-amber-500 mb-4" />
                    <h4 className="text-sm font-black mb-2 uppercase tracking-widest">Incident Log</h4>
                    <p className="text-[10px] font-bold text-muted-foreground mb-4">Report behavioral or safety concerns</p>
                    <Button variant="outline" className="h-10 px-6 rounded-xl border-primary/10 bg-muted/30 text-foreground font-black text-[9px] uppercase tracking-widest">
                        Create Report
                    </Button>
                </Card>
            </div>

            <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-serif font-black">Secure Pickup Feed</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Real-time matching & guardian verification</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                        {['Queue', 'Recent', 'Alerts'].map((tab) => (
                            <Button key={tab} variant="ghost" className={cn(
                                "h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                tab === 'Queue' ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                            )}>
                                {tab}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { child: 'Elias Mensah', guardian: 'Abena M. (Mom)', room: 'Nursery A', status: 'Verifying', icon: Bell },
                        { child: 'Kofi Owusu', guardian: 'Isaac O. (Dad)', room: 'Preschool', status: 'Ready', icon: UserCheck },
                        { child: 'Sarah Wilson', guardian: 'James W. (Dad)', room: 'Primary 1', status: 'Delayed', icon: Clock },
                        { child: 'Alice Boateng', guardian: 'Rose B. (Mom)', room: 'Nursery B', status: 'Verifying', icon: Bell },
                    ].map((entry, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                <entry.icon className={cn("h-4 w-4", entry.status === 'Ready' ? "text-emerald-500" : entry.status === 'Delayed' ? "text-amber-500" : "text-primary")} />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-black text-foreground">{entry.child}</h5>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{entry.guardian} • {entry.room}</p>
                            </div>
                            <Badge variant="outline" className={cn(
                                "h-6 text-[8px] font-black border-none uppercase tracking-widest",
                                entry.status === 'Ready' ? "bg-emerald-500/10 text-emerald-600" :
                                    entry.status === 'Delayed' ? "bg-amber-500/10 text-amber-600" :
                                        "bg-primary/10 text-primary animate-pulse"
                            )}>
                                {entry.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
