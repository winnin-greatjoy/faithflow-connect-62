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
    <header className="sticky top-0 z-30 bg-white border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu toggle + Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {isSuperadmin && !isPortalMode && (
            <div className="hidden md:block mr-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[220px] h-9 bg-purple-50 border-purple-200 text-purple-900 justify-between"
                  >
                    <span className="truncate">
                      {selectedBranchId ? branchName || 'Branch View' : 'System View'}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[260px]">
                  <DropdownMenuItem
                    onClick={() => setSelectedBranchId(null)}
                    className="font-semibold text-purple-700"
                  >
                    System View
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {(districtTree?.districts || []).map((d) => (
                    <DropdownMenuSub key={d.id}>
                      <DropdownMenuSubTrigger>{d.name}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-[240px]">
                        {(branchesByDistrict.map.get(d.id) || []).length === 0 ? (
                          <DropdownMenuItem disabled>No branches</DropdownMenuItem>
                        ) : (
                          (branchesByDistrict.map.get(d.id) || []).map((b) => (
                            <DropdownMenuItem key={b.id} onClick={() => setSelectedBranchId(b.id)}>
                              {b.name}
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}

                  {branchesByDistrict.unassigned.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Unassigned</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[240px]">
                          {branchesByDistrict.unassigned.map((b) => (
                            <DropdownMenuItem key={b.id} onClick={() => setSelectedBranchId(b.id)}>
                              {b.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {isPortalMode &&
            (isSuperadmin || isDistrictAdmin) &&
            (location.pathname.startsWith('/district-portal/branch/') ||
              location.pathname.startsWith('/superadmin/district-portal/branch/')) && (
              <div className="hidden md:block mr-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 justify-between w-[220px]">
                      <span className="truncate">{branchName || 'Select Branch'}</span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[260px]">
                    <DropdownMenuLabel>Branches in District</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(portalDistrictBranches?.branches || []).map((b) => (
                      <DropdownMenuItem key={b.id} onClick={() => handlePortalBranchSwitch(b.id)}>
                        {b.name}
                      </DropdownMenuItem>
                    ))}
                    {(portalDistrictBranches?.branches || []).length === 0 && (
                      <DropdownMenuItem disabled>No branches</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center lg:hidden">
            <img
              src="/faithhealing.png"
              alt="Church Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgM3MtMy0xLjM0LTMtMyAxLjM0LTMgMy0zem0wIDE0LjJjLTIuNSAwLTQuNzEtMS4yOC02LTMuMjIuMDMtMS45OSA0LTMuMDggNi0zLjA4IDEuOTkgMCA1Ljk3IDEuMSA2IDMuMDgtMS4yOSAxLjk5LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4=';
              }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 lg:mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members, events, ministries..."
              className="pl-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Superadmin Badge */}
          {isSuperadmin && !superadminLoading && (
            <div className="hidden sm:block">
              <SuperadminBadge variant="compact" />
            </div>
          )}
          {/* Mobile Search */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
                <Search className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members, events, ministries..."
                  className="pl-10 text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search"
                />
              </form>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-xs flex items-center justify-center bg-destructive text-destructive-foreground rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(notifications.map((n) => ({ ...n, read: true })));
                  }}
                >
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 hover:bg-gray-100 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-gray-500">2h ago</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">No new notifications</p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm hidden sm:inline">
                  {user?.email?.split('@')[0] || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/portal')}>
                <Home className="mr-2 h-4 w-4" />
                My Portal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
