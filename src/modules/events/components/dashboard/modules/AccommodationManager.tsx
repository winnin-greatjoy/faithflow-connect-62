import React, { useState } from 'react';
import {
  Bed,
  Home,
  Users,
  CheckCircle2,
  MoreHorizontal,
  Search,
  Plus,
  Calendar,
  Filter,
  ArrowRight,
  MapPin,
  CreditCard,
  Hammer,
  LogOut,
  LogIn,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Room,
  Booking,
  GuestProfile,
  BookingStatus,
  RoomStatus,
  RoomType,
  PaymentStatus,
} from '@/modules/events/types/accommodation';

// Mock Data
const MOCK_ROOMS: Room[] = [
  {
    id: 'r1',
    building: 'Zion Hall',
    floor: '1',
    number: '101',
    type: 'SINGLE',
    capacity: 1,
    currentOccupancy: 1,
    status: 'OCCUPIED',
    amenities: ['WiFi', 'AC'],
    pricePerNight: 50,
  },
  {
    id: 'r2',
    building: 'Zion Hall',
    floor: '1',
    number: '102',
    type: 'DOUBLE',
    capacity: 2,
    currentOccupancy: 0,
    status: 'AVAILABLE',
    amenities: ['WiFi', 'AC'],
    pricePerNight: 80,
  },
  {
    id: 'r3',
    building: 'Eden Suite',
    floor: '2',
    number: '205',
    type: 'VIP',
    capacity: 1,
    currentOccupancy: 1,
    status: 'OCCUPIED',
    amenities: ['WiFi', 'AC', 'TV', 'Fridge'],
    pricePerNight: 150,
  },
  {
    id: 'r4',
    building: 'Faith Dorm',
    floor: 'G',
    number: 'G01',
    type: 'DORM',
    capacity: 10,
    currentOccupancy: 8,
    status: 'AVAILABLE',
    amenities: ['Fan'],
    pricePerNight: 20,
  },
  {
    id: 'r5',
    building: 'Zion Hall',
    floor: '1',
    number: '103',
    type: 'SINGLE',
    capacity: 1,
    currentOccupancy: 0,
    status: 'MAINTENANCE',
    amenities: ['WiFi'],
    pricePerNight: 50,
  },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    eventId: '1',
    guestId: 'g1',
    guestName: 'Pastor Michael King',
    roomId: 'r3',
    roomNumber: '205',
    checkInDate: '2025-02-15',
    checkOutDate: '2025-02-20',
    status: 'CHECKED_IN',
    paymentStatus: 'SPONSORED',
    totalAmount: 750,
    paidAmount: 0,
  },
  {
    id: 'b2',
    eventId: '1',
    guestId: 'g2',
    guestName: 'Sarah Connor',
    roomId: 'r1',
    roomNumber: '101',
    checkInDate: '2025-02-16',
    checkOutDate: '2025-02-18',
    status: 'CHECKED_IN',
    paymentStatus: 'PAID',
    totalAmount: 100,
    paidAmount: 100,
  },
  {
    id: 'b3',
    eventId: '1',
    guestId: 'g3',
    guestName: 'John Doe',
    roomId: 'r4',
    roomNumber: 'G01',
    checkInDate: '2025-02-17',
    checkOutDate: '2025-02-22',
    status: 'CONFIRMED',
    paymentStatus: 'PARTIAL',
    totalAmount: 100,
    paidAmount: 50,
  },
];

