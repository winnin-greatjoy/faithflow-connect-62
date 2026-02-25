-- Migration: Event scope support for room bookings
-- Adds event_id to room_bookings so unassigned bookings can still be event-scoped.

ALTER TABLE room_bookings
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Backfill event_id from linked room records for existing rows.
UPDATE room_bookings rb
SET event_id = r.event_id
FROM rooms r
WHERE rb.room_id = r.id
  AND rb.event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_room_bookings_event_id ON room_bookings(event_id);

-- Keep event_id synced from room_id when room is present and event_id is omitted.
CREATE OR REPLACE FUNCTION set_room_booking_event_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_id IS NULL AND NEW.room_id IS NOT NULL THEN
    SELECT event_id
      INTO NEW.event_id
    FROM rooms
    WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_room_booking_event_id ON room_bookings;

CREATE TRIGGER trg_set_room_booking_event_id
BEFORE INSERT OR UPDATE OF room_id, event_id
ON room_bookings
FOR EACH ROW
EXECUTE FUNCTION set_room_booking_event_id();
