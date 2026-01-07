import React from 'react';
import { Users2, Calendar, Clock, Download, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const RosterManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="text-xl font-serif font-black">Staff Roster</h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Shift assignment protocol</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-primary/10 font-bold text-xs h-10">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4 mr-2" /> Add Shift
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 space-y-4">
                    {[
                        { role: 'Security Detail', count: 12, shift: '08:00 - 14:00', status: 'In Progress' },
                        { role: 'Ushering Team', count: 8, shift: '10:00 - 16:00', status: 'Pending' },
                        { role: 'Technical Crew', count: 5, shift: '09:00 - 18:00', status: 'Confirmed' },
                    ].map((shift, i) => (
                        <Card key={i} className="group p-6 rounded-[28px] border border-primary/5 bg-white shadow-xl shadow-primary/5 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                    <Users2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <h5 className="text-lg font-serif font-black">{shift.role}</h5>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Clock className="h-3 w-3" /> {shift.shift}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Users2 className="h-3 w-3" /> {shift.count} Assigned
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="h-8 rounded-full px-4 border-primary/10 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
                                    {shift.status}
                                </Badge>
                                <Button variant="ghost" className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
                                    Manage Team
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5">
                        <div className="flex items-center justify-between mb-6">
                            <h5 className="font-serif font-black">Staffing Ratio</h5>
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="flex flex-col items-center justify-center p-4">
                            <div className="text-4xl font-black text-primary">1:25</div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Staff to Attendee</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-primary/5 flex justify-between text-[11px] font-bold">
                            <span className="text-muted-foreground">Total Staff</span>
                            <span>45 Personnel</span>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5">
                        <h5 className="font-serif font-black mb-4">Upcoming Handover</h5>
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                            <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                                Shift Alpha handing over to Beta in **15 minutes** at Entrance Gate.
                            </p>
                            <Button className="w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[9px] uppercase tracking-widest">
                                Acknowledge Alert
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const Activity = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);
