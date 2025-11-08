# Developer Quick Reference

**Last Updated:** 2025-01-27

Quick reference guide for common development tasks and workflows.

---

## 🚀 Getting Started

```bash
# Clone and setup
git clone <repo-url>
cd whats-for-dinner
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your keys

# Start development
pnpm dev:web        # Web app
pnpm dev:mobile     # Mobile app
```

---

## 📝 Common Tasks

### Development

```bash
# Start dev server
pnpm dev:web                # Web only
pnpm dev:mobile             # Mobile only
pnpm dev:all                # All apps

# Build
pnpm build                  # Build everything
pnpm build:web              # Web only
pnpm build:mobile           # Mobile only
```

### Code Quality

```bash
# Format code
pnpm format

# Lint
pnpm lint                   # Check
pnpm lint:fix               # Fix issues

# Type check
pnpm type-check

# Test
pnpm test                   # Run tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # With coverage
```

### Before Committing

```bash
# Quick check
pnpm format && pnpm lint:fix && pnpm type-check && pnpm test
```

---

## 🏗️ Project Structure

```
apps/
  web/          # Next.js web app
  mobile/       # Expo mobile app

packages/
  ui/           # UI components
  utils/        # Utilities
  theme/        # Design system
  config/       # Configurations
  server/       # Server utilities
```

---

## 🔧 Package Scripts

### Root Level

```bash
pnpm dev                    # Start all
pnpm build                  # Build all
pnpm test                   # Test all
pnpm lint                   # Lint all
pnpm type-check             # Type check all
```

### Web App (`apps/web`)

```bash
cd apps/web
pnpm dev                    # Dev server
pnpm build                  # Production build
pnpm build:analyze          # Bundle analysis
pnpm test                   # Run tests
```

### Mobile App (`apps/mobile`)

```bash
cd apps/mobile
pnpm dev                    # Expo dev
pnpm build                  # Production build
pnpm ios                    # iOS simulator
pnpm android                # Android emulator
```

---

## 🎯 Performance

```bash
# Bundle analysis
cd apps/web && pnpm build:analyze

# Lighthouse
pnpm lhci

# Performance budgets
pnpm performance:budget
```

**Targets:**
- LCP < 2.5s
- TBT < 200ms
- CLS < 0.1
- Bundle < 200KB (gzipped)

---

## 🔒 Security

```bash
# Security audit
pnpm security:audit
pnpm supply-chain:check

# Secret scanning
pnpm security:secrets
```

---

## 📱 Mobile Development

```bash
# Setup
pnpm mobile:setup

# Sync Capacitor
pnpm mobile:sync

# Open native projects
pnpm mobile:open:ios
pnpm mobile:open:android
```

---

## 🗄️ Database

```bash
# Generate Prisma client
pnpm db:generate

# Migrations
pnpm db:migrate             # Production
pnpm db:migrate:dev         # Development

# Studio
pnpm db:studio              # Open Prisma Studio
```

---

## 🐛 Troubleshooting

### Clean Everything

```bash
pnpm clean
rm -rf node_modules
pnpm install:all
```

### Health Check

```bash
pnpm doctor
pnpm health:check
```

### Common Issues

**Build fails:**
```bash
pnpm clean
pnpm install:all
pnpm build
```

**Type errors:**
```bash
pnpm type-check
# Fix errors, then rebuild
```

**Lint errors:**
```bash
pnpm lint:fix
```

---

## 📚 Documentation

- [Build Configuration](./BUILD_CONFIGURATION.md)
- [Performance Playbook](./PERFORMANCE_PLAYBOOK.md)
- [Scripts Reference](./SCRIPTS_REFERENCE.md)
- [Bundle Analyzer](./BUNDLE_ANALYZER.md)
- [Edge Functions](./EDGE_FUNCTIONS.md)

---

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Turbo Docs](https://turbo.build/repo/docs)

---

## 💡 Tips

1. **Use Turbo**: Commands run in parallel automatically
2. **Filter Commands**: Use `--filter` for specific packages
3. **Watch Mode**: Use `:watch` suffix for auto-reload
4. **Pre-commit**: Hooks run automatically on commit
5. **Bundle Analysis**: Run before major releases

---

## 🚨 Emergency Procedures

### Rollback Changes

```bash
git revert <commit-hash>
```

### Reset to Clean State

```bash
git stash
pnpm clean
rm -rf node_modules
pnpm install:all
```

### Check What Changed

```bash
git status
git diff
pnpm doctor
```

---

**Need Help?** Check the full documentation in `/docs` or run `pnpm doctor` for system health.
