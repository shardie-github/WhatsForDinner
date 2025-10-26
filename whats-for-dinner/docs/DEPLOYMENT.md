# Deployment Documentation

This document provides comprehensive information about deploying the What's for Dinner application to various environments.

## Table of Contents

- [Overview](#overview)
- [Deployment Environments](#deployment-environments)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Database Deployment](#database-deployment)
- [Mobile App Deployment](#mobile-app-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The What's for Dinner application uses a multi-environment deployment strategy with automated CI/CD pipelines. The deployment process is designed to be reliable, repeatable, and safe.

### Deployment Strategy

- **Blue-Green Deployment**: Zero-downtime deployments
- **Automated Testing**: All tests must pass before deployment
- **Gradual Rollout**: Staged deployment to production
- **Rollback Capability**: Quick rollback if issues are detected
- **Monitoring**: Real-time monitoring during and after deployment

## Deployment Environments

### Environment Overview

| Environment | Purpose | URL | Database | Features |
|-------------|---------|-----|----------|----------|
| **Development** | Local development | `http://localhost:3000` | Local PostgreSQL | Full features, debug mode |
| **Staging** | Pre-production testing | `https://staging.whats-for-dinner.com` | Staging PostgreSQL | Production-like, test data |
| **Production** | Live application | `https://whats-for-dinner.com` | Production PostgreSQL | Full features, optimized |

### Environment Configuration

```typescript
// Environment configuration
interface EnvironmentConfig {
  name: string;
  baseURL: string;
  database: {
    host: string;
    port: number;
    name: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  monitoring: {
    sentry: {
      dsn: string;
      environment: string;
    };
    datadog: {
      apiKey: string;
      site: string;
    };
  };
}
```

## Prerequisites

### Required Tools

- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher)
- **Docker** (v20.0.0 or higher)
- **Supabase CLI** (v1.0.0 or higher)
- **Vercel CLI** (v28.0.0 or higher)
- **Expo CLI** (v49.0.0 or higher)

### Required Accounts

- **Vercel** (for web app deployment)
- **Supabase** (for database and backend services)
- **Expo** (for mobile app deployment)
- **GitHub** (for CI/CD)
- **Sentry** (for error monitoring)
- **Datadog** (for performance monitoring)

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Stripe
STRIPE_PUBLISHABLE_KEY=your-publishable-key
STRIPE_SECRET_KEY=your-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/whats-for-dinner.git
cd whats-for-dinner

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# Start Supabase locally
supabase start

# Run database migrations
pnpm supabase:db:push

# Seed development data
pnpm supabase:db:seed

# Start development servers
pnpm dev
```

### Development Commands

```bash
# Start all services
pnpm dev

# Start specific services
pnpm dev:web      # Web application
pnpm dev:mobile   # Mobile application
pnpm dev:api      # API server

# Run tests
pnpm test

# Build for production
pnpm build

# Start production build locally
pnpm start
```

## Staging Deployment

### Automatic Deployment

Staging deployments are triggered automatically on every push to the `develop` branch.

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy Supabase functions
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      
      - name: Run database migrations
        run: |
          supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

### Manual Deployment

```bash
# Deploy to staging manually
pnpm deploy:staging

# Or deploy specific components
pnpm deploy:staging:web
pnpm deploy:staging:api
pnpm deploy:staging:mobile
```

### Staging Verification

```bash
# Run staging tests
pnpm test:staging

# Check staging health
curl https://staging.whats-for-dinner.com/health

# Verify database connection
pnpm supabase:db:status --project-ref staging-project-ref
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Monitoring configured
- [ ] Rollback plan ready

### Automatic Deployment

Production deployments are triggered automatically on every push to the `main` branch.

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run full test suite
        run: pnpm test:all
      
      - name: Run security scan
        run: pnpm security:scan
      
      - name: Run performance tests
        run: pnpm test:performance
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy Supabase functions
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      
      - name: Run database migrations
        run: |
          supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      
      - name: Verify deployment
        run: |
          curl https://whats-for-dinner.com/health
          pnpm test:smoke
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Production deployment successful!'
```

### Manual Deployment

```bash
# Deploy to production manually
pnpm deploy:production

# Or deploy specific components
pnpm deploy:production:web
pnpm deploy:production:api
pnpm deploy:production:mobile
```

### Blue-Green Deployment

```bash
# Blue-Green deployment script
#!/bin/bash

# Deploy to green environment
pnpm deploy:green

# Run smoke tests
pnpm test:smoke:green

# Switch traffic to green
pnpm switch:traffic:green

# Monitor for 5 minutes
sleep 300

# If healthy, keep green
if pnpm health:check:green; then
  echo "Green deployment successful"
  pnpm cleanup:blue
else
  echo "Green deployment failed, switching back to blue"
  pnpm switch:traffic:blue
  pnpm cleanup:green
fi
```

## Database Deployment

### Migration Strategy

```bash
# Create new migration
pnpm supabase:migration:create "add_user_preferences_table"

# Review migration
pnpm supabase:migration:review

# Apply migration to staging
pnpm supabase:db:push --project-ref staging-project-ref

# Test migration
pnpm test:migration:staging

# Apply migration to production
pnpm supabase:db:push --project-ref production-project-ref
```

### Database Backup

```bash
# Create backup before deployment
pnpm supabase:db:backup --project-ref production-project-ref

# Restore from backup if needed
pnpm supabase:db:restore --project-ref production-project-ref --backup-id backup-id
```

### Data Seeding

```bash
# Seed staging data
pnpm supabase:db:seed --project-ref staging-project-ref

# Seed production data (if needed)
pnpm supabase:db:seed --project-ref production-project-ref
```

## Mobile App Deployment

### iOS Deployment

```bash
# Build iOS app
pnpm mobile:build:ios

# Deploy to TestFlight
pnpm mobile:deploy:ios:testflight

# Deploy to App Store
pnpm mobile:deploy:ios:appstore
```

### Android Deployment

```bash
# Build Android app
pnpm mobile:build:android

# Deploy to Google Play Console
pnpm mobile:deploy:android:playstore

# Deploy to internal testing
pnpm mobile:deploy:android:internal
```

### Expo Deployment

```bash
# Deploy to Expo
expo publish

# Deploy specific platform
expo publish --platform ios
expo publish --platform android

# Deploy with specific channel
expo publish --channel production
```

## Monitoring and Logging

### Application Monitoring

```typescript
// Sentry configuration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

### Performance Monitoring

```typescript
// Datadog configuration
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.DATADOG_APPLICATION_ID,
  clientToken: process.env.DATADOG_CLIENT_TOKEN,
  site: process.env.DATADOG_SITE,
  service: 'whats-for-dinner',
  env: process.env.NODE_ENV,
  version: process.env.VERSION,
  trackInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION,
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      openai: await checkOpenAI(),
    }
  };
  
  res.json(health);
});
```

### Logging

```typescript
// Winston logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## Rollback Procedures

### Automatic Rollback

```yaml
# Automatic rollback on health check failure
- name: Health check
  run: |
    if ! curl -f https://whats-for-dinner.com/health; then
      echo "Health check failed, rolling back"
      pnpm rollback:production
      exit 1
    fi
```

### Manual Rollback

```bash
# Rollback to previous version
pnpm rollback:production

# Rollback specific component
pnpm rollback:production:web
pnpm rollback:production:api

# Rollback database
pnpm supabase:db:rollback --project-ref production-project-ref
```

### Rollback Verification

```bash
# Verify rollback
pnpm health:check:production
pnpm test:smoke:production

# Check logs
pnpm logs:production
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check build logs
pnpm build --verbose

# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

#### 2. Database Connection Issues

```bash
# Check database status
pnpm supabase:db:status

# Test connection
pnpm supabase:db:test

# Reset database
pnpm supabase:db:reset
```

#### 3. Environment Variable Issues

```bash
# Check environment variables
pnpm env:check

# Validate configuration
pnpm config:validate
```

#### 4. Performance Issues

```bash
# Check performance metrics
pnpm performance:check

# Run performance tests
pnpm test:performance

# Analyze bundle size
pnpm analyze:bundle
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm dev

# Enable specific debug namespace
DEBUG=whats-for-dinner:* pnpm dev

# Enable verbose output
pnpm dev --verbose
```

### Log Analysis

```bash
# View application logs
pnpm logs:production

# Filter logs by level
pnpm logs:production --level error

# Search logs
pnpm logs:production --search "error"
```

### Performance Analysis

```bash
# Analyze performance
pnpm performance:analyze

# Generate performance report
pnpm performance:report

# Check resource usage
pnpm resources:check
```

---

This deployment documentation provides a comprehensive guide to deploying the What's for Dinner application. For more specific information about individual deployment steps or troubleshooting, refer to the relevant sections above.