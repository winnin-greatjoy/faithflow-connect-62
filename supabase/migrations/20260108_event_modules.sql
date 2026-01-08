-- Migration: Event Modules Backend Integration
-- Description: Create tables for event management modules (Attendance, Roster, Worship, Assets, etc.)
-- Run this in Supabase SQL Editor or via CLI

-- ============================================
-- TIER 1: Core Operational Tables
-- ============================================

-- Event Zones (for attendance tracking)
CREATE TABLE IF NOT EXISTS event_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  zone_type TEXT CHECK (zone_type IN ('main_hall', 'overflow', 'outdoor', 'children', 'vip', 'other')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event Attendance Records
CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  zone_id UUID REFERENCES event_zones(id),
  status TEXT CHECK (status IN ('checked_in', 'active', 'checked_out')) DEFAULT 'checked_in',
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event Shifts (for roster/volunteer management)
CREATE TABLE IF NOT EXISTS event_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  department TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_volunteers INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shift Assignments (volunteers assigned to shifts)
CREATE TABLE IF NOT EXISTS event_shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES event_shifts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  status TEXT CHECK (status IN ('confirmed', 'pending', 'declined')) DEFAULT 'pending',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(shift_id, member_id)
);

-- ============================================
-- TIER 2: Logistics & Program Tables
-- ============================================

-- Songs Library (branch-level, shared across events)
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES church_branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  original_key TEXT,
  bpm INTEGER,
  duration TEXT,
  tags TEXT[],
  theme TEXT,
  lyrics TEXT,
  chord_chart_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service Items (setlist for an event)
CREATE TABLE IF NOT EXISTS service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id),
  item_type TEXT CHECK (item_type IN ('song', 'prayer', 'sermon', 'announcement', 'offering', 'other')) NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  start_time TEXT,
  item_order INTEGER NOT NULL,
  assigned_to TEXT,
  key_override TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Worship Team Members (per event)
CREATE TABLE IF NOT EXISTS worship_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  role TEXT NOT NULL,
  instrument TEXT,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, member_id, role)
);

-- Assets Inventory (branch-level)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES church_branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('audio', 'visual', 'lighting', 'furniture', 'instruments', 'other')) NOT NULL,
  serial_number TEXT,
  status TEXT CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')) DEFAULT 'available',
  location TEXT,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Asset Checkouts
CREATE TABLE IF NOT EXISTS asset_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  checked_out_to UUID REFERENCES members(id),
  checked_out_by UUID REFERENCES profiles(id),
  checked_out_at TIMESTAMPTZ DEFAULT now(),
  expected_return TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  return_condition TEXT,
  notes TEXT
);

-- Maintenance Tickets
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id),
  issue_description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Queue Management
CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'closed')) DEFAULT 'active',
  max_capacity INTEGER,
  avg_service_time INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queue_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  member_id UUID REFERENCES members(id),
  guest_name TEXT,
  priority TEXT CHECK (priority IN ('normal', 'priority', 'vip')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'no_show')) DEFAULT 'waiting',
  joined_at TIMESTAMPTZ DEFAULT now(),
  called_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Accommodation/Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  building TEXT,
  room_number TEXT NOT NULL,
  room_type TEXT CHECK (room_type IN ('single', 'double', 'dormitory', 'suite', 'accessible')),
  capacity INTEGER NOT NULL,
  amenities TEXT[],
  status TEXT CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')) DEFAULT 'available',
  floor INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  guest_name TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out')) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TIER 3: Support Module Tables
-- ============================================

-- Healthcare Incidents
CREATE TABLE IF NOT EXISTS healthcare_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  incident_type TEXT CHECK (incident_type IN ('medical', 'injury', 'allergy', 'emergency', 'other')) NOT NULL,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')) NOT NULL,
  affected_person_id UUID REFERENCES members(id),
  affected_person_name TEXT,
  description TEXT NOT NULL,
  location TEXT,
  treatment_given TEXT,
  outcome TEXT,
  reported_by UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('open', 'treating', 'resolved', 'referred')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- First Aid Posts
CREATE TABLE IF NOT EXISTS first_aid_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  staff_count INTEGER DEFAULT 0,
  supplies_status TEXT CHECK (supplies_status IN ('full', 'low', 'empty')) DEFAULT 'full',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safeguarding Clearances
CREATE TABLE IF NOT EXISTS safeguarding_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  clearance_type TEXT NOT NULL, -- e.g., 'DBS', 'Reference', 'Training'
  status TEXT CHECK (status IN ('valid', 'pending', 'expired', 'rejected')) DEFAULT 'pending',
  issued_date DATE,
  expiry_date DATE,
  certificate_number TEXT,
  verified_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Child Check-ins
CREATE TABLE IF NOT EXISTS child_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  guardian_id UUID REFERENCES members(id),
  guardian_name TEXT,
  pickup_code TEXT NOT NULL,
  allergies TEXT[],
  special_needs TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  checked_out_by UUID REFERENCES profiles(id),
  notes TEXT
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE event_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE first_aid_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_checkins ENABLE ROW LEVEL SECURITY;

-- Basic read policies (authenticated users can read)
CREATE POLICY "Authenticated users can read event_zones" ON event_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read event_attendance" ON event_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read event_shifts" ON event_shifts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read songs" ON songs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read assets" ON assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read queues" ON queues FOR SELECT TO authenticated USING (true);

-- Insert/Update policies (for now, allow authenticated users - can be refined with roles later)
CREATE POLICY "Authenticated users can insert event_zones" ON event_zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update event_zones" ON event_zones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert event_attendance" ON event_attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update event_attendance" ON event_attendance FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert event_shifts" ON event_shifts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update event_shifts" ON event_shifts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert songs" ON songs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update songs" ON songs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert assets" ON assets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update assets" ON assets FOR UPDATE TO authenticated USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_member ON event_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_event_shifts_event ON event_shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_songs_branch ON songs(branch_id);
CREATE INDEX IF NOT EXISTS idx_assets_branch ON assets(branch_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_queue ON queue_tickets(queue_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON queue_tickets(status);
