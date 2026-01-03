import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Settings, User, LogOut, Menu, X, ChevronDown, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { SuperadminBadge } from './SuperadminBadge';
import { useAdminContext } from '@/context/AdminContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthz } from '@/hooks/useAuthz';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  isPortalMode?: boolean;
}

export const AdminHeader = ({ onMenuToggle, isPortalMode = false }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const { hasRole } = useAuthz();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();
  const { selectedBranchId, setSelectedBranchId, branchName } = useAdminContext();

  const { data: districtTree } = useQuery({
    queryKey: ['admin-header-district-tree'],
    queryFn: async () => {
      const [districtsRes, branchesRes] = await Promise.all([
        supabase.from('districts').select('id, name').order('name'),
        supabase.from('church_branches').select('id, name, district_id').order('name'),
      ]);

      return {
        districts: (districtsRes.data || []) as { id: string; name: string }[],
        branches: (branchesRes.data || []) as {
          id: string;
          name: string;
          district_id: string | null;
        }[],
      };
    },
    enabled: isSuperadmin && !isPortalMode,
  });

  const branchesByDistrict = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    const unassigned: { id: string; name: string }[] = [];

    (districtTree?.branches || []).forEach((b) => {
      if (!b.district_id) {
        unassigned.push({ id: b.id, name: b.name });
        return;
      }
      const arr = map.get(b.district_id) || [];
      arr.push({ id: b.id, name: b.name });
      map.set(b.district_id, arr);
    });

    return { map, unassigned };
  }, [districtTree]);

  const isDistrictAdmin = hasRole('district_admin') && !isSuperadmin;

  useEffect(() => {
    if (!selectedBranchId) return;

    const channel = supabase
      .channel('admin-header-transfers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'member_transfers',
          filter: `to_branch_id=eq.${selectedBranchId}`,
        },
        (payload) => {
          console.log('New transfer request:', payload);
          toast({
            title: 'New Transfer Request',
            description: 'A new member transfer request has been received.',
          });
          setNotifications((prev) => [
            {
              id: payload.new.id,
              text: 'New Transfer Request Received',
              read: false,
              timestamp: new Date().toISOString(),
              link: isPortalMode ? '/portal/transfers' : '/admin/transfers',
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBranchId, toast, isPortalMode]);

  const { data: portalDistrictBranches } = useQuery({
    queryKey: ['admin-header-portal-district-branches', selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId)
        return {
          districtId: null as string | null,
          branches: [] as { id: string; name: string }[],
        };

      const { data: b } = await supabase
        .from('church_branches')
        .select('district_id')
        .eq('id', selectedBranchId)
        .maybeSingle();

      const districtId = (b as any)?.district_id ?? null;
      if (!districtId) return { districtId, branches: [] as { id: string; name: string }[] };

      const { data: branches } = await supabase
        .from('church_branches')
        .select('id, name')
        .eq('district_id', districtId)
        .order('name');

      return { districtId, branches: (branches || []) as { id: string; name: string }[] };
    },
    enabled:
      isPortalMode &&
      (isSuperadmin || isDistrictAdmin) &&
      (location.pathname.startsWith('/district-portal/branch/') ||
        location.pathname.startsWith('/superadmin/district-portal/branch/')),
  });

  const handlePortalBranchSwitch = (nextBranchId: string) => {
    const match = location.pathname.match(
      /^(\/superadmin\/district-portal\/branch\/|\/district-portal\/branch\/|\/branch-portal\/)([^/]+)(.*)$/
    );
    if (!match) return;
    const prefix = match[1];
    const suffix = match[3] || '';
    navigate(`${prefix}${nextBranchId}${suffix}`, { state: location.state });
  };

  // Debounce function with proper TypeScript types
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        func(...args);
      };

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(later, wait);
    };

    debounced.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced as T & { cancel: () => void };
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
          toast({
            title: 'Search',
            description: `Searching for: ${query}`,
          });
          console.log('Searching for:', query);
          setIsSearching(false);
        }, 300);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifications = () => {
    toast({
      title: 'Notifications',
      description: 'Opening notification center...',
    });
    console.log('Opening notifications');
  };

  const handleSettings = () => {
    toast({
      title: 'Settings',
      description: 'Opening user settings...',
    });
    console.log('Opening settings');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 glass dark:bg-black/30 border-b border-primary/5 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-6">
        {/* Mobile menu toggle + Logo area */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </Button>

          {isSuperadmin && !isPortalMode && (
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] h-11 glass border-primary/20 text-foreground justify-between rounded-xl hover:bg-primary/5 transition-all px-4"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span className="truncate font-bold">
                        {selectedBranchId ? branchName || 'Branch View' : 'Global Headquarters'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[280px] glass p-2 rounded-2xl shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => setSelectedBranchId(null)}
                    className="font-bold text-primary p-3 rounded-xl focus:bg-primary/10"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Global Headquarters
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2 opacity-50" />

                  {(districtTree?.districts || []).map((d) => (
                    <DropdownMenuSub key={d.id}>
                      <DropdownMenuSubTrigger className="p-3 rounded-xl focus:bg-primary/5 font-semibold">
                        {d.name}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-[260px] glass p-2 rounded-2xl border-primary/10">
                        {(branchesByDistrict.map.get(d.id) || []).length === 0 ? (
                          <DropdownMenuItem disabled className="text-xs p-3">
                            No branches found
                          </DropdownMenuItem>
                        ) : (
                          (branchesByDistrict.map.get(d.id) || []).map((b) => (
                            <DropdownMenuItem
                              key={b.id}
                              onClick={() => setSelectedBranchId(b.id)}
                              className="p-3 rounded-xl"
                            >
                              {b.name}
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {isPortalMode &&
            (isSuperadmin || isDistrictAdmin) &&
            (location.pathname.startsWith('/district-portal/branch/') ||
              location.pathname.startsWith('/superadmin/district-portal/branch/')) && (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 glass border-primary/20 justify-between w-[240px] rounded-xl px-4 font-bold"
                    >
                      <span className="truncate">{branchName || 'Select Branch'}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[260px] glass p-2 rounded-2xl">
                    <DropdownMenuLabel className="px-3 pb-2 text-xs uppercase tracking-widest text-muted-foreground">
                      District Network
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />
                    {(portalDistrictBranches?.branches || []).map((b) => (
                      <DropdownMenuItem
                        key={b.id}
                        onClick={() => handlePortalBranchSwitch(b.id)}
                        className="p-3 rounded-xl"
                      >
                        {b.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block group">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              placeholder="Search administration..."
              className="pl-12 h-12 glass border-primary/5 focus:border-primary/30 rounded-2xl text-base shadow-inner transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-10 h-10 rounded-xl hover:bg-primary/10 text-primary transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 text-[10px] font-bold flex items-center justify-center bg-destructive text-destructive-foreground rounded-lg border-2 border-white ring-2 ring-destructive/20 shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 glass p-0 rounded-2xl shadow-2xl border-primary/10 overflow-hidden"
            >
              <div className="p-4 bg-primary/5 border-b border-primary/5 flex justify-between items-center">
                <span className="font-bold text-sm">Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] uppercase font-bold text-primary h-7 px-2"
                  onClick={() => setNotifications([])}
                >
                  Clear all
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 hover:bg-primary/[0.02] border-b border-primary/5 last:border-0 cursor-pointer"
                    >
                      <p className="text-sm font-semibold">{n.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                        {n.timestamp}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center opacity-50 flex flex-col items-center gap-3">
                    <Bell className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No new updates found</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 rounded-xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10 group">
                <div className="w-10 h-10 rounded-xl bg-vibrant-gradient flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div className="hidden lg:block text-left mr-2">
                  <p className="text-sm font-bold truncate leading-none mb-1">
                    {user?.user_metadata?.firstName || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-70">
                    Administrator
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 glass p-2 rounded-2xl shadow-2xl border-primary/10 mt-2"
            >
              <div className="px-4 py-4 mb-2">
                <p className="font-serif font-bold text-lg leading-tight truncate">{user?.email}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  Personnel Account
                </p>
              </div>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem
                onClick={() => navigate('/portal')}
                className="p-3 rounded-xl my-1 group"
              >
                <Home className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span className="font-bold">Member Portal</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings} className="p-3 rounded-xl my-1 group">
                <Settings className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span className="font-bold">Global Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="p-3 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive group mt-1"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold">Disconnect Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
