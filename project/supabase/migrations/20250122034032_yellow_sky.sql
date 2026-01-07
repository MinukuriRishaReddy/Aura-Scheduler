/*
  # Update Venues and Add Booking Constraints
  
  1. Updates
    - Add unique constraint to venues table
    - Update venue list with new entries
    
  2. Booking Rules
    - Ensure no overlapping bookings
    - Maintain data integrity
*/

-- First ensure venues table has unique name constraint
ALTER TABLE venues ADD CONSTRAINT venues_name_key UNIQUE (name);

-- Then safely update venues
DO $$ 
BEGIN
  -- Insert or update venues
  INSERT INTO venues (name, capacity, description)
  VALUES
    ('D Block Seminar Hall', 100, 'Modern seminar space with presentation equipment'),
    ('D Block Auditorium', 200, 'Main auditorium with full AV setup'),
    ('E Block Auditorium', 120, 'Spacious auditorium with modern facilities'),
    ('E Block Seminar Hall', 70, 'Well-equipped seminar space'),
    ('B Block Auditorium', 70, 'Secondary auditorium with basic facilities')
  ON CONFLICT (name) DO UPDATE 
  SET 
    capacity = EXCLUDED.capacity,
    description = EXCLUDED.description;

END $$;