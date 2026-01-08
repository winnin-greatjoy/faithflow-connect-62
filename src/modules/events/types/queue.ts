export type QueueStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type QueueType = 'STANDARD' | 'GROUP' | 'PRIORITY';
export type TicketStatus = 'WAITING' | 'CALLED' | 'MISSED' | 'COMPLETED';

export interface Queue {
  id: string;
  eventId: string;
  name: string;
  zoneId?: string; // Optional link to a physical zone
  status: QueueStatus;
  type: QueueType;
  maxLength: number;
  currentLength: number;
  averageProcessingTimeSeconds: number;
  description?: string;
  operatingHours?: string;
  operators: string[]; // List of user IDs (staff)
}

export interface QueueTicket {
  id: string;
  queueId: string;
  personId: string;
  personName: string; // Denormalized for display
  position: number;
  status: TicketStatus;
  priority: boolean;
  groupSize: number;
  joinedAt: string; // ISO timestamp
  estimatedWaitTime?: number; // In minutes
  notified: {
    nearTurn: boolean;
    called: boolean;
  };
}
