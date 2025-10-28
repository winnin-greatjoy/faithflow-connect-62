import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  UserPlus,
  Settings,
  ArrowRight,
  Search,
  X,
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CommitteeWorkspace } from '@/components/committee/CommitteeWorkspace';
import { cn } from '@/lib/utils';

/* ===========================================================================
   MessageComposer (inline component)
   - Accessible dialog-based composer
   - Props: open, onOpenChange, recipientsCount, initialMessage, onSend (async)
   =========================================================================== */
interface MessageComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientsCount: number;
  initialMessage?: string;
  onSend: (message: string) => Promise<void>;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  open,
  onOpenChange,
  recipientsCount,
  initialMessage = '',
  onSend,
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Sync initialMessage when opened
  useEffect(() => {
    if (open) setMessage(initialMessage);
  }, [open, initialMessage]);

  const handleSend = async () => {
    if (!message.trim() || recipientsCount === 0 || isSending) return;
    setIsSending(true);
    try {
      await onSend(message.trim());
      toast({
        title: 'Message sent',
        description: `Sent to ${recipientsCount} recipient${recipientsCount !== 1 ? 's' : ''}.`,
      });
      setMessage('');
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Send failed',
        description: 'Unable to send message. Try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setMessage(''); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px] w-full p-0 bg-transparent">
        <div className={cn('bg-white rounded-lg shadow-xl overflow-hidden mx-4 sm:mx-auto sm:mt-6 flex flex-col')}>
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="text-sm font-medium">
              Message to {recipientsCount} {recipientsCount === 1 ? 'recipient' : 'recipients'}
            </div>
            <button
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[140px] resize-none"
              aria-label="Message content"
            />
          </div>

          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">Cancel</Button>

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending || recipientsCount === 0}
              type="button"
              className="flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ===========================================================================
   MensMinistryDashboard component (main)
   =========================================================================== */
export const MensMinistryDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { ministryId: ministryParam } = useParams();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);
  const [selectedCommitteeName, setSelectedCommitteeName] = useState<string>('');
  const [ministryId, setMinistryId] = useState<string | null>(null);
  const [ministriesList, setMinistriesList] = useState<Array<{ id: string; name: string }>>([]);
  const [members, setMembers] = useState<Array<{
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    committeeAssignments: string[];
    dateJoined: string;
    isActive: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [financeRecords, setFinanceRecords] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});
  const [committees, setCommittees] = useState<Array<{
    id: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    head_member_id?: string | null;
    meeting_schedule?: string | null;
  }>>([]);
  const [ministryMembers, setMinistryMembers] = useState<Array<{ id: string; name: string }>>([]);

  // Add Member modal state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberCandidates, setMemberCandidates] = useState<Array<{ id: string; name: string; email?: string | null }>>([]);
  const [selectedMemberIdToAdd, setSelectedMemberIdToAdd] = useState<string | null>(null);
  const [addMemberRole, setAddMemberRole] = useState('member');
  const [addMemberStatus, setAddMemberStatus] = useState('active');
  const [savingAddMember, setSavingAddMember] = useState(false);

  // Committee create/edit modal state
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [editingCommitteeId, setEditingCommitteeId] = useState<string | null>(null);
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cActive, setCActive] = useState(true);
  const [cHeadId, setCHeadId] = useState<string | undefined>(undefined);
  const [cMeeting, setCMeeting] = useState('');
  const [savingCommittee, setSavingCommittee] = useState(false);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);
  
  // Filter members based on search term and role filter
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return members.filter(member => {
      const matchesSearch =
        !q ||
        member.fullName.toLowerCase().includes(q) ||
        (member.email && member.email.toLowerCase().includes(q));
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter, members]);

  // Handle member selection
  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  // Handle select all/none
  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };
  
  // Export members data to CSV (revokes URL)
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Join Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        `"${(member.fullName || '').replace(/"/g, '""')}"`,
        `"${(member.email || '').replace(/"/g, '""')}"`,
        `"${(member.phone || '')}"`,
        `"${(member.role || '').replace('_', ' ')}"`,
        `"${member.dateJoined}"`,
        `"${member.isActive ? 'Active' : 'Inactive'}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Compose / send logic
  const handleSendMessageClick = () => {
    if (selectedMembers.length > 0) {
      setIsMessageComposerOpen(true);
    } else {
      toast({ title: 'No recipients', description: 'Please select at least one member to message.' });
    }
  };

  const onSendMessage = async (messageText: string) => {
    if (selectedMembers.length === 0) {
      throw new Error('No recipients selected');
    }

    // Simulate an API call — replace with your real API integration
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Optionally: save the message to DB, etc.
    console.log('Sent message to', selectedMembers, 'message:', messageText);

    // Clear the selection after send
    setSelectedMembers([]);
  };

  // Temporary placeholder for Add Member action
  const handleAddMember = () => {
    setSelectedMemberIdToAdd(null);
    setMemberSearch('');
    setAddMemberRole('member');
    setAddMemberStatus('active');
    setShowAddMemberModal(true);
  };

  // Load member candidates when modal opens or search changes
  useEffect(() => {
    (async () => {
      if (!showAddMemberModal) return;
      // Fetch basic member list filtered by search term
      let query = supabase
        .from('members')
        .select('id, full_name, email')
        .order('full_name', { ascending: true })
        .limit(50);
      if (memberSearch.trim()) {
        // best-effort case-insensitive search
        query = query.ilike('full_name', `%${memberSearch.trim()}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.error(error);
        setMemberCandidates([]);
        return;
      }
      const excludeIds = new Set(ministryMembers.map(m => m.id));
      const candidates = (data || [])
        .filter((m: any) => !excludeIds.has(m.id))
        .map((m: any) => ({ id: m.id, name: m.full_name, email: m.email }));
      setMemberCandidates(candidates);
    })();
  }, [showAddMemberModal, memberSearch, ministryMembers]);

  const saveAddMember = async () => {
    if (!ministryId) {
      toast({ title: 'Missing ministry', description: 'No ministry selected', variant: 'destructive' });
      return;
    }
    if (!selectedMemberIdToAdd) {
      toast({ title: 'Select a member', description: 'Choose a member to add.' });
      return;
    }
    setSavingAddMember(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from('ministry_members')
        .insert({
          member_id: selectedMemberIdToAdd,
          ministry_id: ministryId,
          role: addMemberRole,
          status: addMemberStatus,
          joined_date: today,
        });
      if (error) throw error;
      const added = memberCandidates.find(m => m.id === selectedMemberIdToAdd);
      // Update light-weight local lists
      if (added) {
        setMinistryMembers(prev => [...prev, { id: added.id, name: added.name }]);
        setMembers(prev => [
          ...prev,
          {
            id: Math.floor(Math.random() * 1000000),
            fullName: added.name,
            email: added.email || '',
            phone: '',
            role: addMemberRole,
            committeeAssignments: [],
            dateJoined: today,
            isActive: addMemberStatus === 'active',
          }
        ]);
      }
      toast({ title: 'Member added', description: `${added?.name || 'Member'} was added to the ministry.` });
      setShowAddMemberModal(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Add failed', description: e?.message || 'Unable to add member', variant: 'destructive' });
    } finally {
      setSavingAddMember(false);
    }
  };

  // Calculate stats (memoized)
  const stats = useMemo(() => ({
    totalMembers: members.filter(m => m.isActive).length,
    totalCommittees: committees.length,
    monthlyContributions: 0,
    activePledges: 0,
    upcomingEvents: 0,
    publishedArticles: 0
  }), [members, committees]);

  // helper to create a stable numeric id from uuid
  const toLocalId = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) + 1;
  };

  // Load ministry and members
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Select a ministry to scope the dashboard; fallback to first available
        const { data: mins } = await supabase.from('ministries').select('id, name').order('created_at');
        setMinistriesList(mins || []);
        const candidate = (ministryParam as string | undefined) || null;
        const chosen = mins && mins.length > 0
          ? (candidate && mins.some(m => m.id === candidate) ? candidate : mins[0].id)
          : null;
        setMinistryId(chosen);
        if (!chosen) {
          setMembers([]);
          return;
        }

        const { data: mm } = await supabase
          .from('ministry_members')
          .select('id, role, status, joined_date, member:members(id, full_name, email, phone)')
          .eq('ministry_id', chosen)
          .order('joined_date', { ascending: false });

        const mapped = (mm || []).map((row: any) => ({
          id: toLocalId(row.id),
          fullName: row.member?.full_name || 'Unknown',
          email: row.member?.email || '',
          phone: row.member?.phone || '',
          role: row.role || 'member',
          committeeAssignments: [],
          dateJoined: row.joined_date || '',
          isActive: (row.status || 'active') === 'active',
        }));

        setMembers(mapped);

        // Build member name map and fetch finance records for these members
        const memberIds = (mm || [])
          .map((row: any) => row.member?.id)
          .filter((x: any) => !!x);
        const nameMap: Record<string, string> = {};
        const mmembers: Array<{ id: string; name: string }> = [];
        (mm || []).forEach((row: any) => {
          if (row.member?.id) nameMap[row.member.id] = row.member.full_name || 'Unknown';
          if (row.member?.id) mmembers.push({ id: row.member.id, name: row.member.full_name || 'Unknown' });
        });
        setMemberMap(nameMap);
        setMinistryMembers(mmembers);

        if (memberIds.length > 0) {
          const { data: fr } = await supabase
            .from('finance_records')
            .select('id, amount, category, description, transaction_date, type, member_id')
            .in('member_id', memberIds as string[])
            .order('transaction_date', { ascending: false });
          setFinanceRecords(fr || []);
        } else {
          setFinanceRecords([]);
        }

        // Load ministry events
        const { data: ev } = await supabase
          .from('ministry_events')
          .select('id, title, description, event_date, start_time, end_time, location')
          .eq('ministry_id', chosen)
          .order('event_date', { ascending: false });
        setEvents(ev || []);

        // Load committees for this ministry
        const { data: cms } = await supabase
          .from('committees')
          .select('id, name, description, is_active, head_member_id, meeting_schedule')
          .eq('ministry_id', chosen)
          .order('created_at', { ascending: false });
        setCommittees(cms || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [ministryParam]);

  const reloadCommittees = async () => {
    if (!ministryId) return;
    const { data: cms, error } = await supabase
      .from('committees')
      .select('id, name, description, is_active, head_member_id, meeting_schedule')
      .eq('ministry_id', ministryId)
      .order('created_at', { ascending: false });
    if (!error) setCommittees(cms || []);
  };

  // Reload core ministry data when ministryId changes
  useEffect(() => {
    (async () => {
      if (!ministryId) return;
      setLoading(true);
      try {
        const { data: mm } = await supabase
          .from('ministry_members')
          .select('id, role, status, joined_date, member:members(id, full_name, email, phone)')
          .eq('ministry_id', ministryId)
          .order('joined_date', { ascending: false });

        const mapped = (mm || []).map((row: any) => ({
          id: toLocalId(row.id),
          fullName: row.member?.full_name || 'Unknown',
          email: row.member?.email || '',
          phone: row.member?.phone || '',
          role: row.role || 'member',
          committeeAssignments: [],
          dateJoined: row.joined_date || '',
          isActive: (row.status || 'active') === 'active',
        }));
        setMembers(mapped);

        const memberIds = (mm || [])
          .map((row: any) => row.member?.id)
          .filter((x: any) => !!x);
        const nameMap: Record<string, string> = {};
        const mmembers: Array<{ id: string; name: string }> = [];
        (mm || []).forEach((row: any) => {
          if (row.member?.id) nameMap[row.member.id] = row.member.full_name || 'Unknown';
          if (row.member?.id) mmembers.push({ id: row.member.id, name: row.member.full_name || 'Unknown' });
        });
        setMemberMap(nameMap);
        setMinistryMembers(mmembers);

        if (memberIds.length > 0) {
          const { data: fr } = await supabase
            .from('finance_records')
            .select('id, amount, category, description, transaction_date, type, member_id')
            .in('member_id', memberIds as string[])
            .order('transaction_date', { ascending: false });
          setFinanceRecords(fr || []);
        } else {
          setFinanceRecords([]);
        }

        const { data: ev } = await supabase
          .from('ministry_events')
          .select('id, title, description, event_date, start_time, end_time, location')
          .eq('ministry_id', ministryId)
          .order('event_date', { ascending: false });
        setEvents(ev || []);

        await reloadCommittees();
      } finally {
        setLoading(false);
      }
    })();
  }, [ministryId]);

  const openCreateCommittee = () => {
    if (!ministryId) {
      toast({ title: 'Select a ministry', description: 'Please select a ministry before creating a committee.' });
      return;
    }
    setEditingCommitteeId(null);
    setCName('');
    setCDesc('');
    setCActive(true);
    setCHeadId(undefined);
    setCMeeting('');
    setShowCommitteeModal(true);
  };

  const openEditCommittee = (c: { id: string; name: string; description?: string | null; is_active: boolean; head_member_id?: string | null; meeting_schedule?: string | null; }) => {
    setEditingCommitteeId(c.id);
    setCName(c.name || '');
    setCDesc(c.description || '');
    setCActive(!!c.is_active);
    setCHeadId(c.head_member_id || undefined);
    setCMeeting(c.meeting_schedule || '');
    setShowCommitteeModal(true);
  };

  const saveCommittee = async () => {
    if (!ministryId) {
      toast({ title: 'Missing ministry', description: 'No ministry selected', variant: 'destructive' });
      return;
    }
    if (!cName.trim()) {
      toast({ title: 'Name required', description: 'Please enter a committee name', variant: 'destructive' });
      return;
    }
    setSavingCommittee(true);
    try {
      if (editingCommitteeId) {
        const { error } = await supabase
          .from('committees')
          .update({
            name: cName.trim(),
            description: cDesc || null,
            is_active: cActive,
            head_member_id: cHeadId || null,
            meeting_schedule: cMeeting || null,
          })
          .eq('id', editingCommitteeId);
        if (error) throw error;
        toast({ title: 'Committee updated', description: 'Changes saved.' });
      } else {
        const { error } = await supabase
          .from('committees')
          .insert({
            ministry_id: ministryId,
            name: cName.trim(),
            description: cDesc || null,
            is_active: cActive,
            head_member_id: cHeadId || null,
            meeting_schedule: cMeeting || null,
          });
        if (error) throw error;
        toast({ title: 'Committee created', description: 'A new committee has been added.' });
      }
      setShowCommitteeModal(false);
      await reloadCommittees();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Save failed', description: e?.message || 'Unable to save committee', variant: 'destructive' });
    } finally {
      setSavingCommittee(false);
    }
  };

  // Finance derived metrics
  const totalContributions = financeRecords.filter(r => r.type === 'income').reduce((s, r) => s + (r.amount || 0), 0);
  const totalExpenses = financeRecords.filter(r => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0);
  const netBalance = totalContributions - totalExpenses;

  // If a committee is selected, show the workspace (now using real UUID + name)
  if (selectedCommittee !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCommittee(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            Men's Ministry
          </Button>
          <ArrowRight className="h-4 w-4" />
          <span>{selectedCommitteeName || 'Committee'}</span>
        </div>
        <CommitteeWorkspace 
          committeeId={selectedCommittee} 
          committeeName={selectedCommitteeName || 'Committee'}
          userRole="head"
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-1 md:p-1">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/departments')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Men's Ministry Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage the Men's Ministry operations, committees, and activities.
            </p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Ministry Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <div className="bg-blue-50 p-1.5 rounded-full">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Members</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <div className="bg-green-50 p-1.5 rounded-full">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Committees</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalCommittees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">£{stats.monthlyContributions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <div className="bg-purple-50 p-1.5 rounded-full">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pledges</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.activePledges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <div className="bg-orange-50 p-1.5 rounded-full">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Events</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <div className="bg-red-50 p-1.5 rounded-full">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Publications</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.publishedArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gray-200 overflow-x-auto pb-1 -mx-1 px-1">
          <TabsList className="w-full inline-flex h-10 items-center justify-start p-0.5 bg-transparent">
            <TabsTrigger value="overview" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="members" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">Members</TabsTrigger>
            <TabsTrigger value="committees" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">Committees</TabsTrigger>
            <TabsTrigger value="finance" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">Finance</TabsTrigger>
            <TabsTrigger value="publications" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">Publications</TabsTrigger>
            <TabsTrigger value="events" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">Events</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2" onClick={handleAddMember}>
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Add Member</span>
            </Button>
            <Button variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Record Payment</span>
            </Button>
            <Button variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">New Publication</span>
            </Button>
            <Button variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">New Event</span>
            </Button>
          </div>
          {/* Leadership Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Leadership Structure</CardTitle>
              <CardDescription>Current ministry leadership and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.filter(m => m.role !== 'member' && m.role !== 'committee_member').map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{leader.fullName}</h4>
                      <p className="text-sm text-gray-600">{leader.role.replace('_', ' ')}</p>
                    </div>
                    <Badge variant="outline">{leader.role.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New publication: "Men's Ministry Monthly Newsletter - January 2024"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">£200 pledge payment received from David Clark</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Men's Prayer Breakfast scheduled for January 21</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Member Modal */}
        <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add Member to Ministry</DialogTitle>
              <DialogDescription>Select an existing member and assign a role/status.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Search Members</Label>
                <div className="mt-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    className="pl-8"
                    placeholder="Type name..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Member</Label>
                <Select value={selectedMemberIdToAdd || ''} onValueChange={(v) => setSelectedMemberIdToAdd(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {memberCandidates.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No results</div>
                    )}
                    {memberCandidates.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{m.name}</span>
                          {m.email && <span className="ml-2 text-xs text-muted-foreground">{m.email}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Role</Label>
                  <Select value={addMemberRole} onValueChange={setAddMemberRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="leader">Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={addMemberStatus} onValueChange={setAddMemberStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>Cancel</Button>
              <Button onClick={saveAddMember} disabled={savingAddMember || !selectedMemberIdToAdd} className="flex items-center gap-2">
                {savingAddMember && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Committee Modal (global) */}
        <Dialog open={showCommitteeModal} onOpenChange={(v) => setShowCommitteeModal(v)}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>{editingCommitteeId ? 'Edit Committee' : 'Create Committee'}</DialogTitle>
              <DialogDescription>
                {editingCommitteeId ? 'Update committee details' : 'Create a new committee for this ministry'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Events Committee" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="What is this committee responsible for?" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Head</Label>
                  <Select value={cHeadId || ''} onValueChange={(v) => setCHeadId(v === '__none' ? undefined : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select head" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Unassigned</SelectItem>
                      {ministryMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Meeting schedule</Label>
                  <Input value={cMeeting} onChange={(e) => setCMeeting(e.target.value)} placeholder="e.g. First Monday monthly" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="active" checked={cActive} onCheckedChange={(v) => setCActive(!!v)} />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommitteeModal(false)}>Cancel</Button>
              <Button onClick={saveCommittee} disabled={savingCommittee || !cName.trim()} className="flex items-center gap-2">
                {savingCommittee && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-lg font-medium">Ministry Members</h3>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={exportToCSV} 
                  className="w-full sm:w-auto"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSendMessageClick}
                  className={`w-full sm:w-auto ${selectedMembers.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                  disabled={selectedMembers.length === 0}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {selectedMembers.length > 0 ? `Send Message (${selectedMembers.length})` : 'Send Message'}
                </Button>
                <Button size="sm" className="w-full sm:w-auto" onClick={handleAddMember}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Member
                </Button>
              </div>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="leader">Leaders</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                  <SelectItem value="committee_member">Committee Members</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => selectedMembers.length > 0 ? setSelectedMembers([]) : null}
                className={`w-full sm:w-auto ${selectedMembers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={selectedMembers.length === 0}
              >
                {selectedMembers.length > 0 ? `Clear (${selectedMembers.length})` : 'Select Members'}
              </Button>
            </div>

            {/* MessageComposer (replaces old Dialog) */}
            <MessageComposer
              open={isMessageComposerOpen}
              onOpenChange={setIsMessageComposerOpen}
              recipientsCount={selectedMembers.length}
              initialMessage=""
              onSend={onSendMessage}
            />

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 hidden sm:table-header-group">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="select-all"
                              checked={selectedMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                              onCheckedChange={toggleSelectAll}
                              className="h-4 w-4"
                            />
                            <label htmlFor="select-all" className="cursor-pointer">
                              Member
                            </label>
                          </div>
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Committees</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="block sm:table-row border-b last:border-0 hover:bg-gray-50">
                          <td className="block sm:table-cell px-4 py-3 sm:py-4">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id={`member-${member.id}`}
                                checked={selectedMembers.includes(member.id)}
                                onCheckedChange={() => toggleMemberSelection(member.id)}
                                className="h-4 w-4 flex-shrink-0"
                              />
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                                {member.fullName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{member.fullName}</div>
                                <div className="text-xs text-gray-500 truncate">{member.email}</div>
                              </div>
                            </div>
                            
                            {/* Mobile view - additional info */}
                            <div className="sm:hidden mt-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Role:</span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {member.role.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Committees:</span>
                                <div className="text-right">
                                  {member.committeeAssignments.slice(0, 2).map((committee, index) => (
                                    <Badge key={index} variant="secondary" className="text-[10px] h-5 ml-1 mb-1">
                                      {committee}
                                    </Badge>
                                  ))}
                                  {member.committeeAssignments.length > 2 && (
                                    <Badge variant="secondary" className="text-[10px] h-5 ml-1">
                                      +{member.committeeAssignments.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Joined:</span>
                                <span className="text-xs text-gray-700">{member.dateJoined}</span>
                              </div>
                              <div className="flex justify-end space-x-1 pt-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </td>
                          
                          {/* Desktop view - individual cells */}
                          <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs">
                              {member.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {member.committeeAssignments.map((committee, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {committee}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.dateJoined}
                          </td>
                          <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex space-x-1 justify-end">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Committees Tab */}
        <TabsContent value="committees" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-medium">Committees</h3>
            <Button size="sm" className="w-full sm:w-auto" onClick={openCreateCommittee} disabled={!ministryId}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Committee
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {committees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg">
                      {committee.name}
                    </CardTitle>
                    <Badge 
                      variant={committee.is_active ? 'default' : 'secondary'}
                      className="h-5 text-xs"
                    >
                      {committee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {committee.description && (
                    <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                      {committee.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">Head: </span>
                      <span className="ml-1 truncate">
                        {committee.head_member_id 
                          ? (memberMap[committee.head_member_id] || 'TBD')
                          : 'TBD'}
                      </span>
                    </div>
                    {committee.meeting_schedule && (
                      <div className="flex items-start">
                        <Calendar className="h-3.5 w-3.5 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Meeting: </span>
                          <span className="text-gray-700">
                            {committee.meeting_schedule}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setSelectedCommittee(committee.id); setSelectedCommitteeName(committee.name); }}
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                      <span className="truncate">Open Workspace</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                      title="Edit committee"
                      onClick={() => openEditCommittee(committee)}
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {committees.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-600 border border-dashed rounded-lg">
                <p className="text-sm">No committees defined yet.</p>
              </div>
            )}
          </div>

          
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-medium">Financial Management</h3>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Record Contribution
            </Button>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Total Contributions</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">£{totalContributions.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs sm:text-sm text-gray-600">Pledged</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total pledged amount from members for the current period</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">£0</p>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs sm:text-sm text-gray-600">Expenses</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total expenses incurred this period</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">£{totalExpenses.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs sm:text-sm text-gray-600">Balance</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current net balance (Income - Expenses)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className={`text-lg sm:text-2xl font-bold ${netBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    £{Math.abs(netBalance).toLocaleString()}
                    {netBalance < 0 && ' (Deficit)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contributions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeRecords.filter(r => r.type === 'income').map((contribution) => (
                      <tr key={contribution.id} className="border-b">
                        <td className="p-2">{contribution.transaction_date ? new Date(contribution.transaction_date).toISOString().slice(0,10) : ''}</td>
                        <td className="p-2">
                          {memberMap[contribution.member_id] || 'Member'}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{(contribution.category || contribution.type || '').toString().replace('_',' ')}</Badge>
                        </td>
                        <td className="p-2 font-medium">£{(contribution.amount || 0).toLocaleString()}</td>
                        <td className="p-2 text-sm text-gray-600">{contribution.description || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publications Tab */}
        <TabsContent value="publications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Publications & News</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Publication
            </Button>
          </div>
          
          <div className="text-center py-8 text-gray-600 border border-dashed rounded-lg">
            <p className="text-sm">Publications module pending CMS schema integration.</p>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Events & Programs</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.event_date}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{event.description || ''}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location: </span>
                      {event.location || 'TBD'}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
};

export default MensMinistryDashboard;
