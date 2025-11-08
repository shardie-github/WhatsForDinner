# Development Setup Guide

## Termux/Android Friendly Setup

This guide is optimized for Termux and other Android development environments.

## Prerequisites

- Node.js 18+ (install via Termux: `pkg install nodejs`)
- pnpm 8+ (`npm install -g pnpm`)
- Supabase project access

## One-Time Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <repo-name>
pnpm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

```bash
# Core Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ghqyxhbyyirveptgwoqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_URL=https://ghqyxhbyyirveptgwoqm.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>

# Database (use service role key as password)
DATABASE_URL=postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require

# Prisma (REQUIRED for Termux/Android)
PRISMA_CLIENT_ENGINE_TYPE=wasm

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXT_PUBLIC_APP_ENV=development
LOG_LEVEL=info
```

**Important**: Ensure `DATABASE_URL` uses `sslmode=require` for Supabase connection.

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

This will generate the Prisma client with WASM engine (no native dependencies).

### 4. Run Database Migrations

```bash
pnpm prisma migrate deploy
```

This applies all pending migrations to your database.

### 5. Verify Setup

```bash
pnpm doctor
```

This runs the reality check script to verify all connections work.

## Daily Development

### Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Run Tests

```bash
pnpm test
```

### Run Smoke Tests

```bash
pnpm smoke:test
```

### Check Database Schema

```bash
pnpm prisma studio
```

Opens Prisma Studio in your browser for database inspection.

## Troubleshooting

### Prisma Client Generation Fails

Ensure `PRISMA_CLIENT_ENGINE_TYPE=wasm` is set in `.env.local`.

### Database Connection Fails

1. Verify `DATABASE_URL` includes `sslmode=require`
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Ensure Supabase project is active

### Migrations Fail

1. Check database connection: `pnpm prisma db pull`
2. Verify migration files are valid: `pnpm prisma migrate status`
3. Check for conflicts: `pnpm prisma migrate dev --create-only`

### Termux-Specific Issues

- **Storage**: Ensure Termux has storage permissions
- **Network**: Check internet connectivity
- **Node Version**: Use Node 18+ (check with `node --version`)

## Next Steps

- See [deploy.md](./deploy.md) for deployment instructions
- See [secrets.md](./secrets.md) for secrets management
- See [health.md](./health.md) for health check endpoints
