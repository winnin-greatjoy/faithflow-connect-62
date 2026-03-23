-- Create Enums
DO $$ BEGIN
    CREATE TYPE incident_type AS ENUM ('medical', 'security', 'maintenance', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('open', 'dispatched', 'resolved', 'false_alarm');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Table
CREATE TABLE IF NOT EXISTS event_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES members(id) ON DELETE SET NULL,
    type incident_type NOT NULL DEFAULT 'other',
    severity incident_severity NOT NULL DEFAULT 'low',
    status incident_status NOT NULL DEFAULT 'open',
    location_details TEXT,
    description TEXT,
    assigned_to UUID[] DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_incidents ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone authenticated can report an incident
CREATE POLICY "Authenticated users can create incidents"
    ON event_incidents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 2. Anyone authenticated can view incidents (Simplified for Dispatch Dashboard access)
CREATE POLICY "Authenticated users can view incidents"
    ON event_incidents FOR SELECT
    TO authenticated
    USING (true);

-- 3. Authenticated users can update incidents (Simplified for Staff assigning themselves)
CREATE POLICY "Authenticated users can update incidents"
    ON event_incidents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
