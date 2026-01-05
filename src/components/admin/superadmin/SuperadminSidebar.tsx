import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Button } from '@/components/ui/button';
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
  {
    id: 'bible-school',
    label: 'Bible School',
    icon: GraduationCap,
    description: 'Training programs',
  },
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

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const inLaptopRange = w >= 1024 && w < 1280;
      if (inLaptopRange) setIsCollapsed(true);
      else setIsCollapsed(false);
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={{
          width: isCollapsed && !isHovered ? 80 : 256,
          x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -256,
        }}
        className={cn(
          'h-screen bg-card border-r border-primary/10 shadow-2xl transition-[width,transform] duration-300 ease-in-out flex flex-col overflow-hidden',
          'fixed top-0 left-0 z-50 lg:sticky lg:z-20'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-primary/5 sticky top-0 bg-transparent z-10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <motion.div
                layout
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
              >
                <Shield className="h-5 w-5" />
              </motion.div>

              <AnimatePresence>
                {showFullSidebar && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <div className="text-sm font-black uppercase tracking-tighter text-foreground leading-none">
                      Superadmin
                    </div>
                    <div className="text-[10px] uppercase font-bold text-primary tracking-widest mt-1">
                      Command Core
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-auto rounded-xl hover:bg-primary/10"
                onClick={onToggle}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <SidebarContent className="flex-1 px-3 py-6 bg-transparent">
            <SidebarMenu className="space-y-2">
              {menuItems.map(({ id, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={activeModule === id}
                    onClick={() => handleModuleClick(id)}
                    className={cn(
                      'w-full rounded-xl px-4 py-6 transition-all duration-300 group relative',
                      activeModule === id
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'hover:bg-primary/5 text-muted-foreground hover:text-primary',
                      !showFullSidebar && 'justify-center px-0'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                        showFullSidebar ? 'mr-3' : ''
                      )}
                    />
                    <AnimatePresence>
                      {showFullSidebar && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-bold tracking-tight"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {!showFullSidebar && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {label}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* Footer Toggle */}
          <div className="p-4 border-t border-primary/5 bg-transparent backdrop-blur-xl">
            <Button
              variant="ghost"
              className="w-full h-12 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all hidden lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed && !isHovered ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="font-bold text-xs uppercase tracking-widest">Collapse Menu</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
