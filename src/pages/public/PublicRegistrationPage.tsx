import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, ArrowRight, Share2, Info } from 'lucide-react';
import { RegistrationWizard } from '@/modules/events/components/registration/public/RegistrationWizard';
import { motion, AnimatePresence } from 'framer-motion';

export const PublicRegistrationPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Mock Event Data
  const event = {
    name: 'Global Leadership Summit 2026',
    date: 'Oct 12-14, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Accra International Conference Center',
    description:
      'Join over 5,000 leaders for a transformative 3-day experience. Featuring world-class speakers, breakout sessions, and networking opportunities.',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070',
    capacity: 94,
  };

  if (isRegistering) {
    return <RegistrationWizard eventName={event.name} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Hero Image Section */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <img
          src={event.image}
          alt="Event Cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-8 left-8 z-20 text-white p-4">
          <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
            Featured Event
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            {event.name}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 md:h-screen overflow-y-auto bg-white p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Key Details */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Date & Time</h3>
                <p className="text-muted-foreground">{event.date}</p>
                <p className="text-muted-foreground text-sm">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Location</h3>
                <p className="text-muted-foreground">{event.location}</p>
                <a href="#" className="text-sm text-blue-600 font-medium hover:underline">
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          <div className="prose prose-gray">
            <h3 className="font-bold text-lg mb-2">About Event</h3>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          {/* Capacity Indicator */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
              <span>Tickets Remaining</span>
              <span>Few Left</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[94%]" />
            </div>
            <p className="text-xs text-orange-600 mt-2 font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" /> Registration closes soon
            </p>
          </div>

          {/* Action Bar */}
          <div className="pt-8 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold rounded-xl shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all"
              onClick={() => setIsRegistering(true)}
            >
              Register Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" className="flex-1 rounded-xl">
                <Info className="mr-2 h-4 w-4" /> Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
