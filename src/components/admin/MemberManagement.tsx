
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, Mail, Download, Eye, Edit, Trash2, Users, UserCheck, UserPlus, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Member, FirstTimer, MembershipLevel } from '@/types/membership';
import { mockMembers, mockFirstTimers, mockBranches } from '@/data/mockMembershipData';
import { getMembershipLevelDisplay, getMembershipStatusColor, formatMemberAddress, getDiscipleshipProgress } from '@/utils/membershipUtils';
import { MemberForm } from './MemberForm';
import { FirstTimerForm } from './FirstTimerForm';

export const MemberManagement = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedFirstTimers, setSelectedFirstTimers] = useState<number[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showFirstTimerForm, setShowFirstTimerForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFirstTimer, setEditingFirstTimer] = useState<FirstTimer | null>(null);
  const { toast } = useToast();

  // Filter members
  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    const matchesMembership = membershipFilter === 'all' || member.membershipLevel === membershipFilter;
    const matchesBranch = branchFilter === 'all' || member.branchId.toString() === branchFilter;
    return matchesSearch && matchesMembership && matchesBranch;
  });

  // Filter first timers
  const filteredFirstTimers = mockFirstTimers.filter(firstTimer => {
    const matchesSearch = firstTimer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         firstTimer.phone.includes(searchTerm);
    const matchesBranch = branchFilter === 'all' || firstTimer.branchId.toString() === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Stats calculations
  const memberStats = {
    total: mockMembers.length,
    baptized: mockMembers.filter(m => m.membershipLevel === 'baptized').length,
    converts: mockMembers.filter(m => m.membershipLevel === 'convert').length,
    visitors: mockMembers.filter(m => m.membershipLevel === 'visitor').length,
    leaders: mockMembers.filter(m => m.baptizedSubLevel === 'leader').length,
    workers: mockMembers.filter(m => m.baptizedSubLevel === 'worker').length
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberForm(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleMemberSubmit = (data: any) => {
    console.log('Member form submitted:', data);
    setShowMemberForm(false);
    setEditingMember(null);
  };

  const handleAddFirstTimer = () => {
    setEditingFirstTimer(null);
    setShowFirstTimerForm(true);
  };

  const handleEditFirstTimer = (firstTimer: FirstTimer) => {
    setEditingFirstTimer(firstTimer);
    setShowFirstTimerForm(true);
  };

  const handleFirstTimerSubmit = (data: any) => {
    console.log('First timer form submitted:', data);
    setShowFirstTimerForm(false);
    setEditingFirstTimer(null);
  };

  const handlePromoteToMember = (firstTimer: FirstTimer) => {
    toast({
      title: "Promote to Member",
      description: `${firstTimer.fullName} will be promoted to member status.`,
    });
    console.log('Promoting first timer to member:', firstTimer);
  };

  const handleDeleteMember = (memberId: number) => {
    toast({
      title: "Delete Member",
      description: "Member deletion requires senior pastor approval.",
      variant: "destructive",
    });
    console.log('Deleting member:', memberId);
  };

  if (showMemberForm) {
    return (
      <MemberForm
        member={editingMember || undefined}
        onSubmit={handleMemberSubmit}
        onCancel={() => {
          setShowMemberForm(false);
          setEditingMember(null);
        }}
      />
    );
  }

  if (showFirstTimerForm) {
    return (
      <FirstTimerForm
        firstTimer={editingFirstTimer || undefined}
        onSubmit={handleFirstTimerSubmit}
        onCancel={() => {
          setShowFirstTimerForm(false);
          setEditingFirstTimer(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage church members across all branches and track first-time visitors.
          </p>
        </div>
      </div>

      {/* Membership Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Baptized</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.baptized}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Converts</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.converts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.visitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Leaders</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.leaders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Workers</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.workers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Member Directory & First Timers</CardTitle>
          <CardDescription className="text-sm">
            Manage members and track first-time visitors across all branches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Members ({filteredMembers.length})</TabsTrigger>
              <TabsTrigger value="first-timers">First Timers ({filteredFirstTimers.length})</TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 mb-6 mt-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {mockBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeTab === 'members' && (
                  <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Filter by membership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="baptized">Baptized</SelectItem>
                      <SelectItem value="convert">Converts</SelectItem>
                      <SelectItem value="visitor">Visitors</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={activeTab === 'members' ? handleAddMember : handleAddFirstTimer}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {activeTab === 'members' ? 'Add New Member' : 'Record First Timer'}
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <TabsContent value="members" className="space-y-4">
              {/* Members Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-4">
                          <input type="checkbox" className="rounded" />
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
                      {filteredMembers.map((member) => {
                        const progress = getDiscipleshipProgress(member);
                        const branch = mockBranches.find(b => b.id === member.branchId);
                        
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <input 
                                type="checkbox" 
                                className="rounded"
                                checked={selectedMembers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers([...selectedMembers, member.id]);
                                  } else {
                                    setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{member.fullName}</div>
                                <div className="text-sm text-gray-500">
                                  Age: {new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()}
                                </div>
                                <div className="text-sm text-gray-500 sm:hidden">{member.email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="text-sm">
                                <div>{member.email}</div>
                                <div className="text-gray-500">{member.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getMembershipStatusColor(member.membershipLevel, member.status)}>
                                {getMembershipLevelDisplay(member.membershipLevel, member.baptizedSubLevel, member.leaderRole)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">{branch?.name.replace(' (Main)', '')}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">{member.ministry}</div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {member.membershipLevel === 'baptized' && (
                                <div className="text-sm">
                                  <div>Discipleship: {progress.completed}/{progress.total}</div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div 
                                      className="bg-green-600 h-1.5 rounded-full" 
                                      style={{ width: `${progress.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditMember(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No members found matching your search criteria.
                </div>
              )}
            </TabsContent>

            <TabsContent value="first-timers" className="space-y-4">
              {/* First Timers Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-4">
                          <input type="checkbox" className="rounded" />
                        </TableHead>
                        <TableHead className="min-w-[150px]">Name</TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">Phone</TableHead>
                        <TableHead className="min-w-[200px] hidden md:table-cell">Address</TableHead>
                        <TableHead className="min-w-[100px]">Service Date</TableHead>
                        <TableHead className="min-w-[100px] hidden lg:table-cell">Follow Up</TableHead>
                        <TableHead className="min-w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFirstTimers.map((firstTimer) => {
                        const branch = mockBranches.find(b => b.id === firstTimer.branchId);
                        
                        return (
                          <TableRow key={firstTimer.id}>
                            <TableCell>
                              <input 
                                type="checkbox" 
                                className="rounded"
                                checked={selectedFirstTimers.includes(firstTimer.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFirstTimers([...selectedFirstTimers, firstTimer.id]);
                                  } else {
                                    setSelectedFirstTimers(selectedFirstTimers.filter(id => id !== firstTimer.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{firstTimer.fullName}</div>
                                <div className="text-sm text-gray-500">{branch?.name.replace(' (Main)', '')}</div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{firstTimer.phone}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">
                                {firstTimer.street}, {firstTimer.area}
                              </div>
                            </TableCell>
                            <TableCell>{firstTimer.serviceDate}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge 
                                className={
                                  firstTimer.followUpStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                  firstTimer.followUpStatus === 'called' ? 'bg-blue-100 text-blue-800' :
                                  firstTimer.followUpStatus === 'visited' ? 'bg-purple-100 text-purple-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {firstTimer.followUpStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditFirstTimer(firstTimer)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePromoteToMember(firstTimer)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {filteredFirstTimers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No first timers found matching your search criteria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
