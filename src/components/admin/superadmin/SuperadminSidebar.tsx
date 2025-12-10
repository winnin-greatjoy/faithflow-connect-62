import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  ArrowRightLeft,
  Shield,
  FileBarChart,
  Settings,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  { 
    id: 'overview', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'System-wide overview'
  },
  { 
    id: 'branches', 
    label: 'Branch Management', 
    icon: Building2,
    description: 'Manage all church branches'
  },
  { 
    id: 'transfers', 
    label: 'Member Transfers', 
    icon: ArrowRightLeft,
    description: 'Cross-branch transfers'
  },
  { 
    id: 'roles', 
    label: 'Role Management', 
    icon: Shield,
    description: 'Global roles & permissions'
  },
  { 
    id: 'reports', 
    label: 'System Reports', 
    icon: FileBarChart,
    description: 'Organization-wide analytics'
  },
  { 
    id: 'settings', 
    label: 'System Settings', 
    icon: Settings,
    description: 'Global configuration'
  },
];

export const SuperadminSidebar: React.FC<SuperadminSidebarProps> = ({
  activeModule,
  onModuleChange,
  isOpen,
  onToggle,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const showFullSidebar = !isCollapsed || isHovered;

  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  // Auto-collapse on laptop range
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const inLaptopRange = w >= 1024 && w < 1280;
      setIsCollapsed(inLaptopRange);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus trap for mobile
  useEffect(() => {
    if (!isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onToggle();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onToggle]);

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
        className={cn(
          'h-screen bg-gradient-to-b from-purple-900 to-purple-950 border-r border-purple-800 transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden',
          'fixed top-0 left-0 z-50 w-72',
          isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full',
          'lg:sticky lg:z-20 lg:translate-x-0 lg:transition-[width]',
          isCollapsed ? 'lg:w-20' : 'lg:w-72',
          isCollapsed ? 'lg:hover:w-72' : ''
        )}
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="navigation"
        aria-label="Superadmin navigation"
      >
        <Sidebar className="w-full h-full flex flex-col bg-transparent border-none">
          <SidebarContent className="bg-transparent">
            {/* Header */}
            <div className="p-4 border-b border-purple-800/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex-shrink-0 flex items-center justify-center bg-purple-700/50 rounded-lg transition-all duration-300',
                  isCollapsed && !isHovered ? 'w-10 h-10' : 'w-12 h-12'
                )}>
                  <Shield className="w-6 h-6 text-purple-200" />
                </div>

                <div className={cn(
                  'overflow-hidden transition-all duration-300 whitespace-nowrap',
                  !showFullSidebar ? 'w-0 opacity-0' : 'w-auto opacity-100'
                )}>
                  <div className="text-sm font-semibold text-white">Superadmin</div>
                  <div className="text-xs text-purple-300">Global Control Panel</div>
                </div>

                <button
                  onClick={onToggle}
                  className="ml-auto lg:hidden p-1 rounded-md hover:bg-purple-800/50 text-purple-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Back to Admin Link */}
            <div className="px-3 py-2 border-b border-purple-800/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className={cn(
                  'w-full text-purple-300 hover:text-white hover:bg-purple-800/50',
                  !showFullSidebar ? 'justify-center px-2' : 'justify-start'
                )}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className={cn(
                  'transition-all duration-300',
                  !showFullSidebar ? 'hidden' : 'block'
                )}>
                  Back to Branch Admin
                </span>
              </Button>
            </div>

            {/* Menu Items */}
            <SidebarGroup className="flex-1 overflow-y-auto py-4">
              <SidebarMenu>
                {menuItems.map(({ id, label, icon: Icon, description }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={activeModule === id}
                      onClick={() => handleModuleChange(id)}
                      className={cn(
                        'group relative w-full justify-start px-4 py-3 text-sm font-medium transition-all',
                        activeModule === id 
                          ? 'bg-purple-700/50 text-white' 
                          : 'text-purple-200 hover:text-white hover:bg-purple-800/30'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-all duration-300',
                          showFullSidebar ? 'mr-3' : 'mx-auto'
                        )}
                      />
                      <div className={cn(
                        'flex flex-col items-start transition-all duration-300',
                        showFullSidebar ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                      )}>
                        <span className="truncate">{label}</span>
                        {description && (
                          <span className="text-xs text-purple-400 truncate">{description}</span>
                        )}
                      </div>

                      {/* Tooltip for collapsed state */}
                      {!showFullSidebar && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-purple-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {label}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Footer */}
            <div className={cn(
              'p-4 border-t border-purple-800/50 transition-all duration-300',
              !showFullSidebar && 'hidden'
            )}>
              <div className="text-xs text-purple-400 text-center">
                Full organizational access enabled
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
      </div>
    </>
  );
};
