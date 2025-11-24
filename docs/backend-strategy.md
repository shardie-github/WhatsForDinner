# Backend Strategy

**Last Updated:** 2025-01-28  
**Status:** ✅ Canonical Strategy Documented

---

## Executive Summary

**Canonical Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)  
**ORM:** Prisma (for type-safe database access)  
**API Layer:** Next.js API routes + Supabase Edge Functions  
**Migration Tool:** Supabase CLI (native SQL migrations)

This is a **BaaS-first architecture** optimized for:
- ✅ Low operational overhead
- ✅ Cost-effective scaling (Supabase free tier → paid tiers)
- ✅ CI-first deployment (no local CLI requirements)
- ✅ Type safety (Prisma + TypeScript)

---

## Why Supabase?

### Cost Analysis

**Supabase Free Tier:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests
- Auth, Realtime, Storage included

**Cost at Scale:**
- Pro tier: $25/month (8GB DB, 100GB storage)
- Team tier: $599/month (32GB DB, 500GB storage)
- Enterprise: Custom pricing

**Comparison:**
- Self-hosted Postgres: Requires server management, backups, scaling
- Firebase: More expensive, vendor lock-in
- PlanetScale: Serverless Postgres, but no built-in auth/storage

**Verdict:** Supabase provides the best balance of features, cost, and developer experience for this use case.

### Feature Set

✅ **PostgreSQL** - Full SQL database  
✅ **Auth** - Email/password, OAuth, MFA  
✅ **Storage** - File uploads with CDN  
✅ **Realtime** - PostgreSQL subscriptions  
✅ **Edge Functions** - Serverless functions (Deno)  
✅ **Row-Level Security** - Database-level access control  
✅ **API Auto-generation** - REST and GraphQL APIs  

