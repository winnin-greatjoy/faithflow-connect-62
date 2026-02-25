import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Calendar, Clock, MapPin, Info, Banknote, Globe, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EventItem, EventLevel, EventType, EventStatus, Frequency } from '../../types';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventItem | null;
  onSubmit: (payload: any) => Promise<boolean>;
  initialLevel?: EventLevel;
  initialScopeId?: string | null;
}

export const EventFormDialog: React.FC<EventFormDialogProps> = ({
  open,
  onOpenChange,
  event,
  onSubmit,
  initialLevel = 'BRANCH',
  initialScopeId = null,
}) => {
  const [formData, setFormData] = useState<Partial<EventItem>>({});
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseDate = (iso: string) => {
    if (!iso) return new Date();
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  };

  const formatDateISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (event) {
      const startDate = parseDate(event.date);
      const endDate = parseDate(event.end_date || event.date);
      const daysDiff =
        Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      setFormData(event);
      setNumberOfDays(daysDiff);
    } else {
      const today = formatDateISO(new Date());
      setFormData({
        title: '',
        date: today,
        time: '10:00',
        location: '',
        capacity: 100,
        status: 'published',
        type: 'General',
        frequency: 'One-time',
        event_level: initialLevel,
        owner_scope_id: initialScopeId,
        end_date: today,
        visibility: 'public',
        target_audience: 'everyone',
        registration_fee: 0,
        is_paid: false,
        requires_registration: true,
      });
      setNumberOfDays(1);
    }
  }, [event, initialLevel, initialScopeId, open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-4xl bg-transparent border-none shadow-none p-0 overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-primary/10 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

              <div className="p-8">
                <DialogHeader className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <DialogTitle className="text-2xl font-serif font-black text-foreground">
                          {event ? 'Edit Event Details' : 'Create New Event'}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Configure event parameters and visibility
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

                <div className="space-y-8">
                  {/* Section 1: Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Info className="h-3 w-3" /> Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-full space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Event Name
                        </Label>
                        <div className="relative group">
                          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                          <Input
                            value={formData.title || ''}
                            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Enter descriptive event name..."
                            className="bg-card pl-12 h-12 rounded-xl border border-primary/10 font-bold focus:border-primary/20 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Category
                        </Label>
                        <Select
                          value={formData.type || 'General'}
                          onValueChange={(v: any) => setFormData((f) => ({ ...f, type: v }))}
                        >
                          <SelectTrigger className="bg-card h-12 rounded-xl border border-primary/10 font-bold shadow-sm">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-primary/10 rounded-2xl shadow-lg">
                            {[
                              'General',
                              'Retreat',
                              'Crusade',
                              'Conference',
                              'Leadership Meeting',
                              'Youth Meeting',
                              'Day With the Lord',
                              'Outreach',
                              'Combined Service',
                              'Registration',
                            ].map((t) => (
                              <SelectItem key={t} value={t} className="font-bold text-xs py-3">
                                {t.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Event Level
                        </Label>
                        <div className="h-12 flex items-center bg-muted/20 px-4 rounded-xl border border-primary/10">
                          <Badge
                            variant="outline"
                            className="font-black text-[10px] tracking-widest uppercase bg-primary text-white border-transparent"
                          >
                            {formData.event_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Time and Schedule */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Time & Schedule
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Start Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                          <Input
                            type="date"
                            value={formData.date || ''}
                            onChange={(e) => {
                              const startDate = parseDate(e.target.value);
                              const endDate = new Date(startDate);
                              endDate.setDate(startDate.getDate() + numberOfDays - 1);
                              setFormData((f) => ({
                                ...f,
                                date: e.target.value,
                                end_date: formatDateISO(endDate),
                              }));
                            }}
                            className="bg-card pl-12 h-12 rounded-xl border border-primary/10 font-bold shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Duration (Days)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={numberOfDays}
                          onChange={(e) => {
                            const days = parseInt(e.target.value) || 1;
                            setNumberOfDays(days);
                            if (formData.date) {
                              const startDate = parseDate(formData.date);
                              const endDate = new Date(startDate);
                              endDate.setDate(startDate.getDate() + days - 1);
                              setFormData((f) => ({
                                ...f,
                                numberOfDays: days,
                                end_date: formatDateISO(endDate),
                              }));
                            }
                          }}
                          className="bg-card h-12 rounded-xl border border-primary/10 font-bold shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Start Time
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                          <Input
                            type="time"
                            value={formData.time || '10:00'}
                            onChange={(e) => setFormData((f) => ({ ...f, time: e.target.value }))}
                            className="bg-card pl-12 h-12 rounded-xl border border-primary/10 font-bold shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Frequency
                        </Label>
                        <Select
                          value={formData.frequency || 'One-time'}
                          onValueChange={(v: any) => setFormData((f) => ({ ...f, frequency: v }))}
                        >
                          <SelectTrigger className="bg-card h-12 rounded-xl border border-primary/10 font-bold shadow-sm">
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-primary/10 rounded-2xl shadow-lg">
                            {['One-time', 'Weekly', 'Monthly', 'Yearly'].map((f) => (
                              <SelectItem key={f} value={f} className="font-bold text-xs py-3">
                                {f.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Location & Details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Location & Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-full space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Venue / Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                          <Input
                            value={formData.location || ''}
                            onChange={(e) =>
                              setFormData((f) => ({ ...f, location: e.target.value }))
                            }
                            placeholder="Specify venue or online link..."
                            className="bg-card pl-12 h-12 rounded-xl border border-primary/10 font-bold shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="col-span-full space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Event Description
                        </Label>
                        <Textarea
                          value={formData.description || ''}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, description: e.target.value }))
                          }
                          placeholder="Provide details about the event purpose and agenda..."
                          className="bg-card rounded-2xl border border-primary/10 font-medium min-h-[100px] p-4 focus:border-primary/20 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Registration & Finance */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Banknote className="h-3 w-3" /> Registration & Settings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-[20px] border border-primary/10">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">
                            Requires Registration
                          </Label>
                          <p className="text-[10px] text-muted-foreground">
                            Members must sign up to attend
                          </p>
                        </div>
                        <Switch
                          checked={formData.requires_registration}
                          onCheckedChange={(checked) =>
                            setFormData((f) => ({ ...f, requires_registration: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-[20px] border border-primary/10">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">Paid Event</Label>
                          <p className="text-[10px] text-muted-foreground">
                            This event requires a payment
                          </p>
                        </div>
                        <Switch
                          checked={formData.is_paid}
                          onCheckedChange={(checked) =>
                            setFormData((f) => ({ ...f, is_paid: checked }))
                          }
                        />
                      </div>

                      {formData.is_paid && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 col-span-full">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            Access Fee (GHS)
                          </Label>
                          <div className="relative">
                            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 opacity-60" />
                            <Input
                              type="number"
                              value={formData.registration_fee || 0}
                              onChange={(e) =>
                                setFormData((f) => ({
                                  ...f,
                                  registration_fee: parseFloat(e.target.value),
                                }))
                              }
                              className="bg-card pl-12 h-12 rounded-xl border border-primary/10 font-bold text-emerald-600 shadow-sm"
                            />
                          </div>
                        </div>
                      )}

                      <div className="col-span-full space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Visibility
                        </Label>
                        <div className="flex p-1 bg-muted/20 rounded-xl border border-primary/10">
                          <ToggleGroup
                            type="single"
                            value={formData.visibility || 'public'}
                            onValueChange={(v) =>
                              v && setFormData((f) => ({ ...f, visibility: v as any }))
                            }
                            className="w-full"
                          >
                            <ToggleGroupItem
                              value="public"
                              className="flex-1 rounded-lg text-xs font-bold py-2 data-[state=on]:bg-primary data-[state=on]:text-white"
                            >
                              <Globe className="h-3 w-3 mr-2" /> PUBLIC
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="private"
                              className="flex-1 rounded-lg text-xs font-bold py-2 data-[state=on]:bg-primary data-[state=on]:text-white"
                            >
                              <Users className="h-3 w-3 mr-2" /> INTERNAL
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-12 pt-6 border-t border-primary/5">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-12 px-8 rounded-xl font-bold hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary h-12 px-10 rounded-xl font-black text-white shadow-md hover:bg-primary/90 active:scale-95 transition-all text-xs uppercase tracking-widest"
                  >
                    {isSubmitting ? 'Processing...' : event ? 'Save Changes' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
