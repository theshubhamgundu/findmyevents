# Supabase Setup Guide for FindMyEvent

This guide will help you set up Supabase for the FindMyEvent application.

## Prerequisites

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `findmyevent`
   - Database Password: (Generate a strong password and save it)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase project dashboard, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Project API Keys** → **anon public**: `eyJ...` (long JWT token)

## Step 3: Configure Environment Variables

1. In your project root, update the `.env` file:

```bash
# Replace with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Restart your development server:
```bash
pnpm dev
```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New query"
3. Copy the entire content from `scripts/supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create all necessary tables:
- `profiles` - User profiles extending auth.users
- `organizers` - Event organizer information
- `events` - Event details and metadata
- `ticket_types` - Different ticket types for events
- `registrations` - User event registrations
- `tickets` - QR code tickets for check-in
- `volunteers` - Volunteer access for event scanning
- `payments` - Payment transaction records
- `notifications` - User notifications
- `event_analytics` - Event performance metrics

## Step 5: Configure Authentication

1. In Supabase dashboard, go to "Authentication" → "Settings"
2. Configure the following:

### Site URL
- Set to: `http://localhost:8080` (for development)
- For production, set to your actual domain

### Redirect URLs
Add these URLs to the "Redirect URLs" list:
- `http://localhost:8080/auth/callback`
- `https://yourdomain.com/auth/callback` (for production)

### Email Templates (Optional)
Customize the confirmation and recovery email templates in "Authentication" → "Email Templates"

### OAuth Providers (Optional)
To enable Google sign-in:
1. Go to "Authentication" → "Providers"
2. Enable "Google"
3. Add your Google OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
   - Redirect URL: Use the one provided by Supabase

## Step 6: Set Up Row Level Security (RLS)

The schema already includes RLS policies, but you can customize them:

1. Go to "Authentication" → "Policies"
2. Review and modify policies as needed
3. Key policies included:
   - Users can only access their own data
   - Organizers can manage their events
   - Public can view published events
   - Admins have full access (implement custom logic)

## Step 7: Create Sample Data (Optional)

To test the application with sample data:

1. Go to "SQL Editor"
2. Run this query to create a sample organizer (replace `USER_ID` with actual user ID after signup):

```sql
-- First, sign up a user through the app, then get their ID from auth.users table
-- Replace 'USER_ID_HERE' with the actual user ID

INSERT INTO organizers (user_id, organization_name, organization_type, official_email, verification_status)
VALUES ('USER_ID_HERE', 'Demo Tech Club', 'college', 'tech@demo.edu', 'approved');

-- Get the organizer ID from the previous insert, then create a sample event
INSERT INTO events (organizer_id, title, description, event_type, venue, city, start_date, end_date, registration_end, max_participants, event_status)
VALUES (
  'ORGANIZER_ID_HERE',
  'AI/ML Workshop 2024',
  'Learn the fundamentals of Artificial Intelligence and Machine Learning with hands-on projects and industry experts.',
  'workshop',
  'Tech Hub Auditorium',
  'Mumbai',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '8 days',
  NOW() + INTERVAL '6 days',
  100,
  'published'
);

-- Create ticket types for the event
INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
VALUES 
  ('EVENT_ID_HERE', 'Early Bird', 'Limited time early bird pricing', 19900, 50),
  ('EVENT_ID_HERE', 'Standard', 'Regular ticket price', 29900, 100),
  ('EVENT_ID_HERE', 'Premium', 'Includes workshop materials and lunch', 39900, 25);
```

## Step 8: Configure Storage (Optional)

For file uploads (event posters, documents):

1. Go to "Storage"
2. Create a bucket named `event-assets`
3. Set up policies for file access:
   - Public read for event posters
   - Authenticated upload for organizers

## Step 9: Set Up Real-time (Optional)

For real-time features:

1. Go to "Database" → "Replication"
2. Enable replication for tables that need real-time updates:
   - `events`
   - `registrations`
   - `tickets`

## Step 10: Test the Connection

1. Restart your development server
2. Go to `http://localhost:8080`
3. Try signing up with a new account
4. Check if the profile is created in the `profiles` table
5. Test different user roles:
   - Admin: `shubsss` / `shubsss@1911`
   - Organizer: `organizer` / `organizer123`
   - Student: `student` / `student123`

## Production Deployment

For production deployment:

1. Update environment variables with production URLs
2. Configure proper CORS settings
3. Set up database backups
4. Enable database monitoring
5. Configure email settings for production
6. Set up proper logging and error tracking

## Troubleshooting

### Common Issues:

1. **"Supabase not configured" message**
   - Check that your environment variables are correct
   - Ensure you've restarted the development server
   - Verify the URL and key format

2. **Authentication not working**
   - Check redirect URLs in Supabase auth settings
   - Verify site URL configuration
   - Check browser console for errors

3. **Database queries failing**
   - Check RLS policies
   - Verify table schema matches the application code
   - Check user permissions

4. **Real-time not working**
   - Enable replication for required tables
   - Check RLS policies for real-time access
   - Verify WebSocket connections

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Security Considerations

1. **Never commit secrets to version control**
2. **Use environment variables for all credentials**
3. **Regularly rotate API keys**
4. **Implement proper RLS policies**
5. **Use HTTPS in production**
6. **Validate all user inputs**
7. **Implement rate limiting**
8. **Monitor for suspicious activity**

## Next Steps

After setting up Supabase:

1. Connect to payment gateway (Razorpay/Stripe)
2. Set up email notifications
3. Configure SMS notifications
4. Implement advanced analytics
5. Set up monitoring and alerts
6. Plan for scaling and performance optimization
