# What's for Dinner - Ecosystem Documentation

## Overview

The "What's for Dinner" ecosystem is a comprehensive, scalable SaaS platform that transforms meal planning into a collaborative, community-driven experience. This documentation covers all aspects of the platform, from architecture to deployment.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Apps and Services](#apps-and-services)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Deployment Guide](#deployment-guide)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │  Mobile App     │    │ Community Portal│
│   (Next.js)     │    │  (React Native) │    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway          │
                    │    (Supabase + AWS)       │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      Database Layer       │
                    │    (PostgreSQL + Redis)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    AI & ML Services       │
                    │  (OpenAI + Custom Models) │
                    └───────────────────────────┘
```

### Core Components

1. **Frontend Applications**
   - Web App (Next.js)
   - Mobile App (React Native)
   - Community Portal
   - Chef Marketplace
   - API Documentation Portal

2. **Backend Services**
   - Supabase (Database & Auth)
   - AWS Lambda (Serverless Functions)
   - Redis (Caching)
   - AI/ML Services

3. **Infrastructure**
   - AWS (Cloud Infrastructure)
   - Vercel (Frontend Hosting)
   - CloudFront (CDN)
   - GitHub Actions (CI/CD)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.0.0+
- Docker (for local development)
- AWS CLI (for deployment)
- Supabase CLI

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/whats-for-dinner.git
   cd whats-for-dinner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Supabase locally**
   ```bash
   cd whats-for-dinner
   supabase start
   ```

5. **Run database migrations**
   ```bash
   supabase db push
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Web app
   pnpm dev:web

   # Terminal 2: Mobile app
   pnpm dev:mobile

   # Terminal 3: Community portal
   cd apps/community-portal && pnpm dev

   # Terminal 4: Chef marketplace
   cd apps/chef-marketplace && pnpm dev
   ```

## Apps and Services

### 1. Web Application (`apps/web`)
- **Technology**: Next.js 16, React 19, TypeScript
- **Port**: 3000
- **Features**: Main user interface, meal planning, recipe management

### 2. Mobile Application (`apps/mobile`)
- **Technology**: React Native, Expo
- **Features**: Mobile-optimized experience, offline support

### 3. Community Portal (`apps/community-portal`)
- **Technology**: Next.js 16, React 19
- **Port**: 3001
- **Features**: User-generated content, social features, gamification

### 4. Chef Marketplace (`apps/chef-marketplace`)
- **Technology**: Next.js 16, React 19
- **Port**: 3002
- **Features**: Partner onboarding, recipe packs, analytics

### 5. Referral System (`apps/referral`)
- **Technology**: Next.js 16, React 19
- **Port**: 3003
- **Features**: Referral codes, social sharing, viral campaigns

### 6. API Documentation (`apps/api-docs`)
- **Technology**: Next.js 16, Swagger UI
- **Port**: 3004
- **Features**: API documentation, SDK downloads, developer onboarding

## Database Schema

### Core Tables

1. **User Management**
   - `profiles` - User profiles
   - `tenants` - Multi-tenant organization
   - `tenant_memberships` - User-tenant relationships

2. **Recipe Management**
   - `recipes` - Recipe data
   - `pantry_items` - User pantry items
   - `favorites` - User favorites

3. **Community Features**
   - `community_posts` - User-generated content
   - `community_votes` - Voting system
   - `community_comments` - Comments and discussions

4. **Chef Marketplace**
   - `chef_profiles` - Chef profiles
   - `recipe_packs` - Chef recipe collections
   - `chef_earnings` - Revenue tracking

5. **Referral System**
   - `referral_codes` - Referral codes
   - `referral_tracking` - Referral tracking
   - `social_shares` - Social media shares

### Database Migrations

All database changes are managed through Supabase migrations in the `supabase/migrations/` directory:

- `001_create_tables.sql` - Core tables
- `010_community_portal_schema.sql` - Community features
- `011_chef_marketplace_schema.sql` - Chef marketplace
- `012_referral_social_schema.sql` - Referral and social features

## API Documentation

### Authentication

All API endpoints require authentication via Supabase Auth:

```typescript
const { data: { session } } = await supabase.auth.getSession()
```

### Core Endpoints

#### Recipes
- `GET /api/recipes` - List recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/:id` - Get recipe details
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

#### Community
- `GET /api/community/posts` - List community posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/vote` - Vote on post
- `POST /api/community/posts/:id/comment` - Add comment

#### Chef Marketplace
- `GET /api/chefs` - List chefs
- `GET /api/chefs/:id/packs` - Get chef's recipe packs
- `POST /api/chefs/:id/follow` - Follow chef

### SDKs

- **TypeScript/JavaScript**: `@whats-for-dinner/sdk`
- **React**: `@whats-for-dinner/react-sdk`
- **React Native**: `@whats-for-dinner/react-native-sdk`

## Deployment Guide

### Staging Deployment

1. **Push to develop branch**
   ```bash
   git push origin develop
   ```

2. **GitHub Actions will automatically:**
   - Run tests
   - Build applications
   - Deploy to Vercel (staging)
   - Update Supabase (staging)

### Production Deployment

1. **Merge to main branch**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Run full test suite
   - Deploy to production
   - Update infrastructure

### Manual Deployment

1. **Deploy infrastructure**
   ```bash
   cd infra
   terraform init
   terraform plan
   terraform apply
   ```

2. **Deploy applications**
   ```bash
   # Deploy to Vercel
   vercel --prod

   # Deploy to Supabase
   supabase db push --project-ref YOUR_PROJECT_REF
   ```

## Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

3. **Create pull request**
   - Ensure all tests pass
   - Update documentation
   - Follow coding standards

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Testing

- **Unit Tests**: Jest
- **Integration Tests**: Playwright
- **E2E Tests**: Cypress

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Check RLS policies

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

3. **Deployment Issues**
   - Check GitHub Actions logs
   - Verify AWS credentials
   - Check Vercel deployment logs

### Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Slack**: #whats-for-dinner-dev

## License

MIT License - see LICENSE file for details.
