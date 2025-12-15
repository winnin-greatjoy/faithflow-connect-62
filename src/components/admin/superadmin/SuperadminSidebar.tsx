import React, { useState } from 'react';
import {
  LayoutDashboard,
  Network,
  Building,
  Users,
  FileBarChart,
  Settings,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface SuperadminSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, description: 'Global overview' },
  { id: 'districts', label: 'Districts', icon: Network, description: 'Manage districts' },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, description: 'Member approvals' },
  { id: 'users', label: 'Users & Roles', icon: Users, description: 'Access control' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, description: 'System reports' },
  { id: 'settings', label: 'System Settings', icon: Settings, description: 'Configuration' },
  { id: 'audit', label: 'Audit Logs', icon: Shield, description: 'Activity history' },
];

export const SuperadminSidebar: React.FC<SuperadminSidebarProps> = ({
  activeModule,
  onModuleChange,
  isOpen,
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = React.useRef<HTMLDivElement | null>(null);

  const showFullSidebar = !isCollapsed || isHovered;

  // Auto-collapse on laptop range
  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const inLaptopRange = w >= 1024 && w < 1280;
      setIsCollapsed(inLaptopRange);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleModuleClick = (moduleId: string) => {
    onModuleChange(moduleId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'h-screen bg-gradient-to-b from-slate-900 to-slate-800 transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden',
          'fixed top-0 left-0 z-50 w-64',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          'lg:sticky lg:z-20 lg:translate-x-0 lg:transition-[width]',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          isCollapsed ? 'lg:hover:w-64' : ''
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="navigation"
        aria-label="Superadmin navigation"
      >
        <Sidebar className="w-full h-full flex flex-col border-r-0">
          <SidebarContent className="bg-transparent">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div
                  className={cn(
                    'transition-all duration-300 overflow-hidden whitespace-nowrap',
                    !showFullSidebar ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  <div className="text-sm font-semibold text-white">Superadmin</div>
                  <div className="text-xs text-white/60">Command Center</div>
                </div>
                <button
                  onClick={onToggle}
                  className="ml-auto lg:hidden p-1 rounded-md hover:bg-white/10 text-white/60"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <SidebarGroup className="flex-1 overflow-y-auto py-4">
              <SidebarMenu className="space-y-1 px-2">
                {menuItems.map(({ id, label, icon: Icon, description }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={activeModule === id}
                      onClick={() => handleModuleClick(id)}
                      className={cn(
                        'group relative w-full justify-start px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                        activeModule === id
                          ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/25'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-all duration-300',
                          showFullSidebar ? 'mr-3' : 'mx-auto'
                        )}
                      />
                      <div
                        className={cn(
                          'flex flex-col transition-all duration-300 overflow-hidden',
                          showFullSidebar ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        )}
                      >
                        <span className="truncate">{label}</span>
                        {description && (
                          <span className="text-[10px] text-white/50 truncate">{description}</span>
                        )}
                      </div>

                      {/* Tooltip for collapsed state */}
                      {!showFullSidebar && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                          {label}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div
                className={cn(
                  'flex items-center gap-2 text-xs text-white/40 transition-all duration-300',
                  !showFullSidebar && 'justify-center'
                )}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className={cn('transition-all duration-300', !showFullSidebar && 'hidden')}>
                  System Online
                </span>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
      </div>
    </>
  );
};
