# Data Flows

## Overview

This document describes data flows through the "What's for Dinner" application, including PII classification and data retention policies.

---

## PII Classification

### Classification Levels

- **None**: No personally identifiable information
- **Low**: Minimal PII, pseudonymous identifiers (user IDs, session IDs)
- **Medium**: Contains user identifiers but not sensitive data (email in analytics context)
- **High**: Contains sensitive PII (emails, addresses, payment info)
- **Identifier**: Technical identifier (UUID, ID) that can be linked to user
- **Device Info**: Device/browser information
- **Behavioral**: User behavior data

---

## Data Flow: Recipe Generation

### Flow

1. **User Input**: User submits pantry items via `/api/dinner`
   - **Data**: `ingredients[]` (string array)
   - **PII Class**: None

2. **API Processing**: Server processes request
   - **Data**: User ID, session ID, ingredients
   - **PII Class**: Low (user identifiers)

3. **OpenAI API Call**: Recipe generation
   - **Data**: Ingredients, user preferences (from DB)
   - **PII Class**: Low (preferences are behavioral, not PII)

4. **Recipe Storage**: Store in `recipes` table
   - **Data**: Recipe details (title, ingredients, instructions, calories, cook_time)
   - **PII Class**: Low (linked via user_id)

5. **Metrics Logging**: Log to `recipe_metrics`
   - **Data**: Recipe ID, user ID, API latency, model used
   - **PII Class**: Low

6. **Analytics Event**: Track `recipe_generated` event
   - **Data**: Recipe ID, ingredients count, latency, model
   - **PII Class**: Low

### Retention

- **Recipes**: Retained while user account active
- **Metrics**: 24 months
- **Analytics Events**: 24 months

---

## Data Flow: User Authentication

### Flow

1. **User Signup**: User registers via Supabase Auth
   - **Data**: Email, password (hashed)
   - **PII Class**: High (email is PII)

2. **Profile Creation**: Create profile in `profiles` table
   - **Data**: User ID, name (optional), preferences
   - **PII Class**: Medium (name is PII if provided)

3. **Tenant Creation**: Create tenant in `tenants` table (if new organization)
   - **Data**: Tenant ID, name, plan
   - **PII Class**: Low (organization name, not individual)

4. **Session Creation**: Supabase creates session
   - **Data**: Session token, user ID
   - **PII Class**: Low (session token is identifier)

5. **Analytics Event**: Track `user_signed_up` event
   - **Data**: Signup method, tenant ID
   - **PII Class**: Medium

### Retention

- **User Accounts**: Retained while active
- **Sessions**: 30 days
- **Analytics Events**: 12 months (contains user ID)

---

## Data Flow: Subscription Purchase

### Flow

1. **Checkout Initiation**: User selects plan, calls `/api/billing/checkout`
   - **Data**: Plan type, user ID
   - **PII Class**: Low

2. **Stripe Checkout**: Redirect to Stripe
   - **Data**: Email, payment info (handled by Stripe)
   - **PII Class**: High (payment data in Stripe, not our system)

3. **Webhook Processing**: Stripe webhook to `/api/stripe/webhook`
   - **Data**: Stripe customer ID, subscription ID, plan, status
   - **PII Class**: Medium (Stripe IDs are identifiers)

4. **Subscription Storage**: Store in `subscriptions` table
   - **Data**: User ID, tenant ID, Stripe IDs, plan, status
   - **PII Class**: Medium

5. **Tenant Update**: Update tenant plan in `tenants` table
   - **Data**: Plan, status
   - **PII Class**: Low

6. **Analytics Event**: Track `subscription_started` event
   - **Data**: Plan, Stripe customer ID
   - **PII Class**: Medium

### Retention

- **Subscriptions**: Retained while active, 7 years for tax purposes if cancelled
- **Stripe Data**: Managed by Stripe (PCI compliance)
- **Analytics Events**: 12 months

---

## Data Flow: Analytics Events

### Flow

1. **Client-Side Event**: User action triggers event
   - **Data**: Event type, properties, session ID
   - **PII Class**: Varies by event (see event catalog)

2. **Event Tracking**: `analytics.trackEvent()` called
   - **Data**: Adds user ID, timestamp, page URL, user agent
   - **PII Class**: Low to Medium (depends on event)

