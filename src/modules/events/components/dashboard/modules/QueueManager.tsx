import React, { useState } from 'react';
import {
  Timer,
  Users,
  ArrowRight,
  Activity,
  MapPin,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  XCircle,
  Mic,
  SkipForward,
  Volume2,
  Settings,
  Maximize2,
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
import { Queue, QueueTicket } from '@/modules/events/types/queue';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_QUEUES: Queue[] = [
  {
    id: '1',
    eventId: 'evt-1',
    name: 'Registration Desk A',
    zoneId: 'Main Hall',
    status: 'ACTIVE',
    type: 'STANDARD',
    maxLength: 200,
    currentLength: 45,
    averageProcessingTimeSeconds: 120,
    operators: ['user-1'],
  },
  {
    id: '2',
    eventId: 'evt-1',
    name: 'Priority Prayer Line',
    zoneId: 'Sanctuary East',
    status: 'ACTIVE',
    type: 'PRIORITY',
    maxLength: 50,
    currentLength: 12,
    averageProcessingTimeSeconds: 300,
    operators: ['user-2'],
  },
  {
    id: '3',
    eventId: 'evt-1',
    name: 'Medical Triage',
    zoneId: 'Tent 3',
    status: 'PAUSED',
    type: 'STANDARD',
    maxLength: 20,
    currentLength: 4,
    averageProcessingTimeSeconds: 600,
    operators: ['user-3'],
  },
];

const MOCK_TICKETS: QueueTicket[] = [
  {
    id: 't-1',
    queueId: '1',
    personId: 'p-1',
    personName: 'Sarah Jenkins',
    position: 1,
    status: 'WAITING',
    priority: false,
    groupSize: 1,
    joinedAt: new Date().toISOString(),
    notified: { nearTurn: true, called: false },
  },
  {
    id: 't-2',
    queueId: '1',
    personId: 'p-2',
    personName: 'Mike Ross',
    position: 2,
    status: 'WAITING',
    priority: false,
    groupSize: 3,
    joinedAt: new Date().toISOString(),
    notified: { nearTurn: true, called: false },
  },
  {
    id: 't-3',
    queueId: '1',
    personId: 'p-3',
    personName: 'Harvey Specter',
    position: 3,
    status: 'WAITING',
    priority: true,
    groupSize: 1,
    joinedAt: new Date().toISOString(),
    notified: { nearTurn: false, called: false },
  },
  {
    id: 't-4',
    queueId: '2',
    personId: 'p-4',
    personName: 'Louis Litt',
    position: 1,
    status: 'CALLED',
    priority: true,
    groupSize: 1,
    joinedAt: new Date().toISOString(),
    notified: { nearTurn: true, called: true },
  },
];

export const QueueManagerModule = () => {
  const [viewMode, setViewMode] = useState<'ADMIN' | 'OPERATOR' | 'KIOSK'>('ADMIN');
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);

  // Sub-components for cleaner file structure mockup
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
          <Button variant="outline" onClick={() => setViewMode('OPERATOR')}>
            Operator Mode
          </Button>
          <Button variant="outline" onClick={() => setViewMode('KIOSK')}>
            Kiosk Display
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="font-black text-[10px] uppercase tracking-widest rounded-xl">
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
                    placeholder="e.g. Registration Desk A"
                    className="rounded-xl bg-muted/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location / Zone</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Hall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Queue Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full font-black text-[10px] uppercase tracking-widest rounded-xl mt-4">
                  Create Queue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Wait Time', value: '14m', icon: Timer, color: 'text-primary' },
          { label: 'Current Flow', value: '120/min', icon: Activity, color: 'text-emerald-500' },
          { label: 'In Queue', value: '61', icon: Users, color: 'text-amber-500' },
          { label: 'Active Gates', value: '3', icon: MapPin, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 border border-primary/5 rounded-[24px] bg-white shadow-sm">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_QUEUES.map((queue, i) => (
          <Card
            key={i}
            className="p-6 rounded-[32px] border border-primary/5 bg-white shadow-xl shadow-primary/5 overflow-hidden relative group hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-muted/20">
              <div
                className={cn(
                  'h-full transition-all duration-1000',
                  queue.status === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : queue.status === 'PAUSED'
                      ? 'bg-amber-500'
                      : 'bg-gray-300'
                )}
                style={{ width: `${(queue.currentLength / queue.maxLength) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg">{queue.name}</h4>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {queue.zoneId}
                </p>
              </div>
              <Badge
                variant={queue.status === 'ACTIVE' ? 'default' : 'secondary'}
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
                  {queue.currentLength}
                  <span className="text-xs text-muted-foreground font-bold ml-1">
                    / {queue.maxLength}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-muted/20 rounded-2xl border border-primary/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">
                  Est. Wait
                </p>
                <p className="text-xl font-black text-primary">
                  {Math.round((queue.currentLength * queue.averageProcessingTimeSeconds) / 60)}
                  <span className="text-xs text-muted-foreground font-bold ml-1">min</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {queue.status === 'ACTIVE' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-9 text-[9px] uppercase font-black hover:bg-amber-50 hover:text-amber-600 border-primary/10"
                >
                  <Pause className="h-3 w-3 mr-2" /> Pause
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-9 text-[9px] uppercase font-black hover:bg-emerald-50 hover:text-emerald-600 border-primary/10"
                >
                  <Play className="h-3 w-3 mr-2" /> Resume
                </Button>
              )}
              <Button
                onClick={() => {
                  setSelectedQueue(queue);
                  setViewMode('OPERATOR');
                }}
                className="flex-1 rounded-xl h-9 text-[9px] uppercase font-black bg-primary text-white hover:bg-primary/90"
              >
                <Settings className="h-3 w-3 mr-2" /> Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const OperatorView = () => (
    <div className="h-[600px] flex overflow-hidden bg-muted/10 rounded-[40px] border border-primary/5 animate-in slide-in-from-right duration-500">
      {/* Queue List Sidebar (similar to Chat module approach for robustness) */}
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

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {MOCK_QUEUES.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedQueue(q)}
              className={cn(
                'p-4 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.02]',
                selectedQueue?.id === q.id
                  ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20'
                  : 'bg-white border-primary/5 hover:border-primary/20'
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold">{q.name}</h4>
                {q.type === 'PRIORITY' && (
                  <Badge className="bg-amber-400 text-black border-none text-[8px] h-4">VIP</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium opacity-80">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {q.currentLength}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" /> ~
                  {Math.round((q.currentLength * q.averageProcessingTimeSeconds) / 60)}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Controller */}
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
              <h1 className="text-6xl font-black font-serif text-primary">#34</h1>
              <p className="text-xl font-medium text-muted-foreground">
                John Doe <span className="text-sm opacity-50 ml-2">(Group of 3)</span>
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Checked In</Badge>
                <Badge className="bg-amber-500/10 text-amber-600 border-none">Priority</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button className="h-16 rounded-[24px] bg-white border border-primary/10 text-primary hover:bg-neutral-50 shadow-xl font-black text-xs uppercase tracking-widest flex flex-col gap-1 items-center justify-center">
                <Volume2 className="h-5 w-5" />
                Call Again
              </Button>
              <Button className="h-16 rounded-[24px] bg-white border border-primary/10 text-destructive hover:bg-destructive/5 shadow-xl font-black text-xs uppercase tracking-widest flex flex-col gap-1 items-center justify-center">
                <SkipForward className="h-5 w-5" />
                Skip / No Show
              </Button>
              <Button className="h-20 col-span-2 rounded-[32px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                <Mic className="h-5 w-5" />
                Call Next Ticket
              </Button>
            </div>

            {/* Recent History */}
            <div className="pt-8 border-t border-primary/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-4 text-center">
                Up Next
              </p>
              <div className="space-y-3">
                {MOCK_TICKETS.filter((t) => t.status === 'WAITING')
                  .slice(0, 3)
                  .map((t, i) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted font-black text-xs flex items-center justify-center text-muted-foreground">
                          #{t.position}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{t.personName}</p>
                          <p className="text-[10px] font-medium text-muted-foreground">
                            Wait: ~12m
                          </p>
                        </div>
                      </div>
                      {t.priority && <Activity className="h-4 w-4 text-amber-500" />}
                    </div>
                  ))}
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

  const KioskDisplay = () => (
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
            <h1 className="text-[12rem] leading-none font-black font-serif text-emerald-400">
              #34
            </h1>
            <h2 className="text-6xl font-bold tracking-tight">John Doe</h2>
            <p className="text-3xl text-white/60 font-medium">Please proceed to Counter 01</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-[48px] p-12 border border-white/10 backdrop-blur-sm">
          <h3 className="text-2xl font-black uppercase tracking-widest text-white/40 mb-8 border-b border-white/10 pb-4">
            Up Next
          </h3>
          <div className="space-y-6">
            {MOCK_TICKETS.filter((t) => t.status === 'WAITING')
              .slice(0, 4)
              .map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-black font-serif text-white/80">
                      #{t.position}
                    </span>
                    <div>
                      <p className="text-2xl font-bold">{t.personName}</p>
                      <div className="flex gap-3 text-sm font-medium text-white/40 mt-1">
                        <span>Est. wait: 12 min</span>
                        {t.priority && <span className="text-amber-400 font-bold">• Priority</span>}
                      </div>
                    </div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-center space-y-2">
        <p className="text-sm font-black uppercase tracking-[0.4em] text-white/30">
          Scan to join queue
        </p>
        <div className="h-32 w-32 bg-white rounded-2xl mx-auto flex items-center justify-center">
          <span className="text-black font-black text-xs">QR CODE</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[600px]">
      {viewMode === 'ADMIN' && <AdminView />}
      {viewMode === 'OPERATOR' && <OperatorView />}
      {viewMode === 'KIOSK' && <KioskDisplay />}
    </div>
  );
};
