# Database Schema Overview

## Core Tables

### User & Authentication
- `users` - Core user accounts (id, email, plan, preferences)
- `households` - Family/household groups
- `household_members` - User-household relationships with roles
- `rooms` - Chat rooms (family or DM)
- `messages` - Chat messages

### Recipes & Meal Planning
- `recipes` - Recipe catalog (title, steps, ingredients, macros, tags, source)
- `meal_plans` - User meal plans by day
- `grocery_lists` - Shopping lists per household
- `meal_prefs` - User meal preferences (cuisines, diet, allergies, cook_time)

### Health & Wellness
- `health_metrics` - User health tracking (weight, sleep, water, steps, calories)
- `nutrition_logs` - Nutrition tracking

### Growth & Referrals
- `email_subscriptions` - Email marketing subscriptions
- `referral_programs` - Referral program definitions
- `referral_codes` - User referral codes
- `referrals` - Referral tracking (referrer/referee relationships)
- `referral_rewards` - Referral reward tracking
- `affiliates` - Affiliate program participants
- `affiliate_conversions` - Affiliate conversion tracking
- `partners` - Partner program (enterprise partners)
- `partner_revenue_shares` - Partner revenue share tracking

### Privacy & Monitoring
- `privacy_prefs` - User privacy preferences
- `app_allowlist` - App monitoring allowlist
- `signal_toggles` - Granular telemetry controls
- `telemetry_events` - User telemetry events (encrypted)
- `privacy_transparency_log` - Immutable privacy action log
- `mfa_enforced_sessions` - MFA session tracking

### Compliance & RegTech
- `dsar_requests` - Data Subject Access Requests (GDPR/CCPA)
- `dsar_artifacts` - DSAR export artifacts
- `processing_activities` - GDPR processing activities register
- `risk_register` - Risk management register
- `controls` - Security controls monitoring
- `control_evidence` - Control evidence/attestations
- `vendor_catalog` - Vendor risk management
- `dpia_records` - Data Protection Impact Assessments
- `legal_hold` - Legal hold records
- `regulatory_reports` - Regulatory reporting

### Billing & Subscriptions
- `subscriptions` - User subscriptions
- `invoices` - Billing invoices
- `refunds` - Refund tracking
- `tax_calculations` - Multi-region tax calculations

### Support
- `support_tickets` - Customer support tickets
- `support_ticket_messages` - Ticket conversation threads

### Account Management
- `account_deletions` - Account deletion audit log

### Analytics & Events
- `events` - General event tracking
- `analytics_events` - Analytics events
- `recipe_metrics` - Recipe performance metrics
- `recipe_feedback` - Recipe user feedback
- `lifecycle_events` - User lifecycle tracking
- `journey_states` - User journey orchestration state

### Experiments & Pricing
- `experiments` - A/B test experiments
- `experiment_variants` - Experiment variants
- `experiment_assignments` - User experiment assignments
- `pricing_rules` - Dynamic pricing rules
- `promo_offers` - Promotional offers

### Feature Flags
- `feature_flags` - User feature flags (JSON)
- `config_flags` - System-wide feature flags
- `flag_audit_log` - Flag change audit log

### Gamification
- `user_streaks` - User activity streaks
- `user_badges` - User badge achievements
- `user_credits` - User credit balance
- `credit_transactions` - Credit transaction history
- `leaderboard_entries` - Leaderboard rankings

### Collections & Sharing
- `recipe_collections` - Recipe collections/packs
- `collection_purchases` - Collection purchase tracking
- `recipe_shares` - Recipe sharing tracking
- `share_rewards` - Share reward tracking

### Admin & System
- `admin_users` - Admin user accounts
- `admin_sessions` - Admin session tracking
- `admin_audit_logs` - Admin action audit log
- `system_logs` - System logs
- `audit_log` - User-facing audit log

### Knowledge Base
- `knowledge_base_articles` - KB articles
- `knowledge_base_categories` - KB categories
- `chat_conversations` - Support chat conversations
- `chat_messages` - Chat message threads
- `article_feedback` - Article feedback
- `article_views` - Article view tracking
- `search_queries` - Search query tracking

### API & Integrations
- `api_keys` - Partner API keys
- `webhook_events` - Webhook event tracking
- `federated_api_endpoints` - Federated API endpoints
- `api_usage_tracking` - API usage tracking

### Multi-Tenant (if used)
- `tenants` - Tenant organizations
- `tenant_memberships` - User-tenant relationships
- `tenant_invites` - Tenant invitation tracking

### Job Queue
- `jobs_queue` - Background job queue
- `job_results` - Job execution results
- `job_logs` - Job execution logs

## Key Enums

- `plan`: 'free', 'premium', 'partner'
- `role`: 'owner', 'adult', 'teen', 'child'
- `recipe_source`: 'curated', 'partner', 'user'
- `health_metric_kind`: 'weight', 'sleep', 'water', 'steps', 'calories'
- `room_kind`: 'family', 'dm'
- `email_subscription_status`: 'subscribed', 'unsubscribed', 'bounced'
- `referral_status`: 'clicked', 'signed_up', 'converted'
- `dsar_request_type`: 'export', 'erase', 'restrict', 'rectify'
- `dsar_request_status`: 'received', 'verifying', 'in_progress', 'complete', 'rejected'

## Key Functions

- `auth.uid()` - Helper for Supabase auth compatibility
- `update_updated_at_column()` - Trigger function for updated_at timestamps
- `user_belongs_to_tenant()` - Check tenant membership
- `get_user_tenants()` - Get user's tenant IDs
- `is_admin()` - Check if user is admin
- `encrypt_telemetry_payload()` - Encrypt telemetry data
- `log_privacy_action()` - Log privacy actions
- `generate_referral_code()` - Generate unique referral codes
- `calculate_referral_reward()` - Calculate referral rewards
- `generate_invoice_number()` - Generate invoice numbers

## RLS Policies

All tables have Row Level Security enabled. Policies follow these patterns:

1. **User-owned data**: Users can only access their own rows (`auth.uid() = user_id`)
2. **Household-shared data**: Household members can access shared data
3. **Public data**: Some tables allow public read (e.g., curated recipes, active promo offers)
4. **Admin access**: Admin users can access all data via role checks
5. **Service role**: Service role bypasses RLS for system operations
6. **Zero-trust privacy tables**: Privacy tables (telemetry, privacy_prefs) have strict user-only access

## Indexes

Key indexes for performance:
- User ID indexes on most user-related tables
- Foreign key indexes
- Composite indexes for common query patterns (e.g., `meal_plans_user_day_idx`)
- GIN indexes for JSONB and array columns
- Timestamp indexes for time-series queries

## Migration Files

All migrations are in `supabase/migrations/`. The master consolidated migration is:
- `99999999999999_master_consolidated_schema.sql`

Legacy migrations are archived in `supabase/migrations_archive/`.
