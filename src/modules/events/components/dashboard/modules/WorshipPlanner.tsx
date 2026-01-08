import React from 'react';
import { Music2, ListMusic, Users, Clock, FileText, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const WorshipPlannerModule = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Flow */}
        <Card className="lg:col-span-2 p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-serif font-black">Execution Order</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                Live Service Setlist
              </p>
            </div>
            <Button className="bg-primary text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
              Add Element
            </Button>
          </div>

          <div className="space-y-4">
            {[
              { time: '09:00', label: 'Opening Prayer', duration: '5m', team: 'Elders' },
              { time: '09:05', label: 'Praise & Worship', duration: '25m', team: 'Choir' },
              { time: '09:30', label: 'Special Ministration', duration: '10m', team: 'Youth' },
              { time: '09:40', label: 'Sermon', duration: '45m', team: 'Pastor' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                <div className="text-xs font-black text-primary opacity-40">{item.time}</div>
                <div className="flex-1">
                  <h5 className="text-sm font-black text-foreground">{item.label}</h5>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {item.team}
                  </p>
                </div>
                <Badge variant="outline" className="h-6 text-[8px] font-black border-primary/10">
                  {item.duration}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Team & Resources */}
        <div className="space-y-6">
          <Card className="p-8 bg-primary rounded-[32px] text-white border-none shadow-2xl shadow-primary/20">
            <Music2 className="h-8 w-8 mb-4 opacity-40" />
            <h4 className="text-lg font-serif font-black mb-2">Chord Charts</h4>
            <p className="text-xs font-medium opacity-60 mb-6">
              Access lyrics and technical sheets for today's setlist.
            </p>
            <Button
              variant="ghost"
              className="w-full bg-white/10 hover:bg-white/20 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-none"
            >
              Open Media Library
            </Button>
          </Card>

          <Card className="p-8 bg-white rounded-[32px] border-none shadow-2xl shadow-primary/5">
            <Users className="h-6 w-6 text-primary mb-4" />
            <h4 className="text-sm font-black mb-4">Assigned Team</h4>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-xl bg-muted border-2 border-white flex items-center justify-center text-xs font-black text-primary shadow-sm"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
