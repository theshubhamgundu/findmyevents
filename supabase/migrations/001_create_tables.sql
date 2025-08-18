-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE event_type AS ENUM ('hackathon', 'workshop', 'seminar', 'conference', 'meetup', 'webinar', 'competition', 'ideathon');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE organizer_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  phone VARCHAR,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  college VARCHAR,
  course VARCHAR,
  graduation_year INTEGER,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'India',
  bio TEXT,
  interests TEXT[],
  preferred_event_types event_type[],
  preferred_duration VARCHAR[],
  preferred_location VARCHAR[],
  community_channels JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizers table
CREATE TABLE organizers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_name VARCHAR NOT NULL,
  organization_type VARCHAR,
  website_url TEXT,
  description TEXT,
  verification_documents JSONB,
  social_links JSONB DEFAULT '{}',
  contact_person VARCHAR,
  contact_email VARCHAR,
  contact_phone VARCHAR,
  address TEXT,
  tax_id VARCHAR,
  bank_details JSONB,
  status organizer_status DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  event_status event_status DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  venue_name VARCHAR,
  venue_address TEXT,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'India',
  is_online BOOLEAN DEFAULT FALSE,
  online_meeting_url TEXT,
  max_attendees INTEGER,
  min_attendees INTEGER DEFAULT 1,
  age_restrictions VARCHAR,
  prerequisites TEXT,
  what_to_bring TEXT,
  agenda JSONB,
  speakers JSONB DEFAULT '[]',
  sponsors JSONB DEFAULT '[]',
  partners JSONB DEFAULT '[]',
  images TEXT[],
  banner_image TEXT,
  tags TEXT[],
  social_links JSONB DEFAULT '{}',
  contact_email VARCHAR,
  contact_phone VARCHAR,
  terms_and_conditions TEXT,
  refund_policy TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_types table
CREATE TABLE ticket_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  sale_start TIMESTAMP WITH TIME ZONE,
  sale_end TIMESTAMP WITH TIME ZONE,
  is_transferable BOOLEAN DEFAULT TRUE,
  max_per_user INTEGER DEFAULT 1,
  includes JSONB DEFAULT '[]',
  restrictions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id VARCHAR UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE NOT NULL,
  attendee_name VARCHAR NOT NULL,
  attendee_email VARCHAR NOT NULL,
  attendee_phone VARCHAR,
  additional_info JSONB DEFAULT '{}',
  price_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  status ticket_status DEFAULT 'active',
  qr_code_data TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES profiles(id),
  transferred_from UUID REFERENCES tickets(id),
  transferred_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR,
  payment_provider VARCHAR DEFAULT 'razorpay',
  provider_payment_id VARCHAR,
  provider_order_id VARCHAR,
  provider_signature VARCHAR,
  status payment_status DEFAULT 'pending',
  failure_reason TEXT,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create event_analytics table
CREATE TABLE event_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  refunds DECIMAL(10,2) DEFAULT 0,
  check_ins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, date)
);

-- Create event_likes table
CREATE TABLE event_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create event_bookmarks table
CREATE TABLE event_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('event-images', 'event-images', true),
  ('user-avatars', 'user-avatars', true),
  ('organizer-documents', 'organizer-documents', false);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_interests ON profiles USING GIN(interests);

CREATE INDEX idx_organizers_status ON organizers(status);
CREATE INDEX idx_organizers_user_id ON organizers(user_id);

CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_status ON events(event_status);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_featured ON events(is_featured);
CREATE INDEX idx_events_tags ON events USING GIN(tags);

CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_ticket_id ON tickets(ticket_id);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_payment_id ON payments(provider_payment_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_event_analytics_event_id ON event_analytics(event_id);
CREATE INDEX idx_event_analytics_date ON event_analytics(date);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profiles for organizers
CREATE POLICY "Anyone can view organizer profiles" ON profiles
  FOR SELECT USING (
    role = 'organizer' AND 
    id IN (SELECT user_id FROM organizers WHERE status = 'approved')
  );

-- Organizers policies
CREATE POLICY "Users can view own organizer data" ON organizers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create organizer profile" ON organizers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own organizer data" ON organizers
  FOR UPDATE USING (user_id = auth.uid());

-- Public access to approved organizers
CREATE POLICY "Anyone can view approved organizers" ON organizers
  FOR SELECT USING (status = 'approved');

-- Events policies
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (event_status = 'published');

CREATE POLICY "Organizers can manage own events" ON events
  FOR ALL USING (
    organizer_id IN (
      SELECT id FROM organizers WHERE user_id = auth.uid()
    )
  );

-- Ticket types policies
CREATE POLICY "Anyone can view ticket types for published events" ON ticket_types
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE event_status = 'published'
    )
  );

CREATE POLICY "Organizers can manage ticket types for own events" ON ticket_types
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizers o ON e.organizer_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view tickets for own events" ON tickets
  FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizers o ON e.organizer_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update tickets for own events" ON tickets
  FOR UPDATE USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizers o ON e.organizer_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view payments for own events" ON payments
  FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizers o ON e.organizer_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Event analytics policies
CREATE POLICY "Organizers can view analytics for own events" ON event_analytics
  FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizers o ON e.organizer_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Event likes policies
CREATE POLICY "Users can manage own likes" ON event_likes
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view like counts" ON event_likes
  FOR SELECT USING (true);

-- Event bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON event_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Storage policies
CREATE POLICY "Anyone can view public images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('event-images', 'user-avatars'));

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Organizers can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-images' AND
    auth.uid() IN (SELECT user_id FROM organizers WHERE status = 'approved')
  );

CREATE POLICY "Organizers can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'organizer-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create functions for updated_at timestamps
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

CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
