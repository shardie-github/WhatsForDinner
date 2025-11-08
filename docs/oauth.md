# OAuth Configuration Guide

This guide explains how to configure OAuth providers (GitHub, Google) for authentication.

## Supported Providers

- GitHub
- Google

## Redirect URIs

### Development
- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

### Production
- GitHub: `https://<your-vercel-domain>/api/auth/callback/github`
- Google: `https://<your-vercel-domain>/api/auth/callback/google`

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Your app name
   - **Homepage URL**: `https://your-app.vercel.app` (or `http://localhost:3000` for dev)
   - **Authorization callback URL**: 
     - Production: `https://<your-vercel-domain>/api/auth/callback/github`
     - Development: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Set Environment Variables

Add to Vercel and `.env.local`:

```bash
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** (or **Google Identity API**)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - Production: `https://<your-vercel-domain>/api/auth/callback/google`
   - Development: `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

### 2. Set Environment Variables

Add to Vercel and `.env.local`:

```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

## Supabase Auth Configuration

### 1. Enable Providers in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **GitHub** and/or **Google**
3. Enter the Client ID and Client Secret from above
4. Save

### 2. Configure Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app` (production) or `http://localhost:3000` (dev)
- **Redirect URLs**: Add both development and production callback URLs

## Testing

### Test OAuth Flow

1. Start dev server: `pnpm dev`
2. Navigate to login page
3. Click "Sign in with GitHub" or "Sign in with Google"
4. Complete OAuth flow
5. Verify user is created in Supabase `auth.users` table

### Verify User Mapping

After first login, check that user profile is created:

```sql
SELECT * FROM auth.users WHERE email = '<user-email>';
SELECT * FROM public.users WHERE email = '<user-email>';
```

## Troubleshooting

### "Redirect URI mismatch" Error

- Verify redirect URI in OAuth provider matches exactly (including protocol, port, path)
- Check Supabase redirect URL configuration
- Ensure environment variables are set correctly

### User Not Created in App Tables

- Check if trigger exists to create profile on first login
- Verify RLS policies allow inserts
- Check application logs for errors

### OAuth Provider Not Showing

- Verify provider is enabled in Supabase Dashboard
- Check environment variables are set
- Restart development server after adding env vars

## Security Notes

- **Never commit OAuth secrets** to git
- Use different OAuth apps for development and production
- Rotate secrets if exposed
- Monitor OAuth usage in provider dashboards
