-- FindMyEvent Database Schema
-- This creates all tables needed for the FindMyEvent platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS & PROFILES
-- =============================================

-- Users table (managed by Supabase Auth)
-- The auth.users table is automatically created by Supabase

-- User profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'admin')),
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    college TEXT,
    course TEXT,
    graduation_year INTEGER,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    bio TEXT,
    interests TEXT[],
    preferred_event_types TEXT[],
    preferred_duration TEXT[],
    preferred_location TEXT[],
    community_channels JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": false, "telegram": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ORGANIZERS
-- =============================================

CREATE TABLE organizers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL CHECK (organization_type IN ('college', 'club', 'startup', 'company')),
    official_email TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    upi_id TEXT NOT NULL,
    upi_name TEXT NOT NULL,
    upi_qr_code TEXT, -- URL to stored QR code image
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_documents TEXT[],
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- VOLUNTEERS
-- =============================================

CREATE TABLE volunteers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE NOT NULL,
    event_id UUID, -- Will reference events table (created below)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- EVENTS
-- =============================================

CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('hackathon', 'workshop', 'seminar', 'fest', 'ideathon', 'other')),
    banner_url TEXT,
    venue TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_team_event BOOLEAN DEFAULT FALSE,
    max_team_size INTEGER,
    event_status TEXT DEFAULT 'draft' CHECK (event_status IN ('draft', 'pending', 'approved', 'published', 'cancelled')),
    requires_tickets BOOLEAN DEFAULT TRUE, -- New field: whether event needs tickets/passes
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    requirements TEXT,
    prizes TEXT,
    contact_info JSONB DEFAULT '{}',
    custom_form_fields JSONB DEFAULT '[]', -- Store custom registration fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add foreign key constraint for volunteers event_id
ALTER TABLE volunteers ADD CONSTRAINT volunteers_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- =============================================
-- PASS/TICKET TYPES
-- =============================================

CREATE TABLE pass_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER, -- NULL means unlimited
    sold INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sale_start TIMESTAMP WITH TIME ZONE,
    sale_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- REGISTRATIONS
-- =============================================

CREATE TABLE registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    pass_type_id UUID REFERENCES pass_types(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Payment details
    utr_id TEXT NOT NULL UNIQUE, -- UTR from UPI payment
    payment_screenshot_url TEXT NOT NULL, -- URL to uploaded screenshot
    amount DECIMAL(10,2) NOT NULL,
    
    -- Registration form data (dynamic based on organizer's custom fields)
    form_data JSONB NOT NULL DEFAULT '{}',
    
    -- Team details (if applicable)
    team_name TEXT,
    team_members JSONB, -- Array of team member details
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    payment_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure one registration per user per event
    UNIQUE(event_id, user_id)
);

-- =============================================
-- TICKETS/PASSES
-- =============================================

CREATE TABLE tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_token TEXT NOT NULL UNIQUE, -- Unique secure token for QR code
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Ticket status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
    
    -- Check-in details
    scanned_at TIMESTAMP WITH TIME ZONE,
    scanned_by_user_id UUID REFERENCES auth.users(id), -- Organizer who scanned
    scanned_by_volunteer_id UUID REFERENCES volunteers(id), -- Volunteer who scanned
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    sent_via TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ANALYTICS
-- =============================================

CREATE TABLE event_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    views INTEGER DEFAULT 0,
    registrations INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure one record per event per date
    UNIQUE(event_id, date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profile indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_college ON profiles(college);

-- Organizer indexes
CREATE INDEX idx_organizers_user_id ON organizers(user_id);
CREATE INDEX idx_organizers_verification_status ON organizers(verification_status);

-- Volunteer indexes
CREATE INDEX idx_volunteers_organizer_id ON volunteers(organizer_id);
CREATE INDEX idx_volunteers_event_id ON volunteers(event_id);
CREATE INDEX idx_volunteers_username ON volunteers(username);

-- Event indexes
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(event_status);
CREATE INDEX idx_events_featured ON events(is_featured);

-- Pass type indexes
CREATE INDEX idx_pass_types_event_id ON pass_types(event_id);

-- Registration indexes
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_utr_id ON registrations(utr_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- Ticket indexes
CREATE INDEX idx_tickets_registration_id ON tickets(registration_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_token ON tickets(ticket_token);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Analytics indexes
CREATE INDEX idx_event_analytics_event_id ON event_analytics(event_id);
CREATE INDEX idx_event_analytics_date ON event_analytics(date);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, organizers can view basic info of registered users
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizers: Public read for verification, own organizer for full access
CREATE POLICY "Organizers are publicly readable" ON organizers FOR SELECT USING (verification_status = 'approved');
CREATE POLICY "Users can view own organizer profile" ON organizers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create organizer profile" ON organizers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own organizer profile" ON organizers FOR UPDATE USING (auth.uid() = user_id);

-- Volunteers: Only accessible by the organizer who created them
CREATE POLICY "Volunteers accessible by organizer" ON volunteers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM organizers 
        WHERE organizers.id = volunteers.organizer_id 
        AND organizers.user_id = auth.uid()
    )
);

-- Events: Public read for published events, organizer access for own events
CREATE POLICY "Published events are publicly readable" ON events FOR SELECT USING (event_status = 'published');
CREATE POLICY "Organizers can manage own events" ON events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM organizers 
        WHERE organizers.id = events.organizer_id 
        AND organizers.user_id = auth.uid()
    )
);

