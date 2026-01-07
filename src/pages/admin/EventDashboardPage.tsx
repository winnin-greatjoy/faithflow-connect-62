import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Settings2,
    Search,
    Plus,
    LayoutGrid,
    Users,
    ShieldCheck,
    Zap,
    Info,
    ChevronRight,
    Sparkles,
    Command,
    Monitor,
    MessageSquare,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from '@/components/ui/dialog';
import { eventsApi } from '@/services/eventsApi';
import { FEATURE_LIBRARY, EventModuleDefinition } from '@/modules/events/constants/eventModules';
import type { EventItem } from '@/modules/events/types';
import { cn } from '@/lib/utils';

// Module Shells
import { AttendanceManagerModule } from '@/modules/events/components/dashboard/modules/AttendanceManager';
import { RegistrationManagerModule } from '@/modules/events/components/dashboard/modules/RegistrationManager';
import { QueueManagerModule } from '@/modules/events/components/dashboard/modules/QueueManager';
import { AccommodationManagerModule } from '@/modules/events/components/dashboard/modules/AccommodationManager';
import { RosterManagerModule } from '@/modules/events/components/dashboard/modules/RosterManager';
import { StaffChatModule } from '@/modules/events/components/dashboard/modules/StaffChat';
import { HealthcareManagerModule } from '@/modules/events/components/dashboard/modules/HealthcareManager';
import { WorshipPlannerModule } from '@/modules/events/components/dashboard/modules/WorshipPlanner';
import { AssetManagerModule } from '@/modules/events/components/dashboard/modules/AssetManager';
import { GrowthPathwaysModule } from '@/modules/events/components/dashboard/modules/GrowthPathways';
import { PrayerManagerModule } from '@/modules/events/components/dashboard/modules/PrayerManager';
import { GivingManagerModule } from '@/modules/events/components/dashboard/modules/GivingManager';
import { FinanceReportingModule } from '@/modules/events/components/dashboard/modules/FinanceReporting';
import { SafeguardingManagerModule } from '@/modules/events/components/dashboard/modules/SafeguardingManager';
import { ChildSafetyManagerModule } from '@/modules/events/components/dashboard/modules/ChildSafetyManager';

// Views
import { VenueKioskView } from '@/modules/events/components/dashboard/views/VenueKioskView';
import { WorshipPlannerModule } from '@/modules/events/components/dashboard/modules/WorshipPlanner';
import { AssetManagerModule } from '@/modules/events/components/dashboard/modules/AssetManager';
import { GrowthPathwaysModule } from '@/modules/events/components/dashboard/modules/GrowthPathways';
import { PrayerManagerModule } from '@/modules/events/components/dashboard/modules/PrayerManager';
import { GivingManagerModule } from '@/modules/events/components/dashboard/modules/GivingManager';
import { FinanceReportingModule } from '@/modules/events/components/dashboard/modules/FinanceReporting';
import { SafeguardingManagerModule } from '@/modules/events/components/dashboard/modules/SafeguardingManager';
import { ChildSafetyManagerModule } from '@/modules/events/components/dashboard/modules/ChildSafetyManager';

import { useMembers } from '@/modules/members/hooks/useMembers';

