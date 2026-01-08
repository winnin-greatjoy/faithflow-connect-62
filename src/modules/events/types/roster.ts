export type ShiftStatus = 'pending' | 'confirmed' | 'completed' | 'urgent';
export type StaffRole = 'Security' | 'Usher' | 'Medical' | 'Technical' | 'Greeter' | 'Parking';

export interface StaffProfile {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  availability: string[]; // e.g., ["Morning", "Evening"]
  status: 'active' | 'inactive';
}

export interface Shift {
  id: string;
  eventId: string;
  role: StaffRole;
  name: string; // e.g., "Main Entrance Security"
  startTime: string;
  endTime: string;
  requiredCount: number;
  assignedIds: string[]; // IDs of assigned staff
  location: string;
  status: ShiftStatus;
}
