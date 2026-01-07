import React from 'react';
import { Wallet, TrendingUp, CreditCard, Gift, Heart, ArrowUpRight, ArrowDownRight, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const GivingManagerModule = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 bg-primary rounded-[32px] text-white border-none shadow-2xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                    <Gift className="h-8 w-8 mb-4 opacity-40" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Event Giving</p>
                    <h3 className="text-3xl font-black mb-6">$124,500.00</h3>
                    <div className="flex items-center gap-2 text-xs font-black bg-white/10 w-fit p-1 px-3 rounded-full">
                        <ArrowUpRight className="h-3 w-3" />
                        12% vs last event
                    </div>
                </Card>

                <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                    <Heart className="h-6 w-6 text-destructive mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Unique Givers</p>
                    <h3 className="text-2xl font-black text-foreground mb-4">842</h3>
                    <div className="flex items-center gap-2">
                        <Progress value={65} className="h-1.5 flex-1 bg-muted" />
                        <span className="text-[10px] font-black text-primary">65% of Goal</span>
                    </div>
                </Card>

                <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5 flex flex-col items-center justify-center text-center">
                    <Share2 className="h-6 w-6 text-primary mb-4" />
                    <h4 className="text-sm font-black mb-2">Giving Link</h4>
                    <p className="text-[10px] font-bold text-muted-foreground mb-4">Share this link for quick mobile giving</p>
                    <Button variant="outline" className="h-10 px-6 rounded-xl border-primary/10 bg-muted/30 text-primary font-black text-[9px] uppercase tracking-widest">
                        Copy Link
                    </Button>
                </Card>
            </div>

            <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-serif font-black">Transaction Stream</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Real-time giving updates</p>
                    </div>
                    <Button variant="ghost" className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border border-primary/5">
                        View Register
                    </Button>
                </div>

                <div className="space-y-4">
                    {[
                        { type: 'Offering', amount: '$150.00', method: 'Cash', time: 'Just now', user: 'Anonymous' },
                        { type: 'Tithe', amount: '$1,200.00', method: 'Card', time: '5m ago', user: 'Isaac N.' },
                        { type: 'Seed', amount: '$500.00', method: 'Transfer', time: '12m ago', user: 'Gloria A.' },
                        { type: 'Offering', amount: '$25.00', method: 'Mobile Money', time: '30m ago', user: 'Samuel K.' },
                    ].map((tx, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                {tx.method === 'Cash' ? <Wallet className="h-4 w-4 text-primary" /> : <CreditCard className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-black text-foreground">{tx.user}</h5>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{tx.type} • {tx.method}</p>
                            </div>
                            <div className="text-right">
                                <h5 className="text-sm font-black text-primary">{tx.amount}</h5>
                                <p className="text-[9px] font-bold text-muted-foreground opacity-60">{tx.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
