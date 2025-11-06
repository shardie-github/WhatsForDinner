# What's for Dinner? - Universal App Monorepo

A production-ready universal app built with Expo SDK 52, Next.js 15, NativeWind, and Turborepo for iOS, Android, and Web (PWA).

## 🚀 Features

- **Universal App**: Single codebase for iOS, Android, and Web
- **Modern Stack**: Expo SDK 52, Next.js 15, React 18, TypeScript
- **Styling**: NativeWind + Tailwind CSS for consistent design
- **Monorepo**: Turborepo with shared packages
- **PWA Support**: Offline-capable web app
- **CI/CD**: GitHub Actions with automated builds and deployments
- **Cross-Platform**: Shared UI components and business logic
- **Self-Operating Production Framework**: Fully automated ops with minimal human input

## 🎯 Self-Operating Production Framework

This repository includes a comprehensive self-operating production framework that is secure, observable, monetizable, testable, and deploy-ready.

### Master Orchestrator CLI

Run `npm run ops` to access the master orchestrator:

```bash
# Initialize ops framework
npm run ops init

# Run all health checks
npm run ops doctor

# Run validation checks
npm run ops check

# Release with semantic versioning
npm run ops release [patch|minor|major] [--dry-run]

# Database snapshots
npm run ops snapshot [description]
npm run ops restore <snapshot-id>

# Secrets management
npm run ops rotate-secrets

# RLS audit and enforcement
npm run ops sb-guard

# E2E tests
npm run ops test:e2e

# Performance benchmarks
npm run ops benchmark

# Auto-fix linting
npm run ops lintfix

# Generate documentation
npm run ops docs

# Generate changelog
npm run ops changelog
```

### 🗓 Ops Schedule

**Daily:**
- `ops doctor` → check reports → fix → release if green

**Weekly:**
- `ops release` + growth report + rotate secrets

**Monthly:**
- DR rehearsal + deps update + red-team sweep

### Key Components

1. **Reality Suite** - E2E tests + synthetic monitors hitting prod endpoints hourly
2. **Secrets Regimen** - Automated 20-day rotation with Supabase + Vercel sync
3. **RLS Enforcer** - Scans all Supabase tables/views, generates audit reports
4. **Migration Safety** - Shadow migrations + snapshot/restore with encryption
5. **Observability Suite** - OpenTelemetry tracing + p95 latency/error/cost metrics
6. **Performance Budgets** - Lighthouse CI + bundle analyzer (LCP < 2.5s, CLS < 0.1, TBT < 300ms, JS < 170KB)
7. **Release Train** - Semantic versioning + CHANGELOG + Vercel immutable deploys
8. **DR Playbook** - Quarterly CI rehearsal with automated RTO/RPO measurement
9. **Growth Engine** - UTM tracking + cohort/LTV analysis + weekly reports
10. **Compliance Guard** - DSAR endpoints + cookie consent + log redaction
11. **AI Agent Guardrails** - Schema validation + timeouts + retries + circuit breaker
12. **Offers & Paywalls** - Feature-flagged pricing + A/B framework
13. **Internationalization** - Message extraction + CSV/JSON language packs + CI validation
14. **Documentation** - Auto-generated Mermaid diagrams + endpoint examples
15. **Red-Team Tests** - Auth/rate-limit/RLS breach simulation
16. **Billing Stub** - Stripe webhooks + feature flag + CI validation
17. **Store Pack** - Play/App Store manifests + icons + privacy labels
18. **Quiet Mode** - Global config toggle for incident response
19. **Cost Caps** - Quota/throttling + cost simulation + alerts
20. **Partner Hooks** - Integration contracts + Postman collection

### Exit Criteria

✅ `npm run ops doctor` = 0 both locally and in CI  
✅ `ops release` performs full deploy and rollback  
✅ All budgets/tests pass  
✅ Dashboard + growth + compliance reports generated  
✅ System survives offline, high load, and incident modes without manual intervention

## 📁 Project Structure

```
whats-for-dinner/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── web/             # Next.js 15 PWA
├── packages/
│   ├── ui/              # Shared UI components
│   ├── utils/           # Shared utilities and hooks
│   ├── theme/           # Design system
│   └── config/          # Shared configurations
├── .github/workflows/   # CI/CD pipelines
└── turbo.json          # Turborepo configuration
```

## 🛠️ Tech Stack

### Mobile (Expo SDK 52)
- React Native 0.76.3
- Expo Router 4.0
- NativeWind 4.0
- TypeScript 5

