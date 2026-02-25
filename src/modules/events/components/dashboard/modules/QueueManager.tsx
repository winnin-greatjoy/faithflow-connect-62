import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Timer,
  Users,
  ArrowRight,
  Activity,
  MapPin,
  Plus,
  Play,
  Pause,
  XCircle,
  Trash2,
  Mic,
  SkipForward,
  Volume2,
  Settings,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  useCallNextInQueue,
  useCreateQueue,
  useDeleteQueue,
  useJoinQueue,
  useQueues,
  useUpdateQueue,
  useUpdateTicketStatus,
} from '@/hooks/useEventModules';
import { useAuthz } from '@/hooks/useAuthz';
import { toast } from 'sonner';
import type {
  Queue as QueueRecord,
  QueueTicket as QueueTicketRecord,
} from '@/services/eventModulesApi';

type QueueWithTickets = QueueRecord & { tickets: QueueTicketRecord[] };
const ACTIVE_TICKET_STATUSES: QueueTicketRecord['status'][] = ['waiting', 'called', 'serving'];

const priorityScore: Record<QueueTicketRecord['priority'], number> = {
  normal: 0,
  priority: 1,
  vip: 2,
};

const toMinutes = (seconds: number | null, queueLength: number) => {
  const sec = seconds || 0;
  return Math.max(0, Math.round((sec * queueLength) / 60));
};

