/*
  # Initial Schema Setup

  1. Tables
    - users: Store user information
    - venues: Store venue information
    - events: Store event bookings
    - bookings: Store booking status
  
  2. Security
    - Enable RLS on all tables
    - Add basic security policies
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  venue_id uuid REFERENCES venues(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  registration_link TEXT,
  host_id uuid REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id uuid REFERENCES venues(id),
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Enable read access for all users"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for events"
  ON events FOR SELECT
  USING (true);

-- Insert initial venues
INSERT INTO venues (name, capacity, description) VALUES
  ('D Block Seminar Hall', 150, 'Modern seminar space with presentation equipment'),
  ('D Block Auditorium', 500, 'Main auditorium with full AV setup'),
  ('E Block Auditorium', 400, 'Spacious auditorium with modern facilities'),
  ('E Block Seminar Hall', 120, 'Well-equipped seminar space'),
  ('B Block Auditorium', 300, 'Secondary auditorium with basic facilities');

-- Add booking constraints
ALTER TABLE events ADD CONSTRAINT unique_venue_booking 
  UNIQUE (venue_id, date, start_time, end_time);

-- Create function to check venue availability
CREATE OR REPLACE FUNCTION check_venue_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM events
    WHERE venue_id = NEW.venue_id
    AND date = NEW.date
    AND (
      (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
    )
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Venue is already booked for this time slot';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for venue availability check
CREATE TRIGGER ensure_no_double_booking
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION check_venue_availability();