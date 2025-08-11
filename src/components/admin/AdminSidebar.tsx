
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
  Settings 
} from 'lucide-react';
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

interface AdminSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'finance', label: 'Finance', icon: CreditCard },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'volunteers', label: 'Volunteers', icon: UserCheck },
  { id: 'departments', label: 'Departments & Ministries', icon: Building },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar = ({ activeModule, onModuleChange, isOpen, onToggle }: AdminSidebarProps) => {
  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    console.log(`Navigating to ${moduleId} module`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar className="w-full bg-white border-r">
          <SidebarContent>
            <div className="p-4 border-b lg:hidden">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FH</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">Faith Healing</h2>
                  <p className="text-xs text-gray-500">Beccle St Branch</p>
                </div>
              </div>
            </div>
            
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeModule === item.id}
                        onClick={() => handleModuleChange(item.id)}
                        className="w-full justify-start p-3 text-sm font-medium"
                      >
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
    </>
  );
};
