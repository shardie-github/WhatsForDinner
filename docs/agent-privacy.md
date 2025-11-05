# Agent Layer — Privacy & Explainability

## Overview
The ORG3XTRATE-AGENT system provides pattern detection and workflow recommendations based on user behavior signals, with privacy-first design principles.

## Privacy Principles

### Consent
- Signals collection requires explicit opt-in (functional/analytics).
- Users must grant consent before any event tracking begins.
- Consent can be revoked at any time via settings.

### Scope
- Only in-app behavioral metadata is collected.
- No keylogging or cross-app surveillance.
- No personal content (messages, documents) is captured.
- Only interaction patterns (clicks, page views, errors) are tracked.

### Storage
- PII tied to `auth.users` id only.
- User-only Row Level Security (RLS) policies.
- Data deletion available via Data Subject Request (DSR) endpoint.

### Explainability
- Each suggestion includes key signals used ("Why" line).
- Rationale shows which behavioral patterns triggered the recommendation.
- Users can see what data was used to generate each suggestion.

### Opt-out
- Switch off in settings.
- Stops all data flow immediately.
- Clears local caches.
- Existing data can be deleted via DSR.

## Data Flow

1. **Collection**: Client-side events tracked via `lib/agent/events.ts`
2. **Ingestion**: Events sent to Supabase Edge Function `ingest-events`
3. **Processing**: Signals computed via `lib/agent/feature-extract.ts`
4. **Recommendations**: Generated via `lib/agent/recommender.ts`
5. **Display**: Suggestions shown in `SuggestionsDrawer` component

## GDPR/PIPEDA Compliance

- Right to access: Users can view their collected signals
- Right to deletion: DSR endpoint available
- Right to rectification: Users can correct session metadata
- Data minimization: Only necessary signals collected
- Purpose limitation: Data used only for recommendations

## Security

- Least-privilege database policies
- Rate limiting on ingestion endpoints
- Kill-switch flags for emergency disable
- Edge function authentication required