### Web (Next.js 15)
- Next.js 15 with App Router
- PWA with next-pwa
- Tailwind CSS 3.4
- TypeScript 5

### Shared
- Turborepo for monorepo management
- pnpm for package management
- ESLint + Prettier for code quality
- GitHub Actions for CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- iOS Simulator (for mobile development)
- Android Studio (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whats-for-dinner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build shared packages**
   ```bash
   pnpm run build:packages
   ```

### Development

#### Start all apps
```bash
pnpm dev
```

#### Start specific apps
```bash
# Web app only
pnpm dev:web

# Mobile app only
pnpm dev:mobile
```

#### Performance & Security Commands
```bash
# Performance monitoring
pnpm perf:monitor
pnpm perf:analyze
pnpm perf:lighthouse

# Security auditing
pnpm security:audit
pnpm security:scan

# Format code
pnpm format
pnpm format:check
```

#### Mobile Development

1. **Start Expo development server**
   ```bash
   cd apps/mobile
   pnpm dev
   ```

2. **Run on iOS Simulator**
   ```bash
   pnpm ios
   ```

3. **Run on Android Emulator**
   ```bash
   pnpm android
   ```

4. **Run on Web**
   ```bash
   pnpm web
   ```

#### Web Development

1. **Start Next.js development server**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 Building for Production

### Web App

```bash
# Build for production
pnpm build:web

# The built files will be in apps/web/dist
```

### Mobile Apps

#### Using EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   cd apps/mobile
   eas build:configure
   ```

4. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

5. **Build for Android**
   ```bash
   eas build --platform android
   ```

#### Local Builds

```bash
# iOS (requires macOS)
cd apps/mobile
eas build --platform ios --local

# Android
cd apps/mobile
eas build --platform android --local
```

## 🎨 Styling

This project uses NativeWind (Tailwind CSS for React Native) for consistent styling across platforms.

### Mobile (NativeWind)
```tsx
import { View, Text } from 'react-native';

export function MyComponent() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-foreground">
        Hello World
      </Text>
    </View>
  );
}
```

### Web (Tailwind CSS)
```tsx
export function MyComponent() {
  return (
    <div className="flex-1 bg-background p-4">
      <h1 className="text-2xl font-bold text-foreground">
        Hello World
      </h1>
    </div>
  );
}
```

## 📦 Shared Packages

### UI Components (`@whats-for-dinner/ui`)
Cross-platform UI components that work on both mobile and web.

```tsx
import { Button } from '@whats-for-dinner/ui';

<Button variant="primary" onPress={() => {}}>
  Click me
</Button>
```

### Utils (`@whats-for-dinner/utils`)
Shared utilities, hooks, and helper functions.

```tsx
import { usePantry, cn } from '@whats-for-dinner/utils';

