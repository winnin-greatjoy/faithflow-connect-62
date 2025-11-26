import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { getMembershipLevelDisplay } from '@/utils/membershipUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberData {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  profile_photo: string | null;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  membership_level: string;
  baptized_sub_level: string | null;
  leader_role: string | null;
  date_joined: string;
  status: string;
  branch_id: string;
  assigned_department: string | null;
  ministry: string | null;
  street: string;
  area: string;
  community: string;
  public_landmark: string | null;
}

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  notes: string | null;
  event_id: string | null;
  events: { title: string } | null;
}

interface RSVPRecord {
  id: string;
  status: string;
  guests_count: number;
  notes: string | null;
  created_at: string;
  events: {
    title: string;
    event_date: string;
    start_time: string | null;
    location: string | null;
  };
}

interface GivingRecord {
  id: string;
  amount: number;
  transaction_date: string;
  type: string;
  category: string;
  description: string | null;
}

interface ActivityItem {
  date: string;
  type: 'attendance' | 'rsvp' | 'giving' | 'join';
  description: string;
}

export const MemberProfilePage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [rsvps, setRSVPs] = useState<RSVPRecord[]>([]);
  const [giving, setGiving] = useState<GivingRecord[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!memberId) return;
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);

      // Fetch member data
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // Fetch attendance history
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          id,
          attendance_date,
          notes,
          event_id,
          events:event_id (title)
        `)
        .eq('member_id', memberId)
        .order('attendance_date', { ascending: false })
        .limit(20);

      if (!attendanceError) setAttendance(attendanceData || []);

      // Fetch event RSVPs
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select(`
          id,
          status,
          guests_count,
          notes,
          created_at,
          events:event_id (
            title,
            event_date,
            start_time,
            location
          )
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!rsvpError) setRSVPs(rsvpData || []);

      // Fetch giving records
      const { data: givingData, error: givingError } = await supabase
        .from('finance_records')
        .select('id, amount, transaction_date, type, category, description')
        .eq('member_id', memberId)
        .eq('type', 'income')
        .order('transaction_date', { ascending: false })
        .limit(20);

      if (!givingError) setGiving(givingData || []);

      // Build activity timeline
      const activityItems: ActivityItem[] = [];

      // Add join date
      if (memberData?.date_joined) {
        activityItems.push({
          date: memberData.date_joined,
          type: 'join',
          description: 'Joined the church'
        });
      }

      // Add attendance
      (attendanceData || []).forEach(att => {
        activityItems.push({
          date: att.attendance_date,
          type: 'attendance',
          description: att.events?.title ? `Attended ${att.events.title}` : 'Attended service'
        });
      });

      // Add RSVPs
      (rsvpData || []).forEach(rsvp => {
        activityItems.push({
          date: rsvp.created_at,
          type: 'rsvp',
          description: `RSVP ${rsvp.status} for ${rsvp.events.title}`
        });
      });

      // Add giving
      (givingData || []).forEach(gift => {
        activityItems.push({
          date: gift.transaction_date,
          type: 'giving',
          description: `Gave GHS ${gift.amount.toFixed(2)} - ${gift.category}`
        });
      });

      // Sort by date descending
      activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(activityItems.slice(0, 30));

    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Member not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalGiving = giving.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
      </div>

      {/* Member Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.profile_photo || ''} />
              <AvatarFallback className="text-2xl">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{member.full_name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                  <Badge variant="outline">
                    {getMembershipLevelDisplay(
                      member.membership_level as any,
                      member.baptized_sub_level || undefined,
                      member.leader_role || undefined
                    )}
                  </Badge>
                  {member.assigned_department && (
                    <Badge variant="secondary">{member.assigned_department}</Badge>
                  )}
                  {member.ministry && (
                    <Badge variant="secondary">{member.ministry}</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{member.street}, {member.area}, {member.community}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {format(new Date(member.date_joined), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendance</p>
                <p className="text-2xl font-bold">{attendance.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Event RSVPs</p>
                <p className="text-2xl font-bold">{rsvps.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Giving</p>
                <p className="text-2xl font-bold">GHS {totalGiving.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records</p>
              ) : (
                <div className="space-y-3">
                  {attendance.map(record => (
                    <div key={record.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">
                          {record.events?.title || 'Regular Service'}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.attendance_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsvps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              {rsvps.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No RSVP records</p>
              ) : (
                <div className="space-y-4">
                  {rsvps.map(rsvp => (
                    <div key={rsvp.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{rsvp.events.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(rsvp.events.event_date), 'MMM d, yyyy')}
                            {rsvp.events.start_time && ` at ${rsvp.events.start_time}`}
                          </p>
                          {rsvp.events.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {rsvp.events.location}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={rsvp.status === 'confirmed' ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {rsvp.status === 'confirmed' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {rsvp.status}
                        </Badge>
                      </div>
                      {rsvp.guests_count > 0 && (
                        <p className="text-sm">
                          <Users className="h-3 w-3 inline mr-1" />
                          {rsvp.guests_count} guest{rsvp.guests_count !== 1 ? 's' : ''}
                        </p>
                      )}
                      {rsvp.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{rsvp.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="giving" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giving History</CardTitle>
            </CardHeader>
            <CardContent>
              {giving.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No giving records</p>
              ) : (
                <div className="space-y-3">
                  {giving.map(record => (
                    <div key={record.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">GHS {record.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{record.category}</p>
                        {record.description && (
                          <p className="text-xs text-muted-foreground">{record.description}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.transaction_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activity records</p>
              ) : (
                <div className="relative space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                  {activities.map((activity, idx) => (
                    <div key={idx} className="relative flex gap-4 pl-8">
                      <div className="absolute left-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(activity.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
