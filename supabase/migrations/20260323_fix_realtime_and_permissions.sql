-- 1. Add event_incidents to Realtime publication
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'event_incidents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE event_incidents;
    END IF;
END $$;

-- 2. Change reporter_id to reference profiles instead of members
-- (Profiles table contains all users, including admins/staff who might report)
ALTER TABLE event_incidents DROP CONSTRAINT IF EXISTS event_incidents_reporter_id_fkey;
ALTER TABLE event_incidents 
    ADD CONSTRAINT event_incidents_reporter_id_fkey 
    FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Ensure RLS is correct for joined queries
CREATE POLICY "Allow members and profiles to be viewed by authenticated users"
    ON members FOR SELECT
    TO authenticated
    USING (true);

-- Profiles already usually has this, but let's be safe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON profiles
            FOR SELECT USING (true);
    END IF;
END $$;
