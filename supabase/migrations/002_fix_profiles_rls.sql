-- Fix RLS policy for profiles table to handle signup edge cases
-- This migration addresses the "new row violates row-level security policy" error

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view organizer profiles" ON profiles;

-- Recreate policies with better handling

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile insertion during signup with proper authentication
-- This policy allows insertion when the user is authenticated and the ID matches
CREATE POLICY "Users can insert own profile during signup" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id 
    AND auth.jwt() IS NOT NULL
  );

-- Public profiles for organizers (for viewing purposes)
CREATE POLICY "Anyone can view organizer profiles" ON profiles
  FOR SELECT USING (
    role = 'organizer' AND 
    id IN (SELECT user_id FROM organizers WHERE status = 'approved')
  );

-- Add a fallback policy for service role (for admin operations)
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (
    auth.jwt()->>'role' = 'service_role'
  );
