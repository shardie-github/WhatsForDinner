# What's for Dinner - Ecosystem SaaS Platform

A comprehensive, enterprise-grade meal planning and recipe platform with full automation across growth, compliance, monetization, and development workflows.

## 🚀 Features

### Core Platform
- **AI-Powered Meal Planning**: Personalized meal recommendations based on dietary preferences
- **Recipe Management**: Create, save, and share recipes with advanced search
- **Pantry Integration**: Track ingredients and suggest recipes based on available items
- **Multi-Platform**: Web and mobile applications with real-time sync

### Enterprise Features
- **Multi-Tenant Architecture**: Support for organizations and teams
- **API Ecosystem**: Comprehensive REST and GraphQL APIs for partners
- **AI Agent System**: Specialized agents for dietary coaching, chef guidance, and trend analysis
- **Internationalization**: Full i18n support with 10+ languages

### Automation & Growth
- **Feature Flags**: A/B testing and gradual feature rollouts
- **Growth Automation**: Conversion optimization and retention strategies
- **Affiliate Monetization**: Integration with delivery apps and grocery chains
- **Compliance Automation**: GDPR/CCPA compliant with automated legal document generation

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: OpenAI GPT-4 with specialized agents
- **Deployment**: Vercel with GitHub Actions CI/CD
- **Monitoring**: Sentry, PostHog Analytics

### Key Systems
1. **Release Management**: Automated semantic versioning and deployment
2. **Feature Flags**: Real-time experimentation platform
3. **Internationalization**: Multi-language support pipeline
4. **AI Agents**: Domain-specific intelligent assistants
5. **Partner APIs**: B2B integration ecosystem
6. **Compliance**: Legal document automation
7. **Monetization**: Affiliate and subscription revenue
8. **Growth**: A/B testing and conversion optimization
9. **Repo Hygiene**: Automated code quality and onboarding
10. **Support**: AI-powered customer service

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account
- OpenAI API key

### Installation

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
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Set up the database**
   ```bash
   pnpm supabase:db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
whats-for-dinner/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard
│   │   └── ...
│   ├── components/            # Reusable UI components
│   │   ├── feedback/          # Feedback and support
│   │   ├── i18n/             # Internationalization
│   │   ├── monetization/     # Affiliate integration
│   │   └── ui/               # Base UI components
│   ├── lib/                  # Utility libraries
│   │   ├── ai-agents/        # AI agent system
│   │   ├── compliance/       # Legal and compliance
│   │   ├── growth/           # Growth automation
│   │   ├── monetization/     # Revenue systems
│   │   └── partner-api/      # Partner integrations
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript definitions
├── scripts/                  # Automation scripts
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm type-check       # Check TypeScript types
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage

# Database
pnpm supabase:start   # Start local Supabase
pnpm supabase:stop    # Stop local Supabase
pnpm supabase:db:push # Push schema changes

# Automation
pnpm autonomous:start # Start autonomous systems
pnpm hygiene:check    # Run repository hygiene check
```

### Code Standards

- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is enforced
- **Testing**: Write tests for new features
- **Commits**: Use conventional commit messages

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Run linting: `pnpm lint`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push and create a pull request

## 🌍 Internationalization

The platform supports multiple languages with automatic detection and manual switching:

- **Supported Languages**: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic
- **Features**: RTL support, currency formatting, date/time localization
- **Management**: Admin interface for translation management

## 🤖 AI Agents

The platform includes specialized AI agents:

- **Dietary Coach**: Personalized nutrition guidance
- **Master Chef**: Recipe creation and cooking tips
- **eBook Generator**: Personalized cookbook creation
- **Trend Analyzer**: Food trend insights and recommendations

## 🔌 API Integration

### Partner APIs

- **Delivery**: UberEats, DoorDash, Grubhub
- **Grocery**: Instacart, Amazon Fresh
- **Chef Partnerships**: Premium recipe packages

### Public APIs

- **Recipes API**: Search and manage recipes
- **Meal Plans API**: Create and manage meal plans
- **Nutrition API**: Analyze nutritional content
- **Partners API**: B2B integration endpoints

## 📊 Analytics & Monitoring

### Built-in Analytics
- **User Behavior**: Track user journeys and conversions
- **A/B Testing**: Statistical significance testing
- **Revenue Tracking**: Affiliate and subscription analytics
- **Performance**: Real-time performance monitoring

### External Integrations
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Product analytics and feature flags
- **Stripe**: Payment processing and analytics

## 🔒 Security & Compliance

### Security Features
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Data Encryption**: End-to-end encryption
- **API Security**: Rate limiting and key management

### Compliance
- **GDPR**: European data protection compliance
- **CCPA**: California privacy compliance
- **COPPA**: Children's privacy protection
- **Automated Legal**: AI-generated terms and privacy policies

## 🚀 Deployment

### Production Deployment

1. **Configure Environment Variables**
   ```bash
   # Production environment variables
   NEXT_PUBLIC_SUPABASE_URL=your_production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
   OPENAI_API_KEY=your_openai_key
   STRIPE_SECRET_KEY=your_stripe_key
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set up Monitoring**
   - Configure Sentry for error tracking
   - Set up PostHog for analytics
   - Configure alerting thresholds

### CI/CD Pipeline

The platform includes automated CI/CD with:
- **Automated Testing**: Runs on every PR
- **Code Quality**: Linting and type checking
- **Security Scanning**: Vulnerability detection
- **Automated Deployment**: Staging and production
- **Release Management**: Semantic versioning

## 📈 Growth & Monetization

### Revenue Streams
- **Subscriptions**: Free, Pro ($9.99/month), Enterprise ($29.99/month)
- **Affiliate Commissions**: 2.5-5% from delivery/grocery orders
- **Chef Partnerships**: 15% commission on premium packages
- **API Access**: Tiered pricing for partner integrations

### Growth Features
- **A/B Testing**: Conversion optimization
- **Referral Program**: User acquisition
- **Feature Flags**: Gradual rollouts
- **Analytics**: Data-driven decisions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/whats-for-dinner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/whats-for-dinner/discussions)
- **Email**: support@whatsfordinner.com

## 🎯 Roadmap

### Q1 2024
- [ ] Advanced AI agent training
- [ ] Mobile app release
- [ ] Enterprise SSO integration
- [ ] Advanced analytics dashboard

### Q2 2024
- [ ] Voice integration
- [ ] Smart home integration
- [ ] Advanced meal planning AI
- [ ] Community features

### Q3 2024
- [ ] International expansion
- [ ] Advanced personalization
- [ ] Machine learning optimization
- [ ] Enterprise features

---

**Built with ❤️ by the What's for Dinner team**

For more information, visit [whatsfordinner.com](https://whatsfordinner.com)