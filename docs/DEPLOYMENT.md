# Deployment Guide

## Overview

This guide covers deploying What's for Dinner to production environments.

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+
- Supabase account
- Vercel account (for web deployment)
- EAS account (for mobile deployment)

## Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required variables**:
   - Supabase URL and keys
   - Database URL
   - API keys (OpenAI, Stripe, etc.)
   - Email service credentials

3. **Validate environment**:
   ```bash
   pnpm env:validate
   ```

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Tests passing (`pnpm test`)
- [ ] TypeScript compilation successful (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Security audit passed (`pnpm security:audit`)
- [ ] Performance budgets met (`pnpm perf:budget`)

## Web Deployment (Vercel)

1. **Connect repository to Vercel**

2. **Configure environment variables** in Vercel dashboard

3. **Set build settings**:
   - Build Command: `pnpm build`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install --frozen-lockfile`

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## Mobile Deployment (EAS)

1. **Configure EAS**:
   ```bash
   eas build:configure
   ```

2. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

3. **Build for Android**:
   ```bash
   eas build --platform android
   ```

4. **Submit to stores**:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## Database Migrations

1. **Review migrations**:
   ```bash
   supabase migration list
   ```

2. **Apply migrations**:
   ```bash
   supabase db push
   ```

3. **Verify RLS policies**:
   ```bash
   pnpm rls:test
   ```

## Post-Deployment

1. **Verify deployment**:
   - Check health endpoint: `https://your-domain.com/api/health`
   - Test critical user flows
   - Monitor error logs

2. **Monitor**:
   - Check Vercel dashboard for errors
   - Monitor Supabase dashboard for database issues
   - Review Sentry for application errors

## Rollback Procedure

1. **Vercel Rollback**:
   - Go to Vercel dashboard
   - Select deployment
   - Click "Promote to Production"

2. **Database Rollback**:
   ```bash
   supabase migration repair --status reverted <migration_name>
   ```

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.
