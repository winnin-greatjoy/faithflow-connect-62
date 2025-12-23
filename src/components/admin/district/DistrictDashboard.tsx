import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { useAuthz } from '@/hooks/useAuthz';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Building,
  Users,
  FileBarChart,
  DollarSign,
  Settings,
  Shield,
  Menu,
  LogOut,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DistrictOverview } from './DistrictOverview';
import { DistrictBranches } from './DistrictBranches';
import { EventsModule } from '@/components/admin/EventsModule';
import { DistrictStaff } from './DistrictStaff';
import { DistrictReports } from './DistrictReports';
import { DistrictSettings } from './DistrictSettings';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { AdminProvider } from '@/context/AdminContext';

interface District {
  id: string;
  name: string;
  head_admin_id: string | null;
  location: string | null;
}

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  pastor_name: string | null;
  is_district_hq: boolean;
  created_at: string;
}

interface StaffAssignment {
  id: string;
  user_id: string;
  role: string;
  branch_id: string;
  branch_name?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string | null;
}

interface ProfileOption {
  id: string;
  full_name: string;
  email: string | null;
}

interface DistrictDashboardProps {
  districtId?: string;
}

export const DistrictDashboard: React.FC<DistrictDashboardProps> = ({ districtId }) => {
  const { user, signOut } = useAuth();
  const { isSuperadmin } = useSuperadmin();
  const { hasRole } = useAuthz();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const isDistrictAdmin = hasRole('district_admin') && !isSuperadmin;
  const effectiveDistrictId = districtId || params.districtId;
  const requestedDistrictId = params.districtId;

  const [district, setDistrict] = useState<District | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<ProfileOption[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBranches: 0,
    totalDepartments: 0,
    totalStaff: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<
    'overview' | 'branches' | 'staff' | 'events' | 'finance' | 'reports' | 'settings'
  >('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-collapse on laptop logic (optional but good for consistency)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024 && w < 1280) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showFullSidebar = !isCollapsed || isHovered;

  useEffect(() => {
    const requested = (location.state as any)?.activeModule as
      | 'overview'
      | 'branches'
      | 'staff'
      | 'events'
      | 'finance'
      | 'reports'
      | 'settings'
      | undefined;
    if (requested) setActiveModule(requested);
  }, [location.state]);

  useEffect(() => {
    if (effectiveDistrictId || user?.id) {
      fetchDistrictData();
    }
  }, [effectiveDistrictId, user?.id]);

  const fetchDistrictData = async () => {
    setLoading(true);
    try {
      let data: District | null = null;
      let error: any = null;

      if (effectiveDistrictId) {
        // Fetch specific district by ID (Super Admin view)
        const response = await supabase
          .from('districts')
          .select('*')
          .eq('id', effectiveDistrictId)
          .single();
        data = response.data;
        error = response.error;
      } else {
        // Find the district this user manages (District Admin view)
        const response = await supabase
          .from('districts')
          .select('*')
          .eq('head_admin_id', user?.id)
          .single();
        data = response.data;
        error = response.error;
      }

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        setLoading(false);
        return;
      }

      const districtData = data;
      setDistrict(districtData);

      // 2. Fetch branches in this district
      const { data: branchesData, error: branchError } = await supabase
        .from('church_branches')
        .select('*')
        .eq('district_id', districtData.id)
        .order('is_district_hq', { ascending: false })
        .order('name');

      if (branchError) throw branchError;
      setBranches(branchesData as Branch[]);

      // 3. Fetch aggregated stats
      const branchIds = branchesData.map((b) => b.id);
      let memberCount = 0;
      let deptCount = 0;

      if (branchIds.length > 0) {
        const [membersRes, deptsRes] = await Promise.all([
          supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .in('branch_id', branchIds),
          supabase
            .from('departments')
            .select('*', { count: 'exact', head: true })
            .in('branch_id', branchIds),
        ]);

        memberCount = membersRes.count || 0;
        deptCount = deptsRes.count || 0;
      }

      // 4. Fetch staff assignments in district branches
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('id, user_id, role, branch_id')
        .in('branch_id', branchIds);

      // 5. Fetch profiles for assignment dropdown and to enrich staff list
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .order('first_name');

      const profileMap = new Map<string, string>();
      const phoneMap = new Map<string, string | null>();
      const profiles: ProfileOption[] = [];
      (profilesData || []).forEach((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.trim();
        profileMap.set(p.id, fullName);
        phoneMap.set(p.id, (p as any).phone ?? null);
        profiles.push({ id: p.id, full_name: fullName, email: null });
      });

      setAvailableProfiles(profiles);

      // Enrich staff assignments with names
      const enrichedStaff: StaffAssignment[] = (rolesData || []).map((r) => ({
        ...r,
        user_name: profileMap.get(r.user_id) || 'Unknown',
        user_phone: phoneMap.get(r.user_id) ?? null,
        branch_name: branchesData.find((b) => b.id === r.branch_id)?.name || 'Unknown',
      }));
      setStaffAssignments(enrichedStaff);

      setStats({
        totalMembers: memberCount,
        totalBranches: branchesData.length,
        totalDepartments: deptCount,
        totalStaff: enrichedStaff.length,
      });
    } catch (error: any) {
      console.error('Error loading district dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load district data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!district) {
    if (isDistrictAdmin && requestedDistrictId) {
      return (
        <div className="p-8 text-center bg-muted/20 rounded-lg border-2 border-dashed m-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have access to view this district.</p>
        </div>
      );
    }

    return (
      <div className="p-8 text-center bg-muted/20 rounded-lg border-2 border-dashed m-8">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No District Assigned</h2>
        <p className="text-muted-foreground">
          You are logged in as a District Admin but no district is linked to your account.
        </p>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'branches' as const, label: 'Branches', icon: Building },
    { id: 'staff' as const, label: 'Staff', icon: Users },
    { id: 'events' as const, label: 'Events', icon: Calendar },
    { id: 'finance' as const, label: 'Finance', icon: DollarSign },
    { id: 'reports' as const, label: 'Reports', icon: FileBarChart },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Shield className="h-6 w-6" />
            {district.name}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 bg-white border-r transform transition-all duration-300 ease-in-out z-20',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:relative md:translate-x-0',
            isCollapsed ? 'md:w-20' : 'md:w-64',
            isCollapsed ? 'md:hover:w-64' : ''
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b whitespace-nowrap overflow-hidden">
              {isSuperadmin && (
                <Button
                  variant="ghost"
                  className={cn(
                    'justify-start mb-4 text-muted-foreground hover:text-foreground',
                    !showFullSidebar ? 'px-0 justify-center' : '-ml-2 w-full'
                  )}
                  onClick={() => navigate('/admin/districts')}
                  title={!showFullSidebar ? 'Back to Admin' : undefined}
                >
                  <ArrowLeft className={cn('h-4 w-4', showFullSidebar && 'mr-2')} />
                  <span
                    className={cn(
                      'transition-all duration-300 overflow-hidden',
                      !showFullSidebar ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                    )}
                  >
                    Back to Admin
                  </span>
                </Button>
              )}
              <div className="flex items-center gap-2 font-bold text-xl text-primary">
                <Shield className="h-8 w-8 shrink-0" />
                <span
                  className={cn(
                    'transition-all duration-300 overflow-hidden',
                    !showFullSidebar ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                  )}
                >
                  District Portal
                </span>
              </div>
              <div
                className={cn(
                  'transition-all duration-300 overflow-hidden',
                  !showFullSidebar ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                )}
              >
                <p className="text-xs text-muted-foreground mt-1 truncate">{district.name}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 py-4">
              <nav className="space-y-1 px-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeModule === item.id ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      !showFullSidebar && 'justify-center px-2'
                    )}
                    onClick={() => {
                      setActiveModule(item.id);
                      setIsSidebarOpen(false);
                    }}
                    title={!showFullSidebar ? item.label : undefined}
                  >
                    <item.icon className={cn('h-4 w-4', showFullSidebar && 'mr-2')} />
                    <span
                      className={cn(
                        'transition-all duration-300 overflow-hidden',
                        !showFullSidebar ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                      )}
                    >
                      {item.label}
                    </span>
                  </Button>
                ))}
              </nav>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full mb-2 hidden md:flex hover:bg-black/5"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive',
                  !showFullSidebar && 'justify-center px-2'
                )}
                onClick={() => signOut()}
                title={!showFullSidebar ? 'Log Out' : undefined}
              >
                <LogOut className={cn('h-4 w-4', showFullSidebar && 'mr-2')} />
                <span
                  className={cn(
                    'transition-all duration-300 overflow-hidden',
                    !showFullSidebar ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                  )}
                >
                  Log Out
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-bold">
                {menuItems.find((m) => m.id === activeModule)?.label}
              </h1>
              <p className="text-sm text-muted-foreground">
                {district.location || 'District Administration'}
              </p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              {activeModule === 'overview' && <DistrictOverview stats={stats} />}
              {activeModule === 'branches' && (
                <DistrictBranches
                  district={district}
                  branches={branches}
                  onRefresh={fetchDistrictData}
                />
              )}
              {activeModule === 'staff' && (
                <DistrictStaff
                  branches={branches}
                  staffAssignments={staffAssignments}
                  availableProfiles={availableProfiles}
                  onRefresh={fetchDistrictData}
                />
              )}
              {activeModule === 'events' && <EventsModule />}
              {activeModule === 'finance' && (
                <FinanceDashboard mode="district" districtId={district.id} />
              )}
              {activeModule === 'reports' && <DistrictReports branches={branches} />}
              {activeModule === 'settings' && (
                <DistrictSettings
                  district={district}
                  branches={branches}
                  onRefresh={fetchDistrictData}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
};
