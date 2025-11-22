# 🍽️ What's for Dinner?

**Stop wondering. Start cooking.**

Every day at 6 PM, millions of people stare into their fridge and ask the same question: "What's for dinner?" 

We built What's for Dinner to answer that question—instantly, intelligently, and deliciously.

---

## The Problem We Solve

You know the feeling. It's been a long day. You're tired. You open the fridge and see... stuff. But what can you actually make with it? You don't have time to search through recipes. You don't want to order takeout again. You just want a good meal, and you want it now.

**What's for Dinner solves this daily dilemma.**

We combine AI-powered meal suggestions with smart pantry tracking to give you personalized recommendations based on what you actually have, your dietary preferences, and how much time you have to cook.

---

## Why This Matters

Meal planning shouldn't be a chore. It should be effortless, enjoyable, and inspiring.

We believe that:
- **Everyone deserves great meals**, regardless of cooking skill level
- **Food waste is preventable** with better visibility into what you have
- **Meal planning should save time**, not consume it
- **Cooking should be creative**, not stressful

What's for Dinner turns meal planning from a daily struggle into a delightful discovery.

---

## What Makes Us Different

### 🤖 AI That Actually Understands Your Kitchen

Our AI doesn't just suggest random recipes. It learns what you keep in stock, understands your preferences, and adapts to your cooking style. The more you use it, the smarter it gets.

### 🥫 Pantry Intelligence That Works

Track what you have with barcode scanning, manual entry, or receipt import. Get alerts when items are expiring. Discover recipes you can make right now with what's already in your pantry.

### 🛒 Seamless Grocery Integration

Add missing ingredients to your shopping list with one tap. Order directly from your favorite stores. Never forget an ingredient again.

### 📱 Your Kitchen, Everywhere

Your meal plans, shopping lists, and favorite recipes sync seamlessly across iOS, Android, and Web. Start planning on your phone, finish cooking with your tablet.

### ⚡ Works Offline

No internet? No problem. Access your saved meal plans and recipes even when you're offline. Perfect for cooking in areas with spotty connectivity.

---

## Real-World Use Cases

### The Busy Parent

Sarah has three kids, a full-time job, and 30 minutes to get dinner on the table. She opens What's for Dinner, scans what's in her fridge, and gets three meal suggestions that use what she has. She picks one, adds the missing ingredients to her shopping list, and starts cooking—all in under 2 minutes.

**Result**: Dinner is ready on time, the kids are happy, and Sarah feels like a meal-planning superhero.

### The Health-Conscious Professional

Marcus is trying to eat healthier but struggles with meal prep. He sets his dietary preferences (vegetarian, high protein), and What's for Dinner suggests meal plans for the week. He can see the macros for each meal, track his nutrition goals, and discover new healthy recipes that fit his lifestyle.

**Result**: Marcus sticks to his health goals without the mental overhead of planning every meal.

### The College Student

Emma lives in a dorm with a mini-fridge and limited cooking equipment. She tells the app what she has (eggs, bread, some veggies) and her cooking constraints (one pan, 15 minutes). The app suggests creative, simple meals she can actually make.

**Result**: Emma eats better, saves money, and learns to cook—all while living in a dorm.

### The Empty Nester

After their kids moved out, David and Lisa found themselves cooking for two but still buying family-sized portions. What's for Dinner helps them scale down recipes, reduce food waste, and discover new cuisines now that they have more time to experiment.

**Result**: Less waste, more variety, and a renewed love for cooking together.

---

## Quick Start

**Get cooking in under 60 seconds:**

```bash
# 1. Clone the repository
git clone https://github.com/your-org/whats-for-dinner.git
cd whats-for-dinner

# 2. Install dependencies
pnpm install

# 3. Set up your environment
cp .env.example .env.local
# Add your Supabase URL and API keys

# 4. Start developing
pnpm dev
```

Open `http://localhost:3000` and start planning your next meal.

**That's it.** No complex setup. No confusing configuration. Just clone, install, and start cooking.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    What's for Dinner                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   iOS App    │  │ Android App  │  │   Web App    │     │
│  │  (React      │  │  (React      │  │  (Next.js    │     │
│  │   Native)    │  │   Native)    │  │   15)        │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  Shared Packages │                        │
│                  │  • UI Components │                        │
│                  │  • Utils & Hooks │                        │
│                  │  • Theme System │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   Supabase      │                        │
│                  │  • PostgreSQL   │                        │
│                  │  • Auth         │                        │
│                  │  • Realtime     │                        │
│                  │  • Storage      │                        │
│                  └─────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Write once, run everywhere.** A single TypeScript codebase powers iOS, Android, and Web apps with shared components, utilities, and business logic.

---

## Key Features

### 🎯 Smart Meal Suggestions
Get personalized meal recommendations based on your pantry, dietary preferences, cooking time, and skill level.

### 📋 Pantry Management
Track what you have, get expiration alerts, and discover recipes you can make right now.

### 🛒 Grocery Lists
Automatically generate shopping lists from meal plans. Add items manually or scan barcodes.

### 📊 Nutrition Tracking
See macros and nutrition information for every meal. Track your health goals over time.

### 👨‍👩‍👧‍👦 Family Planning
Share meal plans with your household. Everyone can contribute ideas and see what's for dinner.

### 🔄 Recipe Discovery
Discover new recipes from our curated collection or save your own favorites.

### 🌙 Offline Support
Access your meal plans and saved recipes even without internet connectivity.

---

## Project Structure

```
whats-for-dinner/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities and hooks
│   ├── theme/            # Design system and theming
│   ├── config/           # Shared configurations
│   └── server/           # Server-side utilities
├── scripts/               # Automation and tooling
├── ops/                   # Operations and deployment
└── docs/                  # Documentation
```

