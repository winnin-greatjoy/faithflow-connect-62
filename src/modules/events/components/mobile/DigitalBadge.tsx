import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle2, ShieldCheck, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EventRecord } from '@/services/eventsApi';
import type { EventRegistration } from '@/services/registrationsApi';
import { QRCodeSVG } from 'qrcode.react';

interface DigitalBadgeProps {
  event: EventRecord | null;
  registration: EventRegistration | null;
}

const getInitials = (name?: string | null) =>
  (name || 'FaithFlow')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'FF';

export const DigitalBadge: React.FC<DigitalBadgeProps> = ({ event, registration }) => {
  const attendeeName = registration?.name || 'Guest User';
  const roleText = registration?.member_id ? 'Registered Member' : 'Guest Registration';
  const registrationStatus = registration?.status || 'not_registered';
  const qrValue = JSON.stringify({
    event_id: event?.id || null,
    registration_id: registration?.id || null,
    name: attendeeName,
    status: registrationStatus,
  });

  return (
    <div className="p-6 pb-24 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm relative group perspective-1000">
        <div className="relative transform transition-transform duration-500 preserve-3d">
          <Card className="bg-white rounded-[32px] overflow-hidden shadow-2xl border-none relative z-10">
            {/* Badge Header */}
            <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center pt-8 pb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
              <div className="relative z-10">
                <h3 className="text-white font-serif font-black text-2xl tracking-wide">
                  FaithFlow
                </h3>
                <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                  Connect '26
                </p>
              </div>

              {/* Profile Image Float */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full border-4 border-white bg-gray-200 shadow-lg flex items-center justify-center text-2xl font-bold text-gray-500">
                {getInitials(attendeeName)}
              </div>
            </div>

            {/* Badge Body */}
            <div className="pt-14 pb-8 px-6 text-center space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{attendeeName}</h2>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {roleText}
                </p>
              </div>

              <div className="py-2">
                {registration ? (
                  <Badge
                    className={
                      registrationStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest'
                        : registrationStatus === 'waitlist'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest'
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-none px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest'
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {registrationStatus}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 border-none px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    Not Registered
                  </Badge>
                )}
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mx-auto w-48 h-48 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                {registration ? (
                  <QRCodeSVG value={qrValue} size={128} />
                ) : (
                  <QrCode className="h-32 w-32 text-gray-900 opacity-40" />
                )}
              </div>

              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {registration ? 'Scan for Access' : 'Registration Required'}
              </p>
            </div>

            {/* Wallet Actions */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-10 rounded-xl text-xs font-bold border-gray-200 bg-white shadow-sm"
              >
                <Utensils className="h-3.5 w-3.5 mr-2 text-orange-500" />
                Meal Pass
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl text-xs font-bold border-gray-200 bg-white shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-2 text-blue-500" />
                Clearance
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-8 text-xs text-center text-muted-foreground/60 max-w-[200px]">
        {event
          ? `Valid for ${event.title}`
          : 'This digital ID renders you eligible for verified zones.'}
      </p>
    </div>
  );
};
