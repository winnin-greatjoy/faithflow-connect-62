import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthz } from '@/hooks/useAuthz';
import { Users, Calendar, BookOpen, User, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { roles } = useAuthz();

  const [events, setEvents] = useState<any[]>([]);
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

    // Fetch RSVP and notification counts for the current user
    (async () => {
      if (!user?.id) return;
      try {
        // compute date range
        const today = new Date();
        const start = today.toISOString().slice(0, 10);

        // Try to count upcoming RSVPs by joining event_rsvps -> events
        try {
          const res: any = await (supabase as any)
            .from('event_rsvps')
            .select('id,event(event_date)', { count: 'exact', head: false })
            .eq('user_id', user.id)
            .gte('event.event_date', start);

          const { count, error } = res || {};

          if (!error) {
            setRsvpCount(count ?? 0);
          }
        } catch (e) {
          // fallback: count rsvps without filtering by date
          try {
            const res2: any = await (supabase as any)
              .from('event_rsvps')
              .select('id', { count: 'exact', head: false })
              .eq('user_id', user.id);
            setRsvpCount(res2.count ?? 0);
          } catch {
            setRsvpCount(null);
          }
        }

        // Notifications - count unread
        try {
          const res3: any = await (supabase as any)
            .from('notifications')
            .select('id', { count: 'exact', head: false })
            .eq('recipient_id', user.id)
            .eq('read', false);

          if (!res3.error) {
            setNotificationsCount(res3.count ?? 0);
          } else {
            setNotificationsCount(null);
          }
        } catch (e) {
          setNotificationsCount(null);
        }
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
  }, []);

  return (
    <div className="mx-auto space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Hello {user?.user_metadata?.firstName || 'Friend'},</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">We are very excited you got here, looking forward to meeting you and your family very soon!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">My Role</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold capitalize">{roles?.[0] || 'Member'}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active member</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Upcoming RSVPs</CardTitle>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{rsvpCount === null ? '—' : rsvpCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Events with your RSVP</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Notifications</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{notificationsCount === null ? '—' : notificationsCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Unread alerts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">My Departments</CardTitle>
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">—</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active assignments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <Link to="/portal/profile">
          <Button variant="outline" className="w-full h-16 sm:h-20 md:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">My Profile</span>
          </Button>
        </Link>
        <Link to="/portal/departments">
          <Button variant="outline" className="w-full h-16 sm:h-20 md:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">Departments</span>
          </Button>
        </Link>
        <Link to="/portal/events">
          <Button variant="outline" className="w-full h-16 sm:h-20 md:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">Events</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming events in 30 days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingEvents ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-sm text-gray-500">No upcoming events in the next 30 days</div>
            ) : (
              events.map((ev) => {
                const title = ev.title || ev.name || 'Event';
                const dateStr = ev.event_date ? new Date(ev.event_date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '';
                const timeStr = ev.start_time ? `${ev.start_time}${ev.end_time ? ' To ' + ev.end_time : ''}` : '';
                const key = ev.id || ev.event_id || title + dateStr;
                return (
                  <div key={key}>
                    <div className="text-sm font-medium text-blue-600">{title}</div>
                    <div className="text-xs text-gray-600">{dateStr}{timeStr ? ` | ${timeStr}` : ''}</div>
                  </div>
                );
              })
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Next 30 days</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {loadingEvents ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">Department Assignment Approved</p>
                        <p className="text-xs text-muted-foreground mt-0.5">You've been added to Choir Department</p>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap ml-2">2 days ago</div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">Event RSVP Confirmed</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Youth Rally - March 15th</p>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap ml-2">5 days ago</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
