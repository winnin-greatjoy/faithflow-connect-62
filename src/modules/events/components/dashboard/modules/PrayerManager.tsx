import React from 'react';
import { Heart, MessageCircle, Clock, User, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const PrayerManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                        <h4 className="text-xl font-serif font-black">Intercession Hub</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Live Prayer Requests</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-primary/10 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest">
                        Queue Monitor
                    </Button>
                    <Button className="h-11 px-6 rounded-xl bg-destructive text-white shadow-lg shadow-destructive/20 font-black text-[10px] uppercase tracking-widest active:scale-95">
                        New Request
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Requests */}
                <Card className="lg:col-span-2 p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                            <Input placeholder="Search requests..." className="pl-10 h-10 rounded-xl border-primary/5 bg-muted/30" />
                        </div>
                        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl">
                            {['All', 'Pending', 'Prayed'].map((tab) => (
                                <Button key={tab} variant="ghost" className={cn(
                                    "h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                    tab === 'All' ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                                )}>
                                    {tab}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Grace Owusu', category: 'Healing', time: '12m ago', priority: 'High', message: 'Requesting prayers for my mother who is undergoing surgery today.' },
                            { name: 'Daniel Appiah', category: 'Finance', time: '45m ago', priority: 'Medium', message: 'Praying for a breakthrough in a business negotiation this week.' },
                            { name: 'Mercy Darko', category: 'Family', time: '2h ago', priority: 'Emergency', message: 'Urgent prayer for family reconciliation and peace.' },
                        ].map((req, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                                            {req.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-foreground">{req.name}</h5>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{req.category} • {req.time}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "h-6 text-[8px] font-black border-none uppercase tracking-widest",
                                        req.priority === 'Emergency' ? "bg-destructive text-white" :
                                            req.priority === 'High' ? "bg-amber-500/10 text-amber-600" :
                                                "bg-blue-500/10 text-blue-600"
                                    )}>
                                        {req.priority}
                                    </Badge>
                                </div>
                                <p className="text-xs font-medium text-foreground/80 leading-relaxed mb-4">{req.message}</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest border-none">
                                        Mark as Prayed
                                    </Button>
                                    <Button variant="ghost" className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border-none">
                                        Assign Team
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Team & Stats */}
                <div className="space-y-6">
                    <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                        <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-primary">Intercessors on Duty</h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-3 w-24 bg-muted rounded-full mb-2" />
                                        <div className="h-2 w-16 bg-muted/60 rounded-full" />
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-8 bg-primary rounded-[32px] text-white border-none shadow-2xl shadow-primary/20">
                        <h4 className="text-lg font-serif font-black mb-4">Prayer Wall</h4>
                        <p className="text-xs font-medium opacity-60 mb-6">"For where two or three are gathered together in my name, there am I in the midst of them."</p>
                        <div className="text-4xl font-black mb-2">1,204</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Prayers Recorded Today</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
