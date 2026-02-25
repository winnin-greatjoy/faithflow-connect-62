-- Migration: Accommodation RLS policies
-- Ensures authenticated users can operate rooms and room_bookings under current app model.

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read rooms" ON rooms;
CREATE POLICY "Authenticated users can read rooms"
ON rooms
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON rooms;
CREATE POLICY "Authenticated users can insert rooms"
ON rooms
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update rooms" ON rooms;
CREATE POLICY "Authenticated users can update rooms"
ON rooms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete rooms" ON rooms;
CREATE POLICY "Authenticated users can delete rooms"
ON rooms
FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read room_bookings" ON room_bookings;
CREATE POLICY "Authenticated users can read room_bookings"
ON room_bookings
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert room_bookings" ON room_bookings;
CREATE POLICY "Authenticated users can insert room_bookings"
ON room_bookings
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update room_bookings" ON room_bookings;
CREATE POLICY "Authenticated users can update room_bookings"
ON room_bookings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete room_bookings" ON room_bookings;
CREATE POLICY "Authenticated users can delete room_bookings"
ON room_bookings
FOR DELETE
TO authenticated
USING (true);
