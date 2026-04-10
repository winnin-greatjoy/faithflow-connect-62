-- Professional Dispatch Upgrades (v5)

-- 1. Add notes to responders
ALTER TABLE event_incident_responders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create Incident Activity Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS event_incident_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES event_incidents(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- reported, dispatched, arrived, resolved, note_added, etc.
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_incident_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to view logs"
    ON event_incident_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow system to insert logs"
    ON event_incident_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Add Real-Time Support for logs
ALTER PUBLICATION supabase_realtime ADD TABLE event_incident_logs;

-- 4. Function to auto-log status changes (Optional but professional)
-- We will handle logging from the API layer for simplicity in this turn, 
-- but these tables provide the storage.
