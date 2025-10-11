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
import { useNavigate } from 'react-router-dom';
import {
  mockMinistryMembers, 
  mockCommittees, 
  mockContributions, 
  mockPledges,
  mockPublications,
  mockMinistryEvents,
  mockFinancialSummary 
} from '@/data/mockMinistryData';
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

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommittee, setSelectedCommittee] = useState<number | null>(null);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);
  
  // Filter members based on search term and role filter
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mockMinistryMembers.filter(member => {
      const matchesSearch =
        !q ||
        member.fullName.toLowerCase().includes(q) ||
        (member.email && member.email.toLowerCase().includes(q));
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

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

  // Calculate stats (memoized)
  const stats = useMemo(() => ({
    totalMembers: mockMinistryMembers.filter(m => m.isActive).length,
    totalCommittees: mockCommittees.filter(c => c.isActive).length,
    monthlyContributions: mockFinancialSummary.totalContributions,
    activePledges: mockPledges.filter(p => p.status === 'active').length,
    upcomingEvents: mockMinistryEvents.filter(e => e.status === 'planned').length,
    publishedArticles: mockPublications.filter(p => p.status === 'published').length
  }), []);

  // If a committee is selected, show the committee workspace (strict null check)
  if (selectedCommittee !== null) {
    const committee = mockCommittees.find(c => c.id === selectedCommittee);
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
          <span>{committee?.name}</span>
        </div>
        <CommitteeWorkspace 
          committeeId={selectedCommittee} 
          committeeName={committee?.name || ''}
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
            <Button className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2">
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
                {mockMinistryMembers.filter(m => m.role !== 'member' && m.role !== 'committee_member').map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{leader.fullName}</h4>
                      <p className="text-sm text-gray-600">{leader.leadershipPosition}</p>
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
                <Button size="sm" className="w-full sm:w-auto">
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
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Committee
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mockCommittees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg">
                      {committee.name}
                    </CardTitle>
                    <Badge 
                      variant={committee.isActive ? "default" : "secondary"}
                      className="h-5 text-xs"
                    >
                      {committee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {committee.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">Head: </span>
                      <span className="ml-1 truncate">
                        {committee.headId 
                          ? mockMinistryMembers.find(m => m.id === committee.headId)?.fullName || 'TBD'
                          : 'TBD'
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <UserPlus className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">Members: </span>
                      <span className="ml-1">{committee.members.length}</span>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-3.5 w-3.5 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Meeting: </span>
                        <span className="text-gray-700">
                          {committee.meetingSchedule || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCommittee(committee.id)}
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
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  <p className="text-lg sm:text-2xl font-bold text-green-600">£{mockFinancialSummary.totalContributions}</p>
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
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">£{mockFinancialSummary.pledgePayments.toLocaleString()}</p>
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
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">£{mockFinancialSummary.totalExpenses.toLocaleString()}</p>
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
                  <p className={`text-lg sm:text-2xl font-bold ${mockFinancialSummary.netBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    £{Math.abs(mockFinancialSummary.netBalance).toLocaleString()}
                    {mockFinancialSummary.netBalance < 0 && ' (Deficit)'}
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
                    {mockContributions.map((contribution) => (
                      <tr key={contribution.id} className="border-b">
                        <td className="p-2">{contribution.date}</td>
                        <td className="p-2">
                          {mockMinistryMembers.find(m => m.id === contribution.memberId)?.fullName}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{contribution.type.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-2 font-medium">£{contribution.amount}</td>
                        <td className="p-2 text-sm text-gray-600">{contribution.description}</td>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPublications.map((publication) => (
              <Card key={publication.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{publication.title}</CardTitle>
                    <Badge variant={
                      publication.status === 'published' ? 'default' :
                      publication.status === 'draft' ? 'secondary' : 'outline'
                    }>
                      {publication.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{mockMinistryMembers.find(m => m.id === publication.authorId)?.fullName}</span>
                    <span>•</span>
                    <span>{publication.publishDate || publication.createdAt}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {publication.content.substring(0, 150)}...
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {publication.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {mockMinistryEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={
                      event.status === 'completed' ? 'default' :
                      event.status === 'planned' ? 'secondary' :
                      event.status === 'active' ? 'default' : 'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.startDate} {event.startDate !== event.endDate && `- ${event.endDate}`}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location: </span>
                      {event.location}
                    </div>
                    <div>
                      <span className="font-medium">Organizer: </span>
                      {mockMinistryMembers.find(m => m.id === event.organizerId)?.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Attendees: </span>
                      {event.attendees.length}
                    </div>
                    {event.budget && (
                      <div>
                        <span className="font-medium">Budget: </span>
                        £{event.budget}
                      </div>
                    )}
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
