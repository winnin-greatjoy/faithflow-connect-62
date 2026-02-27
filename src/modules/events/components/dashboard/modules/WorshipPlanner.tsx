import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Plus, Search, Trash2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';
import {
  useAddServiceItem,
  useCreateSong,
  useDeleteServiceItem,
  useDeleteSong,
  useSetlist,
  useSongs,
  useUpdateServiceItem,
} from '@/hooks/useEventModules';
import type {
  ServiceItem as ServiceItemRecord,
  Song as SongRecord,
} from '@/services/eventModulesApi';
import type { WorshipTeamMember } from '@/modules/events/types/worship';

const ITEM_TYPES = ['song', 'prayer', 'sermon', 'announcement', 'offering', 'other'];
const KEY_OPTIONS = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'Db',
  'Ab',
  'Eb',
  'Bb',
  'F',
  'Gb',
  'C#',
  'Cb',
];
const MOCK_TEAM: WorshipTeamMember[] = [
  { id: '1', name: 'Sarah Jones', role: 'Vocal', status: 'confirmed' },
  { id: '2', name: 'Mike Smith', role: 'Instrument', instrument: 'Keys', status: 'pending' },
];

const fmt = (v: string | null) => (v && /^\d{2}:\d{2}/.test(v) ? v.slice(0, 5) : v || '--:--');

