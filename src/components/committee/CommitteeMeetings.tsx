
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CommitteeMeeting } from '@/types/committee';
import { supabase } from '@/integrations/supabase/client';

interface CommitteeMeetingsProps {
  committeeId: string | number;
  userRole: string;
  canManage: boolean;
}

export const CommitteeMeetings = ({ committeeId, userRole, canManage }: CommitteeMeetingsProps) => {
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);

  const toLocalId = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) + 1;
  };

  useEffect(() => {
    (async () => {
      const cid: any = committeeId as any;
      const { data: committeeRow } = await (supabase as any)
        .from('committees')
        .select('ministry_id')
        .eq('id', String(cid))
        .single();
      const ministryId = committeeRow?.ministry_id;
      if (!ministryId) { setMeetings([]); return; }

      const { data } = await (supabase as any)
        .from('ministry_events')
        .select('id, title, event_date, start_time, end_time, location, description')
        .eq('ministry_id', ministryId)
        .order('event_date', { ascending: false });

      const today = new Date().toISOString().slice(0, 10);
      const mapped: CommitteeMeeting[] = (data || []).map((e: any) => ({
        id: toLocalId(e.id),
        title: e.title,
        date: e.event_date,
        startTime: e.start_time || '',
        endTime: e.end_time || '',
        location: e.location || '',
        agenda: [],
        attendees: [],
        minutes: '',
        decisions: [],
        followUpTasks: [],
        status: e.event_date < today ? 'completed' : 'scheduled',
      }));
      setMeetings(mapped);
    })();
  }, [committeeId]);

  const getStatusIcon = (status: CommitteeMeeting['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'scheduled':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: CommitteeMeeting['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStats = (attendees: CommitteeMeeting['attendees']) => {
    const present = attendees.filter(a => a.status === 'present').length;
    const total = attendees.length;
    return { present, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meetings</h2>
        {canManage && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {meetings.map((meeting) => {
          const attendanceStats = getAttendanceStats(meeting.attendees);
          
          return (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(meeting.status)}
                      <span>{meeting.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{meeting.startTime} - {meeting.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{meeting.location}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(meeting.status)}>
                    {meeting.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Agenda */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Agenda
                  </h4>
                  <div className="space-y-2">
                    {meeting.agenda.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-sm font-medium">{item.item}</span>
                          <span className="text-xs text-gray-500 ml-2">({item.presenter})</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.duration}min
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Attendance
                    </span>
                    {meeting.status === 'completed' && (
                      <Badge variant="outline">
                        {attendanceStats.present}/{attendanceStats.total} ({attendanceStats.percentage}%)
                      </Badge>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meeting.attendees.map((attendee) => (
                      <div 
                        key={attendee.memberId} 
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                      >
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            attendee.status === 'present' ? 'bg-green-500' :
                            attendee.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="text-sm">{attendee.name}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            attendee.status === 'present' ? 'bg-green-50 text-green-700' :
                            attendee.status === 'late' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {attendee.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minutes & Decisions (for completed meetings) */}
                {meeting.status === 'completed' && (
                  <>
                    {meeting.minutes && (
                      <div>
                        <h4 className="font-medium mb-2">Minutes</h4>
                        <div className="p-3 bg-gray-50 rounded text-sm">
                          {meeting.minutes}
                        </div>
                      </div>
                    )}

                    {meeting.decisions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Decisions & Actions</h4>
                        <div className="space-y-2">
                          {meeting.decisions.map((decision) => (
                            <div key={decision.id} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                              <p className="text-sm font-medium">{decision.decision}</p>
                              <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                                <span>Responsible: {decision.responsible}</span>
                                {decision.deadline && (
                                  <span>Due: {new Date(decision.deadline).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {canManage && meeting.status === 'scheduled' && (
                    <>
                      <Button variant="outline" size="sm">
                        Edit Meeting
                      </Button>
                      <Button variant="outline" size="sm">
                        Record Attendance
                      </Button>
                    </>
                  )}
                  {canManage && meeting.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      Edit Minutes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by scheduling your first committee meeting.</p>
            {canManage && (
              <div className="mt-6">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule First Meeting
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
