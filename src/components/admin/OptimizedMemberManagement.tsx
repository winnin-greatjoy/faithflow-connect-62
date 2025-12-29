// src/components/admin/OptimizedMemberManagement.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Building2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Send,
  Upload,
  ArrowRightLeft,
} from 'lucide-react';
import { MemberImportDialog } from './MemberImportDialog';
import { BatchTransferDialog } from './BatchTransferDialog';
import { SendNotificationDialog } from './SendNotificationDialog';
import { useToast } from '@/hooks/use-toast';
import { Member, FirstTimer, type MembershipLevel } from '@/types/membership';
import { supabase } from '@/integrations/supabase/client';
import { getMembershipLevelDisplay } from '@/utils/membershipUtils';
import { filterMembers, filterFirstTimers, type TabType } from '@/utils/memberFilters';
import { deleteMember, deleteFirstTimer, createMember, updateMember, createFirstTimer, updateFirstTimer } from '@/utils/memberOperations';
import { MemberForm } from './MemberForm';
import { ConvertForm, ConvertFormData } from './ConvertForm';
import { FirstTimerForm } from './FirstTimerForm';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';

// TabType is imported from @/utils/memberFilters

interface MemberStats {
  total: number;
  baptized: number;
  converts: number;
  visitors: number;
  leaders: number;
  workers: number;
}

const ITEMS_PER_PAGE = 10;
const MEMBERSHIP_LEVELS: MembershipLevel[] = ['baptized', 'convert', 'visitor'];