const { items, addItem } = usePantry();
```

### Config (`@whats-for-dinner/config`)
Shared configuration files for ESLint, Tailwind, and TypeScript.

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in the respective app directories:

#### Mobile (apps/mobile/.env.local)
```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Web (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### EAS Configuration

Update `apps/mobile/eas.json` with your app identifiers and credentials.

## 🚀 Deployment

### Web App
The web app is automatically deployed to GitHub Pages on push to main branch.

### Mobile Apps
Mobile apps are built using EAS Build and can be submitted to app stores.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@whats-for-dinner/ui

# Run tests in watch mode
pnpm test:watch
```

## 🎛️ Ops Framework

This repository includes a comprehensive self-operating production framework with minimal human input.

### Quick Start

```bash
# Initialize ops framework
npm run ops init

# Run comprehensive health checks
npm run ops doctor

# Run all safety checks
npm run ops check
```

### Ops CLI Commands

| Command | Description |
|---------|-------------|
| `npm run ops doctor` | Comprehensive system health checks |
| `npm run ops init` | Initialize ops framework |
| `npm run ops check` | Run all safety checks (security/performance/compliance) |
| `npm run ops release` | Semantic release with changelog |
| `npm run ops snapshot` | Create database snapshot |
| `npm run ops restore` | Restore from snapshot |
| `npm run ops rotate-secrets` | Rotate secrets and keys |
| `npm run ops sb-guard` | RLS audit and security scan |
| `npm run ops test:e2e` | Run E2E tests |
| `npm run ops benchmark` | Performance benchmarks |
| `npm run ops lintfix` | Auto-fix linting issues |
| `npm run ops docs` | Generate documentation |
| `npm run ops changelog` | Generate changelog |

### 🗓️ Ops Schedule

**Daily:**
- `npm run ops doctor` → check reports → fix → release if green

**Weekly:**
- `npm run ops release` + growth report + rotate secrets

**Monthly:**
- DR rehearsal + deps update + red-team sweep

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm clean` | Clean all build artifacts |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤖 Automated Operations Suite

This repository includes a comprehensive **Automated Venture Operations Suite** designed for Canadian solo or small-team ventures. All workflows, templates, and automation assets are self-contained and deployable from the repo.

### Quick Start

**Daily Routine (15 minutes):**
- Review automated reports → Check system health → Approve releases (if needed)
- See [`ops/daily-routine.md`](./ops/daily-routine.md) for complete checklist

**What Runs Automatically:**
- **Every Hour:** Analytics collection, health checks, support ticket routing
- **Daily:** Database backups, analytics reports, finance snapshots, marketing automation
- **Weekly:** Growth reports, security audits, performance benchmarks
- **Monthly:** DR rehearsals, dependencies updates, finance reconciliation

### Automation Components

**GitHub Actions:**
- Auto-deploy to Vercel on push to main
- Supabase migration + backup weekly
- Daily analytics scripts → commit reports to `/ops/dashboards/reports/`

**No-Code Automation (Zapier/Make):**
- Lead capture → CRM → Email follow-up
- Stripe sale → Supabase → Google Sheet → Slack DM
- Social post → Auto-log to marketing dashboard
- Support ticket → Auto-route by priority

**Dashboards:**
- Marketing dashboard (leads, conversions, traffic sources)
- Finance dashboard (revenue CAD, expenses, GST/HST tracking)
- KPI tracker (MAU, CAC, LTV, conversion rates)

### Documentation

**Operations:**
- [`ops/daily-routine.md`](./ops/daily-routine.md) - 15-minute daily checklist
- [`ops/automation-blueprints/`](./ops/automation-blueprints/) - GitHub Actions, Zapier/Make flows

**Marketing:**
- [`ops/marketing/automated-leadflow-guide.md`](./ops/marketing/automated-leadflow-guide.md) - Lead capture → CRM → Email
- [`ops/marketing/crm-integration-guide.md`](./ops/marketing/crm-integration-guide.md) - Notion/Airtable setup

**Support:**
- [`ops/support/helpdesk-playbook.md`](./ops/support/helpdesk-playbook.md) - Customer support workflows
- [`ops/support/chatbot-faq-builder.md`](./ops/support/chatbot-faq-builder.md) - Automated FAQ chatbot

**Growth:**
- [`ops/growth/influencer-outreach-automation.md`](./ops/growth/influencer-outreach-automation.md) - Automated influencer partnerships
- [`ops/growth/content-seeding-checklist.md`](./ops/growth/content-seeding-checklist.md) - Content creation workflow
- [`ops/growth/community-engagement-plan.md`](./ops/growth/community-engagement-plan.md) - Reddit, Instagram, Twitter strategy

**Legal:**
- [`ops/legal/vendor-contract-template.md`](./ops/legal/vendor-contract-template.md) - Simplified contract template
- [`ops/legal/nda-template.md`](./ops/legal/nda-template.md) - Mutual NDA template

**Funding:**
- [`ops/funding/seed-prep-playbook.md`](./ops/funding/seed-prep-playbook.md) - Fundraising preparation guide
- [`ops/funding/investor-outreach-email-bank.md`](./ops/funding/investor-outreach-email-bank.md) - Pre-written email templates
- [`ops/funding/grant-and-incubator-list-canada.md`](./ops/funding/grant-and-incubator-list-canada.md) - Canadian funding programs (IRAP, SR&ED, Futurpreneur, BDC Seed)

**See [`ops/README.md`](./ops/README.md) for complete documentation.**

### Cost Breakdown (CAD)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| GitHub Actions | 2,000 min/month | Included |
| Zapier | 100 tasks/month | $29.99/month |
| Supabase | Free (50K MAU) | $25/month |
| Vercel | Free (hobby) | $20/month |
| Google Sheets | Free | Free |
| Notion | Free (personal) | $12/month |

**Recommended:** Start with free tiers, upgrade as needed.

---

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

Built with ❤️ using Expo, Next.js, and Turborepo

## 🏥 Health Check

Run comprehensive health checks:

```bash
node scripts/comprehensive-health-check.mjs
```

This checks:
- Code quality
- Security posture
- Performance metrics
- Test coverage
- Documentation completeness
- Configuration validity
