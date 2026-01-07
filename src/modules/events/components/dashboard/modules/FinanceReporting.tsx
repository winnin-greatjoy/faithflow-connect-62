import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const FinanceReportingModule = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h4 className="text-xl font-serif font-black">Financial Analysis</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Event budget & yield reports</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-primary/10 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button className="h-11 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest active:scale-95">
                        <Filter className="h-4 w-4 mr-2" />
                        Custom Range
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h5 className="text-sm font-black uppercase tracking-widest opacity-40">Revenue Distribution</h5>
                            <p className="text-[10px] font-bold text-muted-foreground">Allocation by department</p>
                        </div>
                        <PieChart className="h-5 w-5 text-primary opacity-40" />
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'General Fund', amount: '$85,200', pct: 65, color: 'bg-primary' },
                            { label: 'Welfare / Charity', amount: '$15,400', pct: 15, color: 'bg-emerald-500' },
                            { label: 'Building Project', amount: '$24,500', pct: 20, color: 'bg-amber-500' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>{item.label}</span>
                                    <span className="text-primary">{item.amount}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h5 className="text-sm font-black uppercase tracking-widest opacity-40">Event Overhead</h5>
                            <p className="text-[10px] font-bold text-muted-foreground">Operational expenses</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-destructive opacity-40" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Venue & Logistics', amount: '$12,000', status: 'Paid' },
                            { label: 'Catering Services', amount: '$4,500', status: 'Pending' },
                            { label: 'Technical Setup', amount: '$8,200', status: 'Paid' },
                            { label: 'Promotional/Ads', amount: '$3,100', status: 'Paid' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-primary/5">
                                <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">{item.label}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-foreground">{item.amount}</span>
                                    <Badge variant="outline" className={cn(
                                        "h-5 text-[8px] font-black border-none uppercase tracking-widest",
                                        item.status === 'Paid' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                    )}>
                                        {item.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
