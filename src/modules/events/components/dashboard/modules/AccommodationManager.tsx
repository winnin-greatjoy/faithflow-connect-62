import React from 'react';
import { Bed, Home, Users, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const AccommodationManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-white rounded-[32px] border border-primary/5 shadow-xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Home className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-lg font-serif font-black">Hostel Inventory</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 text-left">Real-time occupancy</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreHorizontal className="h-5 w-5 opacity-40" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: 'Zion Hall (Male)', capacity: 200, used: 156, color: 'bg-primary' },
                            { name: 'Eden Suite (Female)', capacity: 150, used: 142, color: 'bg-emerald-500' },
                            { name: 'VIP Residency', capacity: 20, used: 8, color: 'bg-amber-500' },
                        ].map((hostel, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-foreground">{hostel.name}</span>
                                    <span className="text-[10px] font-black tracking-widest text-muted-foreground">
                                        {hostel.used} / {hostel.capacity} <span className="opacity-40">({Math.round(hostel.used / hostel.capacity * 100)}%)</span>
                                    </span>
                                </div>
                                <Progress value={hostel.used / hostel.capacity * 100} className={`h-2 ${hostel.color}/10`} />
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-4">
                    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 border-none rounded-[32px] text-white shadow-2xl shadow-primary/20">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Quick Allocation</h5>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Users className="h-7 w-7" />
                            </div>
                            <div>
                                <h4 className="text-xl font-serif font-black">45 Members</h4>
                                <p className="text-xs opacity-80">Awaiting room assignment</p>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-primary hover:bg-white/90 font-black h-12 rounded-xl text-[10px] uppercase tracking-widest shadow-lg">
                            Auto-Assign Rooms
                        </Button>
                    </Card>

                    <Card className="p-6 bg-white border border-primary/5 rounded-[32px] shadow-lg shadow-primary/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="text-xs font-bold">Housekeeping Confirmed</span>
                            </div>
                            <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-3">
                                12:45 PM
                            </Badge>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
