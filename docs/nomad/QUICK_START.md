# Nomad Quick Start Guide

Get Nomad up and running in 10 minutes!

## ?? Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account (free tier works)

## ?? Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /workspace
pnpm install
```

### 2. Set Up Supabase

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Add Environment Variables**:
   ```bash
   cd apps/web
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Database Migration**:
   - Supabase Dashboard ? SQL Editor
   - Copy contents of `supabase/migrations/015_nomad_schema.sql`
   - Paste and Run

4. **Enable Realtime**:
   - Dashboard ? Database ? Replication
   - Enable for: `family_chat_messages`, `family_activities`, `grocery_list_items`

### 3. Start Development Server

```bash
pnpm dev:web
```

Visit http://localhost:3000/nomad/dashboard

## ? That's It!

Your Nomad app is now running with:
- ? Database schema
- ? Real-time chat
- ? Dashboard widgets
- ? All core screens

## ?? Optional: External APIs

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Nutrition APIs (Edamam, Nutritionix)
- Wearables (Google Fit)
- Ad Networks (AdMob)

## ?? Next Steps

1. Set up authentication
2. Configure external APIs
3. Add recipe images
4. Set up push notifications

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.
