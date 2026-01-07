import React from 'react';
import {
    X,
    User,
    Calendar,
    MapPin,
    Clock,
    Shield,
    Heart,
    LogOut,
    Replace,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PersonDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    person: {
        id: string;
        fullName: string;
        role: string;
        status: string;
        currentZone?: string;
        lastIn?: string;
        phone?: string;
        metadata?: any;
    } | null;
}

export const PersonDetailDrawer = ({ isOpen, onClose, person }: PersonDetailDrawerProps) => {
    if (!person) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[101] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 pb-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 z-20">
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-black/5">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="h-24 w-24 rounded-[32px] bg-primary flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-primary/20">
                                    {person.fullName.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] tracking-widest px-3 py-1 uppercase">
                                            {person.role}
                                        </Badge>
                                        <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary uppercase tracking-widest px-3">
                                            {person.status}
                                        </Badge>
                                    </div>
                                    <h2 className="text-3xl font-serif font-black tracking-tight text-foreground">{person.fullName}</h2>
                                    <p className="text-xs font-bold text-muted-foreground opacity-60 mt-1 uppercase tracking-widest">{person.phone || "No Mobile Registered"}</p>
                                </div>
                            </div>

                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent -z-10" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 space-y-8 custom-scrollbar pb-8">
                            {/* Current Context */}
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Real-time Location</h4>
                                <Card className="p-6 rounded-3xl border border-primary/5 bg-muted/30 shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                            <MapPin className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-0.5">CURRENT ZONE</p>
                                            <h5 className="text-sm font-black">{person.currentZone || "Not in a Zone"}</h5>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-primary opacity-40" />
                                            <span className="text-[10px] font-bold text-muted-foreground">LAST SCAN: {person.lastIn || "6:42 PM"}</span>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] px-2">VALIDATED</Badge>
                                    </div>
                                </Card>
                            </section>

                            {/* Timeline */}
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Movement Timeline</h4>
                                <div className="space-y-6 pl-4 border-l-2 border-primary/5 relative">
                                    {[
                                        { action: 'Zone Exit', loc: 'Sanctuary', time: '6:30 PM', sub: 'Manual Override' },
                                        { action: 'Zone Entry', loc: 'Restroom Hall', time: '6:25 PM', sub: 'Staff Device A2' },
                                        { action: 'Global Check-in', loc: 'Main Portal', time: '5:45 PM', sub: 'QR Scanner #4' },
                                    ].map((step, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-primary border-4 border-white shadow-sm" />
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-foreground">{step.action}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground opacity-60">{step.time}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{step.loc}</p>
                                                <p className="text-[9px] font-medium text-muted-foreground/60 italic">{step.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Tags & Flags */}
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Security & Health Flags</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="border-red-500/20 text-red-600 bg-red-500/5 px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                        <Heart className="h-3 w-3 mr-1.5 fill-red-600" /> Asthmatic
                                    </Badge>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                        <Shield className="h-3 w-3 mr-1.5" /> Background Verified
                                    </Badge>
                                </div>
                            </section>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-muted/20 border-t border-primary/5 grid grid-cols-2 gap-3">
                            <Button className="bg-primary text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                                <Replace className="h-4 w-4" /> Transfer Zone
                            </Button>
                            <Button variant="outline" className="border-primary/10 bg-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                                <LogOut className="h-4 w-4" /> Force Exit
                            </Button>
                            <Button variant="ghost" className="col-span-2 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/5 flex items-center justify-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Flag Incident
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
