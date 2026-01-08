import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  Search,
  PlusCircle,
  FileText,
  Users,
  Shield,
  Heart,
  Music,
  Mic2,
  LayoutDashboard,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <button
          onClick={() => setOpen(true)}
          className="bg-primary text-white h-12 w-12 rounded-full shadow-xl flex items-center justify-center"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/calendar'))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/people'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Search Members</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/finance'))}>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Finance Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/events/dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Event Dashboard</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {/* Placeholder route for new registration until wizard page is confirmed */}
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/events?action=new'))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>New Registration</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/safety/reports'))}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Report Incident</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/reports'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export Report</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Modules">
            <CommandItem
              onSelect={() => runCommand(() => navigate('/admin/events/dashboard?module=worship'))}
            >
              <Music className="mr-2 h-4 w-4" />
              <span>Worship Planner</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate('/admin/events/dashboard?module=assets'))}
            >
              <Mic2 className="mr-2 h-4 w-4" />
              <span>Asset Manager</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/engagement/prayer'))}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Prayer Wall</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/settings/profile'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/finance/settings'))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
