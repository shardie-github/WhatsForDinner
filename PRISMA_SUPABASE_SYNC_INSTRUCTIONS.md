# ⚠️ Important: Prisma Schema Must Match Supabase

## The Issue

The Prisma schema needs to match what's **actually in your Supabase database**, not just what's in migrations. The database may have:
- Tables created by Supabase migrations
- Custom columns or types
- Different constraints or indexes
- Tables from Supabase Auth (auth.users, etc.)

## Quick Fix

Once you have `DATABASE_URL` set, run:

```bash
# Sync Prisma schema from actual Supabase database
pnpm db:sync

# Or manually:
npx prisma db pull
npx prisma format
npx prisma generate
```

## What This Does

1. **Introspects** your Supabase database
2. **Generates** Prisma schema from actual tables
3. **Updates** `prisma/schema.prisma` to match reality
4. **Generates** Prisma client that works with Supabase

## Before You Can Sync

You need `DATABASE_URL` set in `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require
```

## After Syncing

1. **Review** the generated schema: `git diff prisma/schema.prisma`
2. **Test** it works: `pnpm doctor`
3. **Commit** if everything looks good

## Full Documentation

See `docs/prisma-supabase-sync.md` for complete guide.

---

**Action Required**: Run `pnpm db:sync` after setting `DATABASE_URL` to ensure Prisma works with Supabase.
