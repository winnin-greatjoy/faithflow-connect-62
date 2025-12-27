
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Calendar, CheckSquare, Clock } from 'lucide-react';
import { useAuthz } from '@/hooks/useAuthz';

interface CalendarCreateButtonProps {
    onCreateEvent: () => void;
    onCreateTask: () => void;
    onCreateAppointment: () => void;
    showLabel?: boolean;
}

export const CalendarCreateButton: React.FC<CalendarCreateButtonProps> = ({
    onCreateEvent,
    onCreateTask,
    onCreateAppointment,
    showLabel = true,
}) => {
    const { hasRole } = useAuthz();
    const canCreateEvents = hasRole('super_admin') || hasRole('district_admin') || hasRole('admin') || hasRole('pastor');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className={`
            rounded-full shadow-md bg-white hover:bg-slate-50 border text-slate-700 font-medium group dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800
            ${showLabel ? 'h-12 px-6 flex gap-3 items-center' : 'h-14 w-14 flex items-center justify-center p-0 shadow-2xl'}
          `}
                >
                    <Plus className="w-6 h-6 text-blue-600 stroke-[3px]" />
                    {showLabel && <span className="text-sm">Create</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" sideOffset={8}>
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {canCreateEvents && (
                    <DropdownMenuItem onClick={onCreateEvent} className="gap-3 p-3 cursor-pointer">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">Event</span>
                            <span className="text-xs text-muted-foreground">Organization event</span>
                        </div>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={(e) => {
                    console.log('Task Create Clicked');
                    onCreateTask?.();
                }} className="gap-3 p-3 cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <CheckSquare className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">Task</span>
                        <span className="text-xs text-muted-foreground">Personal to-do</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onCreateAppointment} className="gap-3 p-3 cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">Appointment</span>
                        <span className="text-xs text-muted-foreground">Book a meeting</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