export default function EventDashboardPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'team'>('overview');
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isKioskMode, setIsKioskMode] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { members } = useMembers(); // For delegation

    const renderModule = (moduleId: string) => {
        switch (moduleId) {
            case 'attendance':
                return <AttendanceManagerModule />;
            case 'registration':
                return <RegistrationManagerModule />;
            case 'queue':
                return <QueueManagerModule />;
            case 'accommodation':
                return <AccommodationManagerModule />;
            case 'roster':
                return <RosterManagerModule />;
            case 'staff_chat':
                return <StaffChatModule />;
            case 'healthcare':
                return <HealthcareManagerModule />;
            case 'worship_planner':
                return <WorshipPlannerModule />;
            case 'assets':
                return <AssetManagerModule />;
            case 'pathways':
                return <GrowthPathwaysModule />;
            case 'prayer_manager':
                return <PrayerManagerModule />;
            case 'giving':
                return <GivingManagerModule />;
            case 'finance_reporting':
                return <FinanceReportingModule />;
            case 'safeguarding':
                return <SafeguardingManagerModule />;
            case 'child_safety':
                return <ChildSafetyManagerModule />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                        <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center">
                            <Command className="h-10 w-10 text-primary opacity-20" />
                        </div>
                        <div>
                            <h4 className="font-serif font-black text-xl">Module Under Construction</h4>
                            <p className="text-sm text-muted-foreground">This system unit is being calibrated for operation.</p>
                        </div>
                    </div>
                );
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            try {
                const { data: found, error } = await eventsApi.getEvent(eventId);
                if (error) throw error;
                if (found) {
                    // Initialize active_modules if missing
                    setEvent({
                        ...found,
                        active_modules: found.active_modules || ['registration'],
                        module_config: found.module_config || {},
                        module_assignments: found.module_assignments || {}
                    } as any);
                }
            } catch (error) {
                console.error('Failed to fetch event:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const toggleModule = async (moduleId: string) => {
        if (!event) return;
        const currentModules = event.active_modules || [];
        const newModules = currentModules.includes(moduleId)
            ? currentModules.filter(m => m !== moduleId)
            : [...currentModules, moduleId];

        const updatedEvent = { ...event, active_modules: newModules };
        setEvent(updatedEvent);

        // In a real implementation, we would call an API update here
        await eventsApi.updateEvent(event.id, updatedEvent);
    };

    const delegateModule = async (moduleId: string, userId: string) => {
        if (!event) return;
        const updatedAssignments = {
            ...(event.module_assignments || {}),
            [moduleId]: userId
        };

        const updatedEvent = { ...event, module_assignments: updatedAssignments };
        setEvent(updatedEvent);

        // Update in backend
        await eventsApi.updateEvent(event.id, {
            metadata: {
                ...event.metadata,
                module_assignments: updatedAssignments
            }
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
    );

    if (!event) return <div>Event not found.</div>;

    const activeModules = FEATURE_LIBRARY.filter(m => event.active_modules?.includes(m.id));
    const filteredLibrary = FEATURE_LIBRARY.filter(m =>
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Dynamic Background Pattern */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/3 blur-[120px]" />
            </div>

            <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
                {/* Superior Header */}
                <header className="mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/admin/events')}
                                className="group -ml-3 hover:bg-transparent text-muted-foreground hover:text-primary transition-all"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Command Center
                            </Button>
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/20 relative">
                                    <Sparkles className="h-10 w-10 text-white" />
                                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-lg border border-primary/5">
                                        <Zap className="h-4 w-4 text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase">
                                            {event.event_level} Protocol
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary uppercase tracking-widest px-3">
                                            {event.status}
                                        </Badge>
                                    </div>
                                    <h1 className="text-4xl font-serif font-black text-foreground tracking-tight leading-tight">
                                        {event.title}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-[20px] font-black text-xs tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-95 group">
                                        <Plus className="mr-3 h-4 w-4 transition-transform group-hover:rotate-90" />
                                        ACTIVATE MODULES
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[32px] p-0 border-none bg-background shadow-2xl">
                                    <div className="p-8">
                                        <DialogHeader className="mb-8">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                    <LayoutGrid className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <DialogTitle className="text-2xl font-black font-serif">Module Marketplace</DialogTitle>
                                                    <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
                                                        Provision event-specific functional units
                                                    </DialogDescription>
                                                </div>
                                            </div>
                                            <div className="relative mt-6">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search functional modules..."
                                                    className="pl-12 h-14 rounded-2xl border-primary/10 bg-muted/30 focus:bg-background transition-all font-bold"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </DialogHeader>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredLibrary.map((module) => (
                                                <Card
                                                    key={module.id}
                                                    className={cn(
                                                        "group cursor-pointer p-6 rounded-[24px] border border-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden",
                                                        event.active_modules?.includes(module.id) ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/30"
                                                    )}
                                                    onClick={() => toggleModule(module.id)}
                                                >
                                                    <div className="flex gap-5 relative z-10">
                                                        <div className={cn(
                                                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                                            event.active_modules?.includes(module.id) ? "bg-primary text-white scale-110" : "bg-muted text-primary opacity-60"
                                                        )}>
                                                            <module.icon className="h-7 w-7" />
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-black text-sm tracking-tight">{module.label}</h4>
                                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-50 border-none p-0">
                                                                    {module.category}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[11px] leading-relaxed text-muted-foreground font-medium pr-4">
                                                                {module.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {event.active_modules?.includes(module.id) && (
                                                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                    )}
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                onClick={() => setIsKioskMode(true)}
                                className="h-14 px-6 rounded-[20px] border-primary/10 bg-white shadow-lg hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest text-primary"
                            >
                                <Monitor className="mr-2 h-4 w-4" />
                                Kiosk Mode
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsChatOpen(true)}
                                className="h-14 w-14 rounded-[20px] border-primary/10 bg-white shadow-lg hover:bg-primary/5 relative"
                            >
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-destructive" />
                            </Button>
                            <Button variant="outline" className="h-14 w-14 rounded-[20px] border-primary/10 bg-white shadow-lg hover:bg-primary/5">
                                <Settings2 className="h-5 w-5 text-primary" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-1 p-1 bg-muted/40 rounded-2xl border border-primary/5 w-fit">
                        {[
                            { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
                            { id: 'team', label: 'Command Team', icon: Users },
                            { id: 'library', label: 'Audit Log', icon: ClipboardList },
                        ].map(tab => (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                                )}
                            >
                                <tab.icon className="h-3.5 w-3.5 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </header>

                {/* Dynamic Workspace */}
                <div className="space-y-8">
                    {selectedModuleId ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between bg-white p-6 rounded-[28px] border border-primary/5 shadow-xl shadow-primary/5">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedModuleId(null)}
                                        className="rounded-xl hover:bg-primary/5"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-primary" />
                                    </Button>
                                    <div>
                                        <h2 className="title-font text-xl font-serif font-black">
                                            {FEATURE_LIBRARY.find(m => m.id === selectedModuleId)?.label}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                            Module Command Interface
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] tracking-widest px-4 py-1.5 uppercase rounded-full">
                                    ACTIVE
                                </Badge>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {renderModule(selectedModuleId)}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {activeModules.map((module) => (
                                    <motion.div
                                        key={module.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                    >
                                        <Card className="group h-full bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 overflow-hidden flex flex-col">
                                            <div className="p-8 pb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/5">
                                                        <module.icon className="h-7 w-7 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-serif font-black text-foreground">{module.label}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-80">Online</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedModuleId(module.id)}
                                                    className="h-10 w-10 rounded-xl hover:bg-primary/5"
                                                >
                                                    <ChevronRight className="h-5 w-5 text-primary opacity-40 group-hover:opacity-100 transition-all" />
                                                </Button>
                                            </div>

                                            <div className="px-8 py-6 flex-1">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-2xl bg-muted/30 border border-primary/5">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                                                            {module.id === 'attendance' ? 'Present' : 'Status'}
                                                        </p>
                                                        <p className="text-xs font-black text-foreground">
                                                            {module.id === 'attendance' ? '1,124' : 'Operational'}
                                                        </p>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-muted/30 border border-primary/5">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Assigned</p>
                                                        {event.module_assignments?.[module.id] ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-5 w-5 rounded-lg bg-primary text-white flex items-center justify-center text-[8px] font-black">
                                                                    {members.find(m => m.id === event.module_assignments?.[module.id])?.fullName.charAt(0)}
                                                                </div>
                                                                <span className="text-[9px] font-bold truncate max-w-[60px]">
                                                                    {members.find(m => m.id === event.module_assignments?.[module.id])?.fullName.split(' ')[0]}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="h-5 text-[8px] font-black tracking-widest bg-primary/5 text-primary border-none">UNASSIGNED</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-8 pb-8 pt-2">
                                                <Button
                                                    onClick={() => setSelectedModuleId(module.id)}
                                                    className="w-full bg-muted/50 hover:bg-primary hover:text-white text-muted-foreground h-12 rounded-xl border border-primary/5 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                                >
                                                    Open Module Console
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}

                                <motion.div
                                    layout
                                    className="flex items-center justify-center p-8 border-2 border-dashed border-primary/10 rounded-[32px] hover:border-primary/20 transition-all cursor-pointer bg-primary/5 group min-h-[300px]"
                                    onClick={() => setActiveTab('library')}
                                >
                                    <div className="text-center space-y-4">
                                        <div className="h-16 w-16 mx-auto rounded-3xl bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                            <Command className="h-8 w-8 text-primary opacity-40" />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-black text-lg text-primary">Provision Module</h4>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                                                Expand event operational capabilities
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-serif font-black">Command Team</h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                                        Delegate operational responsibilities to your team
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {activeModules.map(module => (
                                    <Card key={module.id} className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <module.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-serif font-black">{module.label}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{module.category}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl bg-muted/30 border border-primary/5">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Assigned Controller</p>
                                                <div className="flex items-center justify-between">
                                                    {event.module_assignments?.[module.id] ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-[10px]">
                                                                {members.find(m => m.id === event.module_assignments?.[module.id])?.fullName.charAt(0)}
                                                            </div>
                                                            <span className="text-xs font-bold">{members.find(m => m.id === event.module_assignments?.[module.id])?.fullName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-muted-foreground opacity-40">Unassigned</span>
                                                    )}

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 px-4 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                                                                {event.module_assignments?.[module.id] ? 'Change' : 'Assign'}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-md rounded-[32px]">
                                                            <DialogHeader>
                                                                <DialogTitle className="font-serif font-black">Select Staff Member</DialogTitle>
                                                                <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
                                                                    Assign to {module.label}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2">
                                                                {members.map(member => (
                                                                    <div
                                                                        key={member.id}
                                                                        onClick={() => delegateModule(module.id, member.id)}
                                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors border border-transparent hover:border-primary/10"
                                                                    >
                                                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px]">
                                                                            {member.fullName.charAt(0)}
                                                                        </div>
                                                                        <span className="text-xs font-medium">{member.fullName}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Contextual Chat Drawer */}
            <AnimatePresence>
                {isChatOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsChatOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-2xl z-[70] border-l border-primary/5 flex flex-col"
                        >
                            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif font-black text-lg">Staff Comms</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Real-time Coordination</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsChatOpen(false)}
                                    className="rounded-xl"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <StaffChatModule />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Venue Kiosk Mode Overlay */}
            <AnimatePresence>
                {isKioskMode && (
                    <VenueKioskView
                        eventName={event.title}
                        onExit={() => setIsKioskMode(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const ClipboardList = ({ className }: { className?: string }) => (
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
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
        <path d="M9 8h6" />
    </svg>
);
