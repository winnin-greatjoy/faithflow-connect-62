-- Expansion of Emergency Response System (v2)

-- 1. Update Incident Types Enum (Using safe alter)
DO $$ BEGIN
    ALTER TYPE incident_type ADD VALUE 'fire';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE incident_type ADD VALUE 'crowd_control';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Skills to Profiles (Enabling smart dispatch)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- 3. Create Responders tracking table
CREATE TABLE IF NOT EXISTS event_incident_responders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES event_incidents(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned', -- assigned, en_route, arrived, completed
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    en_route_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(incident_id, staff_id)
);

-- Enable RLS
ALTER TABLE event_incident_responders ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Responders
CREATE POLICY "Allow authenticated users to view responders"
    ON event_incident_responders FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow managers or the responder themselves to update status"
    ON event_incident_responders FOR ALL
    TO authenticated
    USING (
        auth.uid() = staff_id OR 
        EXISTS (
            SELECT 1 FROM event_incidents i
            JOIN events e ON i.event_id = e.id
            WHERE i.id = incident_id
            AND (e.created_by = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'staff', 'super_admin'))
        )
    );

-- 5. Add Real-Time Support
ALTER PUBLICATION supabase_realtime ADD TABLE event_incident_responders;

-- 6. Add manual location selector zones to event metadata (Optional placeholder)
-- We use the existing zones from attendance logic.
