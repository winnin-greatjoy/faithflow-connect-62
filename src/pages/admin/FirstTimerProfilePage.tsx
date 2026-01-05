import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Clock,
  Sparkles,
  MessageSquare,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useBranches } from '@/hooks/useBranches';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FirstTimerData {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  service_date: string;
  first_visit: string | null;
  invited_by: string | null;
  community: string | null;
  area: string | null;
  street: string | null;
  public_landmark: string | null;
  status: 'new' | 'contacted' | 'followed_up' | 'converted';
  follow_up_status: 'pending' | 'completed' | 'called' | 'visited';
  follow_up_notes: string | null;
  notes: string | null;
  branch_id: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}

export const FirstTimerProfilePage: React.FC = () => {
  const { timerId } = useParams<{ timerId: string }>();
  const navigate = useNavigate();
  const { branches } = useBranches();

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name || 'Branch';
  };

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FirstTimerData | null>(null);

  useEffect(() => {
    const fetchFirstTimer = async () => {
      if (!timerId) return;
      try {
        setLoading(true);
        const { data: ftData, error } = await supabase
          .from('first_timers')
          .select('*')
          .eq('id', timerId)
          .single();

        if (error) throw error;
        setData(ftData);
      } catch (error) {
        console.error('Error loading first timer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstTimer();
  }, [timerId]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-[2rem]" />
          <Skeleton className="h-48 w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <Card className="bg-card rounded-2xl border border-primary/10 shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-primary/20 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-foreground">Visitor Not Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The record you are looking for does not exist or has been purged.
            </p>
            <Button variant="ghost" className="mt-6" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Sector
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      contacted: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      followed_up: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      converted: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    };
    return variants[status] || 'bg-primary/10 text-primary border-primary/20';
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="hover:bg-primary/5 rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matrix
        </Button>

        <div className="flex gap-2">
          <Button
            className="bg-primary h-10 px-6 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all text-xs text-white"
            onClick={() => navigate(`/admin/members`, { state: { editingTimer: data } })}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modify Protocol
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border border-primary/10 rounded-3xl overflow-hidden relative shadow-sm">
          <div className="absolute top-0 right-0 p-8">
            <Sparkles className="h-12 w-12 text-primary opacity-5 animate-pulse" />
          </div>

          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all shadow-2xl">
                  <AvatarFallback className="text-4xl font-serif bg-primary/5 text-primary">
                    {getInitials(data.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
                    {data.full_name}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border shadow-sm',
                        getStatusColor(data.status)
                      )}
                    >
                      {data.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.2em] bg-muted/30 border border-primary/10 text-muted-foreground shadow-sm"
                    >
                      {data.follow_up_status} Follow-up
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.2em] bg-primary/5 text-primary border-none shadow-sm"
                    >
                      {getBranchName(data.branch_id)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                  <div className="flex items-center justify-center md:justify-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {data.email || 'Communication identity missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {data.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {[data.street, data.community, data.area].filter(Boolean).join(', ') ||
                        'Territory unmapped'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Initial Encounter: {format(new Date(data.service_date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intelligence / Notes */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <Card className="glass border-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-6">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Intelligence & Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                    Follow-up Protocols
                  </h4>
                  <div className="p-6 rounded-[1.5rem] bg-muted/40 border border-primary/5 min-h-[100px] text-sm leading-relaxed text-foreground/80 italic">
                    {data.follow_up_notes || 'No follow-up signals recorded for this visitor.'}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                    General Dossier
                  </h4>
                  <div className="p-6 rounded-[1.5rem] bg-muted/40 border border-primary/5 min-h-[100px] text-sm leading-relaxed text-foreground/80">
                    {data.notes ||
                      'Standard visitor profile. No unique behavioral patterns identified.'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Encounter Matrix */}
        <motion.div variants={itemVariants} className="space-y-8">
          <Card className="bg-primary border-primary/20 rounded-3xl overflow-hidden text-white shadow-md">
            <CardHeader className="p-6 border-b border-white/10">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Encounter Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  Invited By
                </div>
                <div className="font-serif text-lg font-bold">
                  {data.invited_by || 'Organic Discovery'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  First Visit Signal
                </div>
                <div className="font-serif text-lg font-bold">
                  {data.first_visit
                    ? format(new Date(data.first_visit), 'PPP')
                    : format(new Date(data.service_date), 'PPP')}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  Operational Anchor
                </div>
                <div className="font-serif text-lg font-bold">{getBranchName(data.branch_id)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  Created At
                </div>
                <div className="font-serif text-lg font-bold">
                  {format(new Date(data.created_at), 'PPP')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-6 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">
                System Lifecycle
              </div>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <Clock className="h-12 w-12 text-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">Active Tracking</div>
                <p className="text-xs text-muted-foreground mt-1">
                  This visitor is currently under strategic follow-up protocols.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
