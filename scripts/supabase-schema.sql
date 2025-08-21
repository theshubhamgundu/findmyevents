-- FindMyEvent Database Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- Enable Row Level Security for all tables
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'admin')),
  phone TEXT,
  city TEXT,
  college TEXT,
  year_of_study TEXT,
  interests TEXT[],
  notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": false, "telegram": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create organizers table
CREATE TABLE IF NOT EXISTS organizers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('college', 'company', 'startup', 'ngo', 'government', 'other')),
  official_email TEXT NOT NULL,
  phone TEXT,
  website_url TEXT,
  description TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_documents JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES organizers(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('hackathon', 'workshop', 'seminar', 'conference', 'fest', 'competition', 'meetup', 'other')),
  event_status TEXT DEFAULT 'draft' CHECK (event_status IN ('draft', 'pending', 'approved', 'published', 'cancelled', 'completed')),
  venue TEXT NOT NULL,
  venue_address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_start TIMESTAMPTZ DEFAULT NOW(),
  registration_end TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  tags TEXT[],
  requirements TEXT,
  prizes TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  event_poster TEXT, -- URL to poster image
  event_images TEXT[], -- Array of image URLs
  is_featured BOOLEAN DEFAULT FALSE,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create ticket_types table
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0, -- Price in paise (Indian currency)
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  sale_start TIMESTAMPTZ DEFAULT NOW(),
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- Additional ticket metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ticket_type_id UUID REFERENCES ticket_types(id) NOT NULL,
  registration_data JSONB, -- Form data, team info, etc.
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT, -- Payment gateway transaction ID
  amount_paid INTEGER DEFAULT 0, -- Amount in paise
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID, -- Volunteer/admin who checked in
  qr_code_data TEXT, -- QR code content
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- One registration per user per event
);

-- 6. Create tickets table (for QR codes and check-ins)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES registrations(id) NOT NULL,
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ticket_id TEXT UNIQUE NOT NULL, -- Human readable ticket ID
  qr_code_data TEXT NOT NULL, -- QR code content
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
  scanned_at TIMESTAMPTZ,
  scanned_by UUID, -- Volunteer who scanned
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL, -- Use proper hashing in production
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'scanner' CHECK (role IN ('scanner', 'coordinator', 'admin')),
  permissions JSONB DEFAULT '{"can_scan": true, "can_view_analytics": false}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, username)
);

-- 8. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES registrations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_id UUID REFERENCES events(id) NOT NULL,
  payment_gateway TEXT NOT NULL, -- 'razorpay', 'stripe', etc.
  payment_gateway_id TEXT, -- Gateway transaction ID
  amount INTEGER NOT NULL, -- Amount in paise
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT, -- 'card', 'upi', 'netbanking', etc.
  failure_reason TEXT,
  metadata JSONB, -- Gateway specific metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'event_reminder', 'registration_confirmed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional notification data
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create event_analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0, -- In paise
  check_ins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(event_status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_volunteers_event ON volunteers(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: Public read, organizers can manage their own
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (event_status = 'published');

CREATE POLICY "Organizers can manage their own events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizers 
      WHERE organizers.id = events.organizer_id 
      AND organizers.user_id = auth.uid()
    )
  );

-- Registrations: Users can view their own, organizers can view for their events
CREATE POLICY "Users can view their own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can view registrations for their events" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      JOIN organizers ON events.organizer_id = organizers.id
      WHERE events.id = registrations.event_id 
      AND organizers.user_id = auth.uid()
    )
  );

-- Tickets: Similar to registrations
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view tickets for their events" ON tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      JOIN organizers ON events.organizer_id = organizers.id
      WHERE events.id = tickets.event_id 
      AND organizers.user_id = auth.uid()
    )
  );

-- Notifications: Users can only see their own
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON organizers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET current_participants = current_participants - 1 
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for participant count
CREATE TRIGGER trigger_update_event_participants
  AFTER INSERT OR DELETE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_participants();

-- Insert sample data (optional, for testing)
-- Note: This will only work after you've created some auth users
/*
-- Sample organizer (replace with actual user ID)
INSERT INTO organizers (user_id, organization_name, organization_type, official_email, verification_status)
VALUES ('your-user-id-here', 'Demo Tech Club', 'college', 'tech@demo.edu', 'approved');

-- Sample event
INSERT INTO events (organizer_id, title, description, event_type, venue, city, start_date, end_date, registration_end, max_participants, event_status)
VALUES (
  'organizer-id-here',
  'AI/ML Workshop 2024',
  'Learn the fundamentals of Artificial Intelligence and Machine Learning',
  'workshop',
  'Tech Hub Auditorium',
  'Mumbai',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '8 days',
  NOW() + INTERVAL '6 days',
  100,
  'published'
);
*/