-- Pass types: Public read for active events, organizer write access
CREATE POLICY "Pass types readable for published events" ON pass_types FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events 
        WHERE events.id = pass_types.event_id 
        AND events.event_status = 'published'
    )
);
CREATE POLICY "Organizers can manage pass types" ON pass_types FOR ALL USING (
    EXISTS (
        SELECT 1 FROM events e
        JOIN organizers o ON e.organizer_id = o.id
        WHERE e.id = pass_types.event_id 
        AND o.user_id = auth.uid()
    )
);

-- Registrations: Users can see own registrations, organizers can see registrations for their events
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create registrations" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can view event registrations" ON registrations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events e
        JOIN organizers o ON e.organizer_id = o.id
        WHERE e.id = registrations.event_id 
        AND o.user_id = auth.uid()
    )
);
CREATE POLICY "Organizers can update registration status" ON registrations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM events e
        JOIN organizers o ON e.organizer_id = o.id
        WHERE e.id = registrations.event_id 
        AND o.user_id = auth.uid()
    )
);

-- Tickets: Users can see own tickets, organizers and volunteers can scan tickets
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view event tickets" ON tickets FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events e
        JOIN organizers o ON e.organizer_id = o.id
        WHERE e.id = tickets.event_id 
        AND o.user_id = auth.uid()
    )
);
CREATE POLICY "Organizers can update tickets" ON tickets FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM events e
        JOIN organizers o ON e.organizer_id = o.id
        WHERE e.id = tickets.event_id 
        AND o.user_id = auth.uid()
    )
);

-- Notifications: Users can see own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Analytics: Organizers can view analytics for their events
CREATE POLICY "Organizers can view event analytics" ON event_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events e
        JOIN organizers o ON e.organizer_id = o.id
        WHERE e.id = event_analytics.event_id 
        AND o.user_id = auth.uid()
    )
);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON organizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique ticket token
CREATE OR REPLACE FUNCTION generate_ticket_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'FME-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || upper(substring(md5(random()::text) for 8));
END;
$$ language 'plpgsql';

-- Function to create ticket when registration is confirmed
CREATE OR REPLACE FUNCTION create_ticket_for_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create ticket if event requires tickets and registration is confirmed
    IF NEW.payment_verified = TRUE AND OLD.payment_verified = FALSE THEN
        -- Check if event requires tickets
        IF EXISTS (
            SELECT 1 FROM events 
            WHERE id = NEW.event_id 
            AND requires_tickets = TRUE
        ) THEN
            INSERT INTO tickets (
                ticket_token,
                registration_id,
                event_id,
                user_id,
                status
            ) VALUES (
                generate_ticket_token(),
                NEW.id,
                NEW.event_id,
                NEW.user_id,
                'active'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create tickets
CREATE TRIGGER create_ticket_on_payment_verification 
    AFTER UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION create_ticket_for_registration();

-- Function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
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

-- Trigger to update participant count
CREATE TRIGGER update_participant_count_on_registration 
    AFTER INSERT OR DELETE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_event_participant_count();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('event-images', 'event-images', true),
    ('user-avatars', 'user-avatars', true),
    ('organizer-documents', 'organizer-documents', false),
    ('payment-screenshots', 'payment-screenshots', false),
    ('upi-qr-codes', 'upi-qr-codes', true);

-- Storage policies
CREATE POLICY "Event images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Organizers can upload event images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'event-images' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "User avatars are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload payment screenshots" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "UPI QR codes are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'upi-qr-codes');
CREATE POLICY "Organizers can upload UPI QR codes" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'upi-qr-codes' AND 
    auth.role() = 'authenticated'
);

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert a sample admin user profile (you'll need to create the auth user first)
-- This is just an example - replace with actual user ID after creating admin user
/*
INSERT INTO profiles (id, email, full_name, role) VALUES 
    ('00000000-0000-0000-0000-000000000000', 'admin@findmyevent.com', 'Admin User', 'admin');
*/

-- Create sample organizer (example)
/*
INSERT INTO organizers (id, user_id, organization_name, organization_type, upi_id, upi_name, verification_status) VALUES 
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Sample College', 'college', 'samplecollege@paytm', 'Sample College Events', 'approved');
*/