export const AccommodationManagerModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: BookingStatus | RoomStatus) => {
    switch (status) {
      case 'CHECKED_IN':
      case 'CONFIRMED':
      case 'OCCUPIED':
        return 'bg-emerald-500 text-white';
      case 'PENDING':
      case 'RESERVED':
        return 'bg-amber-500 text-white';
      case 'CANCELLED':
      case 'MAINTENANCE':
        return 'bg-destructive text-white';
      case 'AVAILABLE':
        return 'bg-primary text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Occupancy Rate',
            value: '72%',
            sub: '145/200 Beds',
            icon: Home,
            color: 'text-primary',
          },
          {
            label: 'Revenue',
            value: '$12,450',
            sub: 'Event to Date',
            icon: CreditCard,
            color: 'text-emerald-500',
          },
          {
            label: 'Pending Check-In',
            value: '14',
            sub: 'Today',
            icon: LogIn,
            color: 'text-amber-500',
          },
          {
            label: 'Maintenance',
            value: '3',
            sub: 'Rooms Unavailable',
            icon: Hammer,
            color: 'text-destructive',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-4 border border-primary/5 rounded-[24px] bg-white shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                  {stat.label}
                </p>
                <h3 className="text-xl font-black">{stat.value}</h3>
                <p className="text-[10px] font-medium text-muted-foreground">{stat.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-white rounded-[32px] border border-primary/5 shadow-xl shadow-primary/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-black">Hostel Inventory</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 text-left">
                  Real-time occupancy
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { name: 'Zion Hall (Male)', capacity: 200, used: 156, color: 'bg-primary' },
              { name: 'Eden Suite (Female)', capacity: 150, used: 142, color: 'bg-emerald-500' },
              { name: 'VIP Residency', capacity: 20, used: 8, color: 'bg-amber-500' },
            ].map((hostel, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-foreground">{hostel.name}</span>
                  <span className="text-[10px] font-black tracking-widest text-muted-foreground">
                    {hostel.used} / {hostel.capacity}{' '}
                    <span className="opacity-40">
                      ({Math.round((hostel.used / hostel.capacity) * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress
                  value={(hostel.used / hostel.capacity) * 100}
                  className={`h-2 ${hostel.color}/10`}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 border-none rounded-[32px] text-white shadow-2xl shadow-primary/20">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">
              Quick Allocation
            </h5>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-xl font-serif font-black">45 Members</h4>
                <p className="text-xs opacity-80">Awaiting room assignment</p>
              </div>
            </div>
            <Button className="w-full bg-white text-primary hover:bg-white/90 font-black h-12 rounded-xl text-[10px] uppercase tracking-widest shadow-lg">
              Auto-Assign Rooms
            </Button>
          </Card>

          <Card className="flex-1 p-6 bg-white border border-primary/5 rounded-[32px] shadow-lg shadow-primary/5 overflow-hidden">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-4">
              Urgent Actions
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-destructive/5 border border-destructive/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive">Room 304 AC Fault</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[9px] border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                >
                  Assign
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-600">Overflow in Dorm B</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[9px] border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white"
                >
                  Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const RoomsView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-primary/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-9 bg-muted/30 border-none rounded-xl"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] rounded-xl bg-muted/30 border-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] rounded-xl bg-muted/30 border-none">
            <SelectValue placeholder="Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            <SelectItem value="zion">Zion Hall</SelectItem>
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest">
              <Plus className="h-4 w-4 mr-2" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              Form mocked.
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MOCK_ROOMS.map((room) => (
          <Card
            key={room.id}
            className="group p-4 rounded-[24px] border border-primary/5 bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-serif font-black text-lg">{room.number}</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {room.building}
                </p>
              </div>
              <Badge
                className={cn(
                  'rounded-lg px-2 text-[9px] font-black uppercase tracking-widest border-none',
                  getStatusColor(room.status)
                )}
              >
                {room.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Type</span>
                <span className="font-bold capitalize">{room.type}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-bold">
                  {room.currentOccupancy} / {room.capacity}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {room.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-[8px] font-bold bg-muted px-2 py-1 rounded-md text-muted-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Hover Action */}
            <div className="absolute inset-0 bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <Button
                variant="secondary"
                className="rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const BookingsView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[32px] border border-primary/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex items-center justify-between">
          <h3 className="font-serif font-black text-xl">Reservations</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              Export List
            </Button>
            <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest">
              <Plus className="h-4 w-4 mr-2" /> New Booking
            </Button>
          </div>
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="p-4 pl-6">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {MOCK_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-primary">{booking.guestName}</div>
                    <div className="text-[10px] text-muted-foreground">ID: {booking.guestId}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">
                      {booking.roomId ? `Room ${booking.roomNumber}` : 'Unassigned'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs">
                      <span className="font-bold">
                        {new Date(booking.checkInDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>{' '}
                      -{' '}
                      <span>
                        {new Date(booking.checkOutDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={cn(
                        'rounded-lg px-2 text-[9px] font-black uppercase tracking-widest border-none',
                        getStatusColor(booking.status)
                      )}
                    >
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-lg px-2 text-[9px] font-black uppercase tracking-widest bg-transparent',
                        booking.paymentStatus === 'PAID'
                          ? 'text-emerald-600 border-emerald-200'
                          : 'text-amber-600 border-amber-200'
                      )}
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-primary/10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const GuestsView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-primary/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-9 bg-muted/30 border-none rounded-xl"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] rounded-xl bg-muted/30 border-none">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pastor">Pastor</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Ps. Michael King',
            type: 'Pastor',
            branch: 'Main Branch',
            stays: 12,
            lastStay: 'Feb 15, 2025',
          },
          {
            name: 'Sarah Connor',
            type: 'Visitor',
            branch: 'North District',
            stays: 1,
            lastStay: 'Feb 16, 2025',
          },
          {
            name: 'John Doe',
            type: 'Member',
            branch: ' Youth Wing',
            stays: 4,
            lastStay: 'Jan 20, 2025',
          },
          {
            name: 'Jane Smith',
            type: 'Missionary',
            branch: 'Overseas',
            stays: 8,
            lastStay: 'Dec 12, 2024',
          },
        ].map((guest, i) => (
          <Card
            key={i}
            className="p-6 rounded-[24px] border border-primary/5 bg-white shadow-sm flex items-start gap-4"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-serif font-black text-primary text-xl">
              {guest.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{guest.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-black tracking-widest h-5 px-1.5"
                    >
                      {guest.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {guest.branch}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-primary/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    Total Stays
                  </p>
                  <p className="font-black text-lg">{guest.stays}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    Last Visit
                  </p>
                  <p className="font-bold text-sm">{guest.lastStay}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

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
          {['dashboard', 'rooms', 'bookings', 'guests'].map((tab) => (
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
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'rooms' && <RoomsView />}
        {activeTab === 'bookings' && <BookingsView />}
        {activeTab === 'guests' && <GuestsView />}
      </div>
    </div>
  );
};
