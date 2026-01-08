export type PrayerStatus = 'open' | 'prayed_for' | 'testimony_shared' | 'archived';
export type PrayerCategory =
  | 'healing'
  | 'provision'
  | 'guidance'
  | 'salvation'
  | 'family'
  | 'other';

export interface PrayerRequest {
  id: string;
  requestorName: string; // "Anonymous" allowed
  category: PrayerCategory;
  content: string;
  timestamp: string;
  status: PrayerStatus;
  prayedCount: number;
  isPrivate: boolean;
}

export interface Milestone {
  id: string;
  name: string; // e.g., "Believer's Foundation Class"
  description: string;
  targetCount: number;
  currentCount: number;
  stage: 'new_believer' | 'convert' | 'member' | 'worker' | 'leader';
}

export type PathwayStage =
  | 'guest'
  | 'convert'
  | 'member'
  | 'water_baptized'
  | 'holy_spirit_baptized'
  | 'workforce';
