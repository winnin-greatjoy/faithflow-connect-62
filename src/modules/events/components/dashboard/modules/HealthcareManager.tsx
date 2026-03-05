import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Activity,
  Package,
  UserCheck,
  Search,
  Filter,
  MoreHorizontal,
  HeartPulse,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { IncidentReport } from '@/modules/events/types/safety';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

// Mock Data
const MOCK_INCIDENTS: IncidentReport[] = [
  {
    id: 'i1',
    eventId: 'e1',
    type: 'medical',
    severity: 'low',
    description: 'Heat exhaustion, symptoms of dizziness',
    affectedPerson: 'Child (Tag #124)',
    location: 'Kids Hall',
    status: 'resolved',
    reportedBy: 'u1',
    timestamp: '12:45 PM',
  },
  {
    id: 'i2',
    eventId: 'e1',
    type: 'medical',
    severity: 'high',
    description: 'Severe allergic reaction to peanuts',
    affectedPerson: 'Member (John D.)',
    location: 'Main Hall',
    status: 'open',
    reportedBy: 'u2',
    timestamp: '11:20 AM',
  },
  {
    id: 'i3',
    eventId: 'e1',
    type: 'injury',
    severity: 'low',
    description: 'Minor cut on finger while arranging chairs',
    affectedPerson: 'Volunteer (Sarah M.)',
    location: 'Lobby',
    status: 'resolved',
    reportedBy: 'u3',
    timestamp: '10:05 AM',
  },
  {
    id: 'i4',
    eventId: 'e1',
    type: 'medical',
    severity: 'medium',
    description: 'Fainted during worship',
    affectedPerson: 'Visitor (Unknown)',
    location: 'Balcony',
    status: 'investigating',
    reportedBy: 'u4',
    timestamp: '09:45 AM',
  },
];

