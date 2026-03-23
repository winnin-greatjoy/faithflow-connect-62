import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ShieldAlert,
  Wrench,
  HelpCircle,
  Loader2,
  MapPin,
  Send,
} from 'lucide-react';
import { incidentsApi, IncidentType, IncidentSeverity } from '@/services/incidentsApi';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReportEmergencyDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  reporterId?: string;
  /** If true, uses a dark theme suitable for kiosk mode */
  kioskMode?: boolean;
  /** List of available event zones */
  zones?: any[];
}

const EMERGENCY_TYPES: {
  value: IncidentType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: 'medical',
    label: 'Medical',
    icon: <AlertTriangle className="h-6 w-6" />,
    color: 'border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500/20',
  },
  {
    value: 'fire',
    label: 'Fire',
    icon: <AlertTriangle className="h-6 w-6" />,
    color: 'border-orange-600 bg-orange-600/10 text-orange-600 hover:bg-orange-600/20',
  },
  {
    value: 'security',
    label: 'Security',
    icon: <ShieldAlert className="h-6 w-6" />,
    color: 'border-indigo-500 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20',
  },
  {
    value: 'crowd_control',
    label: 'Crowd',
    icon: <ShieldAlert className="h-6 w-6" />,
    color: 'border-purple-500 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  },
  {
    value: 'maintenance',
    label: 'Facility',
    icon: <Wrench className="h-6 w-6" />,
    color: 'border-amber-500 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  },
  {
    value: 'other',
    label: 'Other',
    icon: <HelpCircle className="h-6 w-6" />,
    color: 'border-slate-500 bg-slate-500/10 text-slate-600 hover:bg-slate-500/20',
  },
];

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'border-blue-400 bg-blue-500/10 text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'border-amber-400 bg-amber-500/10 text-amber-600' },
  { value: 'high', label: 'High', color: 'border-orange-400 bg-orange-500/10 text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'border-red-400 bg-red-500/10 text-red-600' },
];

export const ReportEmergencyDialog = ({
  open,
  onClose,
  eventId,
  reporterId,
  kioskMode = false,
  zones = [],
}: ReportEmergencyDialogProps) => {
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setDetectingLocation(false);
        toast.success('Location detected');
      },
      (error) => {
        toast.error('Could not detect location: ' + error.message);
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await incidentsApi.reportIncident({
        event_id: eventId,
        reporter_id: reporterId,
        type: selectedType || 'other',
        severity,
        location_details: location.trim() || undefined,
        description: description.trim() || 'Urgent assistance requested. No details provided.',
      });
      setSubmitted(true);
      setTimeout(() => {
        resetAndClose();
      }, 3000);
    } catch (err: any) {
      toast.error('Failed to submit report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSelectedType(null);
    setSeverity('medium');
    setLocation('');
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => resetAndClose()}>
      <DialogContent
        className={cn(
          'sm:max-w-lg max-h-[90vh] overflow-y-auto',
          kioskMode && 'bg-slate-950 border-white/10 text-white sm:max-w-2xl'
        )}
      >
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              <Send className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Alert Dispatched!</h3>
            <p className={cn('text-sm', kioskMode ? 'text-slate-400' : 'text-muted-foreground')}>
              Your emergency report has been sent to the operations team. Help is on the way.
            </p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Report an Emergency
              </DialogTitle>
              <DialogDescription className={kioskMode ? 'text-slate-400' : ''}>
                Select the type of emergency and provide details so the right team can respond
                immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Type Selection */}
              <div>
                <Label
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider mb-3 block',
                    kioskMode && 'text-slate-300'
                  )}
                >
                  Emergency Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {EMERGENCY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-medium',
                        selectedType === t.value
                          ? t.color + ' ring-2 ring-offset-2 ring-current'
                          : 'border-transparent bg-secondary/30 hover:bg-secondary/50',
                        kioskMode &&
                          selectedType !== t.value &&
                          'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      )}
                    >
                      {t.icon}
                      <span className="text-sm font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <Label
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider mb-3 block',
                    kioskMode && 'text-slate-300'
                  )}
                >
                  Severity Level
                </Label>
                <div className="flex gap-2">
                  {SEVERITY_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSeverity(s.value)}
                      className={cn(
                        'flex-1 py-2 rounded-lg border-2 text-xs font-bold uppercase tracking-wider transition-all',
                        severity === s.value
                          ? s.color + ' ring-1 ring-current'
                          : 'border-transparent bg-secondary/30',
                        kioskMode &&
                          severity !== s.value &&
                          'bg-white/5 border-white/10 text-white/70'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label
                  htmlFor="location"
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider mb-2 block',
                    kioskMode && 'text-slate-300'
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 inline mr-1" /> Location
                </Label>

                {/* Quick Zone Picker */}
                {zones.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {zones.slice(0, 6).map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => setLocation(z.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all',
                          location === z.name
                            ? 'bg-primary text-white border-primary'
                            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border-transparent'
                        )}
                      >
                        {z.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="e.g. Main Hall, Near Exit B..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={cn(
                      'flex-1',
                      kioskMode &&
                        'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                    )}
                  />
                  {!kioskMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      title="Detect my GPS location"
                    >
                      {detectingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider mb-2 block',
                    kioskMode && 'text-slate-300'
                  )}
                >
                  What's happening?
                </Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the situation..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(
                    kioskMode && 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={resetAndClose}
                className={cn(kioskMode && 'border-white/10 text-white hover:bg-white/10')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !selectedType}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Emergency Alert
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