3. **Storage**: Store in `analytics_events` table
   - **Data**: Event type, user ID, session ID, properties, timestamp
   - **PII Class**: Low to Medium

4. **Aggregation**: Queries aggregate events for metrics
   - **Data**: Aggregated metrics (counts, averages)
   - **PII Class**: None (aggregated data)

### Retention

- **Raw Events**: 24 months (default), 12 months (with PII), 6 months (high PII)
- **Aggregated Metrics**: Indefinite (no PII)

---

## Data Flow: Error Tracking

### Flow

1. **Error Occurrence**: Application error caught
   - **Data**: Error message, stack trace, context
   - **PII Class**: Low (may contain user IDs)

2. **Error Logging**: Log to `logs` table
   - **Data**: Error level, message, stack trace, user ID, session ID
   - **PII Class**: Low

3. **Error Report**: Create entry in `error_reports` table
   - **Data**: Error type, message, stack trace, user ID, context
   - **PII Class**: Low

4. **Sentry Integration**: Send to Sentry
   - **Data**: Same as error report
   - **PII Class**: Low (Sentry handles PII redaction)

### Retention

- **Logs**: 30 days (info/warn), 90 days (error/fatal)
- **Error Reports**: 90 days (unresolved), 30 days (resolved)

---

## Data Flow: Recipe Feedback

### Flow

1. **User Feedback**: User provides feedback on recipe
   - **Data**: Recipe ID, feedback type (thumbs up/down/rating), score, text
   - **PII Class**: Low

2. **Storage**: Store in `recipe_feedback` table
   - **Data**: Recipe ID, user ID, feedback type, score, text, timestamp
   - **PII Class**: Low

3. **Aggregation**: Aggregate feedback for recipe metrics
   - **Data**: Average rating, feedback counts
   - **PII Class**: None (aggregated)

### Retention

- **Feedback Records**: 24 months
- **Aggregated Metrics**: Indefinite

---

## External Data Sharing

### Stripe

- **Data Shared**: Payment information, subscription status
- **Purpose**: Payment processing
- **PII Class**: High (managed by Stripe)
- **Retention**: Per Stripe's policies

### OpenAI

- **Data Shared**: Ingredients, preferences (for recipe generation)
- **Purpose**: AI-powered recipe generation
- **PII Class**: Low (preferences are behavioral, not PII)
- **Retention**: Per OpenAI's policies (data not stored by OpenAI per API terms)

### Sentry

- **Data Shared**: Error logs, stack traces
- **Purpose**: Error monitoring
- **PII Class**: Low (user IDs may be included)
- **Retention**: Per Sentry's policies

### PostHog

- **Data Shared**: Analytics events
- **Purpose**: Product analytics
- **PII Class**: Low (user IDs may be included)
- **Retention**: Per PostHog's policies

---

## Data Retention Policies

### Summary

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| User Accounts | While active + 30 days after deletion | Account management |
| Recipes | While account active | Core feature |
| Analytics Events | 24 months (default), 12 months (with PII), 6 months (high PII) | Analytics, legal |
| Error Logs | 30 days (info/warn), 90 days (error/fatal) | Debugging, compliance |
| Subscriptions | 7 years after cancellation | Tax compliance |
| Sessions | 30 days | Security |

---

## Data Deletion

### User Data Deletion (GDPR)

Users can request data deletion:

1. Delete user account ? Cascades to:
   - Profile (soft delete or anonymize)
   - Recipes (anonymize or delete)
   - Analytics events (anonymize user_id)
   - Error reports (anonymize user_id)

2. Retention Override:
   - Some data must be retained for legal reasons (subscriptions for tax)
   - Data is anonymized rather than deleted

### Automated Deletion

- **Stale Sessions**: Deleted after 30 days
- **Old Analytics**: Deleted per retention policy
- **Resolved Errors**: Deleted after 30 days

---

## Data Security

### Encryption

- **At Rest**: Supabase encrypts data at rest
- **In Transit**: HTTPS/TLS for all connections
- **Passwords**: Hashed by Supabase Auth (bcrypt)

### Access Control

- **RLS Policies**: Row-level security enforces tenant isolation
- **API Keys**: Service role key only on server, never exposed
- **Environment Variables**: Secrets stored in Vercel, never committed

---

*Last updated: 2025-01-21*
