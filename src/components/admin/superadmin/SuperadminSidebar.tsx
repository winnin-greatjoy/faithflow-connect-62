import React, { useState } from 'react';
import {
  LayoutDashboard,
  Network,
  Users,
  FileBarChart,
  Settings,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  DollarSign,
  FileText,
  Video,
  Calendar,
  GraduationCap,
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
  { id: 'bible-school', label: 'Bible School', icon: GraduationCap, description: 'Training programs' },
  { id: 'finance', label: 'Finance', icon: DollarSign, description: 'Financial overview' },
  { id: 'cms', label: 'Content', icon: FileText, description: 'Content management' },
  { id: 'streaming', label: 'Streaming', icon: Video, description: 'Live streams' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, description: 'System reports' },
  { id: 'events', label: 'Events', icon: Calendar, description: 'Hierarchical events' },
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

      if (inLaptopRange) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
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
          'h-screen bg-white border-r transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden',
          'fixed top-0 left-0 z-50 w-64',
          isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full',
          'lg:sticky lg:z-20 lg:translate-x-0 lg:transition-[width]',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          isCollapsed ? 'lg:hover:w-64' : ''
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="navigation"
        aria-label="Superadmin navigation"
      >
        <Sidebar className="w-full h-full flex flex-col">
          <SidebarContent>
            {/* Header */}
            <div className="pt-4 p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10 transition-all duration-300',
                    isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
                  )}
                >
                  <Shield className={cn('text-primary', isCollapsed ? 'h-4 w-4' : 'h-5 w-5')} />
                </div>

                <div
                  className={cn(
                    'hidden lg:block overflow-hidden transition-all duration-300 whitespace-nowrap',
                    !showFullSidebar ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  <div className="text-sm font-medium text-foreground">Superadmin</div>
                  <div className="text-xs text-muted-foreground">Command Center</div>
                </div>

                <button
                  onClick={onToggle}
                  className="ml-auto lg:hidden p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <SidebarGroup className="flex-1 overflow-y-auto">
              <SidebarMenu>
                {menuItems.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={activeModule === id}
                      onClick={() => handleModuleClick(id)}
                      className="group relative w-full justify-start px-4 py-3 text-sm font-medium"
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-all duration-300',
                          showFullSidebar ? 'mr-3' : 'mx-auto'
                        )}
                      />
                      <span
                        className={cn(
                          'truncate transition-all duration-300',
                          showFullSidebar ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        )}
                      >
                        {label}
                      </span>

                      {/* Tooltip for collapsed state */}
                      {!showFullSidebar && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {label}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Collapse Toggle - Desktop Only */}
            <div className="hidden lg:block border-t p-2 mt-auto">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <>
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </div>
          </SidebarContent>
        </Sidebar>
      </div>
    </>
  );
};
