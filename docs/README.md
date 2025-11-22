# What's for Dinner - Documentation

**Welcome to the documentation!** This is your guide to understanding, building, and extending What's for Dinner.

---

## 📚 What's Here

This documentation covers everything you need to know about the What's for Dinner platform:

- **Architecture** - How everything fits together
- **Getting Started** - Set up your development environment
- **Apps & Services** - What each part of the system does
- **API Reference** - How to use our APIs
- **Deployment** - How to deploy to production
- **Contributing** - How to contribute code

**Start with [Getting Started](#getting-started) if you're new here.**

---

## 🏗️ Architecture Overview

**Think of What's for Dinner as a house with multiple rooms:**

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
                    └───────────────────────────┘
```

**Each app talks to the same backend**, so your data syncs everywhere.

### The Big Picture

1. **Frontend Apps** - What users see and interact with
   - Web App (Next.js) - Main website
   - Mobile App (React Native) - iOS and Android
   - Community Portal - Social features
   - Chef Marketplace - Partner features

2. **Backend Services** - The brains behind everything
   - Supabase - Database and authentication
   - Serverless Functions - API endpoints
   - Redis - Caching for speed
   - AI Services - Meal generation

3. **Infrastructure** - Where everything runs
   - Vercel - Hosts the web apps
   - AWS - Cloud infrastructure
   - GitHub Actions - Automated deployments

**Everything works together** to create a seamless experience across all platforms.

---

## 🚀 Getting Started

**Ready to start building?** Here's how to get your development environment set up:

### What You'll Need

- **Node.js 18+** - The JavaScript runtime
- **pnpm 9.0.0+** - The package manager (faster than npm!)
- **Docker** - For running Supabase locally (optional but recommended)
- **Git** - Version control

**That's it!** Everything else is handled automatically.

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/whats-for-dinner.git
   cd whats-for-dinner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   This installs everything you need. Grab a coffee ☕—it takes a few minutes.

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start Supabase locally** (optional)
   ```bash
   cd whats-for-dinner
   supabase start
   ```
   This gives you a local database to work with.

5. **Start developing!**
   ```bash
   pnpm dev:web      # Web app on http://localhost:3000
   pnpm dev:mobile   # Mobile app (requires Expo Go app)
   ```

**That's it!** You're ready to start building.

---

## 📱 Apps and Services

**What's for Dinner is made up of several apps.** Here's what each one does:

### 1. Web Application (`apps/web`)

**The main website** where users plan meals and manage their pantry.

- **Technology**: Next.js 16, React 19, TypeScript
- **Port**: 3000
- **What it does**: Meal planning, recipe management, pantry tracking

**Start it**: `pnpm dev:web`

### 2. Mobile Application (`apps/mobile`)

**The mobile app** for iOS and Android.

- **Technology**: React Native, Expo
- **What it does**: Same features as web, optimized for mobile

**Start it**: `pnpm dev:mobile` (requires Expo Go app on your phone)

### 3. Community Portal (`apps/community-portal`)

**Where users share recipes and connect.**

- **Technology**: Next.js 16, React 19
- **Port**: 3001
- **What it does**: User-generated content, social features, recipe sharing

### 4. Chef Marketplace (`apps/chef-marketplace`)

**For chefs and partners** to sell recipe packs.

- **Technology**: Next.js 16, React 19
- **Port**: 3002
- **What it does**: Partner onboarding, recipe packs, analytics

### 5. API Documentation (`apps/api-docs`)

**Developer documentation** for our APIs.

- **Technology**: Next.js 16, Swagger UI
- **Port**: 3004
- **What it does**: API docs, SDK downloads, developer resources

---

## 🗄️ Database Schema

**Everything is stored in PostgreSQL** (via Supabase).

### Core Tables

- **Users** - User accounts and profiles
- **Recipes** - Recipe data and metadata
- **Pantry Items** - What users have in their pantry
- **Meal Plans** - Planned meals for the week
- **Favorites** - Recipes users have saved

### Community Tables

- **Posts** - User-generated content
- **Votes** - Voting on posts
- **Comments** - Comments and discussions

### Partner Tables

- **Chefs** - Chef profiles
- **Recipe Packs** - Collections of recipes
- **Earnings** - Revenue tracking

**Want to see the full schema?** Check out `supabase/migrations/` for all the SQL.

---

## 🔌 API Documentation

**We have APIs for everything.**

### Authentication

All API endpoints require authentication. We use Supabase Auth:

```typescript
const { data: { session } } = await supabase.auth.getSession()
```

### Core Endpoints

**Recipes**
- `GET /api/recipes` - List recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/:id` - Get recipe details

**Community**
- `GET /api/community/posts` - List posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/vote` - Vote on post

**Want the full API reference?** Check out [API.md](./API.md) or visit `/api-docs` when running locally.

---

## 🚢 Deployment

**Deploying is mostly automatic.** Here's how it works:

### Automatic Deployment

**Push to `main` branch** → GitHub Actions automatically:
1. Runs tests
2. Builds all apps
3. Deploys to Vercel (web apps)
4. Updates Supabase (database)

**That's it!** No manual steps needed.

### Manual Deployment

**Need to deploy manually?** Here's how:

1. **Deploy infrastructure** (if needed)
   ```bash
   cd infra
   terraform init
   terraform apply
   ```

2. **Deploy apps**
   ```bash
   vercel --prod              # Web apps
   supabase db push          # Database
   ```

**Most of the time, automatic deployment handles everything.**

---

## 🤝 Contributing

**Want to contribute?** Awesome! Here's how:

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Write tests
   - Update docs

3. **Test everything**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Create a pull request**
   - Describe what you changed
   - Link any related issues
   - We'll review it together!

**See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.**

---

## 🐛 Troubleshooting

**Running into issues?** Here are common problems and solutions:

### Database Connection Issues

**Problem**: Can't connect to Supabase

**Solution**:
- Check your `.env.local` file
- Verify Supabase credentials
- Make sure Supabase is running (if local)

### Build Failures

**Problem**: Build fails with errors

**Solution**:
```bash
# Clear everything and reinstall
rm -rf node_modules
pnpm install
pnpm build
```

### TypeScript Errors

**Problem**: TypeScript errors everywhere

**Solution**:
```bash
# Rebuild packages
pnpm build:packages
# Then try again
pnpm type-check
```

**Still stuck?** Open an issue and we'll help!

---

## 📖 More Documentation

**Want to dive deeper?**

- **[Architecture Guide](./architecture/)** - Detailed system design
- **[API Reference](./API.md)** - Complete API documentation
- **[Deployment Guide](./deploy.md)** - Production deployment
- **[Security Guide](./SECURITY_PRIVACY.md)** - Security practices

**Everything is documented.** If something's missing, let us know!

---

## 💬 Getting Help

**Need help?**

- **Check the docs** - Most questions are answered here
- **Open an issue** - Report bugs or ask questions
- **Join discussions** - Longer conversations
- **Read the code** - It's well-commented!

**We're here to help.** Don't hesitate to ask!

---

<div align="center">

**Happy building! 🚀**

Questions? [Open an Issue](https://github.com/your-org/whats-for-dinner/issues) • [Join Discussions](https://github.com/your-org/whats-for-dinner/discussions)

</div>
