import React from 'react';
import { Target, Users, MapPin, CheckCircle2, Star, Timer, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const GrowthPathwaysModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Baptism Ready', count: 12, progress: 85, color: 'bg-blue-500' },
                    { label: 'New Members', count: 48, progress: 60, color: 'bg-emerald-500' },
                    { label: 'Leadership', count: 8, progress: 40, color: 'bg-amber-500' },
                    { label: 'Foundation', count: 24, progress: 75, color: 'bg-primary' },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-foreground mb-4">{stat.count} <span className="text-xs font-medium text-muted-foreground">Enrolled</span></h3>
                        <Progress value={stat.progress} className={cn("h-1.5", stat.color.replace('bg-', 'bg-') + "/10")} />
                    </Card>
                ))}
            </div>

            <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-serif font-black">Pathway Tracking</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Real-time milestone progress</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border border-primary/5">Export Manifest</Button>
                        <Button className="h-10 px-6 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest">Enroll Member</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { name: 'Michael Boateng', pathway: 'Leadership 101', stage: 'Stage 3/5', status: 'On Track', time: 'Last active 2h ago' },
                        { name: 'Sarah Mensah', pathway: 'Foundation Class', stage: 'Stage 4/4', status: 'Completed', time: 'Ready for Graduation' },
                        { name: 'James Wilson', pathway: 'Baptism Prep', stage: 'Stage 1/3', status: 'Delayed', time: 'Missed 2 sessions' },
                        { name: 'Alice Osei', pathway: 'New Believers', stage: 'Stage 2/4', status: 'On Track', time: 'Active now' },
                    ].map((member, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary text-sm shadow-sm">
                                {member.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-black text-foreground truncate">{member.name}</h5>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{member.pathway}</p>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{member.stage}</p>
                                <p className="text-[9px] font-bold text-muted-foreground opacity-60">{member.time}</p>
                            </div>
                            <Badge variant="outline" className={cn(
                                "h-6 text-[8px] font-black border-none uppercase tracking-widest",
                                member.status === 'Completed' ? "bg-emerald-500/10 text-emerald-600" :
                                    member.status === 'Delayed' ? "bg-destructive/10 text-destructive" :
                                        "bg-primary/10 text-primary"
                            )}>
                                {member.status}
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
