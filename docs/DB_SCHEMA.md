# Nomad Database Schema

## Overview

Nomad uses PostgreSQL via Supabase with Row Level Security (RLS) enabled on all tables for data isolation.

## Tables

### `users`

Core user table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `email` | varchar(255) | Unique email address |
| `plan` | enum | Subscription plan: `free`, `premium`, `partner` |
| `preferences` | jsonb | User preferences (diet, allergens, units, theme) |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- Users can view/update own profile
- Admins (role claim) can view all users

### `households`

Family/household groups.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `owner_id` | uuid | FK to `users.id` |
| `name` | text | Household name |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- Household members can view household
- Owner can manage household

### `household_members`

Membership in households.

| Column | Type | Description |
|--------|------|-------------|
| `household_id` | uuid | FK to `households.id` |
| `user_id` | uuid | FK to `users.id` |
| `role` | enum | `owner`, `adult`, `teen`, `child` |
| `created_at` | timestamptz | Creation timestamp |

**Composite Primary Key:** `(household_id, user_id)`

**RLS Policies:**
- Members can view household members
- Owner can manage members

### `recipes`

Recipe catalog.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Recipe title |
| `media_url` | text | Image/video URL |
| `steps` | jsonb | Array of step objects |
| `ingredients` | jsonb | Array of ingredient objects |
| `macros` | jsonb | Nutritional macros |
| `tags` | text[] | Tags array |
| `source` | enum | `curated`, `partner`, `user` |
| `user_id` | uuid | FK to `users.id` (nullable, for user-created) |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Indexes:**
- `recipes_source_idx` on `source`
- `recipes_tags_idx` GIN on `tags`
- `recipes_user_id_idx` on `user_id` (partial, where user_id IS NOT NULL)

**RLS Policies:**
- Public can view `curated` and `partner` recipes
- Users can view/manage own recipes

### `meal_plans`

Daily meal plans.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `users.id` |
| `household_id` | uuid | FK to `households.id` (nullable) |
| `day` | date | Plan date |
| `items` | jsonb | Array of meal items |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Index:** `meal_plans_user_day_idx` on `(user_id, day)`

**RLS Policies:**
- Users can view own plans and household plans
- Users can manage own plans

### `grocery_lists`

Shopping lists.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `household_id` | uuid | FK to `households.id` |
| `name` | text | List name |
| `items` | jsonb | Array of grocery items |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- Household members can view/manage lists

### `health_metrics`

Health tracking data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `users.id` |
| `kind` | enum | `weight`, `sleep`, `water`, `steps`, `calories` |
| `value` | numeric | Metric value |
| `unit` | text | Unit (kg, hours, ml, steps, kcal) |
| `ts` | timestamptz | Measurement timestamp |
| `created_at` | timestamptz | Creation timestamp |

**Index:** `health_metrics_user_kind_ts_idx` on `(user_id, kind, ts)`

**RLS Policies:**
- Users can view/manage own metrics

### `rooms`

Communication rooms (family chat or DMs).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `household_id` | uuid | FK to `households.id` (nullable for DMs) |
| `kind` | enum | `family`, `dm` |
| `participants` | uuid[] | Array of user IDs |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- Participants can view/manage rooms

### `messages`

Messages in rooms.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `room_id` | uuid | FK to `rooms.id` |
| `sender_id` | uuid | FK to `users.id` |
| `body` | text | Message text |
| `attachments` | jsonb | Array of attachment objects |
| `ts` | timestamptz | Message timestamp |
| `created_at` | timestamptz | Creation timestamp |

**Index:** `messages_room_ts_idx` on `(room_id, ts)`

**RLS Policies:**
- Room participants can view messages
- Participants can send messages (sender_id must match auth user)

### `feature_flags`

Per-user feature flags.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | FK to `users.id` (primary key) |
| `flags` | jsonb | Flags object `{ flagName: boolean }` |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- Users can view own flags

### `ad_impressions`

Ad impression tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `users.id` (nullable) |
| `slot` | text | Ad slot identifier |
| `kind` | text | Ad kind |
| `ts` | timestamptz | Impression timestamp |
| `metadata` | jsonb | Additional metadata |

**RLS Policies:**
- Users can insert own impressions

### `events`

Analytics events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `users.id` (nullable) |
| `name` | text | Event name |
| `props` | jsonb | Event properties |
| `ts` | timestamptz | Event timestamp |

**Index:** `events_user_ts_idx` on `(user_id, ts)`

**RLS Policies:**
- Users can insert own events

### `api_keys`

Partner API keys (hashed).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `partner_slug` | text | Partner identifier |
| `key_hash` | text | bcrypt hash of API key |
| `scopes` | text[] | Allowed scopes |
| `created_at` | timestamptz | Creation timestamp |

### `webhook_events`

Webhook event tracking (idempotency).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `source` | text | Webhook source (`partner`, `payments`) |
| `external_id` | text | External event ID |
| `payload` | jsonb | Webhook payload |
| `processed_at` | timestamptz | Processing timestamp |
| `created_at` | timestamptz | Creation timestamp |

**Unique Constraint:** `(source, external_id)`

## Enums

- `plan`: `free`, `premium`, `partner`
- `role`: `owner`, `adult`, `teen`, `child`
- `recipe_source`: `curated`, `partner`, `user`
- `health_metric_kind`: `weight`, `sleep`, `water`, `steps`, `calories`
- `room_kind`: `family`, `dm`

## Helper Functions

### `auth.uid()`

Returns the authenticated user ID from JWT claims. Used in RLS policies:

```sql
SELECT auth.uid();
```

### `update_updated_at_column()`

Trigger function to automatically update `updated_at` timestamp.

## Migration

Run migrations using Drizzle:

```bash
pnpm db:generate  # Generate migration from schema
pnpm db:migrate   # Apply migrations
```

Or apply SQL directly:

```bash
psql $DATABASE_URL -f packages/server/db/migrations/0001_initial_schema.sql
```

## Security Notes

1. **RLS Enabled**: All tables have RLS enabled
2. **JWT Verification**: RLS policies use `auth.uid()` from JWT claims
3. **Parameterized Queries**: All queries use parameterized statements (via Drizzle)
4. **No Raw SQL**: Avoid raw SQL concatenation; use Drizzle ORM

## Data Retention

- Analytics events: 90 days (configurable)
- Health metrics: Indefinite (GDPR-compliant deletion available)
- Meal plans: Indefinite
- Messages: Indefinite (household owner can delete)

## Backup & Recovery

- Automated daily backups (Supabase managed)
- Point-in-time recovery available
- Test restore procedure: `dr:validate` script