export const QueueManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const [viewMode, setViewMode] = useState<'ADMIN' | 'OPERATOR' | 'KIOSK'>('ADMIN');
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMaxCapacity, setNewMaxCapacity] = useState('');
  const [newAvgService, setNewAvgService] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPriority, setGuestPriority] = useState<'normal' | 'priority' | 'vip'>('normal');

  const { data: queueData = [], isLoading } = useQueues(eventId || '');
  const createQueue = useCreateQueue(eventId || '');
  const updateQueue = useUpdateQueue(eventId || '');
  const deleteQueue = useDeleteQueue(eventId || '');
  const callNext = useCallNextInQueue(eventId || '');
  const updateTicket = useUpdateTicketStatus(eventId || '');
  const joinQueue = useJoinQueue(eventId || '');
  const canManageQueue = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const canDeleteQueue = useMemo(
    () => hasRole('super_admin', 'admin') || can('events', 'delete'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageQueue;

  const queues = useMemo(() => (queueData || []) as QueueWithTickets[], [queueData]);

  useEffect(() => {
    if (!selectedQueueId && queues.length > 0) {
      setSelectedQueueId(queues[0].id);
    }
    if (selectedQueueId && !queues.find((q) => q.id === selectedQueueId)) {
      setSelectedQueueId(queues[0]?.id || null);
    }
  }, [queues, selectedQueueId]);

  const selectedQueue = useMemo(
    () => queues.find((q) => q.id === selectedQueueId) || null,
    [queues, selectedQueueId]
  );

  const queueMetrics = useMemo(() => {
    const totalInQueue = queues.reduce(
      (sum, q) => sum + q.tickets.filter((t) => ACTIVE_TICKET_STATUSES.includes(t.status)).length,
      0
    );
    const activeQueues = queues.filter((q) => q.status === 'active').length;
    const avgWaitMins =
      queues.length === 0
        ? 0
        : Math.round(
            queues.reduce((sum, q) => {
              const length = q.tickets.filter((t) => t.status === 'waiting').length;
              return sum + toMinutes(q.avg_service_time, length);
            }, 0) / queues.length
          );
    return { totalInQueue, activeQueues, avgWaitMins };
  }, [queues]);

  const orderedWaitingTickets = useMemo(() => {
    if (!selectedQueue) return [];
    return [...selectedQueue.tickets]
      .filter((t) => t.status === 'waiting')
      .sort((a, b) => {
        const p = priorityScore[b.priority] - priorityScore[a.priority];
        if (p !== 0) return p;
        return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
      });
  }, [selectedQueue]);

  const currentTicket = useMemo(() => {
    if (!selectedQueue) return null;
    return (
      selectedQueue.tickets.find((t) => t.status === 'serving') ||
      selectedQueue.tickets.find((t) => t.status === 'called') ||
      null
    );
  }, [selectedQueue]);

  const handleCreateQueue = async () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to create queues.');
      return;
    }
    if (!eventId || !newName.trim()) return;
    await createQueue.mutateAsync({
      event_id: eventId,
      name: newName.trim(),
      description: newDescription.trim() || null,
      status: 'active',
      max_capacity: newMaxCapacity ? Number(newMaxCapacity) : null,
      avg_service_time: newAvgService ? Number(newAvgService) : null,
    });
    setNewName('');
    setNewDescription('');
    setNewMaxCapacity('');
    setNewAvgService('');
    setCreateOpen(false);
  };

  const handleToggleQueueStatus = async (queue: QueueWithTickets) => {
    if (actionsDisabled) {
      toast.error('You do not have permission to update queue status.');
      return;
    }
    const next = queue.status === 'active' ? 'paused' : 'active';
    await updateQueue.mutateAsync({ queueId: queue.id, updates: { status: next } });
  };

  const handleCallNext = async () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to call next ticket.');
      return;
    }
    if (!selectedQueue) return;
    await callNext.mutateAsync(selectedQueue.id);
  };

  const handleCallAgain = async () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to call tickets.');
      return;
    }
    if (!currentTicket) return;
    await updateTicket.mutateAsync({ ticketId: currentTicket.id, status: 'called' });
  };

  const handleSkipNoShow = async () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to update ticket status.');
      return;
    }
    if (!currentTicket) return;
    await updateTicket.mutateAsync({ ticketId: currentTicket.id, status: 'no_show' });
  };

  const handleJoinGuest = async () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to add guests to queue.');
      return;
    }
    if (!selectedQueue || !guestName.trim()) return;
    await joinQueue.mutateAsync({
      queueId: selectedQueue.id,
      ticket: {
        guest_name: guestName.trim(),
        priority: guestPriority,
        status: 'waiting',
      },
    });
    setGuestName('');
    setGuestPriority('normal');
  };

  const handleDeleteQueue = async (queue: QueueWithTickets) => {
    if (authzLoading || !canDeleteQueue) {
      toast.error('You do not have permission to delete queues.');
      return;
    }
    if (!window.confirm(`Delete queue "${queue.name}"? This cannot be undone.`)) return;
    await deleteQueue.mutateAsync(queue.id);
  };

  const openOperatorMode = () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to operate queues.');
      return;
    }
    setViewMode('OPERATOR');
  };

  const openCreateQueue = () => {
    if (actionsDisabled) {
      toast.error('You do not have permission to create queues.');
      return;
    }
    setCreateOpen(true);
  };

  if (!eventId) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-muted-foreground">
        Invalid event context.
      </div>
    );
  }

  const AdminView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-black">Queue Operations</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
            Manage flow and service lines
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openOperatorMode} disabled={actionsDisabled}>
            Operator Mode
          </Button>
          <Button variant="outline" onClick={() => setViewMode('KIOSK')}>
            Kiosk Display
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="font-black text-[10px] uppercase tracking-widest rounded-xl"
                onClick={openCreateQueue}
                disabled={actionsDisabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Queue
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px]">
              <DialogHeader>
                <DialogTitle className="font-serif font-black text-2xl">
                  Create Service Queue
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Queue Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Registration Desk A"
                    className="rounded-xl bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description / Zone</Label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. Main Hall - Gate A"
                    className="rounded-xl bg-muted/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Capacity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newMaxCapacity}
                      onChange={(e) => setNewMaxCapacity(e.target.value)}
                      placeholder="200"
                      className="rounded-xl bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Service Time (sec)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newAvgService}
                      onChange={(e) => setNewAvgService(e.target.value)}
                      placeholder="120"
                      className="rounded-xl bg-muted/30"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateQueue}
                  disabled={createQueue.isPending || !newName.trim() || actionsDisabled}
                  className="w-full font-black text-[10px] uppercase tracking-widest rounded-xl mt-4"
                >
                  {createQueue.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Queue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Avg Wait Time',
            value: `${queueMetrics.avgWaitMins}m`,
            icon: Timer,
            color: 'text-primary',
          },
          {
            label: 'Current Flow',
            value: `${queueMetrics.totalInQueue}`,
            icon: Activity,
            color: 'text-emerald-500',
          },
          {
            label: 'In Queue',
            value: `${queueMetrics.totalInQueue}`,
            icon: Users,
            color: 'text-amber-500',
          },
          {
            label: 'Active Gates',
            value: `${queueMetrics.activeQueues}`,
            icon: MapPin,
            color: 'text-primary',
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-4 border border-primary/5 rounded-[24px] bg-white shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                  {stat.label}
                </p>
                <h3 className="text-lg font-black">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : queues.length === 0 ? (
        <Card className="p-10 rounded-[24px] border border-dashed border-primary/20 text-center text-muted-foreground">
          No queues yet. Create your first queue to begin flow operations.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {queues.map((queue) => {
            const inQueue = queue.tickets.filter((t) =>
              ACTIVE_TICKET_STATUSES.includes(t.status)
            ).length;
            const max = queue.max_capacity || 0;
            const pct = max > 0 ? Math.min((inQueue / max) * 100, 100) : 0;
            const waitMins = toMinutes(queue.avg_service_time, inQueue);
            return (
              <Card
                key={queue.id}
                className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5 overflow-hidden relative group hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 h-1 w-full bg-muted/20">
                  <div
                    className={cn(
                      'h-full transition-all duration-1000',
                      queue.status === 'active'
                        ? 'bg-emerald-500'
                        : queue.status === 'paused'
                          ? 'bg-amber-500'
                          : 'bg-gray-300'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h4 className="font-serif font-black text-lg">{queue.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {queue.description || 'No zone configured'}
                    </p>
                  </div>
                  <Badge
                    variant={queue.status === 'active' ? 'default' : 'secondary'}
                    className="rounded-lg h-6 px-2 text-[9px] font-black tracking-widest uppercase"
                  >
                    {queue.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-muted/20 rounded-2xl border border-primary/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">
                      Queue Length
                    </p>
                    <p className="text-xl font-black text-primary">
                      {inQueue}
                      <span className="text-xs text-muted-foreground font-bold ml-1">
                        / {queue.max_capacity || '∞'}
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-2xl border border-primary/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">
                      Est. Wait
                    </p>
                    <p className="text-xl font-black text-primary">
                      {waitMins}
                      <span className="text-xs text-muted-foreground font-bold ml-1">min</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleQueueStatus(queue)}
                    disabled={updateQueue.isPending || actionsDisabled}
                    className="flex-1 rounded-xl h-9 text-[9px] uppercase font-black border-primary/10"
                  >
                    {queue.status === 'active' ? (
                      <>
                        <Pause className="h-3 w-3 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-2" /> Resume
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedQueueId(queue.id);
                      openOperatorMode();
                    }}
                    disabled={actionsDisabled}
                    className="flex-1 rounded-xl h-9 text-[9px] uppercase font-black bg-primary text-white hover:bg-primary/90"
                  >
                    <Settings className="h-3 w-3 mr-2" /> Manage
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    aria-label={`Delete queue ${queue.name}`}
                    onClick={() => handleDeleteQueue(queue)}
                    disabled={deleteQueue.isPending || authzLoading || !canDeleteQueue}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const OperatorView = () => (
    <div className="h-[700px] flex overflow-hidden bg-muted/10 rounded-[40px] border border-primary/5 animate-in slide-in-from-right duration-500">
      <div className="w-80 bg-white border-r border-primary/5 p-6 flex flex-col gap-6">
        <div>
          <Button
            variant="ghost"
            className="mb-4 -ml-4 rounded-xl"
            onClick={() => setViewMode('ADMIN')}
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to Admin
          </Button>
          <h3 className="font-serif font-black text-xl">Operator Panel</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
            Control active flow
          </p>
        </div>

        <div className="space-y-2">
          <Label>Add Guest to Selected Queue</Label>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Guest name"
            className="rounded-xl bg-muted/30"
          />
          <Select
            value={guestPriority}
            onValueChange={(v: 'normal' | 'priority' | 'vip') => setGuestPriority(v)}
          >
            <SelectTrigger className="rounded-xl bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleJoinGuest}
            disabled={!selectedQueue || !guestName.trim() || joinQueue.isPending || actionsDisabled}
            className="w-full rounded-xl text-[10px] uppercase font-black"
          >
            {joinQueue.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add to Queue
          </Button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {queues.map((q) => {
            const queueCount = q.tickets.filter((t) =>
              ACTIVE_TICKET_STATUSES.includes(t.status)
            ).length;
            const wait = toMinutes(q.avg_service_time, queueCount);
            return (
              <div
                key={q.id}
                onClick={() => setSelectedQueueId(q.id)}
                className={cn(
                  'p-4 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.02]',
                  selectedQueueId === q.id
                    ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20'
                    : 'bg-white border-primary/5 hover:border-primary/20'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{q.name}</h4>
                  <Badge className="bg-amber-400 text-black border-none text-[8px] h-4 uppercase">
                    {q.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium opacity-80">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {queueCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" /> ~{wait}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-muted/20 to-muted/20">
        {selectedQueue ? (
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <Badge
                variant="outline"
                className="text-[10px] font-black tracking-[0.2em] uppercase border-primary/20 text-primary py-1 px-3"
              >
                Now Serving
              </Badge>
              <h1 className="text-6xl font-black font-serif text-primary">
                {currentTicket?.ticket_number || '--'}
              </h1>
              <p className="text-xl font-medium text-muted-foreground">
                {currentTicket?.guest_name ||
                  currentTicket?.member_id ||
                  'No ticket currently called'}
              </p>
              {currentTicket && (
                <div className="flex justify-center gap-2 mt-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none uppercase">
                    {currentTicket.status}
                  </Badge>
                  <Badge className="bg-amber-500/10 text-amber-600 border-none uppercase">
                    {currentTicket.priority}
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCallAgain}
                disabled={!currentTicket || updateTicket.isPending || actionsDisabled}
                className="h-16 rounded-[24px] bg-white border border-primary/10 text-primary hover:bg-neutral-50 shadow-xl font-black text-xs uppercase tracking-widest flex flex-col gap-1 items-center justify-center"
              >
                <Volume2 className="h-5 w-5" />
                Call Again
              </Button>
              <Button
                onClick={handleSkipNoShow}
                disabled={!currentTicket || updateTicket.isPending || actionsDisabled}
                className="h-16 rounded-[24px] bg-white border border-primary/10 text-destructive hover:bg-destructive/5 shadow-xl font-black text-xs uppercase tracking-widest flex flex-col gap-1 items-center justify-center"
              >
                <SkipForward className="h-5 w-5" />
                Skip / No Show
              </Button>
              <Button
                onClick={handleCallNext}
                disabled={
                  callNext.isPending || selectedQueue.status !== 'active' || actionsDisabled
                }
                className="h-20 col-span-2 rounded-[32px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {callNext.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
                Call Next Ticket
              </Button>
            </div>

            <div className="pt-8 border-t border-primary/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-4 text-center">
                Up Next
              </p>
              <div className="space-y-3">
                {orderedWaitingTickets.slice(0, 3).map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted font-black text-xs flex items-center justify-center text-muted-foreground">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{t.ticket_number}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">
                          {t.guest_name || t.member_id || 'Guest'}
                        </p>
                      </div>
                    </div>
                    {t.priority !== 'normal' && <Activity className="h-4 w-4 text-amber-500" />}
                  </div>
                ))}
                {orderedWaitingTickets.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6">
                    No waiting tickets.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-40">
            <Activity className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="font-serif font-black text-2xl">Select a Queue</h3>
            <p className="font-medium">Choose a line from the sidebar to start operating.</p>
          </div>
        )}
      </div>
    </div>
  );

  const KioskDisplay = () => {
    const queue = selectedQueue || queues[0] || null;
    const nowServing =
      queue?.tickets.find((t) => t.status === 'serving') ||
      queue?.tickets.find((t) => t.status === 'called') ||
      null;
    const upcoming = queue
      ? [...queue.tickets]
          .filter((t) => t.status === 'waiting')
          .sort((a, b) => {
            const p = priorityScore[b.priority] - priorityScore[a.priority];
            if (p !== 0) return p;
            return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
          })
          .slice(0, 4)
      : [];

    return (
      <div className="fixed inset-0 bg-black text-white z-[100] flex flex-col items-center justify-center p-8">
        <Button
          variant="ghost"
          className="absolute top-8 right-8 text-white/20 hover:text-white"
          onClick={() => setViewMode('ADMIN')}
        >
          <XCircle className="h-8 w-8" />
        </Button>

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="text-center lg:text-left space-y-8">
            <Badge
              variant="outline"
              className="text-xl py-2 px-6 rounded-full border-white/20 text-white font-black uppercase tracking-[0.3em]"
            >
              Now Serving
            </Badge>
            <div className="space-y-4">
              <h1 className="text-[8rem] leading-none font-black font-serif text-emerald-400">
                {nowServing?.ticket_number || '--'}
              </h1>
              <h2 className="text-4xl font-bold tracking-tight">
                {nowServing?.guest_name || nowServing?.member_id || 'No current call'}
              </h2>
              <p className="text-2xl text-white/60 font-medium">
                {queue ? `Please proceed to ${queue.name}` : 'No active queue selected'}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-[48px] p-12 border border-white/10 backdrop-blur-sm">
            <h3 className="text-2xl font-black uppercase tracking-widest text-white/40 mb-8 border-b border-white/10 pb-4">
              Up Next
            </h3>
            <div className="space-y-6">
              {upcoming.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-black font-serif text-white/80">#{i + 1}</span>
                    <div>
                      <p className="text-2xl font-bold">{t.ticket_number}</p>
                      <div className="flex gap-3 text-sm font-medium text-white/40 mt-1">
                        <span>{t.guest_name || t.member_id || 'Guest'}</span>
                        {t.priority !== 'normal' && (
                          <span className="text-amber-400 font-bold">Priority</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="text-center text-white/40 py-6">No waiting tickets.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[600px]">
      {viewMode === 'ADMIN' && <AdminView />}
      {viewMode === 'OPERATOR' && <OperatorView />}
      {viewMode === 'KIOSK' && <KioskDisplay />}
    </div>
  );
};
