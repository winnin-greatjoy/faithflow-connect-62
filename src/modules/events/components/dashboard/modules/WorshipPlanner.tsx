import React, { useState } from 'react';
import {
  Music2,
  ListMusic,
  Users,
  Clock,
  FileText,
  ChevronRight,
  Play,
  Search,
  Plus,
  MoreHorizontal,
  Mic2,
  Guitar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Song, ServiceItem, WorshipTeamMember, Key } from '@/modules/events/types/worship';

// Mock Data
const MOCK_SONGS: Song[] = [
  {
    id: 's1',
    title: 'Way Maker',
    artist: 'Sinach',
    originalKey: 'E',
    bpm: 68,
    duration: '5:45',
    tags: ['Worship', 'Miracles'],
    theme: 'Adoration',
  },
  {
    id: 's2',
    title: 'Goodness of God',
    artist: 'Bethel Music',
    originalKey: 'Ab',
    bpm: 63,
    duration: '4:55',
    tags: ['Thanksgiving', 'Faithfulness'],
    theme: 'Gratitude',
  },
  {
    id: 's3',
    title: 'Praise',
    artist: 'Elevation Worship',
    originalKey: 'Eb',
    bpm: 128,
    duration: '4:05',
    tags: ['Praise', 'High Energy'],
    theme: 'Celebration',
  },
  {
    id: 's4',
    title: 'Jireh',
    artist: 'Maverick City',
    originalKey: 'Gb',
    bpm: 70,
    duration: '8:30',
    tags: ['Provision', 'Identity'],
    theme: 'Trust',
  },
];

const MOCK_SETLIST: ServiceItem[] = [
  {
    id: 'i1',
    eventId: 'e1',
    type: 'prayer',
    title: 'Opening Prayer',
    duration: '05:00',
    startTime: '09:00',
    assignedTo: 'Pastor Mark',
  },
  {
    id: 'i2',
    eventId: 'e1',
    type: 'song',
    title: 'Praise',
    songId: 's3',
    key: 'Eb',
    duration: '05:00',
    startTime: '09:05',
    assignedTo: 'Choir',
  },
  {
    id: 'i3',
    eventId: 'e1',
    type: 'song',
    title: 'Way Maker',
    songId: 's1',
    key: 'E',
    duration: '06:00',
    startTime: '09:10',
    assignedTo: 'Worship Team',
  },
  {
    id: 'i4',
    eventId: 'e1',
    type: 'announcement',
    title: 'Weekly Updates',
    duration: '05:00',
    startTime: '09:16',
    assignedTo: 'Secretary',
  },
  {
    id: 'i5',
    eventId: 'e1',
    type: 'sermon',
    title: 'The Power of Faith',
    duration: '40:00',
    startTime: '09:21',
    assignedTo: 'Rev. Johnson',
  },
];

const MOCK_TEAM: WorshipTeamMember[] = [
  { id: 't1', name: 'Sarah Jones', role: 'Vocal', status: 'confirmed' },
  { id: 't2', name: 'Mike Smith', role: 'Instrument', instrument: 'Keys', status: 'confirmed' },
  { id: 't3', name: 'David Wilson', role: 'Instrument', instrument: 'Drums', status: 'pending' },
  { id: 't4', name: 'Emily Brown', role: 'Vocal', status: 'declined' },
];

