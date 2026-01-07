import React from 'react';
import { Timer, Users, ArrowRight, Activity, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const QueueManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Wait Time', value: '14m', icon: Timer, color: 'text-primary' },
                    { label: 'Current Flow', value: '120/min', icon: Activity, color: 'text-emerald-500' },
                    { label: 'In Queue', value: '450', icon: Users, color: 'text-amber-500' },
                    { label: 'Active Gates', value: '4', icon: MapPin, color: 'text-primary' },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 border border-primary/5 rounded-2xl bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                                <h3 className="text-lg font-black">{stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { name: 'Gateway Alpha', status: 'Optimal', load: 85, color: 'bg-emerald-500' },
                    { name: 'North Pavilion', status: 'Moderate', load: 45, color: 'bg-amber-500' },
                    { name: 'VIP Entrance', status: 'Closed', load: 0, color: 'bg-gray-400' },
                ].map((gate, i) => (
                    <Card key={i} className="p-6 rounded-[28px] border border-primary/5 bg-white shadow-xl shadow-primary/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 h-1 w-full bg-muted/20">
                            <div className={`h-full ${gate.color}`} style={{ width: `${gate.load}%` }} />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-serif font-black">{gate.name}</h4>
                            <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase border-primary/10">
                                {gate.status}
                            </Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground font-medium">Throughput</span>
                                <span className="font-bold">{gate.load * 2}/hr</span>
                            </div>
                            <Button className="w-full h-10 rounded-xl bg-muted/50 hover:bg-primary hover:text-white text-primary font-black text-[9px] uppercase tracking-widest transition-all">
                                Adjust Capacity
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
