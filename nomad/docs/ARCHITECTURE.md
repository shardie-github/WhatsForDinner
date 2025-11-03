# Nomad Architecture

## Overview

Nomad is a production-ready monorepo for meal planning, health tracking, cooking inspiration, and family communication.

## Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Mobile**: Expo + React Native
- **Web**: Next.js 14 (App Router)
- **State**: Zustand (global), React Query (server sync)
- **Styling**: Tailwind (web), NativeWind (mobile)
- **Type Safety**: TypeScript with Zod schemas

## Package Structure

### `packages/config`
Feature flags, theme tokens, house ads configuration.

### `packages/data`
Type definitions, Zod schemas, API client, query keys, offline sync.

### `packages/adapters`
Adapters for:
- **Ads**: AdMob (mobile), GPT (web), house ads fallback
- **Analytics**: PostHog, Segment, Noop
- **Auth**: Supabase, OAuth (Google/Apple)
- **Partners**: Instacart, Walmart integrations
- **Wearables**: Google Fit, Apple HealthKit

### `packages/analytics`
Event catalog, governance, PII sanitization, consent management.

### `packages/i18n`
i18next setup with locale files (en, fr, ar), RTL support.

### `packages/ui`
Shared UI components: AdSlot, Button, Card, etc.

### `packages/testing`
Vitest, Detox (mobile), Playwright (web) configurations.

## Apps

### `apps/mobile`
Expo app with:
- Expo Router for navigation
- Tab-based layout
- Screens: Dashboard, Planner, Grocery, Inspire, Family, Settings
- Background sync with Expo Task Manager
- Push notifications
- Deep linking (`nomad://`)

### `apps/web`
Next.js 14 app with:
- App Router
- Server components
- Middleware for auth
- PWA support
- SEO optimization

## Data Flow

1. **Client** ? React Query ? API Client ? Backend
2. **Offline**: AsyncStorage (mobile) / IndexedDB (web)
3. **Background Sync**: Expo Task Manager processes queue
4. **Conflict Resolution**: Server-wins for immutable, CRDT merge for lists

## Security

- Tokens: SecureStore (mobile), httpOnly cookies (web)
- CSRF protection on mutations
- PII boundaries in analytics
- Consent gates before tracking
- No medical device claims

## Performance

- Code splitting
- Image optimization
- List virtualization
- Query caching
- Ad preloading to prevent CLS

## Accessibility

- WCAG 2.2 AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Dynamic text sizing
