import React from 'react';
import {
    Stethoscope,
    AlertTriangle,
    Plus,
    Activity,
    MapPin,
    Package,
    Shield,
    FileText,
    UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const HealthcareManagerModule = () => {
    return (
        <div className="space-y-6">
            {/* Quick Actions & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-destructive text-white border-none rounded-[32px] shadow-2xl shadow-destructive/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Urgent Response</h5>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <div>
                                <h4 className="text-xl font-serif font-black">0 Active</h4>
                                <p className="text-xs opacity-80">Emergencies reported</p>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-destructive hover:bg-white/90 font-black h-12 rounded-xl text-[10px] uppercase tracking-widest">
                            Trigger Medical Alert
                        </Button>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700">
                        <AlertTriangle size={150} />
                    </div>
                </Card>

                {[
                    { label: 'Incidents Logged', value: '12', icon: FileText, color: 'text-primary' },
                    { label: 'On-Duty Medics', value: '4', icon: UserCheck, color: 'text-emerald-500' },
                    { label: 'First Aid Points', value: '3', icon: MapPin, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 border border-primary/5 rounded-[32px] bg-white shadow-xl shadow-primary/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                                <h3 className="text-2xl font-black">{stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Incident List */}
                <Card className="xl:col-span-2 p-8 bg-white rounded-[40px] border border-primary/5 shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-serif font-black">Recent Incidents</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Live Care Monitoring</p>
                        </div>
                        <Button className="bg-primary/10 text-primary hover:bg-primary hover:text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                            Log Incident
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { type: 'Heat Exhaustion', patient: 'Child (Tag #124)', time: '12:45 PM', status: 'Resolved', severity: 'low' },
                            { type: 'Allergic Reaction', patient: 'Member (John D.)', time: '11:20 AM', status: 'Sent to Hospital', severity: 'high' },
                            { type: 'Minor Cut', patient: 'Volunteer (Sarah M.)', time: '10:05 AM', status: 'Resolved', severity: 'low' },
                        ].map((incident, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-primary/5 hover:border-primary/20 transition-all bg-muted/30 group">
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
                                        incident.severity === 'high' ? "bg-red-500 text-white" : "bg-white text-primary"
                                    )}>
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black">{incident.type}</h5>
                                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{incident.patient}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black">{incident.time}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground opacity-60">{incident.status}</p>
                                    </div>
                                    <Badge className={cn(
                                        "h-7 rounded-full border-none font-black text-[9px] uppercase tracking-widest px-4",
                                        incident.severity === 'high' ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"
                                    )}>
                                        {incident.status.split(' ')[0]}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Inventory & Stations */}
                <div className="space-y-6">
                    <Card className="p-8 bg-white rounded-[40px] border border-primary/5 shadow-2xl shadow-primary/5">
                        <div className="flex items-center gap-3 mb-8">
                            <Package className="h-5 w-5 text-primary" />
                            <h5 className="font-serif font-black">Medical Supplies</h5>
                        </div>

                        <div className="space-y-6">
                            {[
                                { name: 'First Aid Kits', status: 'Full', load: 100, color: 'bg-emerald-500' },
                                { name: 'Oxygen Cylinders', status: '2 Remaining', load: 40, color: 'bg-amber-500' },
                                { name: 'AED Battery', status: 'Low', load: 15, color: 'bg-red-500' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold">{item.name}</span>
                                        <span className="text-[10px] font-black tracking-widest opacity-60">{item.status}</span>
                                    </div>
                                    <Progress value={item.load} className={`h-1.5 ${item.color}/10`} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-8 bg-primary/5 border border-primary/10 rounded-[40px] relative overflow-hidden">
                        <div className="relative z-10">
                            <h5 className="font-serif font-black mb-4">Medical Roster</h5>
                            <div className="flex -space-x-3 mb-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-10 w-10 rounded-xl bg-white border-2 border-primary/10 flex items-center justify-center font-black text-xs text-primary shadow-sm">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg">
                                    +1
                                </div>
                            </div>
                            <Button className="w-full bg-white text-primary border border-primary/10 hover:bg-primary hover:text-white h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">
                                View Roster
                            </Button>
                        </div>
                        <Shield className="absolute -right-8 -bottom-8 h-32 w-32 text-primary opacity-5" />
                    </Card>
                </div>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
