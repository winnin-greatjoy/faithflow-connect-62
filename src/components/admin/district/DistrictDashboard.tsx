import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Sparkles,
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
import { DistrictConvertReview } from './DistrictConvertReview';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { AdminProvider } from '@/context/AdminContext';

interface DistrictDashboardProps {
  districtId?: string;
}

interface District {
  id: string;
  name: string;
  head_admin_id: string | null;
  overseer_id: string | null;
  location?: string | null;
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
    'overview' | 'branches' | 'staff' | 'events' | 'finance' | 'reports' | 'settings' | 'converts'
  >('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024 && w < 1280) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showFullSidebar = !isCollapsed || isHovered;

  useEffect(() => {
    const requested = (location.state as any)?.activeModule;
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
        const response = await supabase
          .from('districts')
          .select('*')
          .eq('id', effectiveDistrictId)
          .single();
        data = response.data;
        error = response.error;
      } else {
        const response = await supabase
          .from('districts')
          .select('*')
          .eq('head_admin_id', user?.id)
          .single();
        data = response.data;
        error = response.error;
        if (error?.code === 'PGRST116' || !data) {
          const { data: districtRole } = await supabase
            .from('user_roles')
            .select('district_id')
            .eq('user_id', user?.id)
            .eq('role', 'district_admin')
            .maybeSingle();
          if (districtRole?.district_id) {
            const resp2 = await supabase
              .from('districts')
              .select('*')
              .eq('id', districtRole.district_id)
              .single();
            data = resp2.data;
          }
        }
      }
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return;

      setDistrict(data);
      const { data: branchesData } = await supabase
        .from('church_branches')
        .select('*')
        .eq('district_id', data.id)
        .order('is_district_hq', { ascending: false })
        .order('name');
      setBranches(branchesData as Branch[]);

      const branchIds = (branchesData || []).map((b) => b.id);
      let memberCount = 0,
        deptCount = 0;
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

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('id, user_id, role, branch_id')
        .in('branch_id', branchIds);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .order('first_name');

      const profileMap = new Map();
      const phoneMap = new Map();
      const profiles: ProfileOption[] = [];
      (profilesData || []).forEach((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.trim();
        profileMap.set(p.id, fullName);
        phoneMap.set(p.id, (p as any).phone ?? null);
        profiles.push({ id: p.id, full_name: fullName, email: null });
      });
      setAvailableProfiles(profiles);

      const enrichedStaff: StaffAssignment[] = (rolesData || []).map((r) => ({
        ...r,
        user_name: profileMap.get(r.user_id) || 'Unknown',
        user_phone: phoneMap.get(r.user_id) ?? null,
        branch_name: (branchesData || []).find((b) => b.id === r.branch_id)?.name || 'Unknown',
      }));
      setStaffAssignments(enrichedStaff);

      setStats({
        totalMembers: memberCount,
        totalBranches: (branchesData || []).length,
        totalDepartments: deptCount,
        totalStaff: enrichedStaff.length,
      });
    } catch (error) {
      console.error('District fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5" />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary relative z-10"></div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-card p-10 rounded-3xl text-center border border-primary/10 shadow-xl">
          <Shield className="h-16 w-16 mx-auto mb-6 text-primary opacity-50" />
          <h2 className="text-2xl font-bold font-serif mb-3">District Not Resolved</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Your account is authorized for district oversight, but no specific district association
            was found. Please contact your system administrator.
          </p>
          <Button variant="ghost" className="font-bold text-primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview' as const, label: 'District HQ', icon: LayoutDashboard },
    { id: 'branches' as const, label: 'Branches', icon: Building },
    { id: 'staff' as const, label: 'Leadership', icon: Users },
    { id: 'converts' as const, label: 'Evangelism', icon: Sparkles },
    { id: 'events' as const, label: 'Calendar', icon: Calendar },
    { id: 'finance' as const, label: 'Treasury', icon: DollarSign },
    { id: 'reports' as const, label: 'Metrics', icon: FileBarChart },
    { id: 'settings' as const, label: 'Config', icon: Settings },
  ];

  return (
    <AdminProvider>
      <div className="min-h-screen bg-background flex w-full relative overflow-hidden">
        {/* Modern Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5" />
        </div>

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: isCollapsed ? 80 : 256,
            x:
              isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)
                ? 0
                : -256,
          }}
          className={cn(
            'h-screen bg-card border-r border-primary/10 transition-[width,transform] duration-300 ease-in-out flex flex-col overflow-hidden',
            'fixed top-0 left-0 z-50 lg:sticky lg:z-20',
            isSidebarOpen ? 'shadow-2xl ring-1 ring-black/5' : ''
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col h-full">
            <div className="pt-6 p-5 border-b border-primary/5 sticky top-0 bg-transparent z-10 backdrop-blur-xl">
              {isSuperadmin && (
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-primary font-bold hover:bg-primary/10 rounded-xl transition-all mb-4',
                    !showFullSidebar && 'justify-center px-0'
                  )}
                  onClick={() => navigate('/admin/districts')}
                >
                  <ArrowLeft className={cn('h-4 w-4', showFullSidebar && 'mr-2')} />
                  {showFullSidebar && <span>HQ Overview</span>}
                </Button>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Shield className="h-6 w-6" />
                </div>
                {showFullSidebar && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm font-bold font-serif text-foreground truncate">
                      {district.name}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary">
                      District Oversight
                    </p>
                  </motion.div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden ml-auto"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 py-6 px-3">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start rounded-xl px-4 py-6 transition-all duration-300',
                      activeModule === item.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'hover:bg-primary/5 text-muted-foreground hover:text-primary',
                      !showFullSidebar && 'justify-center px-0'
                    )}
                    onClick={() => {
                      setActiveModule(item.id);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <item.icon className={cn('h-5 w-5', showFullSidebar && 'mr-3')} />
                    {showFullSidebar && (
                      <span className="font-bold tracking-tight">{item.label}</span>
                    )}
                  </Button>
                ))}
              </nav>
            </ScrollArea>

            <div className="p-4 border-t border-primary/5 bg-transparent backdrop-blur-xl space-y-2">
              <Button
                variant="ghost"
                className="w-full h-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all hidden lg:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-destructive hover:bg-destructive/10 rounded-xl font-bold',
                  !showFullSidebar && 'justify-center px-0'
                )}
                onClick={() => signOut()}
              >
                <LogOut className={cn('h-5 w-5', showFullSidebar && 'mr-3')} />
                {showFullSidebar && <span>Exit Session</span>}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 lg:ml-0 h-screen">
          <header className="sticky top-0 z-30 bg-background border-b border-primary/10 px-6 py-4 backdrop-blur-2xl flex justify-between items-center shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-primary" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
                  {menuItems.find((m) => m.id === activeModule)?.label}{' '}
                  <span className="text-primary">Control</span>
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  {district.location || 'Oversight Center'}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto pb-10"
            >
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
              {activeModule === 'converts' && <DistrictConvertReview districtId={district.id} />}
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
            </motion.div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
};
