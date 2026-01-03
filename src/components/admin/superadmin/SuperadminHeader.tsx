import React from 'react';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, Home, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SuperadminHeaderProps {
  onMenuToggle: () => void;
}

export const SuperadminHeader: React.FC<SuperadminHeaderProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-30 glass dark:bg-black/30 border-b border-primary/5 px-6 py-4 backdrop-blur-2xl flex justify-between items-center shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden rounded-xl hover:bg-primary/10 text-primary"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="hidden sm:flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-tight leading-none">
              Governance <span className="text-primary">Command</span>
            </h1>
            <Badge
              variant="outline"
              className="mt-1 bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-widest px-2 py-0"
            >
              System Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Switch */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
          className="hidden md:flex glass border-primary/10 text-xs font-bold uppercase tracking-wider hover:bg-primary/5 rounded-xl h-10 px-4"
        >
          Branch Console
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-primary/10 text-primary relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white ring-2 ring-destructive/10" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 gap-3 px-2 hover:bg-primary/5 rounded-2xl group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-vibrant-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-bold leading-none">Superadmin</span>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter mt-1 opacity-50">
                  Master Access
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 glass rounded-2xl border-primary/10 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2"
          >
            <DropdownMenuLabel className="px-4 py-3">
              <p className="text-sm font-bold font-serif">System Management</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
                Global Oversight
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/5" />
            <DropdownMenuItem
              onClick={() => navigate('/portal/profile')}
              className="rounded-xl px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors"
            >
              <User className="mr-3 h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Internal Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/portal')}
              className="rounded-xl px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors"
            >
              <Home className="mr-3 h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Standard Member View</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/5" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-xl px-4 py-3 cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-sm font-bold">Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
