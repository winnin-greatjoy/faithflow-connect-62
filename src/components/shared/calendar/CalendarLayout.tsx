'use client';

import React, { useState } from 'react';

interface CalendarLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  showSidebar: boolean;
}

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  sidebar,
  header,
  children,
  showSidebar,
}) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-slate-950">
      {header}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => {}} // Handle backdrop click if needed
          />
        )}

        <div
          className={`
                        transition-all duration-300 ease-in-out border-r bg-white dark:bg-slate-950 z-20
                        ${showSidebar ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 overflow-hidden border-r-0 -translate-x-full md:translate-x-0'}
                        absolute md:relative h-full shadow-lg md:shadow-none
                    `}
        >
          {sidebar}
        </div>

        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
          <div className="flex-1 overflow-hidden relative">{children}</div>
        </main>
      </div>
    </div>
  );
};