export const WorshipPlannerModule = () => {
  const [activeTab, setActiveTab] = useState('setlist');

  /* Live Mode State */
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  /* Setlist State */
  const [setlist, setSetlist] = useState<ServiceItem[]>(MOCK_SETLIST);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

  const handleSaveItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const itemData = {
      type: formData.get('type') as any,
      title: formData.get('title') as string,
      duration: formData.get('duration') as string,
      startTime: formData.get('startTime') as string,
      assignedTo: formData.get('assignedTo') as string,
    };

    if (editingItem) {
      setSetlist(
        setlist.map((item) => (item.id === editingItem.id ? { ...item, ...itemData } : item))
      );
      toast.success('Item updated');
    } else {
      const newItem: ServiceItem = {
        id: `i${Date.now()}`,
        eventId: 'e1',
        ...itemData,
      };
      setSetlist([...setlist, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      toast.success('Item added to setlist');
    }

    setIsItemDialogOpen(false);
    setEditingItem(null);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const openEditDialog = (item: ServiceItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  /* Live Mode Overlay */
  const LiveModeOverlay = () => {
    if (!isLiveMode) return null;
    const currentItem = setlist[activeItemIndex];
    const nextItem = setlist[activeItemIndex + 1];

    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col animate-in fade-in duration-300">
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-black tracking-widest uppercase">LIVE SERVICE</span>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setIsLiveMode(false)}
          >
            Exit Mode
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-4 text-purple-400 font-bold uppercase tracking-widest text-xl">
            {currentItem?.type || 'End of Service'}
          </div>
          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-tight">
            {currentItem?.title || 'Service Concluded'}
          </h1>
          <div className="text-2xl text-white/60 mb-12 flex items-center gap-4">
            <Clock className="h-8 w-8" /> {currentItem?.duration} • {currentItem?.assignedTo}
          </div>

          <div className="flex gap-6">
            <Button
              size="lg"
              variant="outline"
              className="h-20 px-8 text-xl border-white/20 hover:bg-white/10 bg-transparent text-white rounded-2xl"
              disabled={activeItemIndex === 0}
              onClick={() => setActiveItemIndex(Math.max(0, activeItemIndex - 1))}
            >
              <ChevronRight className="h-8 w-8 rotate-180 mr-2" /> Previous
            </Button>
            <Button
              size="lg"
              className="h-20 px-12 text-xl bg-white text-black hover:bg-white/90 rounded-2xl font-black"
              onClick={() => {
                if (activeItemIndex < setlist.length - 1) {
                  setActiveItemIndex(activeItemIndex + 1);
                } else {
                  setIsLiveMode(false);
                }
              }}
            >
              {activeItemIndex < setlist.length - 1 ? 'Next Item' : 'Finish Service'}{' '}
              <ChevronRight className="h-8 w-8 ml-2" />
            </Button>
          </div>
        </div>

        <div className="p-8 bg-white/5 border-t border-white/10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-white/40 font-bold uppercase tracking-wider">Up Next</span>
            <div className="text-xl font-bold">
              {nextItem
                ? `${nextItem.startTime} • ${nextItem.title} (${nextItem.assignedTo})`
                : 'End of List'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SetlistView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <LiveModeOverlay />
      <Card className="lg:col-span-2 p-8 bg-white rounded-[32px] border border-primary/5 shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xl font-serif font-black">Sunday Service</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Jan 26, 2025 • 09:00 AM
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={cn(
                'h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest',
                isLiveMode && 'bg-red-50 text-red-600 border-red-100'
              )}
              onClick={() => setIsLiveMode(true)}
            >
              <Play className="h-3 w-3 mr-2" /> {isLiveMode ? 'Resume Live' : 'Start Mode'}
            </Button>

            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={openAddDialog}
                  className="bg-primary text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest"
                >
                  <Plus className="h-3 w-3 mr-2" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveItem} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input
                      name="title"
                      required
                      defaultValue={editingItem?.title}
                      placeholder="e.g. Welcome"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <select
                        name="type"
                        defaultValue={editingItem?.type || 'song'}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="song">Song</option>
                        <option value="prayer">Prayer</option>
                        <option value="sermon">Sermon</option>
                        <option value="announcement">Announcement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Assigned To</Label>
                      <Input
                        name="assignedTo"
                        defaultValue={editingItem?.assignedTo}
                        placeholder="e.g. Pastor Mark"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Time</Label>
                      <Input
                        name="startTime"
                        type="time"
                        required
                        defaultValue={editingItem?.startTime || '09:00'}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration</Label>
                      <Input
                        name="duration"
                        defaultValue={editingItem?.duration}
                        placeholder="05:00"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          {setlist.map((item, i) => (
            <div
              key={item.id}
              onClick={() => openEditDialog(item)}
              className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-primary/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative"
            >
              <div className="flex flex-col items-center min-w-[3rem]">
                <div className="text-xs font-black text-primary">{item.startTime}</div>
                <div className="h-full w-px bg-primary/10 my-1 group-last:hidden"></div>
              </div>

              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                {item.type === 'song' ? (
                  <Music2 className="h-5 w-5" />
                ) : item.type === 'sermon' ? (
                  <Mic2 className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1">
                <h5 className="text-sm font-black text-foreground">{item.title}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="h-5 text-[9px] font-bold uppercase tracking-widest border-primary/10 text-muted-foreground px-2"
                  >
                    {item.type}
                  </Badge>
                  {item.key && (
                    <Badge
                      variant="secondary"
                      className="h-5 text-[9px] font-bold border-none px-2 bg-primary/5 text-primary"
                    >
                      Key: {item.key}
                    </Badge>
                  )}
                  <span className="text-[10px] font-medium text-muted-foreground ml-2">
                    {item.assignedTo}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <Badge variant="outline" className="h-6 text-[9px] font-black border-primary/10">
                  {item.duration}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-all hover:text-destructive absolute right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSetlist(setlist.filter((i) => i.id !== item.id));
                  toast.success('Item removed');
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-primary/5 flex justify-between items-center text-xs font-bold text-muted-foreground">
          <span>Total Items: {setlist.length}</span>
          <span>End Time: {setlist.length > 0 ? '11:30 AM' : '--:--'}</span>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-8 bg-primary rounded-[32px] text-white border-none shadow-2xl shadow-primary/20 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3')] bg-cover bg-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/90 group-hover:bg-primary/80 transition-all" />
          <div className="relative z-10">
            <Music2 className="h-8 w-8 mb-4 opacity-80" />
            <h4 className="text-lg font-serif font-black mb-2">Chord Charts</h4>
            <p className="text-xs font-medium opacity-80 mb-6">
              Access lyrics, chords, and technical sheets for today's setlist.
            </p>
            <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-none">
              Open Reader
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-[32px] border border-primary/5 shadow-xl shadow-primary/5">
          <h5 className="font-serif font-black mb-4">Setlist Notes</h5>
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs font-medium text-amber-900 leading-relaxed">
            "Transition from 'Way Maker' to 'Sermon' needs a soft pad fade. Please ensure
            microphones are swapped during the announcement."
          </div>
        </Card>
      </div>
    </div>
  );

  /* State Management */
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [songSearch, setSongSearch] = useState('');
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);

  /* Handlers */
  const handleAddSong = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newSong: Song = {
      id: `s${Date.now()}`,
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      originalKey: formData.get('key') as Key,
      bpm: parseInt(formData.get('bpm') as string) || 0,
      duration: formData.get('duration') as string,
      tags: (formData.get('tags') as string).split(',').map((t) => t.trim()),
      theme: formData.get('theme') as string,
    };
    setSongs([newSong, ...songs]);
    setIsAddSongOpen(false);
    toast.success('Song added to library');
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  const SongsView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-primary/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs by title, artist, or theme..."
            className="pl-9 bg-muted/30 border-none rounded-xl"
            value={songSearch}
            onChange={(e) => setSongSearch(e.target.value)}
          />
        </div>

        <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest">
              <Plus className="h-4 w-4 mr-2" /> Add Song
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Song</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSong} className="space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Way Maker" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Artist</Label>
                  <Input name="artist" required placeholder="e.g. Sinach" />
                </div>
                <div className="grid gap-2">
                  <Label>Theme</Label>
                  <Input name="theme" placeholder="e.g. Worship" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Key</Label>
                  <Input name="key" required placeholder="E" />
                </div>
                <div className="grid gap-2">
                  <Label>BPM</Label>
                  <Input name="bpm" type="number" placeholder="68" />
                </div>
                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Input name="duration" placeholder="5:45" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tags (comma separated)</Label>
                <Input name="tags" placeholder="Worship, Slow, Anthem" />
              </div>
              <Button type="submit" className="w-full">
                Save Song
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSongs.map((song) => (
          <Card
            key={song.id}
            className="p-6 rounded-[24px] border border-primary/5 bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg">{song.title}</h4>
                <p className="text-xs text-muted-foreground">{song.artist}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-black text-primary">
                {song.originalKey}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>BPM: {song.bpm}</span>
                <span>{song.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {song.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[8px] h-5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-lg text-[9px] font-black uppercase tracking-widest h-8"
              >
                Preview
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 rounded-lg text-[9px] font-black uppercase tracking-widest h-8"
              >
                Add to Set
              </Button>
            </div>
          </Card>
        ))}
        {filteredSongs.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Music2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No songs found matching "{songSearch}"</p>
          </div>
        )}
      </div>
    </div>
  );

  /* Team State */
  const [team, setTeam] = useState<WorshipTeamMember[]>(MOCK_TEAM);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newMember: WorshipTeamMember = {
      id: `t${Date.now()}`,
      name: formData.get('name') as string,
      role: formData.get('role') as 'Vocal' | 'Instrument' | 'AV',
      instrument: formData.get('instrument') as string,
      status: 'pending',
    };
    setTeam([...team, newMember]);
    setIsAddMemberOpen(false);
    toast.success('Member added to schedule');
  };

  const cycleStatus = (id: string) => {
    setTeam(
      team.map((m) => {
        if (m.id !== id) return m;
        const nextStatus =
          m.status === 'confirmed' ? 'declined' : m.status === 'pending' ? 'confirmed' : 'pending';
        return { ...m, status: nextStatus };
      })
    );
  };

  const TeamView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-4 bg-muted/20 border border-dashed border-primary/20 flex items-center justify-center">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-primary hover:bg-white hover:shadow-sm transition-all"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input name="name" required placeholder="Search member..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <select
                      name="role"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Vocal">Vocal</option>
                      <option value="Instrument">Instrument</option>
                      <option value="AV">AV/Tech</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Instrument (Optional)</Label>
                    <Input name="instrument" placeholder="e.g. Drums" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Assign Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </Card>

        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-white border border-primary/5 rounded-[24px] shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                {member.name.charAt(0)}
              </div>
              <div>
                <h5 className="font-bold">{member.name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-black uppercase tracking-widest border-none px-2 h-5"
                  >
                    {member.role}
                  </Badge>
                  {member.instrument && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Guitar className="h-3 w-3" /> {member.instrument}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                onClick={() => cycleStatus(member.id)}
                className={cn(
                  'h-6 px-3 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity select-none',
                  member.status === 'confirmed'
                    ? 'bg-emerald-500'
                    : member.status === 'declined'
                      ? 'bg-destructive'
                      : 'bg-amber-500'
                )}
              >
                {member.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTeam(team.filter((t) => t.id !== member.id));
                  toast.success('Member removed');
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Card className="p-6 bg-white rounded-[32px] border border-primary/5 shadow-xl">
        <h5 className="font-serif font-black mb-4">Team Composition</h5>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground">Vocals</span>
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(team.filter((m) => m.role === 'Vocal').length / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black">
              {team.filter((m) => m.role === 'Vocal').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground">Band</span>
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(team.filter((m) => m.role === 'Instrument').length / 5) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-black">
              {team.filter((m) => m.role === 'Instrument').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground">AV/Tech</span>
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-destructive transition-all duration-500"
                style={{ width: `${(team.filter((m) => m.role === 'AV').length / 3) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black text-destructive">
              {team.filter((m) => m.role === 'AV').length}
            </span>
          </div>
        </div>

        <Button
          className="w-full mt-6 rounded-xl font-black text-[10px] uppercase tracking-widest"
          onClick={() =>
            toast.success('Callout Sent', { description: 'Notifications sent to pending members' })
          }
        >
          Send Callout
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Worship Planner
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Service & Liturgy Management
          </p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {['setlist', 'songs', 'team'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'setlist' && <SetlistView />}
        {activeTab === 'songs' && <SongsView />}
        {activeTab === 'team' && <TeamView />}
      </div>
    </div>
  );
};

// Utility for conditional class names if imports are missing in shell
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
