import React, { useEffect, useState } from 'react';
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
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Search Members</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Finance Dashboard</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>New Registration</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Shield className="mr-2 h-4 w-4" />
              <span>Report Incident</span>
            </CommandItem>
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export Report</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Modules">
            <CommandItem>
              <Music className="mr-2 h-4 w-4" />
              <span>Worship Planner</span>
            </CommandItem>
            <CommandItem>
              <Mic2 className="mr-2 h-4 w-4" />
              <span>Asset Manager</span>
            </CommandItem>
            <CommandItem>
              <Heart className="mr-2 h-4 w-4" />
              <span>Prayer Wall</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
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
