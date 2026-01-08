export type RoomType = 'SINGLE' | 'DOUBLE' | 'DORM' | 'FAMILY' | 'VIP';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED' | 'CLEANING';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'SPONSORED';

export interface Room {
  id: string;
  building: string;
  floor: string;
  number: string;
  type: RoomType;
  capacity: number;
  currentOccupancy: number;
  status: RoomStatus;
  amenities: string[];
  pricePerNight: number;
  notes?: string;
}

export interface GuestProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type: 'MEMBER' | 'PASTOR' | 'VISITOR' | 'MISSIONARY';
  homeBranch?: string;
  specialNeeds?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  guestId: string;
  guestName: string; // Denormalized for display
  roomId?: string; // Assigned room
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}
