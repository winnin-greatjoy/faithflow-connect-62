import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Download,
  Eye as EyeIcon,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
  Building2,
  Mail,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Member, FirstTimer, MembershipLevel } from '@/types/membership';

import { mockMembers, mockFirstTimers, mockBranches } from '@/data/mockMembershipData';
import { getMembershipLevelDisplay, getDiscipleshipProgress } from '@/utils/membershipUtils';
import { MemberForm } from './MemberForm';
import { FirstTimerForm } from './FirstTimerForm';

type TabType = 'workers_disciples' | 'converts' | 'visitors';

export const MemberManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('workers_disciples');
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<'all' | MembershipLevel>('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedFirstTimers, setSelectedFirstTimers] = useState<number[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showFirstTimerForm, setShowFirstTimerForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFirstTimer, setEditingFirstTimer] = useState<FirstTimer | null>(null);
  const { toast } = useToast();

  // runtime array of valid membership levels
  const MEMBERSHIP_LEVELS: MembershipLevel[] = ['baptized', 'convert', 'visitor'];

  const memberStats = useMemo(() => ({
    total: mockMembers.length,
    baptized: mockMembers.filter(m => m.membershipLevel === 'baptized').length,
    converts: mockMembers.filter(m => m.membershipLevel === 'convert').length,
    visitors: mockFirstTimers.length,
    leaders: mockMembers.filter(m => !!m.leaderRole).length,
    workers: mockMembers.filter(m => m.baptizedSubLevel === 'worker').length,
  }), []);

  // filtered members for Workers & Disciples OR Converts depending on activeTab
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mockMembers.filter(member => {
      // Tab filter:
      const matchesTab =
        activeTab === 'workers_disciples'
          ? (member.baptizedSubLevel === 'worker' || member.baptizedSubLevel === 'disciple')
          : activeTab === 'converts'
            ? member.membershipLevel === 'convert'
            : true; // visitors handled separately

      const matchesSearch =
        !q ||
        (member.fullName && member.fullName.toLowerCase().includes(q)) ||
        (member.email && member.email.toLowerCase().includes(q)) ||
        (member.phone && member.phone.includes(searchTerm));

      const matchesMembership = membershipFilter === 'all' || member.membershipLevel === membershipFilter;
      const matchesBranch = branchFilter === 'all' || (member.branchId && member.branchId.toString() === branchFilter);

      return matchesTab && matchesSearch && matchesMembership && matchesBranch;
    });
  }, [searchTerm, membershipFilter, branchFilter, activeTab]);

  const filteredFirstTimers = useMemo(() => {
    if (activeTab !== 'visitors') return [];
    const q = searchTerm.trim().toLowerCase();
    return mockFirstTimers.filter(ft => {
      const matchesSearch =
        !q ||
        (ft.fullName && ft.fullName.toLowerCase().includes(q)) ||
        (ft.phone && ft.phone.includes(searchTerm));
      const matchesBranch = branchFilter === 'all' || (ft.branchId && ft.branchId.toString() === branchFilter);
      return matchesSearch && matchesBranch;
    });
  }, [searchTerm, branchFilter, activeTab]);

  // create new member prefill (baptized by default)
  const openNewMemberForm = (level: MembershipLevel = 'baptized') => {
    const base: Member = {
      id: 0,
      fullName: '',
      dateOfBirth: '',
      gender: 'male',
      maritalStatus: 'single',
      spouseName: '',
      numberOfChildren: 0,
      children: [],
      email: '',
      phone: '',
      community: '',
      area: '',
      street: '',
      publicLandmark: '',
      branchId: 1,
      dateJoined: new Date().toISOString(),
      membershipLevel: level,
      baptizedSubLevel: 'worker',
      joinDate: new Date().toISOString(),
      discipleshipClass1: false,
      discipleshipClass2: false,
      discipleshipClass3: false,
      assignedDepartment: '',
      status: 'active',
      ministry: 'none',
      prayerNeeds: '',
      pastoralNotes: '',
      lastAttendance: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      progress: 0,
    };
    setEditingMember(base);
    setShowMemberForm(true);
  };

  const handleSelectMember = (id: number) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectFirstTimer = (id: number) => {
    setSelectedFirstTimers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const toSelect = activeTab === 'visitors' ? filteredFirstTimers.map(f => f.id) : filteredMembers.map(m => m.id);
    if (e.target.checked) {
      if (activeTab === 'visitors') setSelectedFirstTimers(toSelect);
      else setSelectedMembers(toSelect);
    } else {
      if (activeTab === 'visitors') setSelectedFirstTimers([]);
      else setSelectedMembers([]);
    }
  };

  const handleDeleteMember = (id: number) => {
    console.log('delete', id);
    toast({ title: 'Member deleted', description: 'Member removed (mock)', variant: 'destructive' });
  };

  const handlePromoteToMember = (ft: FirstTimer) => {
    console.log('promote', ft);
    toast({ title: 'Promote', description: `${ft.fullName} pre-filled into member form.` });
    const newMember: Member = {
      id: 0,
      fullName: ft.fullName,
      dateOfBirth: '',
      gender: 'male',
      maritalStatus: 'single',
      spouseName: '',
      numberOfChildren: 0,
      children: [],
      email: '',
      phone: ft.phone || '',
      community: ft.community || '',
      area: ft.area || '',
      street: ft.street || '',
      publicLandmark: ft.publicLandmark || '',
      branchId: ft.branchId || 1,
      dateJoined: new Date().toISOString(),
      membershipLevel: 'convert',
      baptizedSubLevel: 'disciple',
      joinDate: new Date().toISOString(),
      discipleshipClass1: false,
      discipleshipClass2: false,
      discipleshipClass3: false,
      assignedDepartment: '',
      status: 'active',
      ministry: 'none',
      prayerNeeds: '',
      pastoralNotes: '',
      lastAttendance: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      progress: 0,
    };
    setEditingMember(newMember);
    setShowMemberForm(true);
  };

  if (showMemberForm) {
    return (
      <MemberForm
        member={editingMember || undefined}
        onCancel={() => setShowMemberForm(false)}
        onSubmit={(data) => {
          setShowMemberForm(false);
          toast({ title: 'Saved', description: 'Member saved (mock)' });
        }}
      />
    );
  }

  if (showFirstTimerForm) {
    return (
      <FirstTimerForm
        firstTimer={editingFirstTimer || undefined}
        onCancel={() => setShowFirstTimerForm(false)}
        onSubmit={(data) => {
          setShowFirstTimerForm(false);
          toast({ title: 'Saved', description: 'First timer saved (mock)' });
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage church members across branches and track visitors.</p>
        </div>

        <div>
          <Button
            onClick={() => {
              if (activeTab === 'converts') openNewMemberForm('convert');
              else if (activeTab === 'visitors') {
                setEditingFirstTimer({
                  id: 0,
                  fullName: '',
                  community: '',
                  area: '',
                  street: '',
                  publicLandmark: '',
                  phone: '',
                  serviceDate: new Date().toISOString(),
                  invitedBy: '',
                  followUpStatus: 'pending',
                  branchId: 1,
                  notes: '',
                  createdAt: new Date().toISOString(),
                  firstVisit: new Date().toISOString(),
                  visitDate: new Date().toISOString(),
                  status: 'new',
                });
                setShowFirstTimerForm(true);
              } else openNewMemberForm('baptized');
            }}
            className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
          >
            <Plus className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline">
              {activeTab === 'visitors' ? 'Add First Timer' : activeTab === 'converts' ? 'Add Convert' : 'Add Worker/Disciple'}
            </span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="workers_disciples" className="text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 sm:mr-2" />
            <span>Workers & Disciples</span>
            <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs">
              {mockMembers.filter(m => m.baptizedSubLevel === 'worker' || m.baptizedSubLevel === 'disciple').length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="converts" className="text-xs sm:text-sm">
            <UserPlus className="h-3.5 w-3.5 sm:mr-2" />
            <span>Converts</span>
            <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs">
              {mockMembers.filter(m => m.membershipLevel === 'convert').length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="visitors" className="text-xs sm:text-sm">
            <UserPlus className="h-3.5 w-3.5 sm:mr-2" />
            <span>First Timers</span>
            <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs">
              {mockFirstTimers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${activeTab === 'visitors' ? 'first timers' : 'members'}...`}
              className="h-9 sm:h-10 pl-9 text-xs sm:text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm w-[140px] sm:w-[160px]">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {mockBranches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {activeTab !== 'visitors' && (
              <Select value={membershipFilter} onValueChange={(v) => setMembershipFilter(v as 'all' | MembershipLevel)}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm w-[120px] sm:w-[140px]">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {MEMBERSHIP_LEVELS.map(level => <SelectItem key={level} value={level}>{getMembershipLevelDisplay(level)}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-lg font-bold text-gray-900">{memberStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-3.5 w-3.5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Baptized</p>
                  <p className="text-lg font-bold text-gray-900">{memberStats.baptized}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Converts</p>
                  <p className="text-lg font-bold text-gray-900">{memberStats.converts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-3.5 w-3.5 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-600">Visitors</p>
                  <p className="text-lg font-bold text-gray-900">{memberStats.visitors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-3.5 w-3.5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Leaders</p>
                  <p className="text-lg font-bold text-gray-900">{memberStats.leaders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-3.5 w-3.5 text-pink-600" />
                <div>
                  <p className="text-xs text-gray-600">Workers</p>
                  <p className="text-lg font-bold text-gray-900">{memberStats.workers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members table (Workers & Disciples or Converts) */}
        <TabsContent value="workers_disciples" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4">
                      <input type="checkbox" className="rounded" onChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Member</TableHead>
                    <TableHead className="min-w-[150px] hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="min-w-[120px]">Membership</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">Branch</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Ministry</TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">Progress</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">No members found</TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <input type="checkbox" className="h-4 w-4 rounded" checked={selectedMembers.includes(member.id)} onChange={() => handleSelectMember(member.id)} />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {member.fullName ? member.fullName.charAt(0).toUpperCase() : 'N'}
                            </div>
                            <div>
                              <div className="font-medium">{member.fullName}</div>
                              <div className="text-xs text-gray-500 truncate">{member.membershipLevel}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm">
                            <div>{member.email || 'N/A'}</div>
                            <div className="text-gray-500">{member.phone || 'N/A'}</div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className="text-xs">{getMembershipLevelDisplay(member.membershipLevel)}</Badge>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">{mockBranches.find(b => b.id === member.branchId)?.name || 'N/A'}</TableCell>

                        <TableCell className="hidden md:table-cell">{member.ministry || 'N/A'}</TableCell>

                        <TableCell className="hidden lg:table-cell">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getDiscipleshipProgress(member).percentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{getDiscipleshipProgress(member).percentage}%</span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon"><EyeIcon className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingMember(member); setShowMemberForm(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Converts tab (filteredMembers handles converts when activeTab === 'converts') */}
        <TabsContent value="converts" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {/* Reuse the same table markup as above: filteredMembers already contains only converts */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4">
                      <input type="checkbox" className="rounded" onChange={handleSelectAll} />
                    </TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="hidden sm:table-cell">Contact</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead className="hidden md:table-cell">Branch</TableHead>
                    <TableHead className="hidden md:table-cell">Ministry</TableHead>
                    <TableHead className="hidden lg:table-cell">Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">No converts found</TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <input type="checkbox" className="h-4 w-4 rounded" checked={selectedMembers.includes(member.id)} onChange={() => handleSelectMember(member.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">{member.fullName ? member.fullName.charAt(0).toUpperCase() : 'N'}</div>
                            <div>
                              <div className="font-medium">{member.fullName}</div>
                              <div className="text-xs text-gray-500 truncate">{member.membershipLevel}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm">
                            <div>{member.email || 'N/A'}</div>
                            <div className="text-gray-500">{member.phone || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge className="text-xs">{getMembershipLevelDisplay(member.membershipLevel)}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{mockBranches.find(b => b.id === member.branchId)?.name || 'N/A'}</TableCell>
                        <TableCell className="hidden md:table-cell">{member.ministry || 'N/A'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getDiscipleshipProgress(member).percentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{getDiscipleshipProgress(member).percentage}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon"><EyeIcon className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingMember(member); setShowMemberForm(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Visitors tab */}
        <TabsContent value="visitors" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4">
                      <input type="checkbox" className="rounded" onChange={handleSelectAll} checked={filteredFirstTimers.length > 0 && selectedFirstTimers.length === filteredFirstTimers.length} />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>How They Heard</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredFirstTimers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">No visitors found</TableCell>
                    </TableRow>
                  ) : (
                    filteredFirstTimers.map(ft => (
                      <TableRow key={ft.id}>
                        <TableCell>
                          <input type="checkbox" className="rounded" checked={selectedFirstTimers.includes(ft.id)} onChange={() => handleSelectFirstTimer(ft.id)} />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">{ft.fullName.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="font-medium">{ft.fullName}</div>
                              <div className="text-xs text-gray-500">First Time</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs">
                            <div>{ft.phone || 'N/A'}</div>
                            <div className="text-gray-500">{ft.community || 'N/A'}</div>
                          </div>
                        </TableCell>

                        <TableCell>{new Date(ft.serviceDate).toLocaleDateString()}</TableCell>

                        <TableCell className="hidden sm:table-cell">{ft.invitedBy || 'N/A'}</TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingFirstTimer(ft); setShowFirstTimerForm(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handlePromoteToMember(ft)} className="text-blue-600 hover:text-blue-700"><UserCheck className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberManagement;

