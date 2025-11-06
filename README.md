# 🍽️ What's for Dinner?

**Stop wondering. Start cooking.**

The universal meal planning app that helps you answer life's most important question—what's for dinner?—with AI-powered meal suggestions, smart pantry management, and seamless grocery integration.

---

## ✨ What Makes This Special?

**Ever find yourself staring into your fridge at 6 PM, wondering what to make?** You're not alone. What's for Dinner solves this daily dilemma with:

- 🤖 **AI-Powered Meal Suggestions** - Get personalized meal recommendations based on what you have, dietary preferences, and cooking time
- 🥫 **Smart Pantry Intelligence** - Track what you have, get alerts when you're running low, and discover recipes you can make right now
- 🛒 **Grocery Integration** - Seamlessly add ingredients to your shopping list or order directly from your favorite stores
- 📱 **Works Everywhere** - Your meal plan, shopping lists, and recipes sync across iOS, Android, and Web
- ⚡ **Offline Ready** - Access your meal plans and saved recipes even without internet

**Built for real people, solving real problems, every single day.**

---

## 🚀 Quick Start (60 Seconds)

**Get cooking in under a minute:**

```bash
# 1. Clone and install
git clone <repository-url>
cd whats-for-dinner
pnpm install

# 2. Set up your environment
cp .env.example .env.local
# Add your Supabase and API keys

# 3. Start developing
pnpm dev
```

**That's it!** Open `http://localhost:3000` and start planning your next meal.

---

## 🎯 The Problem We Solve

### Before What's for Dinner:
- ❌ Stand in front of the fridge, confused
- ❌ Waste food because you forget what you have
- ❌ Order takeout because you're out of ideas
- ❌ Make multiple trips to the store for forgotten ingredients
- ❌ Struggle with meal planning for the week

### With What's for Dinner:
- ✅ Get instant meal suggestions based on your pantry
- ✅ Never waste food with smart expiration tracking
- ✅ Discover new recipes you can actually make right now
- ✅ Build complete shopping lists automatically
- ✅ Plan your week with AI-powered meal suggestions

**We turn meal planning from a chore into a delight.**

---

## 💡 How It Works

### 1. **Add Your Pantry**
Scan barcodes, manually add items, or import from your grocery receipts. The app learns what you keep in stock.

### 2. **Tell Us Your Preferences**
Dietary restrictions? Allergies? Favorite cuisines? Cooking skill level? We'll tailor every suggestion to you.

### 3. **Get Suggestions**
Our AI analyzes your pantry, preferences, and available time to suggest meals you can actually make right now.

### 4. **Shop & Cook**
Add missing ingredients to your shopping list, order online, or use our partner integrations. Then follow step-by-step cooking instructions.

### 5. **Repeat & Improve**
Rate meals, save favorites, and watch as suggestions get smarter over time.

---

## 🛠️ Technical Excellence

**Built for scale, security, and reliability from day one.**

### Universal Architecture

Write once, run everywhere. A single TypeScript codebase powers:

- 📱 **iOS App** - Native performance with Expo SDK 52
- 🤖 **Android App** - Full feature parity with iOS
- 🌐 **Web App** - PWA with offline support
- 🖥️ **Desktop** - Electron support (coming soon)

### Modern Tech Stack

- **Frontend**: React 18, Next.js 15, React Native, Expo SDK 52
- **Styling**: NativeWind + Tailwind CSS (shared design system)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI**: OpenAI GPT-4 for meal generation and suggestions
- **Deployment**: Vercel (web), EAS Build (mobile)
- **CI/CD**: GitHub Actions with automated testing

### Self-Operating Production Framework

**This isn't just code—it's a complete operations system.**

Run `npm run ops doctor` and watch the system:
- ✅ Check code quality, security, and performance
- ✅ Run automated tests
- ✅ Verify database migrations
- ✅ Audit secrets and configurations
- ✅ Generate deployment reports
- ✅ And much more—all automatically

**The framework runs itself. You just approve releases.**

---

## 📦 Project Structure

```
whats-for-dinner/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS/Android)
│   └── web/             # Next.js 15 PWA
├── packages/
│   ├── ui/              # Shared UI components (cross-platform)
│   ├── utils/           # Shared utilities and hooks
│   ├── theme/           # Design system and theming
│   └── config/          # Shared configurations
├── scripts/             # Automation and tooling
├── ops/                 # Self-operating production framework
└── docs/                # Comprehensive documentation
```

**Everything is shared. Nothing is duplicated.**

---

## 🎨 Design Philosophy

**Clean. Simple. Delightful.**

We believe meal planning should be as enjoyable as cooking. Our design system ensures:

- **Consistency** - Same look and feel across all platforms
- **Accessibility** - WCAG 2.1 AA compliant
- **Performance** - Fast, responsive, offline-capable
- **Delight** - Beautiful animations and intuitive interactions

---

## 🔒 Security & Privacy

**Your data is yours. We protect it fiercely.**

- 🔐 **End-to-End Encryption** - Sensitive data encrypted at rest and in transit
- 🛡️ **Row-Level Security** - Database-level access controls
- 🔑 **Centralized Secrets** - No hardcoded credentials, ever
- 📋 **GDPR Compliant** - Full data export and deletion
- 🔍 **Regular Audits** - Automated security scanning and compliance checks

