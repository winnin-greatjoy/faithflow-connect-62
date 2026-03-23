import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { useIncidentSync } from '@/modules/events/hooks/useIncidentSync';
import { incidentsApi, EventIncident } from '@/services/incidentsApi';
import { useMembers } from '@/modules/members/hooks/useMembers';

interface DispatchDashboardViewProps {
  eventId: string;
}

export const DispatchDashboardView = ({ eventId }: DispatchDashboardViewProps) => {
  const { incidents, loading } = useIncidentSync(eventId);
  const { members } = useMembers({});

  // Local states for UI
  const [assigningIncident, setAssigningIncident] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'security':
        return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-amber-500" />;
      default:
        return <ShieldCheck className="h-5 w-5 text-slate-500" />;
    }
  };

  const handleAssignStaff = async (incidentId: string, staffId: string) => {
    try {
      const incident = incidents.find((i) => i.id === incidentId);
      if (!incident) return;

      const currentAssigned = incident.assigned_to || [];
      if (currentAssigned.includes(staffId)) return;

      await incidentsApi.assignStaff(incidentId, [...currentAssigned, staffId]);
      toast.success('Staff unit dispatched successfully.');
      setAssigningIncident(null);
    } catch (e: any) {
      toast.error('Failed to dispatch staff: ' + e.message);
    }
  };

  const handleResolve = async (incidentId: string, falseAlarm = false) => {
    try {
      await incidentsApi.updateIncidentStatus(incidentId, falseAlarm ? 'false_alarm' : 'resolved');
      toast.success(falseAlarm ? 'Marked as False Alarm' : 'Incident securely resolved.');
    } catch (e: any) {
      toast.error('Failed to resolve incident: ' + e.message);
    }
  };

  const renderIncidentCard = (incident: EventIncident) => {
    const timeAgo = formatDistanceToNow(new Date(incident.created_at), { addSuffix: true });

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={incident.id}
      >
        <Card
          className={`overflow-hidden border-2 transition-all ${
            incident.status === 'open' && incident.severity === 'critical'
              ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] bg-red-50/50 dark:bg-red-950/20'
              : 'border-transparent hover:border-border'
          }`}
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border">
                  {getTypeIcon(incident.type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg capitalize">{incident.type} Emergency</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {incident.location_details || 'Location Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </div>
              </div>
            </div>

            <p className="text-sm border-l-2 border-primary/20 pl-3 py-1 my-4 bg-secondary/20 rounded-r-md">
              {incident.description || 'No additional details provided.'}
            </p>

            {/* Assignments Section */}
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {incident.assigned_to?.length
                    ? `${incident.assigned_to.length} Units Responding`
                    : 'No responders assigned'}
                </span>
                {incident.assigned_to?.map((id) => {
                  const staff = members.find((m) => m.id === id);
                  return staff ? (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {staff.fullName.split(' ')[0]}
                    </Badge>
                  ) : null;
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {incident.status === 'open' && (
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setAssigningIncident(incident.id)}
                  >
                    Dispatch Unit
                  </Button>
                )}

                {incident.status === 'dispatched' && (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleResolve(incident.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve Situation
                  </Button>
                )}
              </div>
            </div>

            {/* Inline Assignment UI */}
            <AnimatePresence>
              {assigningIncident === incident.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm font-bold mb-3 text-indigo-600 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Select available staff unit:
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {members.map((member) => (
                        <Button
                          key={member.id}
                          variant="outline"
                          size="sm"
                          disabled={incident.assigned_to?.includes(member.id)}
                          onClick={() => void handleAssignStaff(incident.id, member.id)}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-700 border-indigo-100"
                        >
                          {member.fullName}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-slate-500"
                      onClick={() => setAssigningIncident(null)}
                    >
                      Cancel Assignment
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
      <div className="p-12 text-center text-muted-foreground animate-pulse">
        Loading Dispatch Grid...
      </div>
    );
  }

  const openIncidents = incidents.filter((i) => i.status === 'open');
  const dispatchedIncidents = incidents.filter((i) => i.status === 'dispatched');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Dispatch</h2>
          <p className="text-muted-foreground">
            Monitor and manage real-time emergencies across the venue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Unassigned / Open */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Alerts
              <Badge className="bg-red-500">{openIncidents.length}</Badge>
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {openIncidents.length === 0 ? (
                <div className="text-center p-12 bg-secondary/30 rounded-2xl border border-dashed border-border/50 text-muted-foreground">
                  No active alerts. Venue is secure.
                </div>
              ) : (
                openIncidents.map(renderIncidentCard)
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 2: Dispatched */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Units Dispatched
              <Badge className="bg-amber-500">{dispatchedIncidents.length}</Badge>
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {dispatchedIncidents.length === 0 ? (
                <div className="text-center p-12 bg-secondary/30 rounded-2xl border border-dashed border-border/50 text-muted-foreground">
                  No units currently dispatched.
                </div>
              ) : (
                dispatchedIncidents.map(renderIncidentCard)
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
