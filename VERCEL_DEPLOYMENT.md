# Vercel Deployment Guide

## Current Issue Resolution

The 404 error you're seeing is caused by incorrect build configuration. Here's what we've fixed:

### ✅ Fixed Issues
1. **Build Command**: Changed from `npm run build:client` to `npm run build`
2. **Output Directory**: Changed from `dist` to `dist/spa` to match Vite config
3. **SPA Routing**: Configured rewrites to serve `index.html` for all routes

## Deployment Steps

### 1. Verify Vercel Configuration

Your `vercel.json` is now correctly configured:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/spa",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Set Environment Variables in Vercel

**CRITICAL**: You must set these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Note**: Replace with your actual values from Supabase dashboard.

### 3. Trigger New Deployment

After setting environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### 4. Verify Build Logs

If deployment still fails:

1. Check the **Build Logs** in Vercel dashboard
2. Look for these common issues:
   - Missing environment variables
   - Build errors due to missing dependencies
   - TypeScript errors
   - Import/export errors

## Common 404 Causes & Solutions

### Issue: Routes not working (e.g., `/events`, `/login`)
**Solution**: The `rewrites` configuration in `vercel.json` fixes this by serving `index.html` for all routes.

### Issue: Build fails with environment variable errors
**Solution**: Set proper environment variables in Vercel dashboard (not in `.env` file for production).

### Issue: Assets not loading
**Solution**: Check that `outputDirectory` matches your build output (`dist/spa`).

## Testing Deployment

### 1. Local Build Test
```bash
npm run build
```
Should create files in `dist/spa/` without errors.

### 2. Preview Mode
After deployment, test these URLs:
- `/` - Home page
- `/events` - Should not show 404
- `/login` - Should not show 404
- `/dashboard` - Should not show 404

### 3. Check Network Tab
- Verify assets are loading from Vercel CDN
- Check for any 404s on CSS/JS files

## Environment Variables for Production

### Required Variables
```bash
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[long-jwt-token]
```

### Optional Variables
```bash
VITE_RAZORPAY_KEY_ID=rzp_[key]
VITE_WHATSAPP_API_URL=https://api.whatsapp.com
VITE_TELEGRAM_BOT_TOKEN=bot[token]
```

## Debugging Steps

1. **Check Vercel Function Logs**
   - Go to Vercel dashboard → Functions tab
   - Look for any runtime errors

2. **Verify Build Output**
   - Ensure `dist/spa/index.html` exists after build
   - Check that assets are properly referenced

3. **Test Build Locally**
   ```bash
   npm run build
   npx serve dist/spa
   ```

4. **Check Browser Console**
   - Look for JavaScript errors
   - Verify API calls are working

## Next Steps After Successful Deployment

1. **Set up Supabase** (if not done):
   - Create project at supabase.com
   - Run database migration
   - Update environment variables

2. **Configure Custom Domain** (optional):
   - Add domain in Vercel settings
   - Update Supabase redirect URLs

3. **Set up Analytics** (optional):
   - Enable Vercel Analytics
   - Configure error tracking

## Support

If you continue to see 404 errors after following this guide:

1. Check Vercel deployment logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure the build command completes successfully
4. Test the application locally with the production build

The current configuration should resolve the 404 issue you're experiencing.
