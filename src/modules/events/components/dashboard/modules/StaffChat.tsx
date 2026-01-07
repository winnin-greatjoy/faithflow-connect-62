import React, { useState } from 'react';
import { Send, MessageSquare, Shield, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const StaffChatModule = () => {
    const [activeChannel, setActiveChannel] = useState('general');

    const channels = [
        { id: 'general', name: 'Command & Dispatch', icon: Shield, unread: 2 },
        { id: 'security', name: 'Security Protocol', icon: Shield, unread: 0 },
        { id: 'ushering', name: 'Crowd Control', icon: MessageSquare, unread: 5 },
        { id: 'medical', name: 'Medical & Support', icon: Shield, unread: 0 },
    ];

    return (
        <div className="h-[700px] flex gap-6 overflow-hidden">
            {/* Channels Sidebar */}
            <div className="w-72 flex flex-col gap-4">
                {channels.map((channel) => (
                    <button
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={cn(
                            "w-full p-4 rounded-2xl border text-left transition-all relative group",
                            activeChannel === channel.id
                                ? "bg-primary border-transparent text-white shadow-xl shadow-primary/10"
                                : "bg-white border-primary/5 text-muted-foreground hover:border-primary/20"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                activeChannel === channel.id ? "bg-white/20" : "bg-muted shadow-inner"
                            )}>
                                <channel.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[11px] font-black uppercase tracking-widest truncate">{channel.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", activeChannel === channel.id ? "bg-emerald-300 animate-pulse" : "bg-emerald-500")} />
                                    <span className={cn("text-[9px] font-bold opacity-60", activeChannel === channel.id ? "text-white" : "text-emerald-600")}>Online</span>
                                </div>
                            </div>
                            {channel.unread > 0 && activeChannel !== channel.id && (
                                <Badge className="bg-primary text-white border-none h-5 w-5 rounded-full p-0 flex items-center justify-center font-black text-[9px] animate-bounce">
                                    {channel.unread}
                                </Badge>
                            )}
                        </div>
                    </button>
                ))}

                <div className="mt-auto p-6 bg-primary/5 rounded-[32px] border border-primary/5">
                    <h6 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Emergency Protocol</h6>
                    <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                        Press the red button in any dangerous situation for immediate command escalation.
                    </p>
                    <Button variant="destructive" className="w-full mt-4 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-destructive/20">
                        Emergency Distress
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 bg-white rounded-[40px] border-none shadow-2xl flex flex-col relative overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="title-font text-lg font-serif font-black uppercase tracking-tight">
                                {channels.find(c => c.id === activeChannel)?.name}
                            </h4>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 tracking-[0.2em]">
                                Encrypted Secure Line
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="text-center">
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-40 border-none">Today, Jan 7</Badge>
                    </div>

                    {[
                        { sender: 'System Dispatch', text: 'All units report status before commencement.', time: '09:00 AM', isSystem: true },
                        { sender: 'Sarah Johnson', text: 'Security Detail in position at South Pavilion.', time: '09:12 AM', avatar: 'SJ' },
                        { sender: 'Mark Tech', text: 'AV system check complete. Main stage active.', time: '09:15 AM', avatar: 'MT' },
                        { sender: 'System Dispatch', text: 'Confirmation acknowledged. Operational protocols engaged.', time: '09:16 AM', isSystem: true },
                    ].map((msg, i) => (
                        <div key={i} className={cn("flex gap-4 max-w-[80%]", msg.isSystem ? "mx-auto w-full max-w-full justify-center" : "")}>
                            {!msg.isSystem && (
                                <div className="h-10 w-10 rounded-2xl bg-muted flex-shrink-0 flex items-center justify-center font-black text-xs text-primary shadow-inner">
                                    {msg.avatar}
                                </div>
                            )}
                            <div className={cn("space-y-1", msg.isSystem ? "text-center w-full" : "")}>
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", msg.isSystem ? "text-primary opacity-60" : "text-foreground")}>
                                        {msg.sender}
                                    </span>
                                    <span className="text-[9px] font-bold text-muted-foreground opacity-40">{msg.time}</span>
                                </div>
                                <div className={cn(
                                    "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                    msg.isSystem ? "bg-muted/30 border border-primary/5 text-muted-foreground/80 italic text-[11px] inline-block" : "bg-muted/40 border border-primary/5 text-foreground"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-8 pt-4">
                    <div className="bg-muted/30 rounded-[32px] border border-primary/5 p-2 flex items-center gap-2 pr-4 shadow-inner focus-within:bg-white focus-within:shadow-2xl focus-within:border-primary/20 transition-all duration-300">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-3xl text-muted-foreground hover:bg-neutral-200">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                            placeholder="Securely message team members..."
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 font-bold h-12 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-3xl text-muted-foreground hover:bg-neutral-200">
                            <Smile className="h-5 w-5" />
                        </Button>
                        <Button className="h-12 w-12 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
