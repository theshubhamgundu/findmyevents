# Production Deployment Guide

## Environment Variables Setup

### Required Environment Variables

For production deployment, you need to set these environment variables in your hosting platform:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Razorpay Configuration (Required for payments)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Optional: Community Integration
VITE_WHATSAPP_API_URL=your_whatsapp_api_url
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_EMAIL_SERVICE_URL=your_email_service_url
```

### Netlify Deployment

1. **Connect Repository**: Connect your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add all required variables in Netlify dashboard
4. **Deploy**: Trigger deployment

### Vercel Deployment

1. **Connect Repository**: Import project from GitHub
2. **Framework**: Select "Vite" or "Other"
3. **Build Settings**:
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment Variables**: Add all required variables
5. **Deploy**: Deploy the project

## Supabase Production Setup

### 1. Create Production Database

1. Create a new Supabase project for production
2. Copy the database schema from `supabase/migrations/001_create_tables.sql`
3. Run the SQL in your Supabase SQL Editor

### 2. Configure Authentication

1. Go to Authentication → Settings
2. Enable Email authentication
3. Configure redirect URLs for your production domain
4. Optional: Enable Google OAuth

### 3. Configure Storage

Storage buckets are automatically created by the migration:

- `event-images`: Public bucket for event images
- `user-avatars`: Public bucket for user profile pictures
- `organizer-documents`: Private bucket for verification documents

### 4. Set up Row Level Security

RLS policies are automatically configured by the migration to ensure:

- Users can only access their own data
- Organizers can only manage their own events
- Public read access to published events
- Secure file upload permissions

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] Database RLS policies are active
- [ ] HTTPS is enabled (automatic with Netlify/Vercel)
- [ ] API keys are properly secured
- [ ] No sensitive data in client-side code
- [ ] CORS settings are configured in Supabase
- [ ] Rate limiting is enabled in Supabase

## Performance Optimizations

- [ ] Images are optimized and compressed
- [ ] CDN is configured (automatic with Netlify/Vercel)
- [ ] Database indexes are in place (from migration)
- [ ] API queries are optimized
- [ ] Bundle size is optimized

## Monitoring & Analytics

1. **Supabase Dashboard**: Monitor database performance and usage
2. **Netlify Analytics**: Track website performance (if using Netlify)
3. **Error Tracking**: Consider integrating Sentry for error monitoring
4. **Uptime Monitoring**: Set up monitoring for your production URL

## Post-Deployment Testing

1. Test user registration and authentication
2. Test event creation and registration
3. Test payment flow (use Razorpay test mode first)
4. Test QR code generation and scanning
5. Verify email notifications are working
6. Test mobile responsiveness

## Domain Configuration

1. Configure custom domain in hosting platform
2. Set up SSL certificate (automatic)
3. Update redirect URLs in Supabase settings
4. Update CORS settings if needed

## Backup Strategy

1. Enable automatic backups in Supabase
2. Regular database exports
3. Code repository backups via Git

## Support & Maintenance

- Monitor error logs regularly
- Keep dependencies updated
- Monitor Supabase usage and upgrade plan if needed
- Regular security audits
