import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EventIncident } from '@/services/incidentsApi';

interface VenueMapViewProps {
  zones: any[];
  incidents: EventIncident[];
  responders: any[]; // onDutyStaff with currentZone info
}

export const VenueMapView: React.FC<VenueMapViewProps> = ({ zones, incidents, responders }) => {
  // Map zones to a grid or flex layout
  // We'll use a responsive grid that looks like a floor plan

  const getZoneIncidents = (zoneName: string) => {
    return incidents.filter(
      (i) =>
        i.status === 'open' && i.location_details?.toLowerCase().includes(zoneName.toLowerCase())
    );
  };

  const getZoneResponders = (zoneName: string) => {
    return responders.filter(
      (r) => r.isCheckedIn && r.currentZone?.toLowerCase() === zoneName.toLowerCase()
    );
  };

  if (!zones || zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl bg-secondary/10">
        <MapPin className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-serif font-bold">No Venue Zones Defined</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Define zones in the Attendance module to enable the spatial map view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const zoneIncidents = getZoneIncidents(zone.name);
          const zoneResponders = getZoneResponders(zone.name);
          const isHot = zoneIncidents.length > 0;

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden h-48 border-2 transition-all duration-500',
                  isHot
                    ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)] bg-red-50/50 dark:bg-red-950/20'
                    : 'border-transparent hover:border-primary/20'
                )}
              >
                {/* Background Zone Label */}
                <div className="absolute -bottom-4 -right-2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none uppercase italic font-black text-6xl select-none">
                  {zone.name}
                </div>

                <div className="p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif font-bold text-lg">{zone.name}</h4>
                      {isHot && (
                        <Badge className="bg-red-500 animate-pulse border-none">
                          {zoneIncidents.length} EMERGENCY
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {zone.current_occupancy || 0} / {zone.capacity || '∞'} People
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldAlert
                          className={cn(
                            'h-3 w-3',
                            zoneResponders.length > 0 ? 'text-emerald-500' : 'text-amber-500'
                          )}
                        />
                        <span>{zoneResponders.length} Responders</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Avatars of responders in this zone */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {zoneResponders.map((r) => (
                        <div
                          key={r.id}
                          title={r.full_name}
                          className="inline-block h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-secondary flex items-center justify-center text-[10px] font-black overflow-hidden"
                        >
                          {r.avatar_url ? (
                            <img
                              src={r.avatar_url}
                              alt={r.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            r.full_name.charAt(0)
                          )}
                        </div>
                      ))}
                      {zoneResponders.length === 0 && (
                        <div className="text-[10px] text-muted-foreground italic">
                          No units stationed here
                        </div>
                      )}
                    </div>

                    {/* Incident Types in this zone */}
                    {isHot && (
                      <div className="flex gap-2 mt-2">
                        {zoneIncidents.map((i) => (
                          <div
                            key={i.id}
                            className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shadow-sm border border-red-200 dark:border-red-800"
                          >
                            {i.type === 'medical' && (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            {i.type === 'security' && (
                              <ShieldAlert className="h-4 w-4 text-indigo-600" />
                            )}
                            {i.type === 'fire' && <Sparkles className="h-4 w-4 text-orange-600" />}
                            {i.type !== 'medical' && i.type !== 'security' && i.type !== 'fire' && (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
