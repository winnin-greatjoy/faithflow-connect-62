import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EventCalendar } from '@/components/shared/EventCalendar';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <CalendarIcon className="w-8 h-8" />
            </div>
            Church Calendar
          </h1>
          <p className="text-muted-foreground mt-1 font-sans">
            Comprehensive schedule of all church activities, services, and gatherings.
          </p>
        </div>
      </div>

      <Card className="bg-card border border-primary/10 shadow-xl overflow-hidden min-h-[800px] flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="flex-1 min-h-[700px]">
            <EventCalendar showCard={false} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CalendarPage;
