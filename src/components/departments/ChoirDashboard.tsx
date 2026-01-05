import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChoirSchedule } from './choir/ChoirSchedule';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Music,
  Mic,
  Clock,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { choirApi } from '@/services/departments/choirApi';
import { supabase } from '@/integrations/supabase/client';
import type { DepartmentMember, DepartmentStats, ChoirMember } from '@/types/api';
import { DepartmentTaskBoard } from './DepartmentTaskBoard';
import { ChoirSettingsDialog } from '../choir/ChoirSettingsDialog';
import { ImportMembersDialog } from '../choir/ImportMembersDialog';
import { downloadMemberTemplate } from '../choir/utils/csvTemplates';
import { AddSongDialog } from '../choir/AddSongDialog';
import { SongCard, type Song } from '../choir/SongCard';
import { ScheduleRehearsalDialog } from '../choir/ScheduleRehearsalDialog';

interface ChoirDashboardProps {
  departmentId: string;
}

interface ChoirEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  attendees: number;
  status: string;
  rehearsal_type?: string;
  songs?: string[];
}

interface NewMember {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'widowed' | 'divorced';
  voicePart: 'soprano' | 'alto' | 'tenor' | 'bass';
  yearsExperience: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const ChoirDashboard: React.FC<ChoirDashboardProps> = ({ departmentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceFilter, setVoiceFilter] = useState<'all' | ChoirMember['voice_part']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DepartmentMember['status']>('all');

  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedMember, setSelectedMember] = useState<ChoirMember | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isScheduleRehearsalOpen, setIsScheduleRehearsalOpen] = useState(false);

  // Repertoire states
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  // form / UI states
  const [newMember, setNewMember] = useState<NewMember>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    voicePart: 'soprano',
    yearsExperience: 0,
    status: 'pending',
  });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResult, membersResult, eventsResult] = await Promise.all([
          choirApi.getChoirStats(),
          choirApi.getChoirMembers({ sort: { field: 'assigned_date', direction: 'desc' } }),
          choirApi.getPerformanceHistory(),
        ]);

        // Make choirApi return shape consistent: { data, error }
        if (statsResult?.error) throw new Error(statsResult.error.message || 'Stats error');
        if (membersResult?.error) throw new Error(membersResult.error.message || 'Members error');
        if (eventsResult?.error) throw new Error(eventsResult.error.message || 'Events error');

        setStats(statsResult.data ?? null);
        setMembers(membersResult.data ?? []);
        setEvents(eventsResult.data ?? []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  // Load songs from repertoire
  useEffect(() => {
    const loadSongs = async () => {
      setLoadingSongs(true);
      try {
        const { data, error } = await supabase
          .from('choir_repertoire')
          .select('*')
          .eq('department_id', departmentId)
          .order('title');

        if (error) throw error;
        setSongs(data || []);
      } catch (err: any) {
        console.error('Failed to load songs:', err.message);
      } finally {
        setLoadingSongs(false);
      }
    };

    loadSongs();
  }, [departmentId]);

  // Flatten + enrich members into ChoirMember shape for UI usage
  const choirMembers: ChoirMember[] = useMemo(() => {
    return members.map((m) => {
      const voice_part = (m as any).voice_part
        ? ((m as any).voice_part as ChoirMember['voice_part'])
        : 'soprano';
      const years_experience = (m as any).years_experience ?? 0;
      const attendance_rate = (m as any).attendance_rate ?? 0;
      const id = (m as any).id ?? (m as any).member?.id ?? Math.random().toString(36).slice(2);
      const status = (m as any).status ?? (m as any).member?.status ?? 'active';
      const full_name = m?.member?.full_name ?? (m as any).full_name ?? 'Unknown';
      const email = m?.member?.email ?? (m as any).email ?? null;

      return {
        ...(m as any),
        id,
        voice_part,
        years_experience,
        attendance_rate,
        status,
        full_name,
        email,
      } as ChoirMember;
    });
  }, [members]);

  // Transform events into ChoirEvent
  const choirEvents: ChoirEvent[] = useMemo(() => {
    return (events || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: e.type || 'Service',
      attendees: e.attendees || 0,
      status: e.status || 'completed',
      rehearsal_type: e.rehearsal_type || 'Full Rehearsal',
      songs: e.songs || [],
    }));
  }, [events]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return choirMembers.filter((m) => {
      const matchesSearch =
        !term ||
        m.member?.full_name?.toLowerCase().includes(term) ||
        m.member?.email?.toLowerCase().includes(term);
      const matchesVoice = voiceFilter === 'all' || m.voice_part === voiceFilter;
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesVoice && matchesStatus;
    });
  }, [choirMembers, searchTerm, voiceFilter, statusFilter]);

  const quickActions = [
    {
      label: 'Add Singer',
      icon: UserPlus,
      onClick: () => setIsAddOpen(true),
      variant: 'default' as const,
    },
    {
      label: 'Schedule Rehearsal',
      icon: Calendar,
      onClick: () => setIsScheduleRehearsalOpen(true),
      variant: 'outline' as const,
    },
    {
      label: 'Add Song',
      icon: Music,
      onClick: () => setIsAddSongOpen(true),
      variant: 'outline' as const,
    },
    {
      label: 'Import Members',
      icon: Upload,
      onClick: () => setIsImportOpen(true),
      variant: 'outline' as const,
    },
  ];

  const handleBack = () => navigate('/admin/departments');

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Voice Part', 'Role', 'Experience', 'Status', 'Attendance'],
      ...choirMembers.map((m) => [
        m.member?.full_name || '',
        m.member?.email || '',
        m.voice_part,
        'Choir Member', // Default role since role property doesn't exist on ChoirMember
        m.years_experience || 0,
        m.status,
        m.attendance_rate || 0,
      ]),
    ]
      .map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'choir_members.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: 'Choir members exported as CSV.' });
  };

  // Save edits to selected member
  const handleSaveMember = async (updates: Partial<ChoirMember>) => {
    if (!selectedMember) return;
    try {
      setSaving(true);
      const result = await choirApi.updateChoirMember(selectedMember.id, {
        voice_part: updates.voice_part ?? selectedMember.voice_part,
        years_experience: updates.years_experience ?? selectedMember.years_experience,
        status: updates.status ?? selectedMember.status,
      });
      if (result?.error) throw new Error(result.error.message);

      toast({ title: 'Saved', description: 'Member updated' });

      // optimistic local update
      setMembers((prev) =>
        prev.map((m) => ((m as any).id === selectedMember.id ? { ...(m as any), ...updates } : m))
      );
      setIsEditOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to save changes: ' + (err.message || err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete member
  const handleDelete = async (memberId: string) => {
    if (!confirm('Delete this choir member? This cannot be undone.')) return;
    try {
      setDeletingId(memberId);
      const apiResult = await choirApi.removeChoirMember(memberId);
      if (apiResult?.error)
        throw new Error(apiResult.error.message || 'Failed to remove choir member');

      // Optimistic UI update
      setMembers((prev) => prev.filter((m) => (m as any).id !== memberId));
      toast({ title: 'Deleted', description: 'Member removed from choir' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete member: ' + (err.message || err),
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Add new member
  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.phone.trim() || !newMember.dateOfBirth.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name, Phone, Date of Birth)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAdding(true);

      // First, check if a member with this email already exists (only if email is provided)
      let existingMember = null;
      if (newMember.email && newMember.email.trim()) {
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('email', newMember.email.trim())
          .maybeSingle();

        existingMember = member;
      }

      let memberId: string;

      if (existingMember) {
        memberId = existingMember.id;
        console.log('Found existing member with ID:', memberId);

        // Update existing member's department to choir if not already set
        const { error: updateError } = await supabase
          .from('members')
          .update({ assigned_department: 'choir' })
          .eq('id', memberId);

        if (updateError) {
          console.error('Failed to update existing member department:', updateError);
          // Don't throw error here, member already exists
        }
      } else {
        // Create new member if they don't exist and ensure branch-level RLS compliance
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('You must be signed in to add a member.');
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('branch_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error('Could not load your profile to determine branch.');
        }

        const branchId = (profile as any)?.branch_id as string | null;
        if (!branchId) {
          throw new Error(
            'Your user profile is not assigned to a branch. Please contact an admin.'
          );
        }

        const { data: newMemberRecord, error: memberError } = await supabase
          .from('members')
          .insert({
            full_name: newMember.name.trim(),
            email: newMember.email?.trim() || null,
            phone: newMember.phone.trim(),
            assigned_department: 'choir',
            date_joined: new Date().toISOString().split('T')[0],
            date_of_birth: newMember.dateOfBirth || '1990-01-01',
            status: 'active' as const,
            branch_id: branchId,
            created_by: user.id,
            area: '',
            community: '',
            street: '',
            public_landmark: '',
            gender: newMember.gender as 'male' | 'female',
            marital_status: newMember.maritalStatus as
              | 'single'
              | 'married'
              | 'widowed'
              | 'divorced',
            membership_level: 'convert' as const,
          })
          .select('id')
          .single();

        if (memberError) {
          console.error('Member creation error:', memberError);
          throw new Error('Failed to create member: ' + memberError.message);
        }

        if (!newMemberRecord) {
          throw new Error('Failed to create member: No data returned');
        }

        memberId = newMemberRecord.id;
        console.log('Created new member with ID:', memberId);

        // Just update the member's assigned_department field instead of creating assignment record
        const { error: updateError } = await supabase
          .from('members')
          .update({ assigned_department: 'choir' })
          .eq('id', memberId);
      }

      toast({ title: 'Success', description: 'Member added to choir' });

      // Reset form and close modal
      setNewMember({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male',
        maritalStatus: 'single',
        voicePart: 'soprano',
        yearsExperience: 0,
        status: 'pending',
      });
      setIsAddOpen(false);

      // Refresh data
      window.location.reload(); // Simple refresh for now
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to add member: ' + (err.message || err),
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Departments
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Choir Department Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage choir members, rehearsals, performances, and musical activities.
          </p>
        </div>
        <Button onClick={() => setIsSettingsOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Choir Settings
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Members',
            value: stats?.totalMembers || choirMembers.length || 0,
            icon: Users,
            color: 'blue',
          },
          {
            label: 'Active Singers',
            value:
              stats?.activeMembers || choirMembers.filter((m) => m.status === 'approved').length,
            icon: Music,
            color: 'emerald',
          },
          {
            label: 'Events',
            value: stats?.upcomingEvents || choirEvents.length || 0,
            icon: Calendar,
            color: 'amber',
          },
          {
            label: 'Activities',
            value: stats?.completedActivities || 0,
            icon: Activity,
            color: 'violet',
          },
          {
            label: 'Growth',
            value: `+${stats?.monthlyGrowth || 0}%`,
            icon: TrendingUp,
            color: 'indigo',
          },
          {
            label: 'Budget',
            value: `${stats?.budgetUtilization || 0}%`,
            icon: FileText,
            color: 'rose',
          },
        ].map((stat, idx) => (
          <Card
            key={idx}
            className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`bg-muted/50 p-2.5 rounded-xl group-hover:bg-${stat.color}-500/10 transition-colors duration-300`}
                >
                  <stat.icon
                    className={`h-4 w-4 text-muted-foreground group-hover:text-${stat.color}-600 transition-colors`}
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-foreground leading-none mt-0.5">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="h-20 flex-col space-y-2"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="repertoire">Repertoire</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Part Distribution</CardTitle>
              <CardDescription>Current distribution of singers by voice part</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['soprano', 'alto', 'tenor', 'bass'].map((voice) => {
                  const count = choirMembers.filter(
                    (m) => m.voice_part === voice && m.status === 'approved'
                  ).length;
                  const icons = { soprano: Music, alto: Mic, tenor: Music, bass: Mic };
                  const Icon = (icons as any)[voice];
                  return (
                    <div
                      key={voice}
                      className="text-center p-6 bg-muted/30 rounded-2xl border border-primary/5 group hover:bg-primary/5 transition-colors duration-300"
                    >
                      <div className="h-10 w-10 rounded-xl bg-background border border-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-2xl font-black text-foreground">{count}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                        {voice}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Performances</CardTitle>
              <CardDescription>Latest choir performances and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {choirEvents
                  .filter((e) => e.status === 'completed')
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 border border-primary/5 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {event.date} • {event.attendees} attendees
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      >
                        {event.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Rehearsals</CardTitle>
              <CardDescription>Next scheduled choir practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {choirEvents
                  .filter((e) => e.status === 'upcoming' || e.type === 'service')
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {event.date} • {event.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-primary">
                          {event.attendees} singers
                        </div>
                        <div className="text-[10px] uppercase tracking-tight text-muted-foreground/70">
                          {event.songs?.length || 0} songs
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Choir Members</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm" onClick={() => setIsAddOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Singer
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadMemberTemplate()}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Members
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export List
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search singers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={voiceFilter} onValueChange={(v: any) => setVoiceFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by voice part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voice Parts</SelectItem>
                <SelectItem value="soprano">Soprano</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
                <SelectItem value="tenor">Tenor</SelectItem>
                <SelectItem value="bass">Bass</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Singer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voice Part
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.member.full_name}
                            </div>
                            <div className="text-sm text-gray-500">{member.member.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="capitalize">
                            {member.voice_part}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Choir Member
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.years_experience} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.attendance_rate}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${member.attendance_rate}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={member.status === 'approved' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsViewOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4 inline" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4 inline" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(member.id)}>
                                  <Trash2 className="mr-2 h-4 w-4 inline" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repertoire */}
        <TabsContent value="repertoire" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Song Repertoire</h3>
            <Button size="sm" onClick={() => setIsAddSongOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Song
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search songs..."
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loadingSongs ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-300 animate-spin" />
                  <p>Loading repertoire...</p>
                </div>
              </CardContent>
            </Card>
          ) : songs.filter(
              (s) =>
                s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
                s.composer.toLowerCase().includes(songSearch.toLowerCase())
            ).length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium mb-1">
                    {songSearch ? 'No songs found' : 'No songs in repertoire'}
                  </p>
                  <p className="text-sm mb-4">
                    {songSearch
                      ? 'Try adjusting your search'
                      : 'Add your first song to get started'}
                  </p>
                  {!songSearch && (
                    <Button size="sm" onClick={() => setIsAddSongOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Song
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs
                .filter(
                  (s) =>
                    s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
                    s.composer.toLowerCase().includes(songSearch.toLowerCase())
                )
                .map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onEdit={(s) => {
                      // For now, just notify - could create EditSongDialog later
                      toast({ title: 'Edit Song', description: `Editing ${s.title}` });
                    }}
                    onDelete={async (songId) => {
                      if (!confirm('Delete this song from repertoire?')) return;
                      try {
                        const { error } = await supabase
                          .from('choir_repertoire')
                          .delete()
                          .eq('id', songId);
                        if (error) throw error;
                        setSongs(songs.filter((s) => s.id !== songId));
                        toast({ title: 'Deleted', description: 'Song removed from repertoire' });
                      } catch (err: any) {
                        toast({
                          title: 'Error',
                          description: err.message || 'Failed to delete song',
                          variant: 'destructive',
                        });
                      }
                    }}
                    onMarkPerformed={async (songId) => {
                      try {
                        const song = songs.find((s) => s.id === songId);
                        if (!song) return;

                        const { error } = await supabase
                          .from('choir_repertoire')
                          .update({
                            last_performed: new Date().toISOString(),
                            performance_count: song.performance_count + 1,
                          })
                          .eq('id', songId);

                        if (error) throw error;

                        setSongs(
                          songs.map((s) =>
                            s.id === songId
                              ? {
                                  ...s,
                                  last_performed: new Date().toISOString(),
                                  performance_count: s.performance_count + 1,
                                }
                              : s
                          )
                        );

                        toast({
                          title: 'Updated',
                          description: `Marked ${song.title} as performed`,
                        });
                      } catch (err: any) {
                        toast({
                          title: 'Error',
                          description: err.message || 'Failed to update song',
                          variant: 'destructive',
                        });
                      }
                    }}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <ChoirSchedule ministryId={departmentId} />
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Choir Reports</h3>
            <Button size="sm" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Reports and analytics coming soon</p>
                <p className="text-sm">View attendance, performance metrics, and growth reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <DepartmentTaskBoard departmentId={departmentId} canEdit={true} />
        </TabsContent>
      </Tabs>

      {/* View Member Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Singer</DialogTitle>
            <DialogDescription>View detailed information about this choir member</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-sm">{selectedMember.member.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{selectedMember.member.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Voice Part</Label>
                  <p className="text-sm capitalize">{selectedMember.voice_part}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant={selectedMember.status === 'approved' ? 'default' : 'secondary'}>
                    {selectedMember.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Experience</Label>
                  <p className="text-sm">{selectedMember.years_experience} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Attendance</Label>
                  <p className="text-sm">{selectedMember.attendance_rate}%</p>
                </div>
              </div>
              {selectedMember.member.phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-sm">{selectedMember.member.phone}</p>
                </div>
              )}
              {selectedMember.member.date_joined && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                  <p className="text-sm">{selectedMember.member.date_joined}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Singer</DialogTitle>
            <DialogDescription>Update singer information and settings</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={selectedMember.member.full_name} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={selectedMember.member.email || ''} disabled />
                </div>
                <div>
                  <Label>Voice Part</Label>
                  <Select
                    value={selectedMember.voice_part}
                    onValueChange={(v: any) =>
                      setSelectedMember({ ...selectedMember, voice_part: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soprano">Soprano</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="tenor">Tenor</SelectItem>
                      <SelectItem value="bass">Bass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedMember.status}
                    onValueChange={(v: any) => setSelectedMember({ ...selectedMember, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleSaveMember({
                      voice_part: selectedMember.voice_part,
                      status: selectedMember.status,
                      years_experience: selectedMember.years_experience,
                    })
                  }
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Singer</DialogTitle>
            <DialogDescription>Add a new member to the choir department</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={newMember.dateOfBirth}
                  onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={newMember.gender}
                  onValueChange={(v: any) => setNewMember({ ...newMember, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marital Status</Label>
                <Select
                  value={newMember.maritalStatus}
                  onValueChange={(v: any) => setNewMember({ ...newMember, maritalStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Voice Part *</Label>
                <Select
                  value={newMember.voicePart}
                  onValueChange={(v: any) => setNewMember({ ...newMember, voicePart: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soprano">Soprano</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="tenor">Tenor</SelectItem>
                    <SelectItem value="bass">Bass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={newMember.yearsExperience}
                  onChange={(e) =>
                    setNewMember({ ...newMember, yearsExperience: Number(e.target.value) })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={
                  !newMember.name.trim() ||
                  !newMember.phone.trim() ||
                  !newMember.dateOfBirth.trim() ||
                  adding
                }
              >
                {adding ? 'Adding...' : 'Add Singer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Choir Settings Dialog */}
      <ChoirSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        departmentId={departmentId}
      />

      {/* Import Members Dialog */}
      <ImportMembersDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={() => window.location.reload()}
      />

      {/* Schedule Rehearsal Dialog */}
      <ScheduleRehearsalDialog
        open={isScheduleRehearsalOpen}
        onOpenChange={setIsScheduleRehearsalOpen}
        departmentId={departmentId}
        onRehearsalScheduled={() => {
          toast({ title: 'Success', description: 'Rehearsal scheduled successfully' });
        }}
      />

      {/* Add Song Dialog */}
      <AddSongDialog
        open={isAddSongOpen}
        onOpenChange={setIsAddSongOpen}
        departmentId={departmentId}
        onSongAdded={async () => {
          // Reload songs
          const { data } = await supabase
            .from('choir_repertoire')
            .select('*')
            .eq('department_id', departmentId)
            .order('title');
          setSongs(data || []);
        }}
      />
    </div>
  );
};
