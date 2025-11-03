# Nomad

A production-ready meal planner, health tracker, cooking inspiration, and family communication platform.

## Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Mobile**: Expo + React Native
- **Web**: Next.js 14 (App Router)
- **State**: Zustand + React Query
- **Styling**: Tailwind (web) + NativeWind (mobile)
- **Type Safety**: TypeScript + Zod

## Quick Start

### Prerequisites

- Node.js 18-20
- pnpm 8+
- For mobile: Expo CLI, Xcode (iOS), Android Studio (Android)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev:web      # Web app (http://localhost:3000)
pnpm dev:mobile   # Mobile app (Expo)
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in required environment variables:
   - `API_BASE_URL`: Your API endpoint
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_ANON_KEY`: Supabase anon key
   - Analytics keys (PostHog, Segment)
   - Ad keys (AdMob, GPT)

### Doctor Script

Check your environment setup:

```bash
pnpm doctor
```

## Project Structure

```
nomad/
??? apps/
?   ??? mobile/          # Expo app
?   ??? web/             # Next.js app
??? packages/
?   ??? config/          # Feature flags, themes
?   ??? data/            # Types, API client, sync
?   ??? adapters/        # Ads, analytics, auth, partners
?   ??? analytics/       # Event catalog, governance
?   ??? i18n/            # Internationalization
?   ??? ui/              # Shared UI components
?   ??? testing/         # Test configurations
?   ??? eslint-config/   # Shared ESLint rules
??? tools/
?   ??? scripts/         # Doctor, seed, etc.
??? docs/                # Documentation
```

## Development

### Run All Apps

```bash
pnpm dev
```

### Run Specific App

```bash
pnpm dev:web      # Web
pnpm dev:mobile   # Mobile
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test              # Unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

### Lint

```bash
pnpm lint
pnpm lint:fix
```

### Type Check

```bash
pnpm type-check
```

## Features

### Core
- ? Meal planning with drag & drop
- ? Health metrics tracking
- ? Grocery list management
- ? Recipe browsing
- ? Family communication
- ? Offline-first architecture

### Premium
- ? No ads
- ? AI meal generation
- ? Seasonal themes
- ? Offline recipe media
- ? Wearable sync

### Partner Integrations
- Instacart
- Walmart

## Mobile App

### Setup

```bash
cd apps/mobile
pnpm install
```

### Run

```bash
pnpm dev
```

### Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Deep Links

- Format: `nomad://screen/params`
- Examples:
  - `nomad://subscribe`
  - `nomad://family/invite`
  - `nomad://inspire?filter=seasonal`

## Web App

### Setup

```bash
cd apps/web
pnpm install
```

### Run

```bash
pnpm dev
```

### Build

```bash
pnpm build
pnpm start
```

### PWA

The web app includes PWA support:
- Service worker for offline caching
- Web manifest
- Installable on mobile devices

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
# Mobile (Detox)
cd apps/mobile
detox test

# Web (Playwright)
cd apps/web
pnpm test:e2e
```

## CI/CD

GitHub Actions workflows:
- `ci.yml`: Typecheck, lint, test, build
- `release.yml`: Mobile builds, GitHub releases

## Environment Variables

See `.env.example` for all required variables.

### Required
- `API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Optional
- Analytics: `POSTHOG_KEY`, `SEGMENT_WRITE_KEY`
- Ads: `ADMOB_ANDROID_APP_ID`, `ADMOB_IOS_APP_ID`, `WEB_AD_TAG_PUBLISHER_ID`
- Partners: `INSTACART_API_KEY`, `WALMART_API_KEY`

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Security & Privacy](./docs/SECURITY_PRIVACY.md)
- [Store Readiness](./docs/STORE_READINESS.md)

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and lint
4. Submit PR

## License

Proprietary - All rights reserved
