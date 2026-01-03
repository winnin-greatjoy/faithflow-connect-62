import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthz } from '@/hooks/useAuthz';
import {
  Users,
  Calendar,
  BookOpen,
  User,
  FileText,
  Bell,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Event = Database['public']['Tables']['events']['Row'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { roles } = useAuthz();

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);
  const [notificationsCount, setNotificationsCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingEvents(true);
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        const end = endDate.toISOString().slice(0, 10);

        const { data: evs, error } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', start)
          .lte('event_date', end)
          .order('event_date', { ascending: true })
          .limit(20);

        if (error) console.error('Error fetching events', error);
        if (mounted) setEvents(evs || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    })();

    (async () => {
      if (!user?.id) return;
      try {
        const today = new Date();
        const start = today.toISOString().slice(0, 10);

        try {
          const { count, error } = await supabase
            .from('event_rsvps')
            .select('id,events(event_date)', { count: 'exact', head: false })
            .eq('member_id', user.id)
            .gte('events.event_date', start);

          if (!error) setRsvpCount(count ?? 0);
        } catch (e) {
          const { count } = await supabase
            .from('event_rsvps')
            .select('id', { count: 'exact', head: false })
            .eq('member_id', user.id);
          setRsvpCount(count ?? 0);
        }
        setNotificationsCount(0);
      } catch (e) {
        console.error(e);
        if (mounted) {
          setRsvpCount(null);
          setNotificationsCount(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const stats = [
    {
      title: 'My Membership',
      value: roles?.[0] || 'Member',
      sub: 'Active Status',
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Upcoming RSVPs',
      value: rsvpCount === null ? '—' : rsvpCount,
      sub: 'Event Attendance',
      icon: Calendar,
      color: 'purple',
      gradient: 'from-purple-500/20 to-pink-500/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'New Alerts',
      value: notificationsCount === null ? '0' : notificationsCount,
      sub: 'Recently Received',
      icon: Bell,
      color: 'amber',
      gradient: 'from-amber-500/20 to-orange-500/20',
      text: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Departments',
      value: '2',
      sub: 'Active Roles',
      icon: BookOpen,
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto space-y-8 max-w-7xl pb-10"
    >
      {/* Welcome Hero Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass dark:bg-black/20 border-primary/10"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 tracking-wide uppercase"
          >
            <Sparkles className="w-3 h-3" />
            Member Portal Experience
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-vibrant-blue to-purple-500 bg-clip-text text-transparent leading-tight mb-4">
            Welcome Home, <br className="hidden sm:block" />{' '}
            {user?.user_metadata?.firstName || 'Friend'}.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground/80 leading-relaxed font-sans max-w-xl">
            Experience the fullness of faith and community. We're thrilled to have you as part of
            our family!
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/portal/calendar">
              <Button
                size="lg"
                className="rounded-full bg-vibrant-gradient hover:opacity-90 transition-all font-sans px-8 h-12"
              >
                Join an Event
              </Button>
            </Link>
            <Link to="/portal/streaming">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full glass hover:bg-white/10 font-sans border-primary/20 px-8 h-12"
              >
                Watch Live
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5 }} className="group">
            <Card className="glass dark:bg-black/30 border-primary/5 hover-glow overflow-hidden relative border-none">
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity',
                  stat.gradient
                )}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 pb-2 relative z-10">
                <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn('p-2 rounded-xl bg-white/50 dark:bg-black/30', stat.text)}>
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 relative z-10">
                <div className={cn('text-2xl sm:text-4xl font-bold font-serif', stat.text)}>
                  {stat.value}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70 font-sans mt-1 uppercase tracking-wider font-semibold">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'My Journey', to: '/portal/profile', icon: User, desc: 'Profile & Membership' },
          {
            label: 'Service Units',
            to: '/portal/departments',
            icon: BookOpen,
            desc: 'Groups & Ministries',
          },
          {
            label: 'Upcoming Events',
            to: '/portal/events',
            icon: FileText,
            desc: 'RSVPs & Calendar',
          },
        ].map((action, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Link to={action.to} className="block group">
              <Button
                variant="outline"
                className="w-full h-24 sm:h-32 glass border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center gap-3 p-6 transition-all group-hover:bg-primary/[0.02]"
              >
                <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="text-center">
                  <span className="text-sm sm:text-lg font-bold block">{action.label}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-tighter sm:tracking-normal">
                    {action.desc}
                  </span>
                </div>
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Events & Activity Detail Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">
        {/* Upcoming Events Column */}
        <motion.div variants={itemVariants} className="xl:col-span-3">
          <Card className="glass dark:bg-black/20 border-primary/5 h-full overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/5 border-b border-primary/5 px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Church Calendar
                  </CardTitle>
                  <CardDescription>Upcoming gatherings for the next 30 days</CardDescription>
                </div>
                <Link to="/portal/calendar">
                  <Button variant="ghost" size="sm" className="text-primary gap-1 font-bold">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loadingEvents ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="h-12 w-12 bg-muted rounded-2xl" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4 opacity-50">
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-sans">
                    No scheduled events for the near future.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {events.map((ev) => {
                    const dateObj = new Date(ev.event_date!);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleString('default', { month: 'short' });
                    const weekday = dateObj.toLocaleString('default', { weekday: 'short' });

                    return (
                      <motion.div
                        key={ev.id}
                        whileHover={{ x: 5 }}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-all border border-transparent hover:border-primary/10"
                      >
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-vibrant-gradient text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-xs uppercase font-bold leading-none mb-0.5">
                            {month}
                          </span>
                          <span className="text-xl font-bold leading-none">{day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-bold font-serif truncate">
                            {ev.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {weekday}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {ev.location}
                              </span>
                            )}
                            {ev.start_time && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> {ev.start_time}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={`/portal/events/${ev.id}`}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full bg-primary/5 hover:bg-primary text-primary hover:text-white transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed Column */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="glass dark:bg-black/20 border-primary/5 h-full flex flex-col shadow-xl">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Latest Updates
              </CardTitle>
              <CardDescription>Stay updated with church happenings</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y divide-primary/5">
                {[
                  {
                    title: 'Department Approved',
                    icon: BookOpen,
                    date: '2 days ago',
                    color: 'primary',
                    desc: 'You are now part of the Choir Department!',
                  },
                  {
                    title: 'RSVPs Confirmed',
                    icon: Calendar,
                    date: '5 days ago',
                    color: 'amber',
                    desc: 'Your ticket for Youth Rally is active.',
                  },
                  {
                    title: 'Streaming Access',
                    icon: Sparkles,
                    date: '1 week ago',
                    color: 'purple',
                    desc: 'New sermons available in high definition.',
                  },
                ].map((act, i) => (
                  <div
                    key={i}
                    className="px-6 py-6 hover:bg-primary/[0.01] transition-colors relative group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12',
                          'bg-primary/5 text-primary dark:bg-primary/20'
                        )}
                      >
                        <act.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm sm:text-base font-bold truncate">{act.title}</p>
                          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                            {act.date}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                          {act.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-6 bg-gradient-to-t from-primary/5 to-transparent border-t border-primary/5">
              <Link to="/portal/notifications" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full glass hover:bg-primary/5 border-primary/20 font-bold"
                >
                  View All Notifications
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
