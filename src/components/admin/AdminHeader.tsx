
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Settings, User, LogOut, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
      console.log('Searching for:', searchQuery);
    }
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "Opening notification center...",
    });
    console.log('Opening notifications');
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Opening user settings...",
    });
    console.log('Opening settings');
  };

  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Logging out...",
    });
    console.log('Logging out');
  };

  return (
    <header className="bg-white border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo and Church Name */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <img
                src="/lovable-uploads/5d36a4a9-6499-4550-9a40-87f4bc150872.png"
                alt="Faith Healing Bible Church Logo"
                className="w-10 h-10 rounded-sm"
              />
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="font-serif font-bold text-primary text-lg leading-tight">Faith Healing</div>
            <div className="font-serif font-bold text-primary text-base leading-tight">Bible Church</div>
            <div className="text-xs text-muted-foreground">Beccle St Branch</div>
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
          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleNotifications}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-xs p-0 flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm hidden sm:inline">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
