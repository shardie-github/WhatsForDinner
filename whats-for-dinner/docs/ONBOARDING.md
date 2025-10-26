# Developer Onboarding Guide

Welcome to the What's for Dinner development team! This guide will help you get up and running with the project quickly and efficiently.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **Docker** (v20.0.0 or higher)
- **Supabase CLI** (v1.0.0 or higher)

### Recommended Tools

- **VS Code** with recommended extensions
- **Postman** or **Insomnia** for API testing
- **DBeaver** or **pgAdmin** for database management
- **Figma** for design collaboration

### Browser Requirements

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/whats-for-dinner.git
cd whats-for-dinner
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install workspace dependencies
pnpm install --recursive
```

### 3. Environment Configuration

```bash
# Copy environment templates
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# Edit environment files with your values
nano .env.local
nano apps/web/.env.local
nano apps/mobile/.env.local
```

### 4. Database Setup

```bash
# Start Supabase locally
supabase start

# Run database migrations
pnpm supabase:db:push

# Seed development data
pnpm supabase:db:seed
```

### 5. Start Development Servers

```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:web      # Web application
pnpm dev:mobile   # Mobile application
pnpm dev:api      # API server
```

## Development Environment

### VS Code Setup

Install the recommended extensions:

```bash
# Install VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension supabase.supabase
```

### Git Configuration

```bash
# Configure git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up git hooks
pnpm prepare
```

### Database Access

```bash
# Connect to local database
supabase db connect

# Or use connection string
psql "postgresql://postgres:postgres@localhost:54322/postgres"
```

## Project Structure

```
whats-for-dinner/
├── apps/
│   ├── web/                 # Next.js web application
│   ├── mobile/              # React Native mobile app
│   └── admin/               # Admin dashboard
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Utility functions
│   ├── config/              # Shared configuration
│   └── theme/               # Design system
├── scripts/                 # Build and deployment scripts
├── supabase/                # Database and functions
├── tests/                   # Test suites
├── docs/                    # Documentation
└── .github/                 # GitHub workflows
```

### Key Directories

- **`apps/web/src/`**: Web application source code
- **`apps/mobile/src/`**: Mobile application source code
- **`packages/ui/src/`**: Shared UI components
- **`supabase/migrations/`**: Database migrations
- **`supabase/functions/`**: Edge functions
- **`tests/`**: Test files and configurations

## Development Workflow

### 1. Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description

# Create hotfix branch
git checkout -b hotfix/critical-issue
```

### 2. Code Standards

- **TypeScript**: Use strict mode and proper typing
- **ESLint**: Follow configured rules
- **Prettier**: Use consistent formatting
- **Conventional Commits**: Use semantic commit messages

### 3. Development Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm dev:web               # Start web app only
pnpm dev:mobile            # Start mobile app only

# Building
pnpm build                  # Build all packages
pnpm build:web             # Build web app
pnpm build:mobile          # Build mobile app

# Testing
pnpm test                  # Run all tests
pnpm test:unit             # Run unit tests
pnpm test:integration      # Run integration tests
pnpm test:e2e              # Run E2E tests

# Linting
pnpm lint                  # Lint all code
pnpm lint:fix              # Fix linting issues
pnpm typecheck             # Type check all code

# Database
pnpm supabase:db:push      # Push schema changes
pnpm supabase:db:reset     # Reset database
pnpm supabase:db:seed      # Seed test data
```

### 4. Git Workflow

```bash
# Before starting work
git pull origin main
git checkout -b feature/your-feature

# During development
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature

# Before merging
git rebase main
git push origin feature/your-feature --force-with-lease
```

## Testing

### Unit Tests

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:unit:coverage

# Run specific test file
pnpm test:unit -- src/components/Button.test.tsx
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration

# Run with database
pnpm test:integration:db
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run specific test
pnpm test:e2e -- tests/e2e/auth.spec.ts
```

### Mobile Tests

```bash
# Run mobile tests
pnpm test:mobile

# Run on specific platform
pnpm test:mobile:ios
pnpm test:mobile:android
```

## Deployment

### Local Deployment

```bash
# Build and start locally
pnpm build
pnpm start
```

### Staging Deployment

```bash
# Deploy to staging
pnpm deploy:staging
```

### Production Deployment

```bash
# Deploy to production
pnpm deploy:production
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 2. Database Connection Issues

```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start
```

#### 3. Dependency Issues

```bash
# Clear node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Reinstall dependencies
pnpm install
```

#### 4. TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .tsbuildinfo
rm -rf apps/*/.tsbuildinfo
rm -rf packages/*/.tsbuildinfo

# Rebuild
pnpm build
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm dev

# Enable specific debug namespace
DEBUG=whats-for-dinner:* pnpm dev
```

### Performance Issues

```bash
# Profile web app
pnpm dev:web --profile

# Analyze bundle size
pnpm build:web --analyze
```

## Resources

### Documentation

- [Project README](../README.md)
- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Team Resources

- [Slack Channel](#slack-channel)
- [Figma Design System](#figma-link)
- [Jira Project Board](#jira-link)
- [Confluence Wiki](#confluence-link)

### Getting Help

1. **Check Documentation**: Review relevant docs first
2. **Search Issues**: Look for similar issues in GitHub
3. **Ask in Slack**: Post in the development channel
4. **Create Issue**: If no solution found, create a GitHub issue
5. **Schedule Pair Programming**: Book time with a team member

### Code Review Process

1. **Self Review**: Review your own code before submitting
2. **Run Tests**: Ensure all tests pass
3. **Update Documentation**: Update relevant docs
4. **Request Review**: Assign reviewers and add description
5. **Address Feedback**: Make requested changes
6. **Merge**: Once approved, merge the PR

### Best Practices

- **Write Tests**: Always write tests for new features
- **Document Code**: Add comments for complex logic
- **Follow Conventions**: Use established patterns and conventions
- **Keep Commits Small**: Make focused, atomic commits
- **Review Others**: Participate in code reviews
- **Ask Questions**: Don't hesitate to ask for help

---

Welcome to the team! If you have any questions or need help getting started, don't hesitate to reach out. Happy coding! 🚀
