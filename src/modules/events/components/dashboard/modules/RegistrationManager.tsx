import React from 'react';
import { ClipboardList, Ticket, Target, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const RegistrationManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-white border border-primary/5 rounded-[32px] shadow-xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-serif font-black">Capacity Allocation</h4>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                            <Settings className="h-4 w-4 text-primary opacity-40" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="text-primary">Standard Access</span>
                                <span>850 / 1000</span>
                            </div>
                            <Progress value={85} className="h-2.5 bg-primary/10" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="text-emerald-600">VIP Protocol</span>
                                <span>45 / 50</span>
                            </div>
                            <Progress value={90} className="h-2.5 bg-emerald-600/10" />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 bg-gradient-to-br from-primary to-primary/90 border-none rounded-[32px] text-white shadow-2xl shadow-primary/20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Ticket className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-serif font-black">Ticketing Dynamics</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ready for distribution</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Generated</p>
                            <h3 className="text-xl font-black">1,500</h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Validated</p>
                            <h3 className="text-xl font-black">1,102</h3>
                        </div>
                    </div>

                    <Button className="w-full mt-6 bg-white text-primary hover:bg-white/90 font-black h-12 rounded-xl text-xs uppercase tracking-widest">
                        Print Master Manifest
                    </Button>
                </Card>
            </div>
        </div>
    );
};
