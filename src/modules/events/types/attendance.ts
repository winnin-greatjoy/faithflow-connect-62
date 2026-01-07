export type AttendanceRole = 'ATTENDEE' | 'STAFF' | 'CHILD' | 'MEDICAL' | 'VISITOR';
export type CheckInMethod = 'QR' | 'NFC' | 'MANUAL' | 'BIOMETRIC';
export type AttendanceStatus = 'ACTIVE' | 'CHECKED_OUT' | 'LATE' | 'RE-ENTRY';

export interface AttendanceRecord {
    id: string;
    eventId: string;
    personId: string;
    fullName: string;
    role: AttendanceRole;
    checkInMethod: CheckInMethod;
    zoneId?: string;
    sessionId?: string;
    checkInTime: string;
    checkOutTime?: string;
    status: AttendanceStatus;
    deviceId?: string;
    operatorId?: string;
    metadata?: {
        late?: boolean;
        reentry?: boolean;
        temperature?: string;
        notes?: string;
    };
}

export interface Zone {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    currentOccupancy: number;
    type: 'SANCTUARY' | 'HALL' | 'ROOM' | 'OUTDOOR' | 'CLINIC';
    tags?: string[];
}

export interface AttendanceSession {
    id: string;
    eventId: string;
    title: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    type: 'SERVICE' | 'WORKSHOP' | 'BREAKOUT' | 'GENERAL';
}
