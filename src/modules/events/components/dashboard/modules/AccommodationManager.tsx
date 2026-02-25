import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Edit3,
  Hammer,
  Home,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuthz } from '@/hooks/useAuthz';
import {
  useAccommodationBookings,
  useAccommodationRooms,
  useCreateAccommodationBooking,
  useCreateAccommodationRoom,
  useDeleteAccommodationBooking,
  useDeleteAccommodationRoom,
  useUpdateAccommodationBooking,
  useUpdateAccommodationRoom,
} from '@/hooks/useEventModules';

type Tab = 'dashboard' | 'rooms' | 'bookings' | 'guests';
type NewBookingStatus = 'pending' | 'confirmed' | 'checked_in';

const UNASSIGNED_ROOM = '__unassigned__';

const normalize = (value?: string | null) => String(value || '').toUpperCase();
const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const badgeClass = (status?: string | null) => {
  switch (normalize(status)) {
    case 'CHECKED_IN':
    case 'CONFIRMED':
    case 'OCCUPIED':
      return 'bg-emerald-500 text-white';
    case 'PENDING':
    case 'RESERVED':
      return 'bg-amber-500 text-white';
    case 'CHECKED_OUT':
    case 'AVAILABLE':
      return 'bg-primary text-white';
    case 'CANCELLED':
    case 'MAINTENANCE':
      return 'bg-destructive text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const roomStatus = (room: {
  status: string | null;
  currentOccupancy: number;
  capacity: number;
}) => {
  if (normalize(room.status) === 'MAINTENANCE') return 'MAINTENANCE';
  if (normalize(room.status) === 'RESERVED') return 'RESERVED';
  if (room.currentOccupancy >= room.capacity) return 'OCCUPIED';
  return 'AVAILABLE';
};

