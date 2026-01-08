export type Key =
  | 'C'
  | 'G'
  | 'D'
  | 'A'
  | 'E'
  | 'B'
  | 'F#'
  | 'Db'
  | 'Ab'
  | 'Eb'
  | 'Bb'
  | 'F'
  | 'Gb'
  | 'C#'
  | 'Cb';
export type ServiceItemType = 'song' | 'sermon' | 'prayer' | 'media' | 'announcement';

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: Key;
  bpm: number;
  duration: string; // e.g. "5:30"
  tags: string[];
  theme: string;
}

export interface ServiceItem {
  id: string;
  eventId: string;
  type: ServiceItemType;
  title: string;
  duration: string; // "MM:SS"
  startTime?: string; // Calculated
  assignedTo?: string; // Person/Team Name
  notes?: string;
  songId?: string; // Link to song if type is song
  key?: Key; // Performance key
}

export interface WorshipTeamMember {
  id: string;
  name: string;
  role: 'Vocal' | 'Instrument' | 'AV';
  instrument?: string;
  status: 'confirmed' | 'pending' | 'declined';
}
