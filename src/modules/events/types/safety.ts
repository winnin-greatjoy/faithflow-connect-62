export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType =
  | 'medical'
  | 'security'
  | 'lost_child'
  | 'facility'
  | 'injury'
  | 'fire'
  | 'other';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface IncidentReport {
  id: string;
  eventId: string;
  reportedBy: string; // User ID
  timestamp: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  description: string;
  affectedPerson?: string; // Name or ID
  actionTaken?: string;
  status: IncidentStatus;
  assignedTo?: string; // Staff ID
}

export type ClearanceStatus = 'cleared' | 'pending' | 'expired' | 'rejected' | 'none';

export interface ClearanceRecord {
  id: string;
  userId: string;
  userName: string;
  checkType: 'DBS' | 'Reference' | 'Training';
  issueDate: string;
  expiryDate?: string;
  status: ClearanceStatus;
  documentUrl?: string;
}

export interface ChildCheckIn {
  id: string;
  childName: string;
  age: number;
  parentName: string;
  parentPhone: string;
  pickupCode: string; // 4-digit security code
  allergies?: string[];
  specialNeeds?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked_in' | 'checked_out';
  location: string; // e.g. "Creche", "Kids Hall"
}
