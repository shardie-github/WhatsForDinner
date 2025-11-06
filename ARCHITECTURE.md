# Architecture

## Overview

This is a universal app monorepo built with:
- Expo SDK 52 for mobile (iOS/Android)
- Next.js 15 for web (PWA)
- Turborepo for monorepo management
- Supabase for backend services
- Vercel for deployment

## Project Structure

```
whats-for-dinner/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── web/             # Next.js 15 PWA
├── packages/
│   ├── ui/              # Shared UI components
│   ├── utils/           # Shared utilities
│   ├── theme/           # Design system
│   └── config/          # Shared configurations
├── scripts/             # Automation scripts
├── ops/                 # Operations framework
└── docs/                # Documentation
```

## Key Components

### Self-Operating Production Framework
- Automated health checks
- Secrets management
- Database migrations
- Deployment automation
- Monitoring and observability

### Security
- Row Level Security (RLS) on all tables
- Encrypted secrets vault
- Automated security scanning
- Compliance checks

### Performance
- Code splitting
- Lazy loading
- Bundle optimization
- Performance budgets

## Technology Stack

- **Frontend**: React, Next.js, React Native, Expo
- **Styling**: Tailwind CSS, NativeWind
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (web), EAS Build (mobile)
- **CI/CD**: GitHub Actions
- **Monitoring**: OpenTelemetry, Prometheus

## Data Flow

1. User interacts with app (mobile/web)
2. App calls Supabase APIs
3. RLS policies enforce security
4. Data stored in PostgreSQL
5. Analytics collected
6. Real-time updates via Supabase Realtime

## Deployment Architecture

- **Web**: Vercel → Edge Network → Global CDN
- **Mobile**: EAS Build → App Stores
- **Database**: Supabase → Managed PostgreSQL
- **Secrets**: Supabase Vault + Vercel Env Vars
