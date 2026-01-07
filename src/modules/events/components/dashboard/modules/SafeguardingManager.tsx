import React from 'react';
import { ShieldCheck, FileCheck, UserCheck, AlertCircle, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SafeguardingManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'WWCC Verified', count: 154, status: 'Active' },
                    { label: 'Police Check', count: 128, status: 'Active' },
                    { label: 'First Aid Certs', count: 42, status: 'Active' },
                    { label: 'Pending Review', count: 12, status: 'Warning' },
                ].map((item, i) => (
                    <Card key={i} className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", item.status === 'Active' ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                                <FileCheck className={cn("h-5 w-5", item.status === 'Active' ? "text-emerald-500" : "text-amber-500")} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.label}</p>
                        </div>
                        <h3 className="text-2xl font-black text-foreground">{item.count}</h3>
                    </Card>
                ))}
            </div>

            <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-serif font-black">Personnel Compliance</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Verification status for event staff</p>
                    </div>
                    <Button className="h-10 px-6 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest active:scale-95">
                        Bulk Verification
                    </Button>
                </div>

                <div className="space-y-4">
                    {[
                        { name: 'Kwadwo Asare', role: 'Team Lead', clearance: 'WWCC_8291', expiry: 'Jan 2027', status: 'Compliant' },
                        { name: 'Abena Mansa', role: 'Usher', clearance: 'POL_9921', expiry: 'Dec 2025', status: 'Expiring Soon' },
                        { name: 'John Peterson', role: 'Security', clearance: 'WWCC_1102', expiry: 'Mar 2028', status: 'Compliant' },
                        { name: 'Esther Kim', role: 'Youth Worker', clearance: 'PENDING', expiry: '-', status: 'Under Review' },
                    ].map((staff, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary text-[10px]">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-black text-foreground">{staff.name}</h5>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{staff.role} • {staff.clearance}</p>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Expiry</p>
                                <p className="text-[9px] font-bold text-muted-foreground opacity-60">{staff.expiry}</p>
                            </div>
                            <Badge variant="outline" className={cn(
                                "h-6 text-[8px] font-black border-none uppercase tracking-widest",
                                staff.status === 'Compliant' ? "bg-emerald-500/10 text-emerald-600" :
                                    staff.status === 'Expiring Soon' ? "bg-amber-500/10 text-amber-600" :
                                        "bg-primary/10 text-primary"
                            )}>
                                {staff.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