export const WorshipPlannerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { selectedBranchId, loading: branchLoading } = useAdminContext();
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const canManage = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const canDelete = useMemo(
    () => hasRole('super_admin', 'admin') || can('events', 'delete'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManage;

  const [tab, setTab] = useState<'setlist' | 'songs' | 'team'>('setlist');
  const [itemOpen, setItemOpen] = useState(false);
  const [songOpen, setSongOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItemRecord | null>(null);
  const [itemType, setItemType] = useState('song');
  const [songSearch, setSongSearch] = useState('');
  const [team, setTeam] = useState<WorshipTeamMember[]>(MOCK_TEAM);

  const { data: setlistData = [], isLoading: setlistLoading } = useSetlist(eventId || '');
  const { data: songsData = [], isLoading: songsLoading } = useSongs(selectedBranchId || '');
  const addItem = useAddServiceItem(eventId || '');
  const updateItem = useUpdateServiceItem(eventId || '');
  const deleteItem = useDeleteServiceItem(eventId || '');
  const createSong = useCreateSong(selectedBranchId || '');
  const deleteSong = useDeleteSong(selectedBranchId || '');

  const setlist = useMemo(
    () =>
      [...((setlistData || []) as ServiceItemRecord[])].sort(
        (a, b) => (a.item_order || 0) - (b.item_order || 0)
      ),
    [setlistData]
  );
  const songs = useMemo(() => (songsData || []) as SongRecord[], [songsData]);
  const filteredSongs = useMemo(() => {
    const q = songSearch.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) =>
      [s.title || '', s.artist || '', s.theme || '', ...(s.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [songSearch, songs]);
  const nextOrder = useMemo(
    () => (setlist.length ? Math.max(...setlist.map((s) => s.item_order || 0)) + 1 : 0),
    [setlist]
  );

  const openNewItem = () => {
    if (actionsDisabled) return toast.error('You do not have permission to manage setlist items.');
    setEditingItem(null);
    setItemType('song');
    setItemOpen(true);
  };

  const saveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (actionsDisabled) return toast.error('You do not have permission to manage setlist items.');
    if (!eventId) return;
    const f = new FormData(e.currentTarget);
    const selectedSongId = String(f.get('songId') || '').trim();
    const selectedSong = songs.find((s) => s.id === selectedSongId);
    const titleInput = String(f.get('title') || '').trim();
    const title = itemType === 'song' ? titleInput || selectedSong?.title || '' : titleInput;
    if (!title) return toast.error('Title is required.');
    const payload: Omit<ServiceItemRecord, 'id' | 'created_at'> = {
      event_id: eventId,
      song_id: itemType === 'song' ? selectedSongId || null : null,
      item_type: itemType,
      title,
      duration: String(f.get('duration') || '').trim() || null,
      start_time: String(f.get('startTime') || '').trim() || null,
      item_order: editingItem?.item_order ?? nextOrder,
      assigned_to: String(f.get('assignedTo') || '').trim() || null,
      key_override: String(f.get('keyOverride') || '').trim() || null,
      notes: String(f.get('notes') || '').trim() || null,
    };
    if (editingItem) await updateItem.mutateAsync({ itemId: editingItem.id, updates: payload });
    else await addItem.mutateAsync(payload);
    setItemOpen(false);
    setEditingItem(null);
  };

  const addSongToSet = async (song: SongRecord) => {
    if (actionsDisabled) return toast.error('You do not have permission to manage setlist items.');
    if (!eventId) return;
    await addItem.mutateAsync({
      event_id: eventId,
      song_id: song.id,
      item_type: 'song',
      title: song.title,
      duration: song.duration || null,
      start_time: null,
      item_order: nextOrder,
      assigned_to: null,
      key_override: song.original_key || null,
      notes: null,
    });
  };

  if (!eventId)
    return (
      <div className="min-h-[500px] flex items-center justify-center text-muted-foreground">
        Invalid event context.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
          Worship Planner
        </h2>
        <div className="flex gap-2">
          <Button
            variant={tab === 'setlist' ? 'default' : 'outline'}
            onClick={() => setTab('setlist')}
          >
            Setlist
          </Button>
          <Button variant={tab === 'songs' ? 'default' : 'outline'} onClick={() => setTab('songs')}>
            Songs
          </Button>
          <Button variant={tab === 'team' ? 'default' : 'outline'} onClick={() => setTab('team')}>
            Team
          </Button>
        </div>
      </div>

      {tab === 'setlist' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black">Service Setlist</h4>
            <Dialog open={itemOpen} onOpenChange={setItemOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewItem} disabled={actionsDisabled}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Setlist Item' : 'Add Setlist Item'}
                  </DialogTitle>
                  <DialogDescription>
                    Define type, timing, owner, and optional song link.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={saveItem} className="space-y-3">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input name="title" required defaultValue={editingItem?.title || ''} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <select
                        name="type"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        {ITEM_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Assigned To</Label>
                      <Input name="assignedTo" defaultValue={editingItem?.assigned_to || ''} />
                    </div>
                  </div>
                  {itemType === 'song' && (
                    <div className="grid gap-2">
                      <Label>Song (optional)</Label>
                      <select
                        name="songId"
                        defaultValue={editingItem?.song_id || ''}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="">Select song</option>
                        {songs.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Start Time</Label>
                      <Input
                        name="startTime"
                        defaultValue={editingItem?.start_time || ''}
                        placeholder="09:00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration</Label>
                      <Input
                        name="duration"
                        defaultValue={editingItem?.duration || ''}
                        placeholder="05:00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Key</Label>
                      <Input name="keyOverride" defaultValue={editingItem?.key_override || ''} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Notes</Label>
                      <Input name="notes" defaultValue={editingItem?.notes || ''} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {setlistLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : setlist.length === 0 ? (
            <div className="text-sm text-muted-foreground">No items yet.</div>
          ) : (
            <div className="space-y-2">
              {setlist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-primary/10 p-3"
                >
                  <Badge variant="outline">{fmt(item.start_time)}</Badge>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      if (actionsDisabled)
                        return toast.error('You do not have permission to manage setlist items.');
                      setEditingItem(item);
                      setItemType(item.item_type || 'song');
                      setItemOpen(true);
                    }}
                  >
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.item_type} - {item.assigned_to || 'Unassigned'} -{' '}
                      {item.duration || '--:--'}
                    </div>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (!window.confirm(`Remove "${item.title}" from setlist?`)) return;
                        await deleteItem.mutateAsync(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'songs' && (
        <Card className="p-6 space-y-4">
          {branchLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !selectedBranchId ? (
            <div className="text-sm text-muted-foreground">Select a branch to manage songs.</div>
          ) : (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={songSearch}
                    onChange={(e) => setSongSearch(e.target.value)}
                    placeholder="Search songs..."
                  />
                </div>
                <Dialog open={songOpen} onOpenChange={setSongOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={actionsDisabled}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Song
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Song</DialogTitle>
                      <DialogDescription>Add this song to the branch library.</DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (actionsDisabled)
                          return toast.error('You do not have permission to create songs.');
                        const f = new FormData(e.currentTarget);
                        const title = String(f.get('title') || '').trim();
                        if (!title) return toast.error('Song title is required.');
                        const tags = String(f.get('tags') || '')
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean);
                        await createSong.mutateAsync({
                          branch_id: selectedBranchId,
                          title,
                          artist: String(f.get('artist') || '').trim() || null,
                          original_key: String(f.get('key') || '').trim() || null,
                          bpm: String(f.get('bpm') || '').trim()
                            ? Number(String(f.get('bpm') || '').trim())
                            : null,
                          duration: String(f.get('duration') || '').trim() || null,
                          tags: tags.length ? tags : null,
                          theme: String(f.get('theme') || '').trim() || null,
                          lyrics: null,
                          chord_chart_url: null,
                        });
                        setSongOpen(false);
                      }}
                      className="space-y-3"
                    >
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input name="title" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Artist</Label>
                          <Input name="artist" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Theme</Label>
                          <Input name="theme" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-2">
                          <Label>Key</Label>
                          <select
                            name="key"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                          >
                            <option value="">Select</option>
                            {KEY_OPTIONS.map((k) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label>BPM</Label>
                          <Input name="bpm" type="number" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Duration</Label>
                          <Input name="duration" placeholder="5:45" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Tags</Label>
                        <Input name="tags" placeholder="Worship, Anthem" />
                      </div>
                      <Button type="submit" className="w-full">
                        Save Song
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {songsLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="text-sm text-muted-foreground">No songs found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="rounded-xl border border-primary/10 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{song.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {song.artist || 'Unknown artist'}
                          </div>
                        </div>
                        <Badge variant="secondary">{song.original_key || '--'}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        BPM {song.bpm ?? '--'} - {song.duration || '--:--'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => void addSongToSet(song)}
                          disabled={actionsDisabled}
                        >
                          Add to Set
                        </Button>
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              if (!window.confirm(`Delete "${song.title}" from song library?`))
                                return;
                              await deleteSong.mutateAsync(song.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {tab === 'team' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black flex items-center gap-2">
              <Users className="h-4 w-4" />
              Worship Team (Local)
            </h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>This list is currently local in the UI.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const name = String(f.get('name') || '').trim();
                    if (!name) return;
                    const role = String(f.get('role') || 'Vocal') as WorshipTeamMember['role'];
                    const instrument = String(f.get('instrument') || '').trim();
                    setTeam((prev) => [
                      ...prev,
                      {
                        id: `${Date.now()}`,
                        name,
                        role,
                        instrument: instrument || undefined,
                        status: 'pending',
                      },
                    ]);
                  }}
                  className="space-y-3"
                >
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input name="name" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <select
                        name="role"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="Vocal">Vocal</option>
                        <option value="Instrument">Instrument</option>
                        <option value="AV">AV/Tech</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Instrument</Label>
                      <Input name="instrument" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Save
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {team.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-primary/10 p-3"
              >
                <div>
                  <div className="font-semibold text-sm">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.role}
                    {m.instrument ? ` - ${m.instrument}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{m.status}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTeam((prev) => prev.filter((x) => x.id !== m.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
