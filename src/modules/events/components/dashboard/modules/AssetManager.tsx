import React from 'react';
import { Package, Search, Filter, MoreHorizontal, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const AssetManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                    <Input
                        placeholder="Search AV, Instruments, Gear..."
                        className="pl-12 h-12 rounded-2xl border-primary/5 bg-white shadow-sm font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-primary/10 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                        <Filter className="h-4 w-4 mr-2 opacity-60" />
                        Refine
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
                        Log Deployment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Soundcraft Vi3000', cat: 'AV Gear', loc: 'Main Sanctuary', status: 'Deployed' },
                    { name: 'Drum Kit (Pearl)', cat: 'Instruments', loc: 'Stage Right', status: 'Deployed' },
                    { name: 'Nikon Z9 Kit', cat: 'Media', loc: 'Media Booth', status: 'Available' },
                    { name: 'Stage Monitors x4', cat: 'AV Gear', loc: 'Stage Front', status: 'Deployed' },
                    { name: 'Bass Amp (Ampeg)', cat: 'Instruments', loc: 'Stage Left', status: 'Maintenance' },
                    { name: 'Wireless Mics x8', cat: 'AV Gear', loc: 'Storage A', status: 'Available' },
                ].map((asset, i) => (
                    <Card key={i} className="p-6 bg-white rounded-[28px] border-none shadow-xl shadow-primary/5 group hover:shadow-primary/10 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-1 mb-4">
                            <h5 className="font-black text-foreground">{asset.name}</h5>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{asset.cat}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                <MapPin className="h-3 w-3" />
                                {asset.loc}
                            </div>
                            <div className="flex items-center justify-between border-t border-primary/5 pt-3">
                                <Badge variant="outline" className={cn(
                                    "h-6 text-[8px] font-black uppercase tracking-widest border-none",
                                    asset.status === 'Deployed' ? "bg-emerald-500/10 text-emerald-600" :
                                        asset.status === 'Maintenance' ? "bg-amber-500/10 text-amber-600" :
                                            "bg-blue-500/10 text-blue-600"
                                )}>
                                    {asset.status}
                                </Badge>
                                <div className="text-[8px] font-bold text-muted-foreground opacity-40">SN: FF-AS-9821</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
