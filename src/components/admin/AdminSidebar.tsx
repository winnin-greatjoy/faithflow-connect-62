
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
  FileText,
  Heart,
  Baby,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isMobileSheet?: boolean;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'cms', label: 'Content Management', icon: FileText },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'finance', label: 'Finance', icon: CreditCard },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'volunteers', label: 'Volunteers', icon: UserCheck },
  { id: 'departments', label: 'Departments & Ministries', icon: Building },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ministryItems = [
  { id: 'mens-ministry', label: 'Men\'s Ministry', icon: User },
  { id: 'womens-ministry', label: 'Women\'s Ministry', icon: Heart },
  { id: 'youth-ministry', label: 'Youth Ministry', icon: Zap },
  { id: 'childrens-ministry', label: 'Children\'s Ministry', icon: Baby },
];

export const AdminSidebar = ({ activeModule, onModuleChange, isMobileSheet = false }: AdminSidebarProps) => {
  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    console.log(`Navigating to ${moduleId} module`);
  };

  return (
    <Sidebar className={cn("border-r", isMobileSheet && "border-none")}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 p-4">
          <img
            src="/lovable-uploads/5d36a4a9-6499-4550-9a40-87f4bc150872.png"
            alt="Faith Healing Bible Church Logo"
            className="w-8 h-8 rounded-sm flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-primary text-sm truncate">Faith Healing</h2>
            <p className="text-xs text-muted-foreground truncate">Beccle St Branch</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-auto">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeModule === item.id}
                    onClick={() => handleModuleChange(item.id)}
                    className="w-full justify-start"
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ministries */}
        <SidebarGroup>
          <SidebarGroupLabel>Ministries</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ministryItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeModule === item.id}
                    onClick={() => handleModuleChange(item.id)}
                    className="w-full justify-start"
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {isMobileSheet && (
        <SidebarFooter className="border-t p-4">
          <div className="text-xs text-muted-foreground text-center">
            Faith Healing Bible Church
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