export const AccommodationManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [roomSearch, setRoomSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [newBookingRoomId, setNewBookingRoomId] = useState<string>(UNASSIGNED_ROOM);
  const [newBookingStatus, setNewBookingStatus] = useState<NewBookingStatus>('confirmed');

  const { data: roomsData = [], isLoading: roomsLoading } = useAccommodationRooms(eventId || '');
  const { data: bookings = [], isLoading: bookingsLoading } = useAccommodationBookings(
    eventId || ''
  );
  const createRoom = useCreateAccommodationRoom(eventId || '');
  const updateRoom = useUpdateAccommodationRoom(eventId || '');
  const deleteRoom = useDeleteAccommodationRoom(eventId || '');
  const createBooking = useCreateAccommodationBooking(eventId || '');
  const updateBooking = useUpdateAccommodationBooking(eventId || '');
  const deleteBooking = useDeleteAccommodationBooking(eventId || '');

  const occupancyByRoom = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((booking) => {
      if (!booking.room_id) return;
      const status = normalize(booking.status);
      if (status === 'CONFIRMED' || status === 'CHECKED_IN') {
        map.set(booking.room_id, (map.get(booking.room_id) || 0) + 1);
      }
    });
    return map;
  }, [bookings]);

  const rooms = useMemo(
    () =>
      roomsData.map((room) => ({ ...room, currentOccupancy: occupancyByRoom.get(room.id) || 0 })),
    [occupancyByRoom, roomsData]
  );

  const editingRoom = useMemo(
    () => rooms.find((room) => room.id === editingRoomId) || null,
    [rooms, editingRoomId]
  );

  const editingBooking = useMemo(
    () => bookings.find((booking) => booking.id === editingBookingId) || null,
    [bookings, editingBookingId]
  );

  const buildings = useMemo(
    () =>
      Array.from(new Set(rooms.map((room) => room.building).filter(Boolean) as string[])).sort(),
    [rooms]
  );

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const status = roomStatus(room).toLowerCase();
        const query = roomSearch.toLowerCase();
        const matchesQuery =
          room.room_number.toLowerCase().includes(query) ||
          (room.building || '').toLowerCase().includes(query) ||
          (room.room_type || '').toLowerCase().includes(query);
        const matchesStatus = roomFilter === 'all' || status === roomFilter;
        const matchesBuilding = buildingFilter === 'all' || room.building === buildingFilter;
        return matchesQuery && matchesStatus && matchesBuilding;
      }),
    [rooms, roomSearch, roomFilter, buildingFilter]
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const query = bookingSearch.toLowerCase();
        const guest = (booking.member?.full_name || booking.guest_name || '').toLowerCase();
        const room = (booking.room?.room_number || '').toLowerCase();
        const status = normalize(booking.status).toLowerCase();
        return guest.includes(query) || room.includes(query) || status.includes(query);
      }),
    [bookings, bookingSearch]
  );

  const guests = useMemo(() => {
    const byGuest = new Map<
      string,
      { id: string; name: string; stays: number; lastStay: string; contact: string }
    >();

    bookings.forEach((booking) => {
      const id = booking.member?.id || booking.guest_name || booking.id;
      const name = booking.member?.full_name || booking.guest_name || 'Guest';
      const contact = booking.member?.email || booking.member?.phone || 'No contact';
      const current = byGuest.get(id);

      if (!current) {
        byGuest.set(id, { id, name, stays: 1, lastStay: booking.check_out_date, contact });
        return;
      }

      byGuest.set(id, {
        ...current,
        stays: current.stays + 1,
        lastStay:
          booking.check_out_date > current.lastStay ? booking.check_out_date : current.lastStay,
      });
    });

    return Array.from(byGuest.values())
      .filter((guest) => guest.name.toLowerCase().includes(guestSearch.toLowerCase()))
      .sort((a, b) => b.stays - a.stays);
  }, [bookings, guestSearch]);

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupied = rooms.reduce(
    (sum, room) => sum + Math.min(room.currentOccupancy, room.capacity),
    0
  );
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const pendingCheckIn = bookings.filter((booking) =>
    ['PENDING', 'CONFIRMED'].includes(normalize(booking.status))
  ).length;
  const maintenance = rooms.filter((room) => normalize(room.status) === 'MAINTENANCE').length;
  const activeBookings = bookings.filter((booking) =>
    ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(normalize(booking.status))
  ).length;

  const byBuilding = useMemo(() => {
    const map = new Map<string, { capacity: number; occupied: number }>();
    rooms.forEach((room) => {
      const key = room.building || 'Unassigned';
      const current = map.get(key) || { capacity: 0, occupied: 0 };
      map.set(key, {
        capacity: current.capacity + room.capacity,
        occupied: current.occupied + room.currentOccupancy,
      });
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, ...value }));
  }, [rooms]);

  const isRoomMutating = createRoom.isPending || updateRoom.isPending || deleteRoom.isPending;
  const isBookingMutating =
    createBooking.isPending || updateBooking.isPending || deleteBooking.isPending;
  const canManageAccommodation = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const canDeleteAccommodation = useMemo(
    () => hasRole('super_admin', 'admin') || can('events', 'delete'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageAccommodation;

  const ensureCanManage = (action: string) => {
    if (actionsDisabled) {
      toast.error(`You do not have permission to ${action}.`);
      return false;
    }
    return true;
  };

  const openNewRoomDialog = () => {
    if (!ensureCanManage('manage accommodation')) return;
    setEditingRoomId(null);
    setRoomDialogOpen(true);
  };

  const openEditRoomDialog = (roomId: string) => {
    if (!ensureCanManage('edit rooms')) return;
    setEditingRoomId(roomId);
    setRoomDialogOpen(true);
  };

  const openNewBookingDialog = () => {
    if (!ensureCanManage('create bookings')) return;
    setEditingBookingId(null);
    setNewBookingRoomId(UNASSIGNED_ROOM);
    setNewBookingStatus('confirmed');
    setBookingDialogOpen(true);
  };

  const openEditBookingDialog = (booking: (typeof bookings)[number]) => {
    if (!ensureCanManage('edit bookings')) return;
    setEditingBookingId(booking.id);
    setNewBookingRoomId(booking.room_id || UNASSIGNED_ROOM);
    const bookingStatus = normalize(booking.status).toLowerCase();
    if (
      bookingStatus === 'pending' ||
      bookingStatus === 'confirmed' ||
      bookingStatus === 'checked_in'
    ) {
      setNewBookingStatus(bookingStatus as NewBookingStatus);
    } else {
      setNewBookingStatus('confirmed');
    }
    setBookingDialogOpen(true);
  };

  const submitRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ensureCanManage(editingRoomId ? 'update rooms' : 'create rooms')) return;
    if (!eventId) return;
    const formData = new FormData(event.currentTarget);
    const amenities = String(formData.get('amenities') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const roomPayload = {
      room_number: String(formData.get('room_number') || ''),
      building: String(formData.get('building') || '') || null,
      floor: Number(formData.get('floor') || 0) || null,
      room_type: String(formData.get('room_type') || '') || null,
      capacity: Number(formData.get('capacity') || 1),
      status: String(formData.get('status') || 'available'),
      amenities,
      notes: String(formData.get('notes') || '') || null,
    };

    if (editingRoomId) {
      await updateRoom.mutateAsync({
        roomId: editingRoomId,
        updates: roomPayload,
      });
    } else {
      await createRoom.mutateAsync({
        event_id: eventId,
        ...roomPayload,
      });
    }

    setRoomDialogOpen(false);
    setEditingRoomId(null);
    event.currentTarget.reset();
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ensureCanManage(editingBookingId ? 'update bookings' : 'create bookings')) return;
    if (!eventId) {
      toast.error('Missing event context for booking');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const selectedRoomId = newBookingRoomId === UNASSIGNED_ROOM ? null : newBookingRoomId;
    const bookingPayload = {
      room_id: selectedRoomId,
      guest_name: String(formData.get('guest_name') || '') || null,
      check_in_date: String(formData.get('check_in_date') || ''),
      check_out_date: String(formData.get('check_out_date') || ''),
      status: newBookingStatus,
      special_requests: String(formData.get('special_requests') || '') || null,
    };

    if (editingBookingId) {
      await updateBooking.mutateAsync({
        bookingId: editingBookingId,
        updates: bookingPayload,
      });
    } else {
      await createBooking.mutateAsync({
        event_id: eventId,
        ...bookingPayload,
      });
    }

    setBookingDialogOpen(false);
    setEditingBookingId(null);
    setNewBookingRoomId(UNASSIGNED_ROOM);
    setNewBookingStatus('confirmed');
    event.currentTarget.reset();
  };

  const setBookingStatus = async (bookingId: string, status: 'checked_in' | 'checked_out') => {
    if (!ensureCanManage('update booking status')) return;
    await updateBooking.mutateAsync({ bookingId, updates: { status } });
  };

  const assignFirstAvailableRoom = async (bookingId: string) => {
    if (!ensureCanManage('assign rooms')) return;
    const availableRoom = rooms.find(
      (room) => normalize(room.status) !== 'MAINTENANCE' && room.currentOccupancy < room.capacity
    );
    if (!availableRoom) {
      toast.error('No available room for assignment');
      return;
    }

    await updateBooking.mutateAsync({
      bookingId,
      updates: { room_id: availableRoom.id, status: 'confirmed' },
    });
    toast.success(`Assigned room ${availableRoom.room_number}`);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!canDeleteAccommodation || authzLoading) {
      toast.error('You do not have permission to delete rooms.');
      return;
    }
    if (!window.confirm('Delete this room? This cannot be undone.')) return;
    await deleteRoom.mutateAsync(roomId);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!canDeleteAccommodation || authzLoading) {
      toast.error('You do not have permission to delete bookings.');
      return;
    }
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    await deleteBooking.mutateAsync(bookingId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Accommodation
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Manage Housing & Hospitality
          </p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {(['dashboard', 'rooms', 'bookings', 'guests'] as Tab[]).map((tab) => (
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

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Occupancy', value: `${occupancyRate}%`, icon: Home },
              { label: 'Active Bookings', value: String(activeBookings), icon: Calendar },
              { label: 'Pending Check-In', value: String(pendingCheckIn), icon: LogIn },
              { label: 'Maintenance', value: String(maintenance), icon: Hammer },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="p-4 rounded-[24px] border border-primary/5 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-black">{stat.value}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-6 rounded-[24px] border border-primary/5 bg-white space-y-4">
            <h4 className="font-serif font-black text-lg">By Building</h4>
            {byBuilding.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rooms yet.</p>
            ) : (
              byBuilding.map((building) => (
                <div key={building.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{building.name}</span>
                    <span>
                      {building.occupied} / {building.capacity}
                    </span>
                  </div>
                  <Progress
                    value={
                      building.capacity > 0 ? (building.occupied / building.capacity) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              placeholder="Search rooms..."
            />
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building} value={building}>
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openNewRoomDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
            <Dialog
              open={roomDialogOpen}
              onOpenChange={(open) => {
                setRoomDialogOpen(open);
                if (!open) setEditingRoomId(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRoomId ? 'Edit Room' : 'Add Room'}</DialogTitle>
                </DialogHeader>
                <form key={editingRoomId || 'new-room'} onSubmit={submitRoom} className="space-y-3">
                  <Label>Room Number</Label>
                  <Input
                    name="room_number"
                    required
                    defaultValue={editingRoom?.room_number || ''}
                  />
                  <Label>Building</Label>
                  <Input name="building" required defaultValue={editingRoom?.building || ''} />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      name="floor"
                      type="number"
                      placeholder="Floor"
                      defaultValue={editingRoom?.floor ?? ''}
                    />
                    <Input
                      name="room_type"
                      placeholder="Type"
                      defaultValue={editingRoom?.room_type || ''}
                    />
                    <Input
                      name="capacity"
                      type="number"
                      min="1"
                      defaultValue={editingRoom?.capacity ?? 1}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="status"
                      placeholder="available"
                      defaultValue={editingRoom?.status || 'available'}
                    />
                    <Input
                      name="amenities"
                      placeholder="WiFi, AC"
                      defaultValue={(editingRoom?.amenities || []).join(', ')}
                    />
                  </div>
                  <Input name="notes" placeholder="Notes" defaultValue={editingRoom?.notes || ''} />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isRoomMutating || actionsDisabled}
                  >
                    {isRoomMutating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {editingRoomId ? 'Update Room' : 'Save Room'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {roomsLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className="p-4 rounded-[20px] border border-primary/5 bg-white space-y-2"
                >
                  <div className="flex justify-between">
                    <h4 className="font-black">{room.room_number}</h4>
                    <Badge className={cn('border-none text-[10px]', badgeClass(roomStatus(room)))}>
                      {roomStatus(room)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {room.building || 'Unassigned'} | {room.room_type || 'standard'}
                  </p>
                  <p className="text-xs font-bold">
                    {room.currentOccupancy}/{room.capacity} occupied
                  </p>
                  <div className="flex items-center justify-end gap-1 pt-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEditRoomDialog(room.id)}
                      disabled={isRoomMutating || actionsDisabled}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRoom(room.id)}
                      disabled={isRoomMutating || !canDeleteAccommodation || authzLoading}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search bookings..."
              />
            </div>
            <Button onClick={openNewBookingDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
            <Dialog
              open={bookingDialogOpen}
              onOpenChange={(open) => {
                setBookingDialogOpen(open);
                if (!open) {
                  setEditingBookingId(null);
                  setNewBookingRoomId(UNASSIGNED_ROOM);
                  setNewBookingStatus('confirmed');
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBookingId ? 'Edit Booking' : 'Create Booking'}</DialogTitle>
                </DialogHeader>
                <form
                  key={editingBookingId || 'new-booking'}
                  onSubmit={submitBooking}
                  className="space-y-3"
                >
                  <Label>Guest Name</Label>
                  <Input
                    name="guest_name"
                    required
                    defaultValue={
                      editingBooking?.guest_name || editingBooking?.member?.full_name || ''
                    }
                  />
                  <Label>Room</Label>
                  <Select value={newBookingRoomId} onValueChange={setNewBookingRoomId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign room now (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED_ROOM}>Unassigned</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.room_number} - {room.building || 'Unassigned'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="check_in_date"
                      type="date"
                      required
                      defaultValue={
                        editingBooking ? String(editingBooking.check_in_date).slice(0, 10) : ''
                      }
                    />
                    <Input
                      name="check_out_date"
                      type="date"
                      required
                      defaultValue={
                        editingBooking ? String(editingBooking.check_out_date).slice(0, 10) : ''
                      }
                    />
                  </div>
                  <Label>Status</Label>
                  <Select
                    value={newBookingStatus}
                    onValueChange={(value) => setNewBookingStatus(value as NewBookingStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    name="special_requests"
                    placeholder="Special requests"
                    defaultValue={editingBooking?.special_requests || ''}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isBookingMutating || actionsDisabled}
                  >
                    {isBookingMutating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {editingBookingId ? 'Update Booking' : 'Save Booking'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-[24px] border border-primary/5 bg-white overflow-x-auto">
            {bookingsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left text-[10px] uppercase tracking-widest">
                    <th className="p-4">Guest</th>
                    <th className="p-4">Room</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const status = normalize(booking.status);
                    return (
                      <tr key={booking.id} className="border-t">
                        <td className="p-4 font-semibold">
                          {booking.member?.full_name || booking.guest_name || 'Guest'}
                        </td>
                        <td className="p-4">{booking.room?.room_number || 'Unassigned'}</td>
                        <td className="p-4 text-xs">
                          {fmtDate(booking.check_in_date)} - {fmtDate(booking.check_out_date)}
                        </td>
                        <td className="p-4">
                          <Badge className={cn('border-none text-[10px]', badgeClass(status))}>
                            {status || 'UNKNOWN'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {!booking.room_id && ['PENDING', 'CONFIRMED'].includes(status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => assignFirstAvailableRoom(booking.id)}
                                disabled={isBookingMutating || actionsDisabled}
                              >
                                Assign Room
                              </Button>
                            )}
                            {booking.room_id &&
                              (status === 'PENDING' || status === 'CONFIRMED') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setBookingStatus(booking.id, 'checked_in')}
                                  disabled={isBookingMutating || actionsDisabled}
                                >
                                  <LogIn className="h-3.5 w-3.5 mr-1" />
                                  Check In
                                </Button>
                              )}
                            {status === 'CHECKED_IN' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setBookingStatus(booking.id, 'checked_out')}
                                disabled={isBookingMutating || actionsDisabled}
                              >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                Check Out
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditBookingDialog(booking)}
                              disabled={isBookingMutating || actionsDisabled}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={
                                isBookingMutating || !canDeleteAccommodation || authzLoading
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              placeholder="Search guests..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guests.length === 0 ? (
              <Card className="p-8 border border-dashed text-center text-muted-foreground md:col-span-2 lg:col-span-3">
                No guest activity yet.
              </Card>
            ) : (
              guests.map((guest) => (
                <Card
                  key={guest.id}
                  className="p-5 rounded-[20px] border border-primary/5 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">{guest.name}</h4>
                    <Badge variant="secondary">{guest.stays} stays</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{guest.contact}</p>
                  <p className="text-xs font-semibold mt-3">Last stay: {fmtDate(guest.lastStay)}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {!eventId && (
        <Card className="p-6 border border-destructive/20 bg-destructive/5 text-destructive text-sm">
          Missing event context. Open this module from an event dashboard route.
        </Card>
      )}
    </div>
  );
};
