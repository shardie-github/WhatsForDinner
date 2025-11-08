# Scripts Reference Guide

**Last Updated:** 2025-01-27

Comprehensive reference for all npm/pnpm scripts available in this monorepo.

---

## Quick Navigation

- [Root Scripts](#root-scripts)
- [Web App Scripts](#web-app-scripts)
- [Mobile App Scripts](#mobile-app-scripts)
- [Package Scripts](#package-scripts)
- [Common Workflows](#common-workflows)

---

## Root Scripts

### Development

```bash
pnpm dev                    # Start all apps in dev mode
pnpm dev:web                # Start web app only
pnpm dev:mobile             # Start mobile app only
pnpm dev:all                # Start all apps in parallel
```

### Building

```bash
pnpm build                  # Build all packages and apps
pnpm build:packages         # Build packages only
pnpm build:web              # Build web app only
pnpm build:mobile           # Build mobile app only
```

### Testing

```bash
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm test:ci                # Run tests for CI
pnpm test:coverage          # Run tests with coverage
```

### Code Quality

```bash
pnpm lint                   # Lint all packages/apps
pnpm lint:fix               # Lint and auto-fix
pnpm type-check             # Type check all packages/apps
pnpm format                 # Format all code
pnpm format:check           # Check formatting
```

### Performance

```bash
pnpm perf:analyze           # Analyze performance
pnpm perf:monitor           # Monitor performance
pnpm analyze:bundle         # Analyze bundle size
pnpm bundle:check          # Check bundle budgets
pnpm performance:lighthouse # Run Lighthouse
pnpm performance:budget     # Check performance budgets
```

### Security

```bash
pnpm security:audit        # Security audit
pnpm security:scan          # Security scan
pnpm security:deps          # Check dependencies
pnpm security:secrets       # Scan for secrets
pnpm security:headers       # Check security headers
pnpm supply-chain:check     # Check supply chain
pnpm supply-chain:fix       # Fix supply chain issues
```

### Accessibility

```bash
pnpm a11y                   # Run accessibility checks
```

### Observability

```bash
pnpm obs                    # Observability checks
pnpm doctor                 # Run health checks
```

### Database

```bash
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations
pnpm db:migrate:dev         # Run dev migrations
pnpm db:pull                # Pull schema from database
pnpm db:sync                # Sync Prisma from Supabase
pnpm db:studio              # Open Prisma Studio
```

### Deployment

```bash
pnpm deploy:staging         # Deploy to staging
pnpm deploy:canary          # Deploy to canary
pnpm deploy:production     # Deploy to production
```

### Mobile

```bash
pnpm mobile:setup           # Setup mobile environment
pnpm mobile:sync           # Sync Capacitor
pnpm mobile:open:ios       # Open iOS project
pnpm mobile:open:android   # Open Android project
```

### Utilities

```bash
pnpm clean                  # Clean all build artifacts
pnpm install:all            # Install and build packages
pnpm release                # Release packages
pnpm smoke:test             # Run smoke tests
pnpm health:check           # Health check
```

---

## Web App Scripts

Located in `apps/web/package.json`

### Development

```bash
cd apps/web
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build for production
pnpm build:analyze          # Build with bundle analyzer
pnpm start                  # Start production server
```

### Testing

```bash
pnpm test                   # Run Jest tests
pnpm test:watch             # Watch mode
pnpm test:ci                # CI mode with coverage
pnpm test:coverage          # Generate coverage report
```

### Code Quality

```bash
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint issues
pnpm type-check             # TypeScript type check
pnpm format                 # Format with Prettier
pnpm format:check           # Check formatting
```

### Capacitor (Mobile)

```bash
pnpm cap:init               # Initialize Capacitor
pnpm cap:add:ios            # Add iOS platform
pnpm cap:add:android        # Add Android platform
pnpm cap:sync               # Sync web code to native
pnpm cap:copy               # Copy web assets
pnpm cap:update             # Update Capacitor
pnpm cap:open:ios           # Open iOS project
pnpm cap:open:android       # Open Android project
pnpm cap:build:ios          # Build iOS app
pnpm cap:build:android      # Build Android app
```

---

## Mobile App Scripts

Located in `apps/mobile/package.json`

### Development

```bash
cd apps/mobile
pnpm dev                    # Start Expo dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm android                # Start Android emulator
pnpm ios                    # Start iOS simulator
pnpm web                    # Start web version
```

### Testing

```bash
pnpm test                   # Run tests
pnpm type-check             # TypeScript type check
pnpm lint                   # Run ESLint
```

### Utilities

```bash
pnpm clean                  # Clean Expo cache
```

---

## Package Scripts

### UI Package (`packages/ui`)

```bash
cd packages/ui
pnpm type-check             # Type check
pnpm storybook              # Start Storybook
pnpm build-storybook        # Build Storybook
```

### Utils Package (`packages/utils`)

```bash
cd packages/utils
pnpm type-check             # Type check
```

### Theme Package (`packages/theme`)

```bash
cd packages/theme
pnpm type-check             # Type check
```

### Server Package (`packages/server`)

```bash
cd packages/server
pnpm build                  # Build TypeScript
pnpm dev                    # Dev mode with watch
pnpm test                   # Run Vitest tests
pnpm test:watch             # Watch mode
pnpm type-check             # Type check
```

---

## Common Workflows

### Daily Development

```bash
# Start development
pnpm install:all            # Install dependencies
pnpm dev:web                # Start web app
# or
pnpm dev:mobile             # Start mobile app
```

### Before Committing

```bash
pnpm format                 # Format code
pnpm lint:fix               # Fix linting issues
pnpm type-check             # Check types
pnpm test                   # Run tests
```

### Before Release

```bash
pnpm clean                  # Clean build artifacts
pnpm build                  # Build everything
pnpm test:ci                # Run all tests
pnpm lint                   # Check linting
pnpm type-check             # Check types
pnpm security:audit         # Security audit
pnpm build:analyze          # Analyze bundles
pnpm lhci                   # Lighthouse CI
```

### Performance Analysis

```bash
# Bundle analysis
cd apps/web
pnpm build:analyze

# Performance budgets
pnpm performance:budget

# Lighthouse
pnpm lhci
```

### Troubleshooting

```bash
# Clean everything
pnpm clean
rm -rf node_modules
pnpm install:all

# Check health
pnpm doctor
pnpm health:check

# Verify setup
pnpm dev:doctor
```

---

## Script Categories

### 🔧 Development
- `dev`, `dev:web`, `dev:mobile`, `dev:all`

### 🏗️ Building
- `build`, `build:packages`, `build:web`, `build:mobile`, `build:analyze`

### ✅ Testing
- `test`, `test:watch`, `test:ci`, `test:coverage`

### 🎨 Code Quality
- `lint`, `lint:fix`, `type-check`, `format`, `format:check`

### ⚡ Performance
- `perf:analyze`, `perf:monitor`, `analyze:bundle`, `performance:lighthouse`

### 🔒 Security
- `security:audit`, `security:scan`, `supply-chain:check`

### 📱 Mobile
- `mobile:setup`, `mobile:sync`, `mobile:open:ios`, `mobile:open:android`

### 🗄️ Database
- `db:generate`, `db:migrate`, `db:studio`

---

## Tips

1. **Use Turbo**: Most scripts use Turbo for parallel execution
2. **Filter Commands**: Use `--filter` to run scripts in specific packages
3. **Watch Mode**: Use `:watch` suffix for watch mode
4. **CI Mode**: Use `:ci` suffix for CI-optimized runs
5. **Check Help**: Run `pnpm <script> --help` for options

---

## Adding New Scripts

When adding new scripts:

1. Add to appropriate `package.json`
2. Document in this file
3. Add to Turbo pipeline if needed
4. Update CI workflows if needed
5. Test locally before committing

---

## Related Documentation

- [Build Configuration](./BUILD_CONFIGURATION.md)
- [Performance Playbook](./PERFORMANCE_PLAYBOOK.md)
- [Bundle Analyzer](./BUNDLE_ANALYZER.md)
