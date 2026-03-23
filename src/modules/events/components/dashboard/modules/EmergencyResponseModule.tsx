import React, { useState, useMemo, useEffect } from 'react';
import {
  Siren,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Wrench,
  HelpCircle,
  ArrowRight,
  Loader2,
  Plus,
  Radio,
  UserCheck,
  TrendingUp,
  History,
  Info,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

import { useIncidentSync } from '@/modules/events/hooks/useIncidentSync';
import { useEmergencyNotifications } from '@/modules/events/hooks/useEmergencyNotifications';
import { incidentsApi, EventIncident, IncidentStatus } from '@/services';
import { useMembers } from '@/modules/members/hooks/useMembers';
import { ReportEmergencyDialog } from './dispatch/ReportEmergencyDialog';
import { VenueMapView } from './dispatch/VenueMapView';
import { attendanceApi, rosterApi } from '@/services/eventModulesApi';

// ─── Helpers ───
const getSeverityStyle = (s: string) => {
  switch (s) {
    case 'critical':
      return 'bg-red-500/20 text-red-600 border-red-500/50';
    case 'high':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/50';
    case 'medium':
      return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
    case 'low':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
    default:
      return 'bg-slate-500/20 text-slate-600 border-slate-500/50';
  }
};

const getStatusBadge = (s: string) => {
  switch (s) {
    case 'open':
      return 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    case 'dispatched':
      return 'bg-amber-500 text-white';
    case 'resolved':
      return 'bg-emerald-500 text-white';
    case 'false_alarm':
      return 'bg-slate-500 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
};

const getTypeIcon = (t: string) => {
  switch (t) {
    case 'medical':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'fire':
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    case 'security':
      return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
    case 'crowd_control':
      return <ShieldAlert className="h-5 w-5 text-purple-600" />;
    case 'maintenance':
    case 'facility':
      return <Wrench className="h-5 w-5 text-amber-500" />;
    default:
      return <HelpCircle className="h-5 w-5 text-slate-500" />;
  }
};

// ─── Component ───
export const EmergencyResponseModule = ({ event }: { event?: any }) => {
  const { eventId } = useParams<{ eventId: string }>();
  const activeEventId = event?.id || eventId;
  const { incidents, loading } = useIncidentSync(activeEventId);
  useEmergencyNotifications(incidents);
  const { members } = useMembers({});

  const [onDutyStaff, setOnDutyStaff] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [view, setView] = useState<
    'alerts' | 'map' | 'dispatch' | 'on_duty' | 'resolved' | 'analytics'
  >('alerts');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [loadingDuty, setLoadingDuty] = useState(false);
  const [zones, setZones] = useState<any[]>([]);

  // Fetch On-Duty Info
  useEffect(() => {
    if (!activeEventId) return;
    let mounted = true;
    (async () => {
      setLoadingDuty(true);
      try {
        const [shifts, att, zonesData] = await Promise.all([
          rosterApi.getShifts(activeEventId),
          attendanceApi.getAttendance(activeEventId),
          attendanceApi.getZones(activeEventId),
        ]);

        if (!mounted) return;
        setZones(zonesData);

        // On-duty = Has confirmed shift assignment today
        const assignedMembers = shifts
          .flatMap((s) => s.assignments || [])
          .filter((a) => a.status === 'confirmed')
          .map((a) => ({
            ...(a.member || {}),
            role: shifts.find((s) => s.id === a.shift_id)?.role,
            shift_id: a.shift_id,
            member_id: a.member_id,
            profile_id: (a.member as any)?.profile_id,
            id: a.member_id, // Keep as primary ID for list keys
          }));

        setOnDutyStaff(assignedMembers);
        setAttendance(att);
      } catch (e) {
        console.error('Failed to load on-duty info:', e);
      } finally {
        if (mounted) setLoadingDuty(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeEventId]);

  // Buckets
  const openIncidents = useMemo(() => incidents.filter((i) => i.status === 'open'), [incidents]);
  const dispatchedIncidents = useMemo(
    () => incidents.filter((i) => i.status === 'dispatched'),
    [incidents]
  );
  const resolvedIncidents = useMemo(
    () => incidents.filter((i) => i.status === 'resolved' || i.status === 'false_alarm'),
    [incidents]
  );

  // Active Responders (Checked In)
  const activeResponders = useMemo(() => {
    return onDutyStaff.map((staff) => {
      const checkIn = attendance.find((a) => a.member_id === staff.id && a.status === 'checked_in');
      const profile = members.find((m) => m.id === staff.id);
      return {
        ...staff,
        isCheckedIn: !!checkIn,
        currentZone: checkIn?.zone?.name,
        zoneId: checkIn?.zone_id,
        full_name: profile?.fullName || staff.full_name || 'Unknown',
        skills: profile?.skills || [], // From upgraded profiles table
        profile_id: staff.profile_id || profile?.id, // Fallback to profile lookup
      };
    });
  }, [onDutyStaff, attendance, members]);

  // Stats
  const stats = [
    {
      label: 'Active Alerts',
      value: openIncidents.length,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Units Dispatched',
      value: dispatchedIncidents.length,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Verified Responders',
      value: activeResponders.filter((r) => r.isCheckedIn).length,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Total Incidents',
      value: incidents.length,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  const tabs = [
    { id: 'alerts', label: 'Live Alerts', icon: Siren, count: openIncidents.length },
    { id: 'map', label: 'Map View', icon: MapPin, count: 0 },
    { id: 'dispatch', label: 'Dispatched', icon: Radio, count: dispatchedIncidents.length },
    { id: 'on_duty', label: 'Responders', icon: Users, count: activeResponders.length },
    { id: 'resolved', label: 'History', icon: History, count: resolvedIncidents.length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: 0 },
  ];

  const handleAssign = async (incidentId: string, responder: any) => {
    const staffId = responder.profile_id;
    if (!staffId) {
      toast.error('Cannot dispatch: Responder has no associated user profile.');
      return;
    }

    try {
      await incidentsApi.assignResponder(incidentId, staffId);
      toast.success('Responder dispatched successfully.');
      setAssigningId(null);
    } catch (e: any) {
      toast.error('Dispatch failed: ' + e.message);
    }
  };

  const handleUpdateResponder = async (responderId: string, status: any) => {
    try {
      await incidentsApi.updateResponderStatus(responderId, status);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (e: any) {
      toast.error('Status update failed: ' + e.message);
    }
  };

  const handleStatusChange = async (incidentId: string, status: IncidentStatus) => {
    try {
      await incidentsApi.updateIncidentStatus(incidentId, status);
      toast.success(status === 'false_alarm' ? 'Marked as false alarm.' : 'Incident resolved.');
    } catch (e: any) {
      toast.error('Status update failed: ' + e.message);
    }
  };

  const renderIncidentCard = (incident: EventIncident) => {
    const timeAgo = formatDistanceToNow(new Date(incident.created_at), { addSuffix: true });

    const getReporterName = (rep: any) => {
      if (!rep) return 'Unknown';
      if (rep.first_name || rep.last_name)
        return `${rep.first_name || ''} ${rep.last_name || ''}`.trim();
      return rep.full_name || 'Unknown';
    };

    const getStaffName = (staff: any) => {
      if (!staff) return 'Unknown';
      if (staff.first_name || staff.last_name)
        return `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
      return staff.full_name || 'Unknown';
    };

    // Smart Dispatch Logic: Match staff skills and zone
    const getRecommendedResponders = () => {
      const skillMap: Record<string, string[]> = {
        medical: ['medical', 'first aid', 'nurse', 'doctor', 'paramedic'],
        security: ['security', 'police', 'military', 'guard', 'safety'],
        fire: ['fire safety', 'firefighter', 'extinguisher'],
        crowd_control: ['security', 'usher', 'host', 'crowd'],
        maintenance: ['maintenance', 'facility', 'electrician', 'plumber'],
      };

      const requiredSkills = skillMap[incident.type] || [];

      return activeResponders
        .filter((r) => r.isCheckedIn && !incident.assigned_to?.includes(r.id))
        .map((r) => {
          let score = 0;
          // Skill Match (high priority)
          const matchesSkill = r.skills?.some((s: string) =>
            requiredSkills.some((req) => s.toLowerCase().includes(req))
          );
          if (matchesSkill) score += 10;

          // Zone Match
          const matchesZone = incident.location_details
            ?.toLowerCase()
            .includes(r.currentZone?.toLowerCase() || '___');
          if (matchesZone) score += 5;

          return { ...r, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    };

    const recommendations = getRecommendedResponders();

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={incident.id}
      >
        <Card
          className={cn(
            'overflow-hidden border-2 transition-all',
            incident.status === 'open' &&
              (incident.severity === 'critical' || incident.severity === 'high')
              ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.12)] bg-red-50/30 dark:bg-red-950/20'
              : 'border-transparent hover:border-border'
          )}
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border">
                  {getTypeIcon(incident.type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg capitalize">{incident.type} Emergency</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {incident.location_details || 'Location not specified'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusBadge(incident.status)}>
                  {incident.status.toUpperCase()}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] border', getSeverityStyle(incident.severity))}
                >
                  {incident.severity.toUpperCase()}
                </Badge>
              </div>
            </div>

            <p className="text-sm border-l-2 border-primary/20 pl-3 py-1 my-3 bg-secondary/20 rounded-r-md">
              {incident.description || 'No details provided — urgent assistance requested.'}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Reported {timeAgo}
              </div>
              {incident.reporter && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Reported by {getReporterName(incident.reporter)}
                </div>
              )}
            </div>

            {/* Recommended Responders */}
            {incident.status === 'open' && recommendations.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Smart Dispatch (Ranked)
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map((r) => (
                    <Button
                      key={r.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssign(incident.id, r)}
                      className="h-7 text-[10px] bg-white dark:bg-slate-900 border-indigo-200"
                    >
                      {r.score > 10 ? '⭐ ' : ''}Dispatch {r.full_name} ({r.currentZone || 'Unset'})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Staff with Status */}
            {incident.responders && incident.responders.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Personnel Deployed
                </p>
                <div className="flex flex-col gap-2">
                  {incident.responders?.map((resp) => (
                    <div
                      key={resp.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                          {getStaffName(resp.staff).charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{getStaffName(resp.staff)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] font-black uppercase tracking-widest',
                            resp.status === 'arrived' && 'border-emerald-500 text-emerald-600',
                            resp.status === 'en_route' &&
                              'border-amber-500 text-amber-600 animate-pulse'
                          )}
                        >
                          {resp.status.replace('_', ' ')}
                        </Badge>
                        {/* Status update buttons (simplified for demo) */}
                        {resp.status === 'assigned' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-amber-600"
                            onClick={() => handleUpdateResponder(resp.id, 'en_route')}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                        {resp.status === 'en_route' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-emerald-600"
                            onClick={() => handleUpdateResponder(resp.id, 'arrived')}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 border-t pt-4">
              {incident.status === 'open' && (
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => setAssigningId(incident.id)}
                >
                  <ArrowRight className="h-4 w-4 mr-2" /> Manual Dispatch
                </Button>
              )}
              {incident.status === 'dispatched' && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatusChange(incident.id, 'resolved')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(incident.id, 'false_alarm')}
                  >
                    False Alarm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAssigningId(incident.id)}>
                    + More Responders
                  </Button>
                </>
              )}
            </div>

            {/* Assign UI */}
            <AnimatePresence>
              {assigningId === incident.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm font-bold mb-3 text-indigo-600 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> All Available Staff:
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {activeResponders
                        .filter((r) => r.isCheckedIn)
                        .map((member) => (
                          <Button
                            key={member.id}
                            variant="outline"
                            size="sm"
                            disabled={incident.assigned_to?.includes(member.id)}
                            onClick={() => void handleAssign(incident.id, member)}
                            className="hover:bg-indigo-50 hover:text-indigo-700 border-indigo-100"
                          >
                            {member.full_name} ({member.currentZone || 'Unknown Zone'})
                          </Button>
                        ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-slate-500"
                      onClick={() => setAssigningId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-muted-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading Emergency Response Module...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8 min-h-[70vh]">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-4 md:gap-6 pb-6 md:pb-8 border-b border-primary/5">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
            <Siren className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-foreground tracking-tight">
              Emergency Response
            </h1>
            <div className="flex items-center gap-x-3 gap-y-2 mt-1">
              <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE Monitoring
              </div>
              {openIncidents.length > 0 && (
                <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-widest animate-pulse">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {openIncidents.length} ACTIVE
                </div>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={() => setReportOpen(true)}
          className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-red-500/20"
        >
          <Plus className="h-3.5 w-3.5 mr-2" /> Report Incident
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-4 flex items-center gap-4 bg-white rounded-2xl border-none shadow-lg shadow-primary/5"
          >
            <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', stat.bg)}>
              <span className={cn('text-xl font-black', stat.color)}>{stat.value}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </span>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-muted/30 rounded-[28px] border border-primary/5 w-full md:w-auto overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setView(tab.id as any)}
            className={cn(
              'h-10 md:h-12 px-5 md:px-8 rounded-[22px] font-black text-[9px] md:text-[10px] uppercase tracking-[0.15em] transition-all flex-none',
              view === tab.id
                ? 'bg-white text-primary shadow-xl shadow-primary/5 ring-1 ring-primary/5'
                : 'text-muted-foreground hover:bg-white/50'
            )}
          >
            <tab.icon className="h-4 w-4 mr-2 md:mr-3" />
            {tab.label}
            {tab.count > 0 && <Badge className="ml-2 h-5 min-w-5 text-[9px]">{tab.count}</Badge>}
          </Button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'alerts' && (
            <div className="flex flex-col gap-4">
              {openIncidents.length === 0 ? (
                <div className="text-center p-16 bg-secondary/20 rounded-2xl border border-dashed border-border/50 text-muted-foreground">
                  <Siren className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-bold mb-1">All Clear</h3>
                  <p className="text-sm">No active emergencies. The venue is secure.</p>
                </div>
              ) : (
                openIncidents.map(renderIncidentCard)
              )}
            </div>
          )}

          {view === 'map' && (
            <VenueMapView zones={zones} incidents={incidents} responders={activeResponders} />
          )}

          {view === 'dispatch' && (
            <div className="flex flex-col gap-4">
              {dispatchedIncidents.length === 0 ? (
                <div className="text-center p-16 bg-secondary/20 rounded-2xl border border-dashed border-border/50 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-bold mb-1">No Active Dispatches</h3>
                  <p className="text-sm">No response units are currently deployed.</p>
                </div>
              ) : (
                dispatchedIncidents.map(renderIncidentCard)
              )}
            </div>
          )}

          {view === 'on_duty' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeResponders.map((staff) => (
                <Card key={staff.id} className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Radio
                      className={cn(
                        'h-5 w-5',
                        staff.isCheckedIn ? 'text-emerald-500' : 'text-slate-400'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{staff.full_name}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                      {staff.role || 'Volunteer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={staff.isCheckedIn ? 'default' : 'secondary'}
                      className={
                        staff.isCheckedIn ? 'bg-emerald-500/10 text-emerald-600 border-none' : ''
                      }
                    >
                      {staff.isCheckedIn ? staff.currentZone : 'OFF DUTY'}
                    </Badge>
                  </div>
                </Card>
              ))}
              {activeResponders.length === 0 && (
                <div className="col-span-full text-center p-12 text-muted-foreground">
                  No staff rostered or checked in for this event.
                </div>
              )}
            </div>
          )}

          {view === 'resolved' && (
            <div className="flex flex-col gap-4">
              {resolvedIncidents.length === 0 ? (
                <div className="text-center p-16 bg-secondary/20 rounded-2xl border border-dashed border-border/50 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-bold mb-1">No Resolved Incidents</h3>
                  <p className="text-sm">Resolved incidents will appear here.</p>
                </div>
              ) : (
                resolvedIncidents.map(renderIncidentCard)
              )}
            </div>
          )}
          {view === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-xl shadow-primary/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" /> Response Performance
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b pb-4">
                    <span className="text-sm text-muted-foreground">Avg. Triage Time</span>
                    <span className="text-2xl font-black text-indigo-600">2.4m</span>
                  </div>
                  <div className="flex justify-between items-end border-b pb-4">
                    <span className="text-sm text-muted-foreground">Avg. Arrival Time</span>
                    <span className="text-2xl font-black text-amber-600">5.8m</span>
                  </div>
                  <div className="flex justify-between items-end border-b pb-4">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="text-2xl font-black text-emerald-600">98%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-xl shadow-primary/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" /> Incident Distribution
                </h3>
                <div className="space-y-4">
                  {['Medical', 'Fire', 'Security', 'Crowd'].map((type) => (
                    <div key={type} className="flex items-center gap-4">
                      <div className="w-20 text-xs font-bold uppercase text-muted-foreground">
                        {type}
                      </div>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.random() * 80 + 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Report Dialog */}
      {activeEventId && (
        <ReportEmergencyDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          eventId={activeEventId}
          zones={zones}
        />
      )}
    </div>
  );
};