**Everything is shared. Nothing is duplicated.** Our monorepo structure ensures consistency across platforms while minimizing code duplication.

---

## Technology Stack

**Frontend**
- React 19 & Next.js 15 for web
- React Native & Expo SDK 52 for mobile
- TypeScript for type safety
- Tailwind CSS & NativeWind for styling

**Backend**
- Supabase (PostgreSQL, Auth, Realtime, Storage)
- OpenAI GPT-4 for meal generation
- Serverless functions for API routes

**Infrastructure**
- Vercel for web deployment
- EAS Build for mobile apps
- GitHub Actions for CI/CD
- Turborepo for monorepo management

---

## Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm 8+
- Supabase account (free tier works)

### Available Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:web          # Web app only
pnpm dev:mobile       # Mobile app only

# Building
pnpm build            # Build all apps
pnpm build:web        # Web app only
pnpm build:mobile     # Mobile app only

# Testing
pnpm test             # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage    # Coverage report

# Code Quality
pnpm lint             # Lint code
pnpm lint:fix          # Auto-fix linting issues
pnpm type-check        # TypeScript type checking
pnpm format            # Format code with Prettier

# Operations
pnpm ops:doctor        # Health checks
pnpm ops:check         # All safety checks
pnpm health:check      # Comprehensive health dashboard
```

---

## Testing

We take testing seriously. Our test suite includes:

- ✅ **Unit Tests** - Component and function tests
- ✅ **Integration Tests** - API and database tests  
- ✅ **E2E Tests** - Full user journey tests with Playwright
- ✅ **Accessibility Tests** - Automated a11y checks
- ✅ **Performance Tests** - Lighthouse CI integration

Run `pnpm test` to execute the full test suite.

### Running Tests Locally

**Before pushing code, run tests locally:**

```bash
# Run all tests
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run CI tests (same as GitHub Actions)
pnpm test:ci
```

**All tests must pass before merging.** If tests fail locally, they'll fail in CI too.

### CI/CD Pipeline

**Every push triggers automated checks:**

1. **Linting** - Code style and quality checks
2. **Type Checking** - TypeScript type validation
3. **Tests** - Full test suite execution
4. **Build** - Verify everything compiles
5. **Security** - Dependency and secret scanning

**If any check fails, the PR can't be merged.** This keeps the codebase stable and reliable.

**Want to see CI in action?** Check the "Checks" tab on any pull request.

---

## Contributing

We welcome contributions! Whether you're fixing a bug, adding a feature, or improving documentation, your help makes What's for Dinner better for everyone.

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

**Make your first contribution in under 10 minutes.**

---

## Documentation

**Comprehensive docs for every aspect:**

- 📖 [Architecture Guide](docs/ARCHITECTURE.md) - System design and technical decisions
- 🔐 [Security Policy](SECURITY.md) - How we handle security
- 🛠️ [Setup Guide](docs/SETUP.md) - Complete setup instructions
- 🗄️ [Database Guide](docs/DATABASE.md) - Migration and schema docs
- 🔑 [Secrets Management](docs/SECRETS.md) - Secure secrets handling
- 🎯 [API Documentation](docs/API.md) - API endpoints and examples

**Everything you need to understand, deploy, and extend the system.**

---

## Roadmap

**What's coming next:**

- 🗓️ **Calendar Integration** - Sync with Google Calendar, Apple Calendar
- 👥 **Enhanced Family Features** - Better household management
- 🍳 **Cooking Mode** - Step-by-step instructions with timers
- 📊 **Advanced Nutrition** - Detailed macro tracking and meal analysis
- 🌍 **More Integrations** - Instacart, Amazon Fresh, more grocery stores
- 💬 **Community Recipes** - Share and discover recipes from other users

**Have an idea?** [Open an issue](https://github.com/your-org/whats-for-dinner/issues) and let's discuss it!

---

## Security & Privacy

**Your data is yours. We protect it fiercely.**

- 🔐 **End-to-End Encryption** - Sensitive data encrypted at rest and in transit
- 🛡️ **Row-Level Security** - Database-level access controls
- 🔑 **No Hardcoded Secrets** - Centralized secrets management
- 📋 **GDPR Compliant** - Full data export and deletion
- 🔍 **Regular Audits** - Automated security scanning

See [SECURITY.md](SECURITY.md) for our complete security policy.

---

## Performance

**Built for speed. Measured continuously.**

- ⚡ **LCP**: < 2.5s (Largest Contentful Paint)
- 🎯 **CLS**: < 0.1 (Cumulative Layout Shift)
- ⚙️ **FID**: < 100ms (First Input Delay)
- 📦 **Bundle Size**: < 170KB (JavaScript)
- 🚀 **TTFB**: < 500ms (Time to First Byte)

**We monitor these metrics in CI/CD. Every commit. Every deployment.**

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

**Need help?**

- 📖 Check the [documentation](docs/)
- 🐛 [Report a bug](https://github.com/your-org/whats-for-dinner/issues)
- 💬 [Ask a question](https://github.com/your-org/whats-for-dinner/discussions)
- 📧 Email: support@whatsfordinner.app

**We're here to help you succeed.**

---

## Acknowledgments

Built with love using:
- [Expo](https://expo.dev) - Amazing mobile development platform
- [Next.js](https://nextjs.org) - The React framework for production
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Turborepo](https://turbo.build) - High-performance build system
- And the amazing open-source community

---

<div align="center">

**🍽️ Stop wondering. Start cooking. 🍳**

Made with ❤️ by the What's for Dinner team

[Get Started](#quick-start) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md) • [Security](SECURITY.md)

</div>
