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
import { MemberForm } from './MemberForm';
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

type TabType = 'workers' | 'converts' | 'visitors';

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
  const [activeTab, setActiveTab] = useState<TabType>('workers');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedFirstTimers, setSelectedFirstTimers] = useState<number[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showFirstTimerForm, setShowFirstTimerForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFirstTimer, setEditingFirstTimer] = useState<FirstTimer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMembers, setAddedMembers] = useState<Member[]>([]);
  const [addedFirstTimers, setAddedFirstTimers] = useState<FirstTimer[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBatchTransferDialogOpen, setIsBatchTransferDialogOpen] = useState(false);
  const [isSendNotificationDialogOpen, setIsSendNotificationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [firstTimerToDelete, setFirstTimerToDelete] = useState<FirstTimer | null>(null);

  // Live data state
  const [dbMembers, setDbMembers] = useState<Member[]>([]);
  const [dbFirstTimers, setDbFirstTimers] = useState<FirstTimer[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Map local numeric IDs to DB UUIDs and branch IDs for actions/display
  const memberMetaRef = useRef(new Map<number, { dbId: string; branchId: string }>());
  const firstTimerMetaRef = useRef(new Map<number, { dbId: string; branchId: string }>());

  // Stable numeric ID from UUID for local selection keys
  const toLocalId = useCallback((s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) + 1;
  }, []);

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
              'id, full_name, email, phone, branch_id, membership_level, baptized_sub_level, status, date_joined, updated_at, last_attendance, created_at'
            )
            .order('full_name'),
          supabase
            .from('first_timers')
            .select(
              'id, full_name, email, phone, branch_id, service_date, community, area, street, public_landmark, invited_by, follow_up_status, status, created_at, first_visit, updated_at, notes, follow_up_notes'
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
          const lid = toLocalId(row.id);
          memberMetaRef.current.set(lid, { dbId: row.id, branchId: row.branch_id });
          const m: Member = {
            id: lid,
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
            branchId: 0,
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
          const lid = toLocalId(row.id);
          firstTimerMetaRef.current.set(lid, { dbId: row.id, branchId: row.branch_id });
          const ft: FirstTimer = {
            id: lid,
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
            branchId: 0,
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
  }, [toLocalId]);

  // Reload helpers
  const reloadMembers = useCallback(async () => {
    const { data: mr } = await supabase
      .from('members')
      .select(
        'id, full_name, email, phone, branch_id, membership_level, baptized_sub_level, status, date_joined, updated_at, last_attendance, created_at'
      )
      .order('full_name');

    const mappedMembers: Member[] = (mr || []).map((row: any) => {
      const lid = toLocalId(row.id);
      memberMetaRef.current.set(lid, { dbId: row.id, branchId: row.branch_id });
      const m: Member = {
        id: lid,
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
        branchId: 0,
        dateJoined: row.date_joined || '',
        membershipLevel: row.membership_level as any,
        baptizedSubLevel: row.baptized_sub_level || undefined,
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
  }, [toLocalId]);

  const reloadFirstTimers = useCallback(async () => {
    const { data: fr } = await supabase
      .from('first_timers')
      .select(
        'id, full_name, email, phone, branch_id, service_date, community, area, street, public_landmark, invited_by, follow_up_status, status, created_at, first_visit, updated_at, notes, follow_up_notes'
      )
      .order('service_date', { ascending: false });

    const mappedFirstTimers: FirstTimer[] = (fr || []).map((row: any) => {
      const lid = toLocalId(row.id);
      firstTimerMetaRef.current.set(lid, { dbId: row.id, branchId: row.branch_id });
      const ft: FirstTimer = {
        id: lid,
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
        branchId: 0,
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
  }, [toLocalId]);

  const { toast } = useToast();

  useEffect(
    () => setCurrentPage(1),
    [activeTab, debouncedSearchTerm, membershipFilter, branchFilter]
  );

  const allMembers = useMemo(() => {
    const map = new Map<number, Member>();
    dbMembers.forEach((m) => map.set(m.id, m));
    addedMembers.forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [addedMembers, dbMembers]);
  const allFirstTimers = useMemo(() => {
    const map = new Map<number, FirstTimer>();
    dbFirstTimers.forEach((f) => map.set(f.id, f));
    addedFirstTimers.forEach((f) => map.set(f.id, f));
    return Array.from(map.values());
  }, [addedFirstTimers, dbFirstTimers]);

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
    const q = debouncedSearchTerm.toLowerCase();
    const filtered = allMembers.filter((member) => {
      // Tab: workers includes both workers and disciples
      const matchesTab =
        activeTab === 'workers'
          ? member.baptizedSubLevel === 'worker' || member.baptizedSubLevel === 'disciple'
          : activeTab === 'converts'
            ? member.membershipLevel === 'convert'
            : activeTab === 'visitors'
              ? member.membershipLevel === 'visitor'
              : true;

      const matchesSearch =
        member.fullName.toLowerCase().includes(q) ||
        (member.email && member.email.toLowerCase().includes(q)) ||
        (member.phone && member.phone.includes(debouncedSearchTerm));

      const matchesMembership =
        membershipFilter === 'all' || member.membershipLevel === membershipFilter;
      const matchesBranch =
        branchFilter === 'all' || memberMetaRef.current.get(member.id)?.branchId === branchFilter;

      return matchesTab && matchesSearch && matchesMembership && matchesBranch;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    return { filteredMembers: paginated, totalPages: pages };
  }, [activeTab, debouncedSearchTerm, membershipFilter, branchFilter, currentPage, allMembers]);

  // Filtered first timers (only used when activeTab === 'visitors')
  const { filteredFirstTimers, firstTimerTotalPages } = useMemo(() => {
    if (activeTab !== 'visitors') return { filteredFirstTimers: [], firstTimerTotalPages: 0 };
    const q = debouncedSearchTerm.toLowerCase();
    const filtered = allFirstTimers.filter((ft) => {
      const matchesSearch =
        ft.fullName.toLowerCase().includes(q) ||
        (ft.phone && ft.phone.includes(debouncedSearchTerm));
      const matchesBranch =
        branchFilter === 'all' || firstTimerMetaRef.current.get(ft.id)?.branchId === branchFilter;
      return matchesSearch && matchesBranch;
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
    setEditingMember({
      id: 0,
      fullName: '',
      email: '',
      phone: '',
      membershipLevel: 'convert',
      baptizedSubLevel: 'disciple',
      branchId: 1,
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      status: 'active',
      progress: 0,
    } as Member);
    setShowMemberForm(true);
  };

  // Listen for quick-created member from ProvisioningQueue
  useEffect(() => {
    const handleIncoming = () => {
      try {
        const stored = sessionStorage.getItem('mm:newMember');
        if (!stored) return;
        const detail = JSON.parse(stored);
        sessionStorage.removeItem('mm:newMember');
        if (!detail) return;
        const now = new Date().toISOString();
        if (detail.membershipLevel === 'visitor') {
          const ft: FirstTimer = {
            id: Date.now(),
            fullName: detail.fullName,
            community: '',
            area: '',
            street: '',
            publicLandmark: '',
            phone: detail.phone || '',
            email: detail.email || '',
            serviceDate: now,
            invitedBy: '',
            followUpStatus: 'pending',
            branchId: detail.branchId || 1,
            firstVisit: now,
            visitDate: now,
            status: 'new',
            followUpNotes: '',
            notes: '',
            createdAt: now,
          };
          setAddedFirstTimers((prev) => [ft, ...prev]);
        } else {
          const m: Member = {
            id: Date.now(),
            fullName: detail.fullName,
            profilePhoto: '',
            dateOfBirth: '2000-01-01',
            gender: 'male',
            maritalStatus: 'single',
            spouseName: '',
            numberOfChildren: 0,
            children: [],
            email: detail.email || '',
            phone: detail.phone || '',
            community: '',
            area: '',
            street: '',
            publicLandmark: '',
            branchId: detail.branchId || 1,
            dateJoined: now,
            membershipLevel: detail.membershipLevel,
            baptizedSubLevel:
              detail.baptizedSubLevel && detail.baptizedSubLevel !== 'none'
                ? detail.baptizedSubLevel
                : undefined,
            leaderRole: undefined,
            baptismDate: '',
            joinDate: now,
            lastVisit: now,
            progress: 0,
            baptismOfficiator: '',
            spiritualMentor: '',
            discipleshipClass1: false,
            discipleshipClass2: false,
            discipleshipClass3: false,
            assignedDepartment: '',
            status: 'active',
            ministry: '',
            prayerNeeds: '',
            pastoralNotes: '',
            lastAttendance: '',
            createdAt: now,
            updatedAt: now,
          } as Member;
          setAddedMembers((prev) => [m, ...prev]);
        }
      } catch (error) {
        console.error('Error handling incoming member:', error);
      }
    };
    const listener = () => handleIncoming();
    window.addEventListener('member:created', listener);
    // Also check once on mount
    handleIncoming();
    return () => window.removeEventListener('member:created', listener);
  }, []);
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
    const dbId = memberMetaRef.current.get(m.id)?.dbId;
    if (dbId) {
      navigate(`/admin/member/${dbId}`);
    }
  };

  const handleDeleteMember = async (id: number) => {
    const dbId = memberMetaRef.current.get(id)?.dbId;
    if (!dbId) {
      toast({
        title: 'Delete failed',
        description: 'Unable to resolve member id.',
        variant: 'destructive',
      });
      return;
    }
    const { data, error } = await supabase.functions.invoke('admin-create-member', {
      body: { action: 'delete', id: dbId },
    } as any);
    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Edge function error',
        variant: 'destructive',
      });
      return;
    }
    setAddedMembers((prev) => prev.filter((m) => m.id !== id));
    setDbMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMembers((prev) => prev.filter((x) => x !== id));
    memberMetaRef.current.delete(id);
    toast({ title: 'Member deleted', description: 'The member has been removed.' });
  };
  const handleDeleteFirstTimer = async (id: number) => {
    const dbId = firstTimerMetaRef.current.get(id)?.dbId;
    if (!dbId) {
      toast({
        title: 'Delete failed',
        description: 'Unable to resolve visitor id.',
        variant: 'destructive',
      });
      return;
    }
    const { data, error } = await supabase.functions.invoke('admin-create-member', {
      body: { action: 'delete', id: dbId, target: 'first_timers' },
    } as any);
    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Edge function error',
        variant: 'destructive',
      });
      return;
    }
    setAddedFirstTimers((prev) => prev.filter((f) => f.id !== id));
    setDbFirstTimers((prev) => prev.filter((f) => f.id !== id));
    setSelectedFirstTimers((prev) => prev.filter((x) => x !== id));
    firstTimerMetaRef.current.delete(id);
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
  const handleSelectMember = (id: number, checked: boolean) => {
    setSelectedMembers((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    );
  };
  const handleSelectFirstTimer = (id: number, checked: boolean) => {
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

  // Loading simulation
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab, debouncedSearchTerm, membershipFilter, branchFilter, currentPage]);

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
                              const bid = memberMetaRef.current.get(member.id)?.branchId;
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            </DialogHeader>
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
                    const dbId = memberMetaRef.current.get(editingMember.id)?.dbId;
                    if (!dbId) throw new Error('Unable to resolve member id');
                    const { error } = await supabase.from('members').update(payload).eq('id', dbId);
                    if (error) throw error;
                  } else {
                    // Use edge function for account creation if requested
                    if (createAccount && username && password) {
                      const {
                        data: { session },
                      } = await supabase.auth.getSession();
                      const { data: result, error } = await supabase.functions.invoke(
                        'admin-create-member',
                        {
                          headers: {
                            Authorization: `Bearer ${session?.access_token}`,
                          },
                          body: {
                            action: 'insert',
                            data: { ...payload, createAccount, username, password },
                          },
                        }
                      );
                      if (error) throw error;
                      if (result?.error) throw new Error(result.error);

                      const memberId = result?.data?.id;
                      const children = (memberData.children ?? []) as any[];
                      if (memberId && children.length) {
                        const childRows = children.map((c) => ({
                          member_id: memberId,
                          name: c.name,
                          date_of_birth: c.dateOfBirth,
                          gender: c.gender as any,
                          notes: c.notes || null,
                        }));
                        await supabase.from('children').insert(childRows);
                      }
                    } else {
                      // Regular member creation without account
                      const { data: inserted, error } = await supabase
                        .from('members')
                        .insert(payload)
                        .select('id')
                        .single();
                      if (error) throw error;
                      const memberId = inserted?.id as string;
                      const children = (memberData.children ?? []) as any[];
                      if (memberId && children.length) {
                        const childRows = children.map((c) => ({
                          member_id: memberId,
                          name: c.name,
                          date_of_birth: c.dateOfBirth,
                          gender: c.gender as any,
                          notes: c.notes || null,
                        }));
                        await supabase.from('children').insert(childRows);
                      }
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
          </DialogContent>
        </Dialog>

        {/* FirstTimer form in dialog */}
        <Dialog open={showFirstTimerForm} onOpenChange={setShowFirstTimerForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    const dbId = firstTimerMetaRef.current.get(editingFirstTimer.id)?.dbId;
                    if (!dbId) throw new Error('Unable to resolve visitor id');
                    const { error } = await supabase
                      .from('first_timers')
                      .update(payload)
                      .eq('id', dbId);
                    if (error) throw error;
                  } else {
                    const { error } = await supabase.from('first_timers').insert(payload);
                    if (error) throw error;
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
          ...selectedMembers.map((id) => memberMetaRef.current.get(id)?.dbId || ''),
          ...selectedFirstTimers.map((id) => firstTimerMetaRef.current.get(id)?.dbId || ''),
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
            const meta = memberMetaRef.current.get(id);
            return {
              memberId: meta?.dbId || '',
              currentBranchId: meta?.branchId || '',
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