export const OptimizedMemberManagement: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranchId } = useAdminContext();
  const { branchId: authBranchId, hasRole } = useAuthz();

  // Determine effective branch ID (similar to MemberManagement)
  const isSuperadmin = hasRole('super_admin');
  const effectiveBranchId = isSuperadmin ? selectedBranchId : authBranchId;

  const [activeTab, setActiveTab] = useState<TabType>('workers');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState(effectiveBranchId || 'all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // UUID strings
  const [selectedFirstTimers, setSelectedFirstTimers] = useState<string[]>([]); // UUID strings
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showFirstTimerForm, setShowFirstTimerForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFirstTimer, setEditingFirstTimer] = useState<FirstTimer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBatchTransferDialogOpen, setIsBatchTransferDialogOpen] = useState(false);
  const [isSendNotificationDialogOpen, setIsSendNotificationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [firstTimerToDelete, setFirstTimerToDelete] = useState<FirstTimer | null>(null);

  // Sync branch filter with context
  useEffect(() => {
    if (effectiveBranchId) setBranchFilter(effectiveBranchId);
    else setBranchFilter('all');
  }, [effectiveBranchId]);

  // Live data state
  const [dbMembers, setDbMembers] = useState<Member[]>([]);
  const [dbFirstTimers, setDbFirstTimers] = useState<FirstTimer[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Load branches, members, and first timers from Supabase
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [br, mr, fr] = await Promise.all([
          supabase.from('church_branches').select('id, name').order('name'),
          supabase
            .from('members')
            .select(
              'id, full_name, phone, email, branch_id, membership_level, baptized_sub_level, status, last_attendance, date_joined'
            )
            .order('full_name'),
          supabase
            .from('first_timers')
            .select(
              'id, full_name, phone, email, branch_id, service_date, follow_up_status, status, created_at'
            )
            .order('service_date', { ascending: false }),
        ]);

        setBranches(br.data || []);

        const mappedMembers: Member[] = (mr.data || []).map((row: any) => {
          const membershipLevel = (row.membership_level?.toLowerCase() ??
            'visitor') as MembershipLevel;
          const baptizedSubLevel = row.baptized_sub_level
            ? (row.baptized_sub_level.toLowerCase() as Member['baptizedSubLevel'])
            : undefined;
          const m: Member = {
            id: row.id, // Use UUID directly
            fullName: row.full_name,
            profilePhoto: '',
            dateOfBirth: '2000-01-01',
            gender: 'male',
            maritalStatus: 'single',
            spouseName: '',
            numberOfChildren: 0,
            children: [],
            email: row.email || '',
            phone: row.phone || '',
            community: '',
            area: '',
            street: '',
            publicLandmark: '',
            branchId: row.branch_id, // Use UUID directly
            dateJoined: row.date_joined || '',
            membershipLevel,
            baptizedSubLevel,
            leaderRole: undefined,
            baptismDate: '',
            joinDate: row.date_joined || '',
            lastVisit: row.updated_at || row.last_attendance || '',
            progress: 0,
            baptismOfficiator: '',
            spiritualMentor: '',
            discipleshipClass1: false,
            discipleshipClass2: false,
            discipleshipClass3: false,
            assignedDepartment: '',
            status: (row.status as any) || 'active',
            ministry: '',
            prayerNeeds: '',
            pastoralNotes: '',
            lastAttendance: row.last_attendance || '',
            createdAt: row.created_at || '',
            updatedAt: row.updated_at || '',
          } as Member;
          return m;
        });
        setDbMembers(mappedMembers);

        const mappedFirstTimers: FirstTimer[] = (fr.data || []).map((row: any) => {
          const ft: FirstTimer = {
            id: row.id, // Use UUID directly
            fullName: row.full_name,
            community: row.community || '',
            area: row.area || '',
            street: row.street || '',
            publicLandmark: row.public_landmark || '',
            phone: row.phone || '',
            email: row.email || '',
            serviceDate: row.service_date || new Date().toISOString(),
            invitedBy: row.invited_by || '',
            followUpStatus: (row.follow_up_status as any) || 'pending',
            branchId: row.branch_id, // Use UUID directly
            firstVisit: row.first_visit || row.service_date || new Date().toISOString(),
            visitDate: row.service_date || new Date().toISOString(),
            status: (row.status as any) || 'new',
            followUpNotes: row.follow_up_notes || '',
            notes: row.notes || '',
            createdAt: row.created_at || new Date().toISOString(),
          } as FirstTimer;
          return ft;
        });
        setDbFirstTimers(mappedFirstTimers);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Reload helpers
  const reloadMembers = useCallback(async () => {
    const { data: mr } = await supabase
      .from('members')
      .select(
        'id, full_name, phone, email, branch_id, membership_level, baptized_sub_level, status, last_attendance, date_joined'
      )
      .order('full_name');

    const mappedMembers: Member[] = (mr || []).map((row: any) => {
      const m: Member = {
        id: row.id, // Use UUID directly
        fullName: row.full_name,
        profilePhoto: '',
        dateOfBirth: '2000-01-01',
        gender: 'male',
        maritalStatus: 'single',
        spouseName: '',
        numberOfChildren: 0,
        children: [],
        email: row.email || '',
        phone: row.phone || '',
        community: '',
        area: '',
        street: '',
        publicLandmark: '',
        branchId: row.branch_id, // Use UUID directly
        dateJoined: row.date_joined || '',
        membershipLevel: row.membership_level as any,
        baptizedSubLevel: row.baptized_sub_level || undefined,
        leaderRole: undefined,
        baptismDate: '',
        joinDate: row.date_joined || '',
        lastVisit: row.date_joined || '',
        progress: 0,
        baptismOfficiator: '',
        spiritualMentor: '',
        discipleshipClass1: false,
        discipleshipClass2: false,
        discipleshipClass3: false,
        assignedDepartment: '',
        status: (row.status as any) || 'active',
        ministry: '',
        prayerNeeds: '',
        pastoralNotes: '',
        lastAttendance: row.last_attendance || '',
        createdAt: row.date_joined || '',
        updatedAt: row.date_joined || '',
      } as Member;
      return m;
    });
    setDbMembers(mappedMembers);
  }, []);

  const reloadFirstTimers = useCallback(async () => {
    const { data: fr } = await supabase
      .from('first_timers')
      .select(
        'id, full_name, phone, email, branch_id, service_date, follow_up_status, status, created_at'
      )
      .order('service_date', { ascending: false });

    const mappedFirstTimers: FirstTimer[] = (fr || []).map((row: any) => {
      const ft: FirstTimer = {
        id: row.id, // Use UUID directly
        fullName: row.full_name,
        community: '',
        area: '',
        street: '',
        publicLandmark: '',
        phone: row.phone || '',
        email: row.email || '',
        serviceDate: row.service_date || new Date().toISOString(),
        invitedBy: '',
        followUpStatus: (row.follow_up_status as any) || 'pending',
        branchId: row.branch_id, // Use UUID directly
        firstVisit: row.service_date || new Date().toISOString(),
        visitDate: row.service_date || new Date().toISOString(),
        status: (row.status as any) || 'new',
        followUpNotes: '',
        notes: '',
        createdAt: row.created_at || new Date().toISOString(),
      } as FirstTimer;
      return ft;
    });
    setDbFirstTimers(mappedFirstTimers);
  }, []);

  const { toast } = useToast();

  useEffect(
    () => setCurrentPage(1),
    [activeTab, debouncedSearchTerm, membershipFilter, branchFilter]
  );

  // All members from database
  const allMembers = useMemo(() => dbMembers, [dbMembers]);

  // All first timers from database  
  const allFirstTimers = useMemo(() => dbFirstTimers, [dbFirstTimers]);

  // Memoized branch lookup map for O(1) access
  const branchMap = useMemo(
    () => Object.fromEntries(branches.map(b => [b.id, b])),
    [branches]
  );

  const getBranchName = useCallback(
    (id?: string) => branchMap[id || '']?.name || 'N/A',
    [branchMap]
  );

  const memberStats: MemberStats = useMemo(
    () => ({
      total: allMembers.length,
      baptized: allMembers.filter((m) => m.membershipLevel === 'baptized').length,
      converts: allMembers.filter((m) => m.membershipLevel === 'convert').length,
      visitors: allFirstTimers.length,
      leaders: allMembers.filter((m) => !!m.leaderRole).length,
      workers: allMembers.filter((m) => m.baptizedSubLevel === 'worker').length,
    }),
    [allMembers, allFirstTimers]
  );

  // Filtered members (paginated)
  const { filteredMembers, totalPages } = useMemo(() => {
    const filtered = filterMembers(allMembers, {
      tab: activeTab,
      searchTerm: debouncedSearchTerm,
      membershipLevel: membershipFilter,
      branchId: branchFilter,
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    return { filteredMembers: paginated, totalPages: pages };
  }, [activeTab, debouncedSearchTerm, membershipFilter, branchFilter, currentPage, allMembers]);

  // Filtered first timers (only used when activeTab === 'visitors')
  const { filteredFirstTimers, firstTimerTotalPages } = useMemo(() => {
    if (activeTab !== 'visitors') return { filteredFirstTimers: [], firstTimerTotalPages: 0 };

    const filtered = filterFirstTimers(allFirstTimers, {
      searchTerm: debouncedSearchTerm,
      branchId: branchFilter,
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    return { filteredFirstTimers: paginated, firstTimerTotalPages: pages };
  }, [activeTab, debouncedSearchTerm, branchFilter, currentPage, allFirstTimers]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const max = activeTab === 'visitors' ? firstTimerTotalPages : totalPages;
      setCurrentPage(Math.max(1, Math.min(newPage, max)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [firstTimerTotalPages, totalPages, activeTab]
  );

  // CRUD helpers (simplified placeholders)
  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberForm(true);
  };
  const handleAddConvert = () => {
    setEditingMember({ membershipLevel: 'convert' } as Member); // Set type to show ConvertForm
    setShowMemberForm(true);
  };


  const handleAddFirstTimer = () => {
    setEditingFirstTimer(null);
    setShowFirstTimerForm(true);
  };
  const handleEditMember = (m: Member) => {
    setEditingMember(m);
    setShowMemberForm(true);
  };
  const handleEditFirstTimer = (ft: FirstTimer) => {
    setEditingFirstTimer(ft);
    setShowFirstTimerForm(true);
  };

  const handleViewMember = (m: Member) => {
    if (m.id) {  // Use ID directly
      navigate(`/admin/member/${m.id}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const result = await deleteMember(id);
    if (!result.success) {
      toast({
        title: 'Delete failed',
        description: result.error || 'Failed to delete member',
        variant: 'destructive',
      });
      return;
    }
    setDbMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMembers((prev) => prev.filter((x) => x !== id));
    toast({ title: 'Member deleted', description: 'The member has been removed.' });
  };
  const handleDeleteFirstTimer = async (id: string) => {
    const result = await deleteFirstTimer(id);
    if (!result.success) {
      toast({
        title: 'Delete failed',
        description: result.error || 'Failed to delete visitor',
        variant: 'destructive',
      });
      return;
    }
    setDbFirstTimers((prev) => prev.filter((f) => f.id !== id));
    setSelectedFirstTimers((prev) => prev.filter((x) => x !== id));
    toast({ title: 'First timer deleted', description: 'Removed.' });
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      handleDeleteMember(memberToDelete.id);
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const confirmDeleteFirstTimer = () => {
    if (firstTimerToDelete) {
      handleDeleteFirstTimer(firstTimerToDelete.id);
      setIsDeleteDialogOpen(false);
      setFirstTimerToDelete(null);
    }
  };

  // Selection helpers
  const handleSelectMember = (id: string, checked: boolean) => {
    setSelectedMembers((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    );
  };
  const handleSelectFirstTimer = (id: string, checked: boolean) => {
    setSelectedFirstTimers((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    );
  };
  const handleSelectAllMembers = (checked: boolean) => {
    if (checked) {
      if (activeTab === 'visitors') setSelectedFirstTimers(filteredFirstTimers.map((ft) => ft.id));
      else setSelectedMembers(filteredMembers.map((m) => m.id));
    } else {
      if (activeTab === 'visitors') setSelectedFirstTimers([]);
      else setSelectedMembers([]);
    }
  };

  // Skeleton rows
  const renderSkeletonRows = (count: number, isVisitor = false) =>
    Array.from({ length: count }).map((_, i) => (
      <TableRow key={i} className="h-16">
        <TableCell>
          <Skeleton className="h-4 w-4 rounded" />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </TableCell>
        {!isVisitor && (
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        )}
        {!isVisitor && (
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
        )}
        {!isVisitor && (
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-16" />
          </TableCell>
        )}
        {!isVisitor && (
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
        )}
        {!isVisitor && (
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-4 w-24" />
          </TableCell>
        )}
        <TableCell>
          <div className="flex justify-end space-x-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </TableCell>
      </TableRow>
    ));

  // Composer helpers
  const totalRecipientsCount = selectedMembers.length + selectedFirstTimers.length;

  const openComposer = () => {
    if (totalRecipientsCount === 0) {
      toast({
        title: 'No recipients',
        description: 'Select at least one member or visitor to message.',
      });
      return;
    }
    setIsSendNotificationDialogOpen(true);
  };


  // Pagination UI component (inline)
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Member Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage church members and first-time visitors.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={openComposer}
            disabled={totalRecipientsCount === 0}
            className="hidden sm:inline-flex"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Message {totalRecipientsCount > 0 ? `(${totalRecipientsCount})` : ''}
          </Button>

          {activeTab !== 'visitors' && selectedMembers.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBatchTransferDialogOpen(true)}
              className="hidden sm:inline-flex"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transfer Selected ({selectedMembers.length})
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button
            onClick={
              activeTab === 'visitors'
                ? handleAddFirstTimer
                : activeTab === 'converts'
                  ? handleAddConvert
                  : handleAddMember
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {activeTab === 'visitors'
                ? 'Add First Timer'
                : activeTab === 'converts'
                  ? 'Add Convert'
                  : 'Add Member'}
            </span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="workers" className="text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 sm:mr-2" /> <span>Workers & Disciples</span>
            <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs">
              {memberStats.workers + Math.max(0, memberStats.baptized - memberStats.workers)}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="converts" className="text-xs sm:text-sm">
            <UserPlus className="h-3.5 w-3.5 sm:mr-2" /> <span>Converts</span>
            <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs">
              {memberStats.converts}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="visitors" className="text-xs sm:text-sm">
            <UserPlus className="h-3.5 w-3.5 sm:mr-2" /> <span>Visitors</span>
            <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs">
              {memberStats.visitors}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              placeholder={`Search ${activeTab === 'visitors' ? 'first timers' : 'members'}...`}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {isSuperadmin ? (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm w-[140px] sm:w-[160px]">
                  <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-9 sm:h-10 text-xs sm:text-sm w-[140px] sm:w-[160px] flex items-center gap-2 px-3 rounded border bg-white">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">
                  {branches.find((b) => b.id === effectiveBranchId)?.name || 'Branch'}
                </span>
              </div>
            )}

            {activeTab !== 'visitors' && (
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm w-[120px] sm:w-[140px]">
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {MEMBERSHIP_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {getMembershipLevelDisplay(l)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Table */}
        <TabsContent value={activeTab} className="space-y-4 mt-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={(e) => handleSelectAllMembers(e.target.checked)}
                        checked={
                          activeTab === 'visitors'
                            ? filteredFirstTimers.length > 0 &&
                            selectedFirstTimers.length === filteredFirstTimers.length
                            : filteredMembers.length > 0 &&
                            selectedMembers.length === filteredMembers.length
                        }
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    {activeTab !== 'visitors' && (
                      <>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Branch</TableHead>
                        <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                        <TableHead className="hidden lg:table-cell">Progress</TableHead>
                      </>
                    )}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    renderSkeletonRows(5, activeTab === 'visitors')
                  ) : activeTab === 'visitors' ? (
                    filteredFirstTimers.length > 0 ? (
                      filteredFirstTimers.map((ft) => (
                        <TableRow key={ft.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedFirstTimers.includes(ft.id)}
                              onChange={(e) => handleSelectFirstTimer(ft.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-gray-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{ft.fullName}</div>
                                <div className="text-xs text-gray-500">
                                  Visit: {new Date(ft.serviceDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditFirstTimer(ft)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditFirstTimer(ft)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => handleDeleteFirstTimer(ft.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No visitors found
                        </TableCell>
                      </TableRow>
                    )
                  ) : filteredMembers.length > 0 ? (
                    filteredMembers
                      .filter((member) => {
                        if (activeTab === 'workers')
                          return (
                            member.baptizedSubLevel === 'worker' ||
                            member.baptizedSubLevel === 'disciple'
                          );
                        if (activeTab === 'converts') return member.membershipLevel === 'convert';
                        return true;
                      })
                      .map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member.id)}
                              onChange={(e) => handleSelectMember(member.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-700">
                                  {member.fullName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{member.fullName}</div>
                                <div className="text-xs text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{member.phone || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                member.membershipLevel === 'baptized'
                                  ? 'bg-green-50 text-green-700'
                                  : member.membershipLevel === 'convert'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-gray-50 text-gray-700'
                              )}
                            >
                              {getMembershipLevelDisplay(member.membershipLevel)}
                              {member.baptizedSubLevel ? ` (${member.baptizedSubLevel})` : ''}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {(() => {
                              const bid = member.branchId; // Use branchId directly
                              const found = branches.find((b) => b.id === bid);
                              return found?.name || 'N/A';
                            })()}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm">
                              {member.lastVisit
                                ? new Date(member.lastVisit).toLocaleDateString()
                                : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-indigo-600 h-1.5 rounded-full"
                                  style={{ width: `${member.progress ?? 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">
                                {member.progress ?? 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewMember(member)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member form in dialog */}
        <Dialog open={showMemberForm} onOpenChange={setShowMemberForm}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingMember?.membershipLevel === 'convert'
                  ? editingMember?.fullName
                    ? 'Edit Convert'
                    : 'Add Convert'
                  : editingMember
                    ? 'Edit Member'
                    : 'Add New Member'}
              </DialogTitle>
            </DialogHeader>

            {editingMember?.membershipLevel === 'convert' ? (
              <ConvertForm
                convert={{
                  id: editingMember.id,
                  fullName: editingMember.fullName || '',
                  email: editingMember.email || '',
                  phone: editingMember.phone || '',
                  community: '',
                  area: '',
                  branchId: branches[0]?.id || '',
                }}
                branches={branches}
                onSubmit={async (data: ConvertFormData) => {
                  try {
                    const payload = {
                      full_name: data.fullName,
                      email: data.email || null,
                      phone: data.phone,
                      community: data.community,
                      area: data.area,
                      branch_id: data.branchId,
                      membership_level: 'convert' as const,
                      baptized_sub_level: 'disciple' as const,
                      date_joined: new Date().toISOString(),
                      date_of_birth: new Date().toISOString(),
                      gender: 'male' as const,
                      marital_status: 'single' as const,
                      street: '',
                      status: 'active' as const,
                      profile_photo: data.profilePhoto || null,
                    };


                    if (editingMember && editingMember.id) {
                      // Update existing convert
                      const result = await updateMember(editingMember.id, payload);
                      if (!result.success) {
                        throw new Error(result.error || 'Failed to update convert');
                      }
                    } else {
                      // Create new convert
                      const result = await createMember(payload);
                      if (!result.success) {
                        throw new Error(result.error || 'Failed to create convert');
                      }
                    }

                    await reloadMembers();
                    toast({
                      title: editingMember && editingMember.id ? 'Convert updated' : 'Convert added',
                      description: 'Saved successfully.',
                    });
                    setShowMemberForm(false);
                  } catch (err: any) {
                    toast({
                      title: 'Save failed',
                      description: err.message || 'Database error',
                      variant: 'destructive',
                    });
                  }
                }}
                onCancel={() => setShowMemberForm(false)}
              />
            ) : (
              <MemberForm
                member={editingMember ?? undefined}
                onCancel={() => setShowMemberForm(false)}
                onSubmit={async (data) => {
                  try {
                    const { createAccount, username, password, ...memberData } = data;
                    const payload: any = {
                      full_name: memberData.fullName,
                      email: memberData.email,
                      phone: memberData.phone,
                      community: memberData.community,
                      area: memberData.area,
                      street: memberData.street,
                      public_landmark: memberData.publicLandmark || null,
                      branch_id: memberData.branchId,
                      date_joined: memberData.joinDate,
                      date_of_birth: memberData.dateOfBirth,
                      gender: memberData.gender as any,
                      marital_status: memberData.maritalStatus as any,
                      membership_level: memberData.membershipLevel as any,
                      baptized_sub_level:
                        memberData.membershipLevel === 'baptized'
                          ? (memberData.baptizedSubLevel as any)
                          : null,
                      leader_role: (memberData.leaderRole as any) || null,
                      status: 'active',
                    };

                    if (editingMember) {
                      // Update existing member
                      const result = await updateMember(editingMember.id, payload);
                      if (!result.success) {
                        throw new Error(result.error || 'Failed to update member');
                      }
                    } else {
                      // Create new member
                      const result = await createMember(payload);
                      if (!result.success) {
                        throw new Error(result.error || 'Failed to create member');
                      }

                      // Note: Account creation and children records deferred
                      // TODO: Add account creation to Edge Function
                      // TODO: Add children records handling to Edge Function
                      if (createAccount && username && password) {
                        toast({
                          title: 'Member created',
                          description: 'Note: Account creation feature will be added to Edge Function',
                        });
                      }
                    }

                    await reloadMembers();
                    toast({
                      title: editingMember ? 'Member updated' : 'Member added',
                      description: 'Saved successfully.',
                    });
                    setShowMemberForm(false);
                  } catch (err: any) {
                    toast({
                      title: 'Save failed',
                      description: err.message || 'Database error',
                      variant: 'destructive',
                    });
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* FirstTimer form in dialog */}
        <Dialog open={showFirstTimerForm} onOpenChange={setShowFirstTimerForm}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingFirstTimer ? 'Edit First Timer' : 'Add New First Timer'}
              </DialogTitle>
            </DialogHeader>
            <FirstTimerForm
              firstTimer={editingFirstTimer ?? undefined}
              onCancel={() => setShowFirstTimerForm(false)}
              onSubmit={async (data) => {
                try {
                  const payload: any = {
                    full_name: data.fullName,
                    community: data.community,
                    area: data.area,
                    street: data.street,
                    public_landmark: data.publicLandmark || null,
                    phone: data.phone || null,
                    email: null,
                    service_date: data.serviceDate,
                    invited_by: data.invitedBy || null,
                    follow_up_status: 'pending',
                    branch_id: data.branchId,
                    first_visit: data.serviceDate,
                    status: 'new',
                    notes: data.notes || null,
                  };

                  if (editingFirstTimer) {
                    // Update existing first-timer
                    const result = await updateFirstTimer(editingFirstTimer.id, payload);
                    if (!result.success) {
                      throw new Error(result.error || 'Failed to update first timer');
                    }
                  } else {
                    // Create new first-timer
                    const result = await createFirstTimer(payload);
                    if (!result.success) {
                      throw new Error(result.error || 'Failed to create first timer');
                    }
                  }

                  await reloadFirstTimers();
                  toast({
                    title: editingFirstTimer ? 'First timer updated' : 'First timer added',
                    description: 'Saved successfully.',
                  });
                  setShowFirstTimerForm(false);
                } catch (err: any) {
                  toast({
                    title: 'Save failed',
                    description: err.message || 'Database error',
                    variant: 'destructive',
                  });
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </Tabs>

      {/* Pagination */}
      {activeTab === 'visitors' ? (
        <PaginationControls
          currentPage={currentPage}
          totalPages={firstTimerTotalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <SendNotificationDialog
        open={isSendNotificationDialogOpen}
        onOpenChange={setIsSendNotificationDialogOpen}
        recipientIds={[
          ...selectedMembers, // Already UUIDs
          ...selectedFirstTimers, // Already UUIDs
        ].filter(Boolean)}
        recipientCount={totalRecipientsCount}
        onSuccess={() => {
          setSelectedMembers([]);
          setSelectedFirstTimers([]);
        }}
      />

      <MemberImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        branchId={branches[0]?.id || ''}
        onSuccess={() => {
          reloadMembers();
          setIsImportDialogOpen(false);
        }}
      />

      <BatchTransferDialog
        open={isBatchTransferDialogOpen}
        onOpenChange={setIsBatchTransferDialogOpen}
        selectedMembers={selectedMembers
          .map((id) => {
            const member = allMembers.find(m => m.id === id);
            return {
              memberId: id,
              currentBranchId: member?.branchId || '',
            };
          })
          .filter((m) => m.memberId && m.currentBranchId)}
        onSuccess={() => {
          setSelectedMembers([]);
          setIsBatchTransferDialogOpen(false);
          reloadMembers();
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {memberToDelete ? ' member' : ' first timer'} and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={memberToDelete ? confirmDeleteMember : confirmDeleteFirstTimer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OptimizedMemberManagement;