All of these are **included** in a single platform, reducing operational complexity.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│  (Next.js Web App, React Native Mobile, API Clients)   │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Next.js API      │  │ Supabase Edge Functions  │   │
│  │ Routes           │  │ (Deno)                    │   │
│  │ (/api/*)         │  │                           │   │
│  └──────────────────┘  └──────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase Platform                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ PostgreSQL   │  │ Auth         │  │ Storage      │ │
│  │ Database     │  │ (JWT)        │  │ (S3-like)    │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ Realtime     │  │ Edge         │                   │
│  │ (WebSockets) │  │ Functions    │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## Database Strategy

### PostgreSQL via Supabase

**Why PostgreSQL?**
- Relational data model fits meal planning (users, households, recipes, meal plans)
- ACID compliance for data integrity
- Rich query capabilities (JSONB, full-text search, aggregations)
- Row-Level Security (RLS) for multi-tenant data isolation

### Schema Management

**Current Approach:**
- **Migrations:** Supabase-native SQL migrations (`supabase/migrations/`)
- **Master Migration:** `99999999999999_master_consolidated_schema.sql`
  - Single consolidated migration for fresh databases
  - Idempotent (uses `IF NOT EXISTS`)
  - Contains all tables, enums, indexes, RLS policies, functions

**Prisma Integration:**
- **Schema:** `prisma/schema.prisma` (generated from Supabase schema)
- **Purpose:** Type-safe database access in application code
- **Client Generation:** `prisma generate` (WASM engine for Termux compatibility)
- **Note:** Prisma is **not** used for migrations (Supabase handles migrations)

**Why This Dual Approach?**
- Supabase migrations: Native SQL, better for complex RLS policies, functions, triggers
- Prisma: Type generation, better DX for application code, autocomplete

### Migration Workflow

**Local Development:**
```bash
# Link to Supabase project (one-time)
supabase link --project-ref <project-ref>

# Apply migrations
supabase migration up
```

**CI/CD:**
- Workflow: `.github/workflows/supabase-migrate.yml`
- Triggers: Push to `main`, manual dispatch
- Steps:
  1. Login to Supabase (`supabase login --token`)
  2. Link project (`supabase link --project-ref`)
  3. Apply migrations (`supabase migration up`)

**Secrets Required:**
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI authentication
- `SUPABASE_PROJECT_REF` - Project reference ID

### Row-Level Security (RLS)

**Strategy:** Database-level access control via RLS policies

**Benefits:**
- Security enforced at database level (can't be bypassed)
- Multi-tenant data isolation
- Fine-grained access control (per table, per user)

**Example Policy:**
```sql
-- Users can only read their own meal plans
CREATE POLICY "Users can read own meal plans"
ON meal_plans FOR SELECT
USING (auth.uid() = user_id);
```

---

## API Layer Strategy

### Next.js API Routes

**Location:** `apps/web/app/api/`

**Use Cases:**
- Server-side logic that needs Node.js ecosystem
- Integration with third-party APIs (OpenAI, Stripe, etc.)
- Custom business logic

**Example:**
```typescript
// apps/web/app/api/generate-meal/route.ts
export async function POST(request: Request) {
  const { ingredients } = await request.json();
  // Use OpenAI API
  const meal = await generateMeal(ingredients);
  return Response.json(meal);
}
```

### Supabase Edge Functions

**Location:** `supabase/functions/`

**Use Cases:**
- Background job processing
- Serverless functions (Deno runtime)
- Functions that need direct database access

**Example:**
```typescript
// supabase/functions/generate-meal/index.ts
Deno.serve(async (req) => {
  const { ingredients } = await req.json();
  // Direct Supabase client access
  const { data } = await supabase.from('recipes').select('*');
  return new Response(JSON.stringify(data));
});
```

**Deployment:**
- Via Supabase CLI: `supabase functions deploy`
- Or via GitHub Actions (if configured)

---

## Authentication Strategy

### Supabase Auth

**Methods:**
- Email/password
- OAuth (GitHub, Google)
- Magic links
- MFA (Multi-Factor Authentication)

**Session Management:**
- JWT tokens (short-lived access tokens + refresh tokens)
- Server-side session handling via Supabase SSR helpers
- Client-side session management via `@supabase/ssr`

**Integration:**
```typescript
// Server Component
import { createClient } from '@supabase/ssr';

const supabase = createClient(cookies());
const { data: { user } } = await supabase.auth.getUser();
```

---

## Storage Strategy

### Supabase Storage

**Buckets:**
- `public` - Public uploads (recipe images, avatars)
- `artifacts` - Private artifacts (DSAR exports, backups)
- `evidence` - Immutable evidence (compliance)

**Access Control:**
- Bucket-level policies
- File-level policies (via RLS)

**CDN:**
- Automatic CDN via Supabase
- Image optimization available

---

## Scaling Considerations

### Current Scale (Free Tier)
- Suitable for: Development, small production (< 1000 users)
- Database: 500MB
- Storage: 1GB
- Bandwidth: 2GB/month

### Scaling Path

**Stage 1: Pro Tier ($25/month)**
- Database: 8GB
- Storage: 100GB
- Bandwidth: 250GB/month
- **When:** ~1000-5000 active users

**Stage 2: Team Tier ($599/month)**
- Database: 32GB
- Storage: 500GB
- Bandwidth: 1TB/month
- **When:** ~5000-50000 active users

**Stage 3: Enterprise (Custom)**
- Custom database size
- Custom storage
- Custom bandwidth
- **When:** > 50000 active users

### Migration Path (If Needed)

**If Supabase becomes limiting:**
1. **Self-hosted Postgres:**
   - Migrate schema to self-hosted Postgres
   - Replace Supabase Auth with custom auth (NextAuth.js, Clerk)
   - Replace Supabase Storage with S3/Cloudflare R2
   - Replace Realtime with custom WebSocket server

2. **Alternative BaaS:**
   - Firebase (if NoSQL is acceptable)
   - PlanetScale (if serverless Postgres is needed)
   - Neon (if serverless Postgres is needed)

**Migration Effort:** High (requires rewriting auth, storage, realtime)

**Recommendation:** Stay on Supabase unless hitting hard limits (cost or features)

---

## Cost Optimization

### Current Costs
- **Development:** Free (Supabase free tier)
- **Production:** Free → $25/month (Pro tier when needed)

### Cost-Saving Strategies

1. **Database Optimization**
   - Use indexes efficiently
   - Archive old data (retention policies)
   - Use JSONB for flexible schemas (avoid over-normalization)

2. **Storage Optimization**
   - Compress images before upload
   - Use CDN for static assets
   - Archive old files to cheaper storage

3. **API Optimization**
   - Cache frequently accessed data
   - Use database functions for complex queries (reduces round trips)
   - Batch API requests where possible

4. **Bandwidth Optimization**
   - Use image optimization (WebP/AVIF)
   - Enable compression (gzip/brotli)
   - Use CDN for static assets

---

## Security Considerations

### Database Security
- ✅ Row-Level Security (RLS) policies enforced
- ✅ Service role key kept secret (server-only)
- ✅ Anon key is public (but restricted via RLS)

### API Security
- ✅ Environment variables for secrets
- ✅ Rate limiting (via Supabase or Vercel)
- ✅ CORS configured
- ✅ Input validation (Zod schemas)

### Authentication Security
- ✅ JWT tokens (short-lived)
- ✅ Refresh token rotation
- ✅ MFA support
- ✅ Session management via Supabase

---

## Monitoring & Observability

### Database Monitoring
- Supabase Dashboard (built-in)
- Query performance insights
- Connection pooling metrics

### Application Monitoring
- Sentry (error tracking)
- Custom logging (structured logs)
- Performance monitoring (Web Vitals)

### Infrastructure Monitoring
- Vercel Analytics (web app)
- Supabase Metrics (database, API)

---

## Backup & Disaster Recovery

### Supabase Backups
- **Automatic:** Daily backups (Pro tier+)
- **Manual:** Via Supabase Dashboard
- **Point-in-Time Recovery:** Available on Pro tier+

### Custom Backup Strategy
- Scripts exist: `scripts/backup-run.ts`
- Backup to S3/Cloudflare R2
- Encryption: `BACKUP_ENCRYPTION_KEY`

### Disaster Recovery Plan
- Restore from Supabase backups
- Or restore from custom backups
- Runbook: `docs/runbooks/restore.md`

---

## Future Considerations

### Potential Enhancements

1. **Read Replicas**
   - For high read traffic
   - Available on Team tier+

2. **Edge Functions Expansion**
   - More serverless functions
   - Background job processing

3. **GraphQL API**
   - Supabase supports GraphQL
   - Consider if REST becomes limiting

4. **Multi-Region**
   - Supabase supports multi-region (Enterprise)
   - Consider for global scale

---

## Conclusion

**Current Strategy:** ✅ Supabase + Prisma is the right choice for this application.

**Rationale:**
- Low operational overhead
- Cost-effective scaling path
- Comprehensive feature set (Auth, Storage, Realtime)
- CI-first deployment (no local CLI requirements)
- Type safety (Prisma + TypeScript)

**Next Steps:**
1. ✅ Document this strategy (done)
2. ✅ Normalize migrations workflow (in progress)
3. ✅ Add schema validation script
4. Monitor costs as scale increases
5. Consider Pro tier when hitting free tier limits

**No changes needed** unless hitting hard limits (cost or features).
