'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// -------------------- Types -------------------- 
type MembershipLevel = 'baptized' | 'convert' | 'visitor';

type Member = {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  membershipLevel?: MembershipLevel;
  baptizedSubLevel?: 'worker' | 'disciple' | 'none';
  branchId?: string;
  ministry?: string;
  progress?: number; // 0-100
  status?: string;
};

type FirstTimer = {
  id: number;
  fullName: string;
  phone?: string;
  community?: string;
  invitedBy?: string;
  branchId?: string;
  serviceDate?: string;
  status?: string;
};

type Branch = { id: string; name: string };

// -------------------- Mock placeholders removed; loading live data --------------------

// -------------------- Helper: paginate --------------------
function paginate<T>(items: T[], pageSize: number, page: number) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: items.slice(start, end),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// -------------------- Component --------------------
export const MemberManagement: React.FC = () => {
  // data state (live)
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'workers_disciples' | 'converts' | 'visitors'>('workers_disciples');
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<'all' | MembershipLevel>('all');
  const [branchFilter, setBranchFilter] = useState<'all' | string>('all');

  // selection / bulk
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [selectedFirstTimerIds, setSelectedFirstTimerIds] = useState<number[]>([]);

  // pagination
  const pageSize = 5;
  const [page, setPage] = useState(1);

  // modals & actions
  const [viewing, setViewing] = useState<Member | FirstTimer | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editing, setEditing] = useState<Member | FirstTimer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleting, setDeleting] = useState<Member | FirstTimer | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { toast } = useToast();

  // Map local numeric ids to DB UUIDs for server actions
  const memberMetaRef = useRef(new Map<number, { dbId: string }>());
  const firstTimerMetaRef = useRef(new Map<number, { dbId: string }>());

  const toLocalId = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h) + 1;
  };

  // Load branches, members, and first timers from Supabase
  useEffect(() => {
    (async () => {
      const [br, mr, fr] = await Promise.all([
        supabase.from('church_branches').select('id, name').order('name'),
        supabase
          .from('members')
          .select('id, full_name, email, phone, branch_id, membership_level, baptized_sub_level, status')
          .order('full_name'),
        supabase
          .from('first_timers')
          .select('id, full_name, phone, community, invited_by, branch_id, service_date, status')
          .order('service_date', { ascending: false }),
      ]);
      setBranches((br.data || []) as any);
      const mappedMembers: Member[] = (mr.data || []).map((row: any) => {
        const lid = toLocalId(row.id);
        memberMetaRef.current.set(lid, { dbId: row.id });
        return {
          id: lid,
          fullName: row.full_name,
          email: row.email || '',
          phone: row.phone || '',
          membershipLevel: row.membership_level,
          baptizedSubLevel: (row.baptized_sub_level || 'none') as any,
          branchId: row.branch_id,
          ministry: '',
          progress: 0,
          status: row.status || 'active',
        } as Member;
      });
      setMembers(mappedMembers);
      const mappedFT: FirstTimer[] = (fr.data || []).map((row: any) => {
        const lid = toLocalId(row.id);
        firstTimerMetaRef.current.set(lid, { dbId: row.id });
        return {
          id: lid,
          fullName: row.full_name,
          phone: row.phone || '',
          community: row.community || '',
          invitedBy: row.invited_by || '',
          branchId: row.branch_id,
          serviceDate: row.service_date || new Date().toISOString(),
          status: row.status || 'new',
        } as FirstTimer;
      });
      setFirstTimers(mappedFT);
    })();
  }, []);

  // -------------------- Derived / filtered data --------------------
  const MEMBERSHIP_LEVELS: MembershipLevel[] = ['baptized', 'convert', 'visitor'];

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return members.filter(m => {
      // tab filter
      const matchesTab =
        activeTab === 'workers_disciples'
          ? (m.baptizedSubLevel === 'worker' || m.baptizedSubLevel === 'disciple')
          : activeTab === 'converts'
            ? m.membershipLevel === 'convert'
            : true;

      const matchesSearch = !q || m.fullName.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.phone || '').includes(q);
      const matchesMembership = membershipFilter === 'all' || m.membershipLevel === membershipFilter;
      const matchesBranch = branchFilter === 'all' || (m.branchId && m.branchId === branchFilter);

      return matchesTab && matchesSearch && matchesMembership && matchesBranch;
    });
  }, [members, searchTerm, membershipFilter, branchFilter, activeTab]);

  const filteredFirstTimers = useMemo(() => {
    if (activeTab !== 'visitors') return [];
    const q = searchTerm.trim().toLowerCase();
    return firstTimers.filter(ft => {
      const matchesSearch = !q || ft.fullName.toLowerCase().includes(q) || (ft.phone || '').includes(q);
      const matchesBranch = branchFilter === 'all' || (ft.branchId && ft.branchId === branchFilter);
      return matchesSearch && matchesBranch;
    });
  }, [firstTimers, searchTerm, branchFilter, activeTab]);

  // pagination slice depending on tab
  const paginated = useMemo(() => {
    const source = activeTab === 'visitors' ? filteredFirstTimers : filteredMembers;
    return paginate(source, pageSize, page);
  }, [activeTab, filteredMembers, filteredFirstTimers, page]);

  // reset page when filters or tab change
  React.useEffect(() => setPage(1), [activeTab, searchTerm, membershipFilter, branchFilter]);

  // -------------------- Selection helpers --------------------
  const toggleSelectMember = (id: number) => {
    setSelectedMemberIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleSelectFirstTimer = (id: number) => {
    setSelectedFirstTimerIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const selectAllOnPage = (checked: boolean) => {
    const currentIds = (activeTab === 'visitors' ? paginated.data.map((d: any) => d.id) : paginated.data.map((d: any) => d.id));
    if (activeTab === 'visitors') {
      setSelectedFirstTimerIds(prev => (checked ? Array.from(new Set([...prev, ...currentIds])) : prev.filter(id => !currentIds.includes(id))));
    } else {
      setSelectedMemberIds(prev => (checked ? Array.from(new Set([...prev, ...currentIds])) : prev.filter(id => !currentIds.includes(id))));
    }
  };

  const allOnPageSelected = useMemo(() => {
    const currentIds = paginated.data.map((d: any) => d.id);
    if (activeTab === 'visitors') return currentIds.length > 0 && currentIds.every(id => selectedFirstTimerIds.includes(id));
    return currentIds.length > 0 && currentIds.every(id => selectedMemberIds.includes(id));
  }, [paginated, selectedFirstTimerIds, selectedMemberIds, activeTab]);

  // -------------------- Actions: view / edit / delete --------------------
  const openView = (item: Member | FirstTimer) => {
    setViewing(item);
    setIsViewOpen(true);
  };

  const openEdit = (item: Member | FirstTimer) => {
    setEditing(item);
    setIsEditOpen(true);
  };

  const openDeleteConfirm = (item: Member | FirstTimer) => {
    setDeleting(item);
    setIsDeleteConfirmOpen(true);
  };

  const deleteItem = async () => {
    if (!deleting) return;
    try {
      if ('membershipLevel' in deleting) {
        const meta = memberMetaRef.current.get(deleting.id);
        if (meta?.dbId) {
          const { data, error } = await supabase.functions.invoke('admin-create-member', { body: { action: 'delete', id: meta.dbId } });
          if (error) throw new Error(error.message || 'Edge function error');
          if (data && (data as any).error) throw new Error((data as any).error);
        }
        setMembers(prev => prev.filter(m => m.id !== deleting.id));
        setSelectedMemberIds(prev => prev.filter(x => x !== deleting.id));
      } else {
        const meta = firstTimerMetaRef.current.get(deleting.id);
        if (meta?.dbId) {
          const { data, error } = await supabase.functions.invoke('admin-create-member', { body: { action: 'delete', id: meta.dbId, target: 'first_timers' } });
          if (error) throw new Error(error.message || 'Edge function error');
          if (data && (data as any).error) throw new Error((data as any).error);
        }
        setFirstTimers(prev => prev.filter(f => f.id !== deleting.id));
        setSelectedFirstTimerIds(prev => prev.filter(x => x !== deleting.id));
      }
      toast({ title: 'Deleted', description: `${deleting.fullName} removed.` });
    } catch (e: any) {
      toast({ title: 'Delete failed', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeleting(null);
    }
  };

  const deleteSelected = async () => {
    try {
      if (activeTab === 'visitors') {
        const results = await Promise.allSettled(selectedFirstTimerIds.map(async (id) => {
          const meta = firstTimerMetaRef.current.get(id);
          if (meta?.dbId) {
            const { data, error } = await supabase.functions.invoke('admin-create-member', { body: { action: 'delete', id: meta.dbId, target: 'first_timers' } });
            if (error || (data && (data as any).error)) throw new Error(error?.message || (data as any)?.error || 'Delete failed');
          }
        }));
        const failed = results.filter(r => r.status === 'rejected').length;
        setFirstTimers(prev => prev.filter(ft => !selectedFirstTimerIds.includes(ft.id)));
        toast({ title: 'Deleted', description: `${selectedFirstTimerIds.length - failed} visitor(s) removed${failed > 0 ? `, ${failed} failed` : ''}.` });
        setSelectedFirstTimerIds([]);
      } else {
        const results = await Promise.allSettled(selectedMemberIds.map(async (id) => {
          const meta = memberMetaRef.current.get(id);
          if (meta?.dbId) {
            const { data, error } = await supabase.functions.invoke('admin-create-member', { body: { action: 'delete', id: meta.dbId } });
            if (error || (data && (data as any).error)) throw new Error(error?.message || (data as any)?.error || 'Delete failed');
          }
        }));
        const failed = results.filter(r => r.status === 'rejected').length;
        setMembers(prev => prev.filter(m => !selectedMemberIds.includes(m.id)));
        toast({ title: 'Deleted', description: `${selectedMemberIds.length - failed} member(s) removed${failed > 0 ? `, ${failed} failed` : ''}.` });
        setSelectedMemberIds([]);
      }
    } catch (e: any) {
      toast({ title: 'Delete failed', description: String(e?.message || e), variant: 'destructive' });
    }
  };

  const saveEdit = (payload: any) => {
    // simple patch for mock data (works for Member and FirstTimer)
    if (!editing) return;
    if ('membershipLevel' in editing) {
      // Member update
      setMembers(prev => prev.map(m => (m.id === editing.id ? { ...m, ...payload } : m)));
      toast({ title: 'Saved', description: `${payload.fullName ?? editing.fullName} updated.` });
    } else {
      setFirstTimers(prev => prev.map(f => (f.id === editing.id ? { ...f, ...payload } : f)));
      toast({ title: 'Saved', description: `${payload.fullName ?? editing.fullName} updated.` });
    }
    setIsEditOpen(false);
    setEditing(null);
  };

  // -------------------- renderActionMenu --------------------
  const renderActionMenu = (item: Member | FirstTimer) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openView(item)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openEdit(item)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(item)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // -------------------- small helpers --------------------
  const getBranchName = (id?: string) => branches.find(b => b.id === id)?.name || 'N/A';

  // -------------------- UI --------------------
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Member Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage workers, converts and visitors</p>
        </div>

        <div className="flex gap-2 items-center">
          <Input
            placeholder={`Search ${activeTab === 'visitors' ? 'first timers' : 'members'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-56"
          />

          <Select value={branchFilter} onValueChange={(v) => setBranchFilter(v as any)}>
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {activeTab !== 'visitors' && (
            <Select value={membershipFilter} onValueChange={(v) => setMembershipFilter(v as any)}>
              <SelectTrigger className="h-9 w-44 text-sm">
                <SelectValue placeholder="All Membership Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {MEMBERSHIP_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <Button onClick={() => {
            // open "add" edit modal with blank template
            if (activeTab === 'visitors') {
              const template: FirstTimer = { id: Date.now(), fullName: '', phone: '', community: '', invitedBy: '', branchId: branches[0]?.id, serviceDate: new Date().toISOString(), status: 'new' };
              setEditing(template);
            } else {
              const template: Member = { id: Date.now(), fullName: '', email: '', phone: '', membershipLevel: 'baptized', baptizedSubLevel: 'worker', branchId: branches[0]?.id, ministry: '', progress: 0, status: 'active' };
              setEditing(template);
            }
            setIsEditOpen(true);
          }}>Add New</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-3 gap-2 w-full">
          <TabsTrigger value="workers_disciples" className="text-sm">Workers & Disciples</TabsTrigger>
          <TabsTrigger value="converts" className="text-sm">Converts</TabsTrigger>
          <TabsTrigger value="visitors" className="text-sm">First Timers</TabsTrigger>
        </TabsList>

        {/* -------------- WORKERS & DISCIPLES -------------- */}
        <TabsContent value="workers_disciples" className="space-y-4">
          <Card className="border">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={allOnPageSelected}
                    onCheckedChange={(v) => selectAllOnPage(!!v)}
                  />
                  <Label htmlFor="select-all" className="text-sm">Select page</Label>
                  {(selectedMemberIds.length > 0) && (
                    <Badge>{selectedMemberIds.length} selected</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="destructive" onClick={deleteSelected} disabled={selectedMemberIds.length === 0}>Delete Selected</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-4"><span /></TableHead>
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
                    {paginated.data.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center">No members found</TableCell></TableRow>
                    ) : (
                      (paginated.data as Member[]).map(member => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <Checkbox checked={selectedMemberIds.includes(member.id)} onCheckedChange={() => toggleSelectMember(member.id)} />
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                {member.fullName ? member.fullName.charAt(0).toUpperCase() : 'N'}
                              </div>
                              <div>
                                <div className="font-medium">{member.fullName || '—'}</div>
                                <div className="text-xs text-muted-foreground">{member.membershipLevel}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <div className="text-sm">
                              <div>{member.email || 'N/A'}</div>
                              <div className="text-muted-foreground">{member.phone || 'N/A'}</div>
                            </div>
                          </TableCell>

                          <TableCell><Badge className="text-xs">{member.membershipLevel}</Badge></TableCell>

                          <TableCell className="hidden md:table-cell">{getBranchName(member.branchId)}</TableCell>

                          <TableCell className="hidden md:table-cell">{member.ministry || 'N/A'}</TableCell>

                          <TableCell className="hidden lg:table-cell">
                            {member.progress !== undefined ? (
                              <div className="w-full">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="h-2 rounded-full" style={{ width: `${member.progress}%`, backgroundColor: '#2563eb' }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{member.progress}%</span>
                              </div>
                            ) : '-'}
                          </TableCell>

                          <TableCell className="text-right">
                            {renderActionMenu(member)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* pagination */}
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <div>Showing {paginated.data.length} of {paginated.total}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <div className="px-2 py-1 rounded border">{page} / {paginated.totalPages}</div>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(paginated.totalPages, p + 1))} disabled={page === paginated.totalPages}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------- CONVERTS -------------- */}
        <TabsContent value="converts" className="space-y-4">
          <Card className="border">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all-converts"
                    checked={allOnPageSelected}
                    onCheckedChange={(v) => selectAllOnPage(!!v)}
                  />
                  <Label htmlFor="select-all-converts" className="text-sm">Select page</Label>
                  {(selectedMemberIds.length > 0) && <Badge>{selectedMemberIds.length} selected</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={deleteSelected} disabled={selectedMemberIds.length === 0}>Delete Selected</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-4"><span /></TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead className="hidden sm:table-cell">Contact</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead className="hidden md:table-cell">Branch</TableHead>
                      <TableHead className="hidden lg:table-cell">Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.data.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center">No converts found</TableCell></TableRow>
                    ) : (
                      (paginated.data as Member[]).map(member => (
                        <TableRow key={member.id}>
                          <TableCell><Checkbox checked={selectedMemberIds.includes(member.id)} onCheckedChange={() => toggleSelectMember(member.id)} /></TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">{member.fullName ? member.fullName.charAt(0).toUpperCase() : 'N'}</div>
                              <div>
                                <div className="font-medium">{member.fullName}</div>
                                <div className="text-xs text-muted-foreground">{member.membershipLevel}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <div className="text-sm">
                              <div>{member.email || 'N/A'}</div>
                              <div className="text-muted-foreground">{member.phone || 'N/A'}</div>
                            </div>
                          </TableCell>

                          <TableCell><Badge className="text-xs">{member.membershipLevel}</Badge></TableCell>

                          <TableCell className="hidden md:table-cell">{getBranchName(member.branchId)}</TableCell>

                          <TableCell className="hidden lg:table-cell">
                            {member.progress !== undefined ? (
                              <div className="w-full">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="h-2 rounded-full" style={{ width: `${member.progress}%`, backgroundColor: '#2563eb' }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{member.progress}%</span>
                              </div>
                            ) : '-'}
                          </TableCell>

                          <TableCell className="text-right">{renderActionMenu(member)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <div>Showing {paginated.data.length} of {paginated.total}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <div className="px-2 py-1 rounded border">{page} / {paginated.totalPages}</div>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(paginated.totalPages, p + 1))} disabled={page === paginated.totalPages}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------- FIRST TIMERS (VISITORS) -------------- */}
        <TabsContent value="visitors" className="space-y-4">
          <Card className="border">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Checkbox checked={allOnPageSelected} onCheckedChange={(v) => selectAllOnPage(!!v)} />
                  <Label className="text-sm">Select page</Label>
                  {(selectedFirstTimerIds.length > 0) && <Badge>{selectedFirstTimerIds.length} selected</Badge>}
                </div>

                <div className="flex gap-2">
                  <Button variant="destructive" onClick={deleteSelected} disabled={selectedFirstTimerIds.length === 0}>Delete Selected</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-4"><span /></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Contact</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead className="hidden sm:table-cell">Invited By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.data.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center">No visitors found</TableCell></TableRow>
                    ) : (
                      (paginated.data as FirstTimer[]).map(ft => (
                        <TableRow key={ft.id}>
                          <TableCell><Checkbox checked={selectedFirstTimerIds.includes(ft.id)} onCheckedChange={() => toggleSelectFirstTimer(ft.id)} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">{ft.fullName ? ft.fullName.charAt(0).toUpperCase() : 'N'}</div>
                              <div>
                                <div className="font-medium">{ft.fullName}</div>
                                <div className="text-xs text-muted-foreground">First Time</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <div className="text-sm">
                              <div>{ft.phone || 'N/A'}</div>
                              <div className="text-muted-foreground">{ft.community || 'N/A'}</div>
                            </div>
                          </TableCell>

                          <TableCell>{new Date(ft.serviceDate || '').toLocaleDateString()}</TableCell>

                          <TableCell className="hidden sm:table-cell">{ft.invitedBy || 'N/A'}</TableCell>

                          <TableCell className="text-right">{renderActionMenu(ft)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <div>Showing {paginated.data.length} of {paginated.total}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <div className="px-2 py-1 rounded border">{page} / {paginated.totalPages}</div>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(paginated.totalPages, p + 1))} disabled={page === paginated.totalPages}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ------------------- VIEW MODAL ------------------- */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View</DialogTitle>
            <DialogDescription>Details for {('fullName' in (viewing || {})) ? viewing?.fullName : ''}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {viewing ? (
              'membershipLevel' in viewing ? (
                // Member view
                <>
                  <div><strong>Name:</strong> {viewing.fullName}</div>
                  <div><strong>Email:</strong> {(viewing.email) || 'N/A'}</div>
                  <div><strong>Phone:</strong> {(viewing.phone) || 'N/A'}</div>
                  <div><strong>Membership:</strong> {viewing.membershipLevel}</div>
                  <div><strong>Branch:</strong> {getBranchName(viewing.branchId)}</div>
                  <div><strong>Ministry:</strong> {viewing.ministry || 'N/A'}</div>
                  {viewing.progress !== undefined && (
                    <div>
                      <strong>Progress:</strong>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                        <div className="h-2 rounded-full" style={{ width: `${viewing.progress}%`, backgroundColor: '#2563eb' }} />
                      </div>
                      <div className="text-xs text-muted-foreground">{viewing.progress}%</div>
                    </div>
                  )}
                </>
              ) : (
                // FirstTimer view
                <>
                  <div><strong>Name:</strong> {viewing.fullName}</div>
                  <div><strong>Phone:</strong> {(viewing.phone) || 'N/A'}</div>
                  <div><strong>Community:</strong> {((viewing as FirstTimer).community) || 'N/A'}</div>
                  <div><strong>Invited By:</strong> {((viewing as FirstTimer).invitedBy) || 'N/A'}</div>
                  <div><strong>Service Date:</strong> {new Date((viewing as FirstTimer).serviceDate || '').toLocaleString()}</div>
                  <div><strong>Status:</strong> {(viewing as FirstTimer).status}</div>
                </>
              )
            ) : (
              <div>No details available</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsViewOpen(false); setViewing(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------- EDIT MODAL ------------------- */}
      <Dialog open={isEditOpen} onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing && 'membershipLevel' in editing ? (editing.fullName ? 'Edit Member' : 'Add Member') : (editing && editing.fullName ? 'Edit Visitor' : 'Add Visitor')}</DialogTitle>
          </DialogHeader>

          {editing ? (
            'membershipLevel' in editing ? (
              // Member edit form
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                const payload: Partial<Member> = {
                  fullName: (data.get('fullName') as string) || editing.fullName,
                  email: (data.get('email') as string) || editing.email,
                  phone: (data.get('phone') as string) || editing.phone,
                  ministry: (data.get('ministry') as string) || editing.ministry,
                  progress: Number(data.get('progress')) || editing.progress || 0,
                  branchId: (data.get('branchId') as string) || editing.branchId || branches[0]?.id,
                };

                // If new id (mock add)
                if (!members.find(m => m.id === editing.id)) {
                  setMembers(prev => [{ id: editing.id as number, membershipLevel: 'baptized', baptizedSubLevel: 'worker', status: 'active', ...payload } as Member, ...prev]);
                  toast({ title: 'Added', description: `${payload.fullName} added.` });
                } else {
                  saveEdit(payload);
                }
              }}>
                <div className="grid grid-cols-1 gap-2">
                  <Label>Full name</Label>
                  <Input name="fullName" defaultValue={editing.fullName} />

                  <Label>Email</Label>
                  <Input name="email" defaultValue={(editing as Member).email} />

                  <Label>Phone</Label>
                  <Input name="phone" defaultValue={(editing as Member).phone} />

                  <Label>Ministry</Label>
                  <Input name="ministry" defaultValue={(editing as Member).ministry} />

                  <Label>Branch</Label>
                  <Select value={(editing as Member).branchId?.toString() || branches[0].id.toString()} onValueChange={() => { /* controlled not required here */ }}>
                    <SelectTrigger className="h-9 w-full text-sm"><SelectValue placeholder="Branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Label>Progress</Label>
                  <Input name="progress" type="number" defaultValue={String((editing as Member).progress ?? 0)} />

                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </div>
              </form>
            ) : (
              // FirstTimer edit form
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                const payload: Partial<FirstTimer> = {
                  fullName: (data.get('fullName') as string) || editing.fullName,
                  phone: (data.get('phone') as string) || editing.phone,
                  community: (data.get('community') as string) || (editing as FirstTimer).community,
                  invitedBy: (data.get('invitedBy') as string) || (editing as FirstTimer).invitedBy,
                };

                if (!firstTimers.find(f => f.id === editing.id)) {
                  setFirstTimers(prev => [{ id: editing.id as number, branchId: branches[0].id, serviceDate: new Date().toISOString(), status: 'new', ...payload } as FirstTimer, ...prev]);
                  toast({ title: 'Added', description: `${payload.fullName} added.` });
                } else {
                  // update
                  setFirstTimers(prev => prev.map(f => (f.id === editing.id ? { ...f, ...payload } : f)));
                  toast({ title: 'Saved', description: `${payload.fullName} updated.` });
                }

                setIsEditOpen(false);
                setEditing(null);
              }}>
                <div className="grid grid-cols-1 gap-2">
                  <Label>Full name</Label>
                  <Input name="fullName" defaultValue={editing.fullName} />
                  <Label>Phone</Label>
                  <Input name="phone" defaultValue={editing.phone} />
                  <Label>Community</Label>
                  <Input name="community" defaultValue={(editing as FirstTimer).community} />
                  <Label>Invited By</Label>
                  <Input name="invitedBy" defaultValue={(editing as FirstTimer).invitedBy} />

                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </div>
              </form>
            )
          ) : (
            <div>No item to edit</div>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------- DELETE CONFIRM ------------------- */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={(v) => setIsDeleteConfirmOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete <strong>{deleting?.fullName}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteItem}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagement;
