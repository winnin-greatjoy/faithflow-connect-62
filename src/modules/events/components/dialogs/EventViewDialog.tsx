import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Banknote,
  Globe,
  Zap,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { EventItem } from '../../types';
import { cn } from '@/lib/utils';

interface EventViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventItem | null;
  registrationCount?: number | null;
  canEdit: boolean;
  onRegister: (event: EventItem) => void;
  onManageRegistrations: (event: EventItem) => void;
  onManageQuotas: (event: EventItem) => void;
}

export const EventViewDialog: React.FC<EventViewDialogProps> = ({
  open,
  onOpenChange,
  event,
  registrationCount,
  canEdit,
  onRegister,
  onManageRegistrations,
  onManageQuotas,
}) => {
  const navigate = useNavigate();
  if (!event) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'NATIONAL':
        return 'from-rose-500 to-pink-600';
      case 'DISTRICT':
        return 'from-blue-500 to-indigo-600';
      case 'BRANCH':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0 overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-primary/10 rounded-[32px] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div
                className={cn(
                  'absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r',
                  getLevelColor(event.event_level)
                )}
              />

              <div className="p-8">
                <DialogHeader className="mb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 bg-gradient-to-br',
                          getLevelColor(event.event_level)
                        )}
                      >
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <DialogTitle className="text-3xl font-serif font-black text-foreground">
                          {event.title}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Protocol Activation Manifest
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenChange(false)}
                      className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </DialogHeader>

                <div className="mt-8 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/40 p-4 rounded-2xl border border-primary/5 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                        Scope
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-black tracking-widest text-white border-transparent bg-gradient-to-br',
                          getLevelColor(event.event_level)
                        )}
                      >
                        {event.event_level}
                      </Badge>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-2xl border border-primary/5 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                        Category
                      </p>
                      <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                        {event.type}
                      </p>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-2xl border border-primary/5 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary"
                      >
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-2xl border border-primary/5 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                        Capacity
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {event.capacity || 'UNLIMITED'}
                        {registrationCount !== null && (
                          <span className="ml-1 opacity-40">({registrationCount} ACTIVE)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-6 rounded-[24px] border border-primary/5 space-y-6 shadow-sm">
                    <h5 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                      <Info className="h-4 w-4" />
                      Protocol Specifications
                    </h5>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-card border border-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary opacity-60" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                              Temporal Window
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {event.date}{' '}
                              {event.end_date &&
                                event.end_date !== event.date &&
                                ` to ${event.end_date}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-card border border-primary/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary opacity-60" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                              Operational Hour
                            </p>
                            <p className="text-xs font-bold text-foreground">{event.time}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-card border border-primary/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary opacity-60" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                              Deployment Matrix
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {event.location || 'SPECIFICATION PENDING'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-card border border-primary/10 flex items-center justify-center">
                            <Banknote className="h-5 w-5 text-primary opacity-60" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                              Monetary Protocol
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {event.is_paid
                                ? `PAID: GHS ${event.registration_fee?.toFixed(2)}`
                                : 'FREE ACCESS'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-primary/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-2">
                        Protocol Summary
                      </p>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                        {event.description ||
                          'Access manifest for this digital protocol is currently in preparation. All systems parameters are being calibrated for optimal deployment.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {canEdit && (
                      <Button
                        onClick={() => navigate(`/admin/event/${event.id}/dashboard`)}
                        className="w-full bg-primary text-white h-14 rounded-2xl font-black text-xs tracking-[0.25em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all border-b-4 border-primary-foreground/20 active:border-b-0 active:translate-y-1"
                      >
                        <Zap className="mr-3 h-5 w-5 fill-white" />
                        LAUNCH COMMAND CENTER
                      </Button>
                    )}
                    {event.requires_registration && (
                      <Button
                        onClick={() => onRegister(event)}
                        className="flex-1 bg-muted/40 h-14 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-primary/5 transition-all border border-primary/10"
                      >
                        INITIALIZE REGISTRATION
                      </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => onManageRegistrations(event)}
                          className="flex-1 bg-card h-14 border border-primary/10 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-primary/5 transition-all"
                        >
                          <Users className="mr-3 h-4 w-4 text-primary" />
                          MANAGE ATTENDEES
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onManageQuotas(event)}
                          className="flex-1 bg-card h-14 border border-primary/10 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-primary/5 transition-all"
                        >
                          <Globe className="mr-3 h-4 w-4 text-primary" />
                          MANAGE QUOTAS
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
