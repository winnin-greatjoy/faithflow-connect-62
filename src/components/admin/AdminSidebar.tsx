
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

interface AdminSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
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

export const AdminSidebar = ({ activeModule, onModuleChange }: AdminSidebarProps) => {
  return (
    <Sidebar className="w-64 bg-white border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeModule === item.id}
                    onClick={() => onModuleChange(item.id)}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
