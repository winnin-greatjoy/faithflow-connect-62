'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarSidebarProps, CalendarType } from './calendar.types';
import { LEVEL_META } from './calendar.constants';
import { CalendarCreateButton } from './CalendarCreateButton';

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  onDateSelect,
  selectedCalendars,
  onToggleCalendar,
  onCreateEvent,
  onCreateTask,
  onCreateAppointment
}) => {
  const [openSections, setOpenSections] = React.useState({
    my: true,
    church: true,
    other: true,
  });

  const toggleSection = (section: 'my' | 'church' | 'other') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const myGroup = [
    { id: 'ministry', label: 'Ministry Meetings', color: '#0ea5e9' },
    { id: 'youth', label: 'Youth Department', color: '#f59e0b' },
    { id: 'choir', label: 'Choir Rehearsals', color: '#ec4899' },
  ];

  const churchGroup = [
    {
      id: 'national',
      label: 'National Events',
      type: 'national' as CalendarType,
      color: LEVEL_META.NATIONAL.bg,
    },
    {
      id: 'district',
      label: 'District Events',
      type: 'district' as CalendarType,
      color: LEVEL_META.DISTRICT.bg,
    },
    {
      id: 'branch',
      label: 'Branch Events',
      type: 'branch' as CalendarType,
      color: LEVEL_META.BRANCH.bg,
    },
  ];

  const otherGroup = [
    { id: 'holiday', label: 'Holidays', type: 'holiday' as CalendarType, color: '#7c3aed' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-white dark:bg-slate-950 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <CalendarCreateButton
            onCreateEvent={onCreateEvent}
            onCreateTask={onCreateTask || (() => { })}
            onCreateAppointment={onCreateAppointment || (() => { })}
          />

          <div className="mb-6 px-3">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && onDateSelect(date)}
              className="p-0 border-none w-full"
              classNames={{
                head_cell: 'text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]',
                cell: 'h-7 w-7 text-center text-xs p-0 relative',
                day: 'h-7 w-7 p-0 font-normal aria-selected:opacity-100 rounded-full text-xs hover:bg-slate-100 dark:hover:bg-slate-800',
                day_today: 'bg-transparent font-bold !text-blue-600',
                day_selected:
                  'bg-blue-600 text-white rounded-full hover:bg-blue-600 focus:bg-blue-600',
              }}
            />
          </div>

          <div className="space-y-4">
            {/* My Calendars */}
            <div>
              <div
                className="flex items-center justify-between mb-1 py-1 px-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md cursor-pointer group"
                onClick={() => toggleSection('my')}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  My Calendars
                </h3>
                <Button variant="ghost" size="icon" className="w-5 h-5">
                  {openSections.my ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {openSections.my && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1">
                  {myGroup.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md cursor-pointer group"
                    >
                      <Checkbox
                        id={item.id}
                        className="border-2 rounded-sm h-4 w-4 shadow-none"
                        style={{ borderColor: item.color }}
                      />
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Church Calendars */}
            <div>
              <div
                className="flex items-center justify-between mb-1 py-1 px-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md cursor-pointer group"
                onClick={() => toggleSection('church')}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Church Calendars
                </h3>
                <Button variant="ghost" size="icon" className="w-5 h-5">
                  {openSections.church ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {openSections.church && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1">
                  {churchGroup.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCalendar(group.type);
                      }}
                    >
                      <Checkbox
                        id={group.id}
                        checked={selectedCalendars.includes(group.type)}
                        onCheckedChange={() => onToggleCalendar(group.type)}
                        className="border-2 rounded-sm h-4 w-4"
                        style={{
                          borderColor: group.color,
                          backgroundColor: selectedCalendars.includes(group.type)
                            ? group.color
                            : 'transparent',
                        }}
                      />
                      <label
                        htmlFor={group.id}
                        className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1"
                      >
                        {group.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Calendars */}
            <div className="pb-8">
              <div
                className="flex items-center justify-between mb-1 py-1 px-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md cursor-pointer group"
                onClick={() => toggleSection('other')}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Other Calendars
                </h3>
                <Button variant="ghost" size="icon" className="w-5 h-5">
                  {openSections.other ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {openSections.other && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1">
                  {otherGroup.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCalendar(group.type);
                      }}
                    >
                      <Checkbox
                        id={group.id}
                        checked={selectedCalendars.includes(group.type)}
                        onCheckedChange={() => onToggleCalendar(group.type)}
                        className="border-2 rounded-sm h-4 w-4"
                        style={{
                          borderColor: group.color,
                          backgroundColor: selectedCalendars.includes(group.type)
                            ? group.color
                            : 'transparent',
                        }}
                      />
                      <label
                        htmlFor={group.id}
                        className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1"
                      >
                        {group.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 opacity-50 text-[10px] text-slate-400 font-medium border-t">
          © 2025 FaithFlow Connect
        </div>
      </div>
    </aside>
  );
};
