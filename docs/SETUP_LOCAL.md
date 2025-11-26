# Local Development Setup Guide

**Purpose**: Get "What's for Dinner" running locally from a fresh clone.

---

## Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **pnpm**: 8+ (`npm install -g pnpm`)
- **Supabase Account**: Free tier works
- **OpenAI API Key**: For AI features (optional for basic testing)

---

## Quick Start (5 Minutes)

### 1. Clone Repository

```bash
git clone <repository-url>
cd whats-for-dinner
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your values
# Required minimum:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_PROJECT_REF
# - OPENAI_API_KEY (optional)
```

**Where to get values:**
- Supabase: Dashboard → Project Settings → API
- OpenAI: https://platform.openai.com/api-keys

### 4. Set Up Database

```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase migration up
# OR use helper script:
# ./scripts/supa-migrate-all.sh
```

### 5. Start Development Server

```bash
# Start web app
pnpm dev:web

# OR start all apps
pnpm dev
```

**Open**: `http://localhost:3000`

---

## Detailed Setup

### Environment Variables

See [env-setup.md](./env-setup.md) for complete environment variable documentation.

**Minimum Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)
- `SUPABASE_PROJECT_REF` - Your Supabase project reference

**Optional (for full features):**
- `OPENAI_API_KEY` - For AI recipe generation
- `STRIPE_SECRET_KEY` - For payments
- `RESEND_API_KEY` - For emails

### Database Setup

#### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase migration up
```

#### Option 2: Manual SQL Execution

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of migration files from `/supabase/migrations/`
3. Execute in SQL Editor

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Building for Production

```bash
# Build all apps
pnpm build

# Build web app only
pnpm build:web

# Build mobile app only
pnpm build:mobile
```

---

## Troubleshooting

### "Missing environment variables"

- Check `.env.local` exists and has all required variables
- Restart dev server after adding variables
- Verify variable names match exactly (case-sensitive)

### "Cannot connect to Supabase"

- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project is active (not paused)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### "Migration failed"

- Check `SUPABASE_PROJECT_REF` is correct
- Verify you have access to the project
- Check migration files for syntax errors

### "Port 3000 already in use"

```bash
# Use different port
PORT=3001 pnpm dev:web
```

---

## Next Steps

- Read [README.md](../README.md) for project overview
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [API.md](./API.md) for API documentation

---

## Verification Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment variables set (`.env.local` exists)
- [ ] Database migrations applied
- [ ] Dev server starts (`pnpm dev:web`)
- [ ] App loads at `http://localhost:3000`
- [ ] Can sign up/login
- [ ] Can generate a recipe (if OpenAI key set)

---

**Last Updated**: 2025-01-28  
**Status**: ✅ Ready for use
