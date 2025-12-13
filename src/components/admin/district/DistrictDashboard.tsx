import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Building,
  Users,
  FileBarChart,
  Settings,
  Shield,
  Menu,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DistrictOverview } from './DistrictOverview';
import { DistrictBranches } from './DistrictBranches';
import { DistrictStaff } from './DistrictStaff';
import { DistrictReports } from './DistrictReports';
import { DistrictSettings } from './DistrictSettings';

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const effectiveDistrictId = districtId || params.districtId;

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
    'overview' | 'branches' | 'staff' | 'reports' | 'settings'
  >('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

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
        .select('id, first_name, last_name')
        .order('first_name');

      const profileMap = new Map<string, string>();
      const profiles: ProfileOption[] = [];
      (profilesData || []).forEach((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.trim();
        profileMap.set(p.id, fullName);
        profiles.push({ id: p.id, full_name: fullName, email: null });
      });

      setAvailableProfiles(profiles);

      // Enrich staff assignments with names
      const enrichedStaff: StaffAssignment[] = (rolesData || []).map((r) => ({
        ...r,
        user_name: profileMap.get(r.user_id) || 'Unknown',
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
    { id: 'reports' as const, label: 'Reports', icon: FileBarChart },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
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
          'fixed inset-y-0 left-0 bg-white border-r w-64 transform transition-transform duration-200 ease-in-out z-20 md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            {isSuperadmin && (
              <Button
                variant="ghost"
                className="w-full justify-start mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/admin/districts')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Button>
            )}
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <Shield className="h-8 w-8" />
              District Portal
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{district.name}</p>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeModule === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveModule(item.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
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
            {activeModule === 'reports' && <DistrictReports />}
            {activeModule === 'settings' && <DistrictSettings district={district} />}
          </div>
        </main>
      </div>
    </div>
  );
};
