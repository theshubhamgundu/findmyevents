# Supabase Setup Guide

## Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project

## Configuration Steps

### 1. Get Your Supabase Credentials
After creating your project, go to:
- Project Settings → API
- Copy your Project URL and anon/public key

### 2. Configure Environment Variables
Replace the placeholder values with your actual Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Run Database Migration
In your Supabase dashboard:
1. Go to SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_create_tables.sql`
3. Run the query

This will create:
- All necessary tables with proper relationships
- Row Level Security (RLS) policies
- Storage buckets for file uploads
- Triggers and functions
- Indexes for performance

### 4. Configure Authentication
1. Go to Authentication → Settings
2. Enable the following providers:
   - Email (already enabled)
   - Google (if you want Google Sign-in)

### 5. Configure Storage
The migration automatically creates storage buckets:
- `event-images`: For event banners and images
- `user-avatars`: For user profile pictures
- `organizer-documents`: For organizer verification documents

### 6. Optional: Add Sample Data
You can add some sample events and organizers to test the application.

## Security Features Implemented
- Row Level Security (RLS) on all tables
- Proper user permissions
- Secure file upload policies
- API key protection

## Production Considerations
1. **Environment Variables**: Never commit real credentials to git
2. **RLS Policies**: Review and adjust based on your needs
3. **Storage Policies**: Configure proper file upload restrictions
4. **Backups**: Enable automatic backups in Supabase
5. **Rate Limiting**: Configure in Supabase settings
