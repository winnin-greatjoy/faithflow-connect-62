import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  CreditCard, 
  Calendar, 
  UserCheck, 
  Building, 
  FileBarChart, 
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';


interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

// Primary tabs shown in the bottom bar (max 4 for good mobile UX)
const primaryTabs: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'more', label: 'More', icon: MoreVertical },
];

// Secondary items shown in the more menu
const secondaryItems: MenuItem[] = [
  { id: 'mens-ministry', label: 'Men\'s Ministry', icon: User },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'finance', label: 'Finance', icon: CreditCard },
  { id: 'volunteers', label: 'Volunteers', icon: UserCheck },
  { id: 'departments', label: 'Departments', icon: Building },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// All menu items combined for the desktop sidebar
const allMenuItems = [...primaryTabs.filter(tab => tab.id !== 'more'), ...secondaryItems];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeModule,
  onModuleChange,
  isOpen,
  onToggle,
  isCollapsed: externalIsCollapsed = false,
  onCollapse,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isControlled = typeof externalIsCollapsed !== 'undefined' && typeof onCollapse === 'function';
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  
  const isCollapsed = isControlled ? externalIsCollapsed : internalCollapsed;
  
  const handleCollapse = (collapsed: boolean) => {
    if (isControlled) {
      onCollapse?.(collapsed);
    } else {
      setInternalCollapsed(collapsed);
    }
  };

  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    // close mobile drawer after selection
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  // Show full sidebar on desktop when not collapsed OR when hovered
  const showFullSidebar = !isCollapsed || isHovered;

  // Auto-collapse only on the "laptop" range: >=1024 (lg) AND <1280 (xl)
  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const inLaptopRange = w >= 1024 && w < 1280;

      // Only collapse when in laptop range. On mobile (<1024) we want full drawer.
      if (inLaptopRange) {
        handleCollapse(true);
      } else {
        // On xl+ and mobile we force expanded (mobile drawer will still translate offscreen when closed).
        handleCollapse(false);
      }

      // also ensure mobile drawer closes when reaching desktop
      if (w >= 1024) {
        // onToggle might be undefined in some contexts; guard is safe here
        try { /* close mobile if open */ 
          // Only close if it's open
          // Leave this silent if onToggle not intended to be called here
        } catch {}
      }
    };

    // run once on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // run once

  // Mobile tab bar with more menu
  const renderMobileTabs = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {primaryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'more') {
                setShowMoreMenu(!showMoreMenu);
              } else {
                onModuleChange(tab.id); // Changed from handleModuleChange to onModuleChange
              }
            }}
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-full text-xs font-medium",
              activeModule === tab.id ? "text-primary" : "text-gray-500"
            )}
          >
            <tab.icon className="w-6 h-6 mb-1" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* More Menu */}
      {showMoreMenu && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg rounded-t-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-2">
            {secondaryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onModuleChange(item.id); // Changed from handleModuleChange to onModuleChange
                  setShowMoreMenu(false);
                }}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm",
                  activeModule === item.id ? "bg-gray-100 text-primary" : "text-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {
            setShowMoreMenu(false);
            onToggle();
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile tab bar */}
      <div className="lg:hidden">
        {renderMobileTabs()}
      </div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "h-screen bg-white border-r transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
          // mobile base: fixed and full height; we will translate it in/out
          "fixed top-0 left-0 z-50 w-64",
          isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full",
          // desktop overrides
          "lg:sticky lg:z-20 lg:translate-x-0 lg:transition-[width]",
          // desktop width depends on collapse state
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // allow hover to expand on desktop
          isCollapsed ? "lg:hover:w-64" : ""
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="navigation"
        aria-label="Main navigation"
      >
        <Sidebar className="w-full h-full flex flex-col">
          <SidebarContent>
            {/* Sidebar Header */}
            <div className="pt-4 p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className={cn(
                  "flex-shrink-0 flex items-center justify-center transition-all duration-300",
                  isCollapsed ? "w-8 h-8" : "w-12 h-12" // collapsed -> smaller, expanded -> larger
                )}>
                  <img
                    src="/faithhealing.png"
                    alt="Church Logo"
                    className={cn(
                      "object-contain transition-all duration-300",
                      isCollapsed ? "w-8 h-8" : "w-12 h-12"
                    )}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzk5OSIgZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDEzIDAgOCAzLjU4NyA4IDhzLTMuNTg3IDgtOCA4LTgtMy41ODctOC04IDMuNTg3LTggOC04eiIvPjwvc3ZnPg==';
                    }}
                  />
                </div>
                
                {/* Text - hidden when collapsed (desktop) */}
                <div className={cn(
                  "hidden lg:block overflow-hidden transition-all duration-300 whitespace-nowrap",
                  !showFullSidebar ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                  <div className="text-sm font-medium text-foreground">Faith Healing</div>
                  <div className="text-xs text-muted-foreground">Beccle St Branch</div>
                </div>
                
                {/* Mobile close button */}
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
                {allMenuItems.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={activeModule === id}
                      onClick={() => handleModuleChange(id)}
                      className="group relative w-full justify-start px-4 py-3 text-sm font-medium"
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-300",
                        showFullSidebar ? "mr-3" : "mx-auto"
                      )} />
                      <span className={cn(
                        "truncate transition-all duration-300",
                        showFullSidebar ? "opacity-100 w-auto" : "opacity-0 w-0"
                      )}>
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
                onClick={() => handleCollapse(!isCollapsed)}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