**We take security seriously because your privacy matters.**

---

## 📈 Performance Metrics

**Built for speed. Measured continuously.**

- ⚡ **LCP**: < 2.5s (Largest Contentful Paint)
- 🎯 **CLS**: < 0.1 (Cumulative Layout Shift)
- ⚙️ **FID**: < 100ms (First Input Delay)
- 📦 **Bundle Size**: < 170KB (JavaScript)
- 🚀 **TTFB**: < 500ms (Time to First Byte)

**We monitor these metrics in CI/CD. Every commit. Every deployment.**

---

## 🧪 Testing & Quality

**Code quality isn't optional. It's automatic.**

- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Unit Tests** - Comprehensive test suite
- ✅ **E2E Tests** - Playwright tests for critical flows
- ✅ **Integration Tests** - API and database testing
- ✅ **Accessibility Tests** - Automated a11y checks
- ✅ **Performance Tests** - Lighthouse CI integration

**Run `npm run check:all` to see everything in action.**

---

## 🚀 Deployment

**From commit to production in minutes.**

### Web App
Deployed automatically to Vercel on every push to `main`. Zero downtime deployments with instant rollbacks.

### Mobile Apps
- **iOS**: Built via EAS Build, submitted to App Store
- **Android**: Built via EAS Build, submitted to Play Store
- **Beta Testing**: TestFlight (iOS) and Internal Testing (Android)

### Database
Managed Supabase with automated backups, point-in-time recovery, and zero-downtime migrations.

**Everything is automated. Everything is monitored.**

---

## 🤝 Contributing

**We welcome contributions!** Whether you're fixing a bug, adding a feature, or improving documentation.

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

**Make your first contribution in under 10 minutes.**

---

## 📚 Documentation

**Comprehensive docs for every aspect:**

- 📖 [Architecture Guide](ARCHITECTURE.md) - System design and technical decisions
- 🔐 [Security Policy](SECURITY.md) - How we handle security
- 🛠️ [Setup Guide](COMPLETE_SETUP_GUIDE.md) - Complete setup instructions
- 🗄️ [Database Guide](DATABASE_MIGRATION_GUIDE.md) - Migration and schema docs
- 🔑 [Secrets Management](docs/SECRETS_MIGRATION_GUIDE.md) - Secure secrets handling
- 🎯 [API Documentation](docs/API.md) - API endpoints and examples

**Everything you need to understand, deploy, and extend the system.**

---

## 🎯 Roadmap

**What's coming next:**

- 🗓️ **Calendar Integration** - Sync with Google Calendar, Apple Calendar
- 👥 **Family Planning** - Shared meal plans for households
- 🍳 **Cooking Mode** - Step-by-step cooking instructions with timers
- 📊 **Nutrition Tracking** - Track macros and nutrition goals
- 🌍 **More Integrations** - Instacart, Amazon Fresh, more grocery stores
- 💬 **Community Recipes** - Share and discover recipes from other users

**Have an idea? [Open an issue](https://github.com/your-org/whats-for-dinner/issues)!**

---

## 📊 System Health

**Transparency is important. Here's how we're doing:**

Run `npm run health:check` to see:
- Code quality metrics
- Test coverage
- Security posture
- Performance benchmarks
- Documentation completeness

**Current Status**: 🟡 Needs improvement (see [PROJECT_HEALTH_DASHBOARD.json](PROJECT_HEALTH_DASHBOARD.json) for details)

---

## 🛠️ Development Commands

**Everything you need to build, test, and deploy:**

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Web app only
pnpm dev:mobile       # Mobile app only

# Building
pnpm build            # Build all apps
pnpm build:web        # Web app only
pnpm build:mobile     # Mobile app only

# Testing
pnpm test             # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report

# Quality
pnpm lint              # Lint code
pnpm lint:fix          # Auto-fix linting
pnpm type-check        # TypeScript checking
pnpm format            # Format code

# Operations
npm run ops doctor     # Health checks
npm run ops check      # All safety checks
npm run ops release    # Semantic release
npm run health:check   # Comprehensive health dashboard

# Secrets Management
npm run secrets:migrate # Migrate secrets to Supabase/Vercel
npm run secrets:sync   # Sync secrets between systems
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [Expo](https://expo.dev) - Amazing mobile development platform
- [Next.js](https://nextjs.org) - The React framework for production
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Turborepo](https://turbo.build) - High-performance build system
- And the amazing open-source community

---

## 🆘 Support

**Need help?**

- 📖 Check the [documentation](docs/)
- 🐛 [Report a bug](https://github.com/your-org/whats-for-dinner/issues)
- 💬 [Ask a question](https://github.com/your-org/whats-for-dinner/discussions)
- 📧 Email: support@whatsfordinner.app

**We're here to help you succeed.**

---

## 🌟 Star Us!

**If this project helps you, please ⭐ star us!**

It helps others discover the project and motivates us to keep improving.

---

<div align="center">

**🍽️ Stop wondering. Start cooking. 🍳**

Made with ❤️ by the What's for Dinner team

[Get Started](#-quick-start-60-seconds) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md) • [Security](SECURITY.md)

</div>


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
