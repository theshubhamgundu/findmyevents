# FindMyEvent - Deployment Setup Guide

## Environment Variables Required

### For Local Development

Copy `.env.example` to `.env` and fill in your actual values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Razorpay Configuration (Optional)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### For Vercel Deployment

Add these environment variables in your Vercel dashboard:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

_Note: Both VITE* and NEXT_PUBLIC* prefixes are included for maximum compatibility._

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public** key → Use as `SUPABASE_ANON_KEY`

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Production Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add the environment variables mentioned above
3. Deploy

### Manual Build

```bash
pnpm build
pnpm start
```

## Features

### QR Code Scanner (Volunteer Dashboard)

- Access via: `/volunteer/login`
- Demo credentials: `scanner` / `scanner123`
- Mobile optimized with camera permissions
- HTTPS required for camera access

### Demo Authentication

The app includes demo mode when Supabase is not configured:

- Admin: `admin` / `admin123`
- Student: `student` / `student123`
- Organizer: `organizer` / `organizer123`

## Troubleshooting

### "Supabase isn't configured" Error

1. Verify environment variables are set correctly
2. Ensure you're using actual Supabase values, not placeholders
3. Check that HTTPS is being used (required for camera access)
4. Restart the development server after changing environment variables

### Camera Not Starting on Mobile

1. Ensure HTTPS is enabled
2. Allow camera permissions when prompted
3. Try refreshing the page
4. Check browser compatibility (modern browsers required)
