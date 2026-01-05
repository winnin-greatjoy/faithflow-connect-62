import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EventItem } from '../types';
import { cn } from '@/lib/utils';

interface EventListItemProps {
  event: EventItem;
  canEdit: boolean;
  onView: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onDelete: (id: string) => void;
  onRegister: (event: EventItem) => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  canEdit,
  onView,
  onEdit,
  onDelete,
  onRegister,
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'NATIONAL':
        return 'bg-rose-500';
      case 'DISTRICT':
        return 'bg-blue-500';
      case 'BRANCH':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Upcoming':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Active':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'Ended':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} layout>
      <Card className="bg-card group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border border-primary/10">
        <div
          className={cn('absolute left-0 top-0 w-1.5 h-full', getLevelColor(event.event_level))}
        />

        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-black tracking-widest text-white border-transparent',
                    getLevelColor(event.event_level)
                  )}
                >
                  {event.event_level}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-primary/20 bg-primary/5"
                >
                  {event.type}
                </Badge>
                {event.is_paid ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-amber-500/20 bg-amber-500/5 text-amber-600"
                  >
                    PAID: GHS {event.registration_fee?.toFixed(2)}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                  >
                    FREE
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn('text-[10px] font-bold', getStatusColor(event.status))}
                >
                  {event.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h4 className="text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1 italic max-w-2xl">
                  {event.description || 'No digital summary provided for this protocol activation.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary opacity-60" />
                  <span>{event.date}</span>
                  {event.end_date && event.end_date !== event.date && (
                    <>
                      <span className="opacity-40">→</span>
                      <span>{event.end_date}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary opacity-60" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary opacity-60" />
                  <span>{event.location || 'REMOTE / HQ'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="flex flex-1 lg:flex-none gap-2">
                {event.requires_registration && (
                  <Button
                    size="sm"
                    onClick={() => onRegister(event)}
                    className="flex-1 lg:flex-none bg-primary text-white h-10 px-6 rounded-xl font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] transition-all"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(event)}
                  className="flex-1 lg:flex-none bg-card h-10 px-6 rounded-xl font-bold border border-primary/20 hover:bg-primary/5 transition-all shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-2 text-primary" />
                  View
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-primary/10"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border border-primary/10 rounded-2xl p-2 w-48 shadow-xl"
                >
                  <DropdownMenuItem
                    disabled={!canEdit}
                    onClick={() => onEdit(event)}
                    className="rounded-xl py-3 cursor-pointer focus:bg-primary/10"
                  >
                    <Edit className="h-4 w-4 mr-3 text-blue-500" />
                    <span className="font-bold">Modify Protocol</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!canEdit}
                    onClick={() => onDelete(event.id)}
                    className="rounded-xl py-3 cursor-pointer focus:bg-rose-500/10 text-rose-500"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    <span className="font-bold">Terminate Entry</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
