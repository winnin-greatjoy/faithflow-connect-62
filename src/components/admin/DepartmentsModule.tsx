'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Activity, Settings } from 'lucide-react';
import { AddDepartmentForm } from './AddDepartmentForm';
import { supabase } from '@/integrations/supabase/client';
import { AddMemberToDepartmentDialog } from '@/components/departments/AddMemberToDepartmentDialog';
import { DepartmentSettingsDialog } from '@/components/departments/DepartmentSettingsDialog';
import { MinistrySettingsDialog } from '@/components/ministries/MinistrySettingsDialog';
import { AddMemberToMinistryDialog } from '@/components/ministries/AddMemberToMinistryDialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthz } from '@/hooks/useAuthz';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ✅ Type Definitions
type Department = {
  id: string;
  name: string;
  slug: string;
  leader: string;
  members: number;
  activities: number;
  status: 'Active' | 'Inactive';
};

type Ministry = {
  id: string;
  name: string;
  leader: string;
  members: number;
  activities: number;
  status: 'Active' | 'Inactive';
  description: string;
};

// ✅ Department Card Component
const DepartmentCard: React.FC<{
  dept: Department;
  onOpen: (dept: Department) => void;
  onMembersClick: (dept: Department) => void;
  onSettingsClick: (dept: Department) => void;
}> = ({ dept, onOpen, onMembersClick, onSettingsClick }) => (
  <Card
    key={dept.id}
    className="hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onOpen(dept)}
  >
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg">{dept.name}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Led by {dept.leader}</p>
        </div>
        <Badge className="bg-green-50 text-green-700 text-xs sm:text-sm">{dept.status}</Badge>
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="space-y-3">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Members:</span>
          <span className="font-medium">{dept.members}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Activities:</span>
          <span className="font-medium">{dept.activities}</span>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onMembersClick(dept);
            }}
          >
            <Users className="mr-1.5 h-4 w-4" />
            Members
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick(dept);
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ✅ Ministry Card Component
const MinistryCard: React.FC<{
  ministry: Ministry;
  onOpen: (ministry: Ministry) => void;
  onMembersClick: (ministry: Ministry) => void;
  onSettingsClick: (ministry: Ministry) => void;
}> = ({ ministry, onOpen, onMembersClick, onSettingsClick }) => (
  <Card
    key={ministry.id}
    className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
    onClick={() => onOpen(ministry)}
  >
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg">{ministry.name}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{ministry.description}</p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 text-xs sm:text-sm">{ministry.status}</Badge>
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="space-y-3">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Leader:</span>
          <span className="font-medium">{ministry.leader}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Members:</span>
          <span className="font-medium">{ministry.members}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Activities:</span>
          <span className="font-medium">{ministry.activities}</span>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onMembersClick(ministry);
            }}
          >
            <Users className="mr-1.5 h-4 w-4" />
            Members
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick(ministry);
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ✅ Main Module Component
export const DepartmentsModule = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [ministrySearch, setMinistrySearch] = useState('');
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<Department | null>(null);
  const [deptMembers, setDeptMembers] = useState<Array<{ id: string; full_name: string }>>([]);

  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [addMinistryOpen, setAddMinistryOpen] = useState(false);
  const [mName, setMName] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [savingMinistry, setSavingMinistry] = useState(false);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  const { selectedBranchId, loading: contextLoading } = useAdminContext();
  const { branchId: authBranchId, hasRole } = useAuthz();

  const effectiveBranchId = selectedBranchId || authBranchId;
  const [formBranchId, setFormBranchId] = useState<string>('');

  // Ministry dialog state
  const [activeMinistry, setActiveMinistry] = useState<Ministry | null>(null);
  const [isMinistrySettingsOpen, setIsMinistrySettingsOpen] = useState(false);
  const [isAddMinistryMembersOpen, setIsAddMinistryMembersOpen] = useState(false);

  const [totalDepartmentsCount, setTotalDepartmentsCount] = useState<number>(0);
  const [totalMinistryMembersCount, setTotalMinistryMembersCount] = useState<number>(0);
  const [recentMinistryActivitiesCount, setRecentMinistryActivitiesCount] = useState<number>(0);

  // Load ministries
  const loadMinistries = async () => {
    try {
      const query = supabase
        .from('ministries')
        .select('id, name, description, branch_id, head_id')
        .order('created_at', { ascending: true });

      if (effectiveBranchId) query.eq('branch_id', effectiveBranchId);

      const { data: ministriesData, error } = await query;
      if (error) throw error;

      // Aggregates
      const { data: mmAll } = await supabase.from('ministry_members').select('ministry_id');
      const { data: evAll } = await supabase
        .from('ministry_events')
        .select('ministry_id, event_date');

      const mmMap: Record<string, number> = {};
      (mmAll || []).forEach((row: any) => {
        const k = row.ministry_id;
        mmMap[k] = (mmMap[k] || 0) + 1;
      });
      const evMap: Record<string, number> = {};
      (evAll || []).forEach((row: any) => {
        const k = row.ministry_id;
        evMap[k] = (evMap[k] || 0) + 1;
      });

      // Fetch leader names manually since FK might be missing in types
      const headIds = (ministriesData || []).map((m: any) => m.head_id).filter((id: any) => id);

      const leaderMap: Record<string, string> = {};
      if (headIds.length > 0) {
        const { data: leaders } = await supabase
          .from('members')
          .select('id, full_name')
          .in('id', headIds);

        (leaders || []).forEach((l: any) => {
          leaderMap[l.id] = l.full_name;
        });
      }

      const mapped: Ministry[] = (ministriesData || []).map((m: any) => ({
        id: m.id,
        name: m.name || 'Ministry',
        description: m.description || '',
        leader: m.head_id ? leaderMap[m.head_id] || 'Unknown' : 'No Leader',
        members: mmMap[m.id] || 0,
        activities: evMap[m.id] || 0,
        status: 'Active',
      }));
      setMinistries(mapped);

      // Update counts
      const ministryIds = new Set<string>((ministriesData || []).map((m: any) => m.id));
      setTotalMinistryMembersCount(
        (mmAll || []).filter((row: any) => ministryIds.has(row.ministry_id)).length
      );

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const recentCount = (evAll || []).filter((row: any) => {
        const d = row.event_date ? new Date(row.event_date) : null;
        return d && d >= startOfMonth && ministryIds.has(row.ministry_id);
      }).length;
      setRecentMinistryActivitiesCount(recentCount);
    } catch (e) {
      console.error('Failed to load ministries:', e);
      toast({ title: 'Error', description: 'Failed to load ministries', variant: 'destructive' });
    }
  };

  // reload departments (used after updates)
  const reloadDepartments = async () => {
    try {
      const deptListQuery = supabase
        .from('departments')
        .select(
          'id, name, slug, description, branch_id, head_id, members!departments_head_id_fkey(full_name)'
        );
      if (effectiveBranchId) deptListQuery.eq('branch_id', effectiveBranchId);
      const { data: deptList } = await deptListQuery;
      if (deptList) {
        // Get member counts
        const deptIds = deptList.map((d) => d.id);
        const { data: memberCounts } = await supabase
          .from('members')
          .select('assigned_department')
          .in('assigned_department', deptIds);
        const { data: taskCounts } = await supabase
          .from('department_tasks')
          .select('department_id')
          .in('department_id', deptIds);

        const memberCountMap: Record<string, number> = {};
        (memberCounts || []).forEach((m: any) => {
          if (m.assigned_department) {
            memberCountMap[m.assigned_department] =
              (memberCountMap[m.assigned_department] || 0) + 1;
          }
        });
        const taskCountMap: Record<string, number> = {};
        (taskCounts || []).forEach((t: any) => {
          taskCountMap[t.department_id] = (taskCountMap[t.department_id] || 0) + 1;
        });

        setDepartments(
          deptList.map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            leader: d.members?.full_name || 'No Leader',
            members: memberCountMap[d.id] || 0,
            activities: taskCountMap[d.id] || 0,
            status: 'Active' as const,
          }))
        );
      }

      // Update total count
      const deptCountQuery = supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });
      if (effectiveBranchId) deptCountQuery.eq('branch_id', effectiveBranchId);
      const { count } = await deptCountQuery;
      setTotalDepartmentsCount(count || 0);
    } catch (e) {
      console.error('Failed to reload departments:', e);
    }
  };

  const loadDepartmentMembers = async (departmentId: string) => {
    if (!departmentId) return;
    try {
      const { data } = await supabase
        .from('members')
        .select('id, full_name')
        .eq('assigned_department', departmentId)
        .order('full_name');
      setDeptMembers((data || []).map((m: any) => ({ id: m.id, full_name: m.full_name })));
    } catch (e) {
      setDeptMembers([]);
    }
  };

  // ✅ Department click handler
  const handleDepartmentClick = (dept: Department & { slug: string }) => {
    navigate(`/departments/${dept.slug}`);
  };

  const handleOpenAddMembers = (dept: Department) => {
    setActiveDepartment(dept);
    setIsAddMembersOpen(true);
  };

  const handleOpenSettings = async (dept: Department) => {
    setActiveDepartment(dept);
    await loadDepartmentMembers(dept.id);
    setIsSettingsOpen(true);
  };

  // ✅ Ministry click handler
  const handleMinistryClick = (ministry: Ministry) => {
    // Navigate to the appropriate ministry dashboard based on ministry name
    const raw = ministry.name || '';
    const name = raw.toLowerCase();
    const normalized = raw.replace(/[^a-z]/gi, ' ').toLowerCase();
    const isMens =
      /\bmen\b/.test(normalized) || /\bmens\b/.test(normalized) || normalized.includes('men s');
    const isWomens =
      /\bwomen\b/.test(normalized) ||
      /\bwomens\b/.test(normalized) ||
      normalized.includes('women s');

    if (isMens) {
      navigate(`/admin/mens-ministry/${ministry.id}`);
      return;
    }
    if (isWomens) {
      navigate(`/admin/womens-ministry/${ministry.id}`);
      return;
    }
    if (name.includes('youth')) {
      navigate(`/admin/youth-ministry/${ministry.id}`);
      return;
    }
    if (name.includes('children')) {
      navigate(`/admin/childrens-ministry/${ministry.id}`);
      return;
    }
    navigate(`/admin/ministries/${ministry.id}`);
  };

  const saveAddMinistry = async () => {
    if (!mName.trim()) return;
    setSavingMinistry(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // use effectiveBranchId defined in component scope
      const targetBranchId = effectiveBranchId || formBranchId;
      if (!targetBranchId) {
        toast({
          title: 'Branch required',
          description: 'Please select a branch for this ministry.',
        });
        return;
      }
      const insertPayload: any = {
        name: mName.trim(),
        description: mDesc || null,
        branch_id: targetBranchId,
      };
      if (user?.id) insertPayload.head_id = user.id;

      const { data, error } = await supabase
        .from('ministries')
        .insert(insertPayload)
        .select('id, name, description');
      if (error) {
        toast({ title: 'Failed to add ministry', description: error.message });
        throw error;
      }
      const created = data && data[0];
      if (created) {
        toast({ title: 'Ministry added', description: `${created.name} has been created.` });
        setAddMinistryOpen(false);
        setMName('');
        setMDesc('');
        // Reload list
        loadMinistries();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSavingMinistry(false);
    }
  };

  // Initial branch selection effect (handled by AdminContext mostly, but keeping loader for Select options if needed)
  useEffect(() => {
    const initBranch = async () => {
      const { data: branchesData } = await supabase
        .from('church_branches')
        .select('id, name')
        .order('name', { ascending: true });

      const list = (branchesData || []).map((b: any) => ({ id: b.id, name: b.name }));
      setBranches(list);
    };
    initBranch();
  }, []);

  // Data loading effect
  useEffect(() => {
    loadMinistries();
    reloadDepartments();
  }, [effectiveBranchId]);
  // ✅ Add new department
  const handleAddDepartment = async (newDept: Department) => {
    // Reload departments from database
    const deptListQuery = supabase
      .from('departments')
      .select('id, name, slug, description, branch_id');
    if (effectiveBranchId) deptListQuery.eq('branch_id', effectiveBranchId);
    const { data: deptList } = await deptListQuery;

    if (deptList) {
      setDepartments(
        deptList.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          leader: 'TBD',
          members: 0,
          activities: 0,
          status: 'Active' as const,
        }))
      );
    }
  };

  // ✅ Filter departments
  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Departments & Ministries</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Organize and manage church departments and ministries.
          </p>
        </div>
        {/* AddDepartment moved to Departments tab header */}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full sm:w-64 text-sm"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">{totalDepartmentsCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Ministries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">{ministries.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Growing strong</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">{totalMinistryMembersCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Monthly Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">{recentMinistryActivitiesCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-4 sm:space-y-6">
        <TabsList className="w-2/3 sm:w-auto grid grid-cols-2">
          <TabsTrigger value="departments" className="text-xs sm:text-sm py-2 px-4">
            Departments
          </TabsTrigger>
          <TabsTrigger value="ministries" className="text-xs sm:text-sm py-2 px-4">
            Ministries
          </TabsTrigger>
        </TabsList>

        {/* Departments */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Church Departments</CardTitle>
                  <CardDescription>
                    Operational departments that support church services
                  </CardDescription>
                </div>
                <AddDepartmentForm onAdd={handleAddDepartment} />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              {filteredDepartments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No departments found</p>
                  <p className="text-sm mt-1">
                    {search
                      ? 'Try adjusting your search'
                      : 'Get started by adding your first department'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredDepartments.map((dept) => (
                    <DepartmentCard
                      key={dept.id}
                      dept={dept}
                      onOpen={handleDepartmentClick}
                      onMembersClick={handleOpenAddMembers}
                      onSettingsClick={handleOpenSettings}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ministries */}
        <TabsContent value="ministries">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Church Ministries</CardTitle>
                  <CardDescription>
                    Ministries focused on different groups and activities
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddMinistryOpen(true)}>
                  Add Ministry
                </Button>
              </div>
              <div className="mt-4">
                <Input
                  placeholder="Search ministries..."
                  value={ministrySearch}
                  onChange={(e) => setMinistrySearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              {ministries.filter(
                (m) =>
                  m.name.toLowerCase().includes(ministrySearch.toLowerCase()) ||
                  m.description.toLowerCase().includes(ministrySearch.toLowerCase())
              ).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No ministries found</p>
                  <p className="text-sm mt-1">
                    {ministrySearch
                      ? 'Try adjusting your search'
                      : 'Get started by adding your first ministry'}
                  </p>
                  {!ministrySearch && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddMinistryOpen(true)}
                    >
                      Create Ministry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
                  {ministries
                    .filter(
                      (m) =>
                        m.name.toLowerCase().includes(ministrySearch.toLowerCase()) ||
                        m.description.toLowerCase().includes(ministrySearch.toLowerCase())
                    )
                    .map((m) => (
                      <MinistryCard
                        key={m.id}
                        ministry={m}
                        onOpen={handleMinistryClick}
                        onMembersClick={(ministry) => {
                          setActiveMinistry(ministry);
                          setIsAddMinistryMembersOpen(true);
                        }}
                        onSettingsClick={(ministry) => {
                          setActiveMinistry(ministry);
                          setIsMinistrySettingsOpen(true);
                        }}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Ministry Dialog */}
      <Dialog open={addMinistryOpen} onOpenChange={setAddMinistryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Ministry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!authBranchId && (
              <div className="grid gap-2">
                <Label htmlFor="m-branch">Branch</Label>
                <Select value={formBranchId} onValueChange={setFormBranchId}>
                  <SelectTrigger id="m-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="m-name">Ministry Name</Label>
              <Input
                id="m-name"
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                placeholder="e.g., Men's Ministry"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-desc">Description</Label>
              <Textarea
                id="m-desc"
                value={mDesc}
                onChange={(e) => setMDesc(e.target.value)}
                placeholder="Short description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMinistryOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveAddMinistry}
              disabled={savingMinistry || !mName.trim() || (!effectiveBranchId && !formBranchId)}
            >
              {savingMinistry ? 'Saving...' : 'Save Ministry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog (opens when clicking Members on a department card) */}
      <AddMemberToDepartmentDialog
        open={isAddMembersOpen}
        onOpenChange={(open) => setIsAddMembersOpen(open)}
        departmentId={activeDepartment?.id ?? ''}
        onMembersAdded={async () => {
          await reloadDepartments();
          if (activeDepartment) await loadDepartmentMembers(activeDepartment.id);
        }}
      />

      {/* Department Settings Dialog */}
      <DepartmentSettingsDialog
        open={isSettingsOpen}
        onOpenChange={(open) => setIsSettingsOpen(open)}
        departmentId={activeDepartment?.id ?? ''}
        departmentName={activeDepartment?.name ?? ''}
        members={deptMembers}
        onUpdated={(name) => {
          setDepartments((prev) =>
            prev.map((d) => (d.id === activeDepartment?.id ? { ...d, name } : d))
          );
          if (activeDepartment) setActiveDepartment({ ...activeDepartment, name });
        }}
        onDeleted={async () => {
          await reloadDepartments();
        }}
        onMembersChanged={async () => {
          if (activeDepartment) await loadDepartmentMembers(activeDepartment.id);
        }}
      />
    </div>
  );
};
