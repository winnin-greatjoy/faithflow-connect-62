import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventsApi } from '@/services/eventsApi';
import {
    History,
    Search,
    Filter,
    Download,
    User,
    Clock,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const AttendanceLogs = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!eventId) return;
            setLoading(true);
            try {
                const { data, error } = await eventsApi.getAttendanceLogs(eventId);
                if (!error && data) {
                    setLogs(data);
                }
            } catch (err) {
                console.error('Failed to fetch logs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [eventId]);

    const filteredLogs = logs.filter(log =>
        log.member?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.zone_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                    <Input
                        placeholder="Search logs by name, ID or zone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 rounded-2xl border-primary/5 bg-white shadow-sm focus:ring-primary/20 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-primary/10 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                        <Filter className="h-4 w-4 mr-2 opacity-60" />
                        Refine
                    </Button>
                    <div className="flex bg-white rounded-2xl border border-primary/10 p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary">
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary">
                            <FileText className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <Card className="rounded-[40px] border border-primary/5 bg-white shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-primary/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Activity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Location</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Method</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 text-right">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Retrieving Logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No activity logs found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td className="px-8 py-5">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                                                log.type === 'in' ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                                            )}>
                                                {log.type === 'in' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-primary shadow-inner">
                                                    {(log.member?.full_name || 'U').charAt(0)}
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-black text-foreground">{log.member?.full_name || 'Unknown Member'}</h5>
                                                    <Badge variant="outline" className="mt-1 h-5 text-[8px] font-black tracking-widest border-primary/10 opacity-60">
                                                        {log.metadata?.role || 'ATTENDEE'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                <MapPin className="h-3.5 w-3.5 opacity-40 text-primary" />
                                                {log.zone_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[8px] font-black tracking-widest px-3 py-1">
                                                BY {log.method}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-foreground">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 hover:bg-primary/5 hover:text-primary transition-all">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-8 border-t border-primary/5 flex items-center justify-between bg-muted/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Showing 1-50 of 1,248 entries</p>
                    <div className="flex gap-2">
                        <Button variant="outline" className="h-10 rounded-xl border-primary/10 text-xs font-black uppercase tracking-widest disabled:opacity-30" disabled>Previous</Button>
                        <Button variant="outline" className="h-10 rounded-xl border-primary/10 text-xs font-black uppercase tracking-widest">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