export const HealthcareManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('incidents');
  const [incidents, setIncidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    type: 'medical' as IncidentReport['type'],
    severity: 'low' as IncidentReport['severity'],
    location: '',
    affectedPerson: '',
    description: '',
  });
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageHealthcare = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageHealthcare || !hasEventContext;

  const ensureActionAllowed = (deniedMessage: string) => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Healthcare Manager from an event dashboard.');
      return false;
    }
    if (actionsDisabled) {
      toast.error(deniedMessage);
      return false;
    }
    return true;
  };

  const resetIncidentForm = () => {
    setIncidentForm({
      type: 'medical',
      severity: 'low',
      location: '',
      affectedPerson: '',
      description: '',
    });
  };

  const handleTriggerAlert = () => {
    if (!ensureActionAllowed('You do not have permission to trigger medical alerts.')) {
      return;
    }
    toast.error('Global Medical Alert Triggered', {
      description: 'All operational units have been notified of a new emergency.',
      duration: 5000,
    });
  };

  const handleLogIncident = () => {
    if (!ensureActionAllowed('You do not have permission to log incidents.')) {
      return;
    }
    setShowIncidentDialog(true);
  };

  const handleCreateIncident = () => {
    if (!ensureActionAllowed('You do not have permission to log incidents.')) {
      return;
    }

    if (!incidentForm.location.trim() || !incidentForm.description.trim()) {
      toast.error('Location and incident description are required.');
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newIncident: IncidentReport = {
      id: `incident-${Date.now()}`,
      eventId: eventId || 'unknown-event',
      type: incidentForm.type,
      severity: incidentForm.severity,
      description: incidentForm.description.trim(),
      affectedPerson: incidentForm.affectedPerson.trim() || undefined,
      location: incidentForm.location.trim(),
      status: 'open',
      reportedBy: 'current-user',
      timestamp,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setShowIncidentDialog(false);
    resetIncidentForm();
    toast.success('Incident logged successfully');
  };

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return incidents;

    return incidents.filter((incident) =>
      [incident.type, incident.affectedPerson, incident.location, incident.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [incidents, searchQuery]);

  const activeIncidentsCount = incidents.filter(
    (incident) => incident.status === 'open' || incident.status === 'investigating'
  ).length;

  const IncidentsView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search incidents by type, patient, or location..."
            className="pl-12 h-12 rounded-2xl border-primary/5 bg-white shadow-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <Filter className="h-4 w-4 mr-2 opacity-60" /> Filter
          </Button>
          <Button
            onClick={handleLogIncident}
            disabled={actionsDisabled}
            className="h-12 px-6 rounded-2xl bg-destructive text-white shadow-lg shadow-destructive/20 font-black text-[10px] uppercase tracking-widest"
          >
            Log Incident
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-3xl border border-primary/5 hover:border-primary/20 transition-all bg-white shadow-sm group"
          >
            <div className="flex items-center gap-5 mb-4 md:mb-0">
              <div
                className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0',
                  incident.severity === 'high'
                    ? 'bg-red-500 text-white'
                    : incident.severity === 'medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-primary/5 text-primary'
                )}
              >
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-black">
                    {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                  </h5>
                  <Badge
                    variant="outline"
                    className="text-[9px] h-5 border-primary/10 text-muted-foreground uppercase tracking-widest"
                  >
                    {incident.location}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-1">
                  {incident.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                    Patient: {incident.affectedPerson}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              <div className="text-right">
                <p className="text-[10px] font-black">{incident.timestamp}</p>
                <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                  Reported by: User #{incident.reportedBy}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    'h-8 rounded-full border-none font-black text-[9px] uppercase tracking-widest px-4',
                    incident.status === 'open'
                      ? 'bg-red-500/10 text-red-600'
                      : incident.status === 'investigating'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-emerald-500/10 text-emerald-600'
                  )}
                >
                  {incident.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FirstAidView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Main Sanctuary Post',
            status: 'Active',
            staff: ['Nurse Jane', 'Medic Tom'],
            supplies: 85,
          },
          { name: 'Kids Hall Station', status: 'Active', staff: ['Dr. Smith'], supplies: 92 },
          { name: 'Lobby Desk', status: 'Inactive', staff: [], supplies: 100 },
        ].map((post, i) => (
          <Card
            key={i}
            className="p-6 bg-white rounded-[32px] border border-primary/5 shadow-xl shadow-primary/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <HeartPulse className="h-6 w-6" />
              </div>
              <Badge
                variant={post.status === 'Active' ? 'default' : 'secondary'}
                className="rounded-full"
              >
                {post.status}
              </Badge>
            </div>

            <h4 className="font-bold text-lg mb-2">{post.name}</h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  <span>Supply Level</span>
                  <span>{post.supplies}%</span>
                </div>
                <Progress value={post.supplies} className="h-2" />
              </div>

              <div className="pt-4 border-t border-primary/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Assigned Staff
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.staff.length > 0 ? (
                    post.staff.map((s) => (
                      <Badge key={s} variant="outline" className="border-primary/10 text-xs py-1">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">
                      No staff assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Healthcare Manager
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Incident Response & Medical Logistics
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleTriggerAlert}
            disabled={actionsDisabled}
            variant="destructive"
            className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-destructive/20"
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> Global Alert
          </Button>
          <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
            {['incidents', 'first-aid', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={!hasEventContext}
                className={cn(
                  'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === tab
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary',
                  !hasEventContext && 'cursor-not-allowed opacity-60'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Incidents',
            value: String(activeIncidentsCount),
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            label: 'Response Teams',
            value: '4',
            icon: UserCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Avg Respons Time',
            value: '2m',
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Supplies Health',
            value: '94%',
            icon: Package,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-4 border border-primary/5 rounded-[24px] bg-white shadow-sm flex items-center gap-4"
          >
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <div>
              <h3 className="text-xl font-black">{stat.value}</h3>
              <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'incidents' && <IncidentsView />}
        {activeTab === 'first-aid' && <FirstAidView />}
        {activeTab === 'schedule' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <UserCheck className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Medical roster integration coming soon</p>
          </div>
        )}
      </div>

      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Log New Incident</DialogTitle>
            <DialogDescription>
              Record medical incidents so response and follow-up stay auditable.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Type
              </label>
              <select
                aria-label="Incident type"
                value={incidentForm.type}
                onChange={(event) =>
                  setIncidentForm((prev) => ({
                    ...prev,
                    type: event.target.value as IncidentReport['type'],
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="medical">Medical</option>
                <option value="injury">Injury</option>
                <option value="security">Security</option>
                <option value="lost_child">Lost Child</option>
                <option value="facility">Facility</option>
                <option value="fire">Fire</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Severity
              </label>
              <select
                aria-label="Incident severity"
                value={incidentForm.severity}
                onChange={(event) =>
                  setIncidentForm((prev) => ({
                    ...prev,
                    severity: event.target.value as IncidentReport['severity'],
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <Input
              aria-label="Incident location"
              placeholder="Location"
              value={incidentForm.location}
              onChange={(event) =>
                setIncidentForm((prev) => ({ ...prev, location: event.target.value }))
              }
            />
            <Input
              aria-label="Affected person"
              placeholder="Affected person (optional)"
              value={incidentForm.affectedPerson}
              onChange={(event) =>
                setIncidentForm((prev) => ({ ...prev, affectedPerson: event.target.value }))
              }
            />
          </div>

          <Textarea
            aria-label="Incident description"
            placeholder="Describe what happened..."
            value={incidentForm.description}
            onChange={(event) =>
              setIncidentForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowIncidentDialog(false);
                resetIncidentForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateIncident}>Save Incident</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
