# Onboarding Guide

Welcome to the What's For Dinner monorepo! This guide will get you up and running quickly.

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm 8+
- Git

### Setup
```bash
# 1. Clone and install
git clone <repository-url>
cd whats-for-dinner-monorepo
pnpm install

# 2. Environment setup
cp .env.example .env.local
# Edit .env.local with your values

# 3. Preflight check
pnpm run dev:doctor

# 4. Start development
pnpm run dev
```

## Project Structure

```
whats-for-dinner-monorepo/
├── apps/                    # Applications
│   ├── web/                # Next.js web app
│   ├── mobile/             # React Native mobile app
│   └── community-portal/   # Community features
├── packages/               # Shared packages
│   ├── ui/                 # UI components
│   ├── utils/              # Utilities
│   ├── theme/              # Design system
│   └── config/             # Configuration
├── whats-for-dinner/       # Main application
└── scripts/                # Build and utility scripts
```

## Development Workflow

### Daily Development
```bash
# Start all services
pnpm run dev

# Start specific app
pnpm run dev:web
pnpm run dev:mobile

# Run tests
pnpm run test

# Check code quality
pnpm run lint
pnpm run type-check
```

### Before Committing
```bash
# Run full check suite
pnpm run doctor

# Format code
pnpm run format

# Run all tests
pnpm run test:ci
```

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all development servers |
| `pnpm run build` | Build all packages and apps |
| `pnpm run test` | Run all tests |
| `pnpm run lint` | Lint all code |
| `pnpm run doctor` | Run environment health checks |
| `pnpm run a11y` | Run accessibility tests |
| `pnpm run perf:analyze` | Analyze performance |
| `pnpm run security:audit` | Run security audit |

## Environment Variables

Required environment variables are documented in `.env.example`. Copy this file to `.env.local` and fill in your values:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for meal generation
- `STRIPE_SECRET_KEY` - Stripe secret key for payments

## Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: All changes require PR review

## Architecture

This is a monorepo using:
- **Turbo** for build orchestration
- **pnpm** for package management
- **Next.js** for the web application
- **React Native** for mobile
- **Supabase** for backend services
- **TypeScript** throughout

## Next Steps

1. Read the [DX Guide](./DX_GUIDE.md) for detailed development practices
2. Check out the [Architecture Summary](./ARCHITECTURE_SUMMARY.md)
3. Explore the codebase starting with `apps/web/src/`
4. Run `pnpm run doctor` to verify your setup

Welcome to the team! 🎉