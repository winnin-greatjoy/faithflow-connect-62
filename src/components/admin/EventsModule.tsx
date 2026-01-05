'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthz } from '@/hooks/useAuthz';
import { useAdminContext } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import EventCalendar from '@/components/shared/EventCalendar';
import { EventRegistrationForm } from '@/components/events/EventRegistrationForm';
import { RegistrationsManagementDialog } from '@/components/admin/RegistrationsManagementDialog';
import { EventQuotasDialog } from '@/components/admin/EventQuotasDialog';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import registrationsApi from '@/services/registrationsApi';

// New Architecture Imports
import { useEvents } from '@/modules/events/hooks/useEvents';
import { useEventActions } from '@/modules/events/hooks/useEventActions';
import { EventStats } from '@/modules/events/components/EventStats';
import { EventListItem } from '@/modules/events/components/EventListItem';
import { EventFilters } from '@/modules/events/components/EventFilters';
import { EventFormDialog } from '@/modules/events/components/dialogs/EventFormDialog';
import { EventViewDialog } from '@/modules/events/components/dialogs/EventViewDialog';
import type { EventItem, EventLevel, EventType } from '@/modules/events/types';

export const EventsModule: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRole, branchId: userBranchId, loading: authzLoading } = useAuthz();
  const { selectedBranchId, loading: contextLoading } = useAdminContext();

  // Data Hooks
  const { events, loading: eventsLoading, reload, stats } = useEvents();
  const actions = useEventActions();

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<EventLevel | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<EventType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // UI State
  const [dialog, setDialog] = useState<
    | 'create'
    | 'edit'
    | 'view'
    | 'calendar'
    | 'register'
    | 'manage'
    | 'quotas'
    | 'create-task'
    | 'book-appointment'
    | null
  >(null);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [regCount, setRegCount] = useState<number | null>(null);

  const loading = authzLoading || contextLoading || eventsLoading;

  // Permissions
  const canManageEvents = useMemo(() => {
    return (
      hasRole('super_admin') || hasRole('district_admin') || hasRole('admin') || hasRole('pastor')
    );
  }, [hasRole]);

  const canEditEvent = (e: EventItem) => {
    if (!canManageEvents) return false;
    if (hasRole('super_admin')) return true;
    if (e.event_level === 'NATIONAL') return false;
    // Simplified logic for brevity, matches existing
    return e.owner_scope_id === (selectedBranchId || userBranchId);
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    const result = events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesScope = scopeFilter === 'All' || e.event_level === scopeFilter;
      const matchesType = typeFilter === 'All' || e.type === typeFilter;
      return matchesSearch && matchesScope && matchesType;
    });

    result.sort((a, b) => {
      const fieldA = sortBy === 'date' ? a.date : a.title;
      const fieldB = sortBy === 'date' ? b.date : b.title;
      return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    });

    return result;
  }, [events, searchTerm, scopeFilter, typeFilter, sortBy, sortOrder]);

  // Handlers
  const openView = async (ev: EventItem) => {
    setActiveEvent(ev);
    setDialog('view');
    setRegCount(null);
    try {
      const { count } = await registrationsApi.getRegistrationCount(ev.id);
      setRegCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch registration count', err);
    }
  };

  const handleSave = async (payload: any) => {
    // Transform payload for API
    const formatTime = (time: string | undefined): string => {
      if (!time) return '10:00:00';
      if (time.split(':').length === 3) return time;
      return `${time}:00`;
    };

    const mapStatus = (s: string): any => {
      const mapping: any = {
        Cancelled: 'cancelled',
        Upcoming: 'upcoming',
        Active: 'active',
        Ended: 'ended',
        Open: 'published',
      };
      return mapping[s] || 'published';
    };

    const apiPayload = {
      title: payload.title,
      description: payload.description,
      event_level: payload.event_level,
      owner_scope_id: payload.owner_scope_id,
      start_at: `${payload.date}T${formatTime(payload.time)}`,
      end_at: `${payload.end_date || payload.date}T${formatTime(payload.time)}`,
      location: payload.location,
      capacity: payload.capacity,
      status: mapStatus(payload.status),
      requires_registration: payload.requires_registration,
      is_paid: payload.is_paid,
      visibility: payload.visibility,
      registration_fee: payload.registration_fee,
      target_audience: payload.target_audience,
      metadata: {
        type: payload.type,
        frequency: payload.frequency,
        daysOfWeek: payload.daysOfWeek || [],
      },
    };

    let result;
    if (payload.id) {
      result = await actions.updateEvent(payload.id, apiPayload);
    } else {
      result = await actions.createEvent(apiPayload);
    }

    if (result.success) {
      setDialog(null);
      reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (await actions.deleteEvent(id)) {
      reload();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20"></div>
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
          Synchronizing Event Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif font-black tracking-tight text-foreground">
            Digital <span className="text-primary">Protocols</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Sparkles className="h-4 w-4 text-primary opacity-60" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
              System Orchestration & Deployment Center
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            onClick={() => setDialog('calendar')}
            variant="outline"
            className="bg-card h-12 px-6 rounded-2xl font-bold border border-primary/10 hover:bg-primary/5 transition-all shadow-sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            CALENDAR VIEW
          </Button>
          {canManageEvents && (
            <Button
              onClick={() => {
                setActiveEvent(null);
                setDialog('create');
              }}
              className="bg-primary h-12 px-8 rounded-2xl font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              INITIALIZE ACTIVATION
            </Button>
          )}
        </motion.div>
      </div>

      {/* Stats Section */}
      <EventStats stats={stats} />

      {/* Filters Section */}
      <EventFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {/* Content Section */}
      <div className="space-y-4 min-h-[400px]">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev, idx) => (
            <EventListItem
              key={ev.id}
              event={ev}
              canEdit={canEditEvent(ev)}
              onView={openView}
              onEdit={(e) => {
                setActiveEvent(e);
                setDialog('edit');
              }}
              onDelete={handleDelete}
              onRegister={(e) => {
                setActiveEvent(e);
                setDialog('register');
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-card rounded-[32px] border-dashed border-2 border-primary/10 text-center shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
              <CalendarIcon className="h-8 w-8 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-serif font-black text-foreground opacity-40">
              NO PROTOCOLS DETECTED
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">
              Adjust scope or category filters
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EventFormDialog
        open={dialog === 'create' || dialog === 'edit'}
        onOpenChange={(open) => !open && setDialog(null)}
        event={activeEvent}
        onSubmit={handleSave}
        initialLevel={
          hasRole('super_admin') ? 'NATIONAL' : hasRole('district_admin') ? 'DISTRICT' : 'BRANCH'
        }
        initialScopeId={selectedBranchId || userBranchId}
      />

      <EventViewDialog
        open={dialog === 'view'}
        onOpenChange={(open) => !open && setDialog(null)}
        event={activeEvent}
        registrationCount={regCount}
        canEdit={activeEvent ? canEditEvent(activeEvent) : false}
        onRegister={(e) => setDialog('register')}
        onManageRegistrations={() => setDialog('manage')}
        onManageQuotas={() => setDialog('quotas')}
      />

      <Dialog open={dialog === 'calendar'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden bg-card border border-primary/10 flex flex-col shadow-2xl">
          <div className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-serif font-black tracking-tight">
                Digital Calendar Visualization
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden relative rounded-2xl border border-primary/5">
              <EventCalendar
                events={
                  filteredEvents.map((e) => ({ ...e, start_at: `${e.date}T${e.time}` })) as any
                }
                onEventClick={(ev: any) => openView(ev as any)}
                showCard={false}
                onCreateEvent={() => setDialog('create')}
                onCreateTask={() => setDialog('create-task')}
                onCreateAppointment={() => setDialog('book-appointment')}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTaskDialog
        open={dialog === 'create-task'}
        onOpenChange={(open) => !open && setDialog('calendar')}
      />

      <BookAppointmentDialog
        open={dialog === 'book-appointment'}
        onOpenChange={(open) => !open && setDialog('calendar')}
      />

      <Dialog open={dialog === 'register'} onOpenChange={() => setDialog('view')}>
        <DialogContent className="bg-card border border-primary/10 rounded-[32px] p-0 overflow-hidden max-w-md shadow-2xl">
          {activeEvent && (
            <EventRegistrationForm
              eventId={activeEvent.id}
              eventTitle={activeEvent.title}
              capacity={activeEvent.capacity}
              onSuccess={() => setTimeout(() => setDialog('view'), 2000)}
            />
          )}
        </DialogContent>
      </Dialog>

      {activeEvent && dialog === 'manage' && (
        <RegistrationsManagementDialog
          eventId={activeEvent.id}
          eventTitle={activeEvent.title}
          isOpen={dialog === 'manage'}
          onClose={() => setDialog('view')}
          capacity={activeEvent.capacity}
        />
      )}

      {activeEvent && dialog === 'quotas' && (
        <EventQuotasDialog
          eventId={activeEvent.id}
          eventTitle={activeEvent.title}
          isOpen={dialog === 'quotas'}
          onClose={() => setDialog('view')}
        />
      )}
    </div>
  );
};

export default EventsModule;
