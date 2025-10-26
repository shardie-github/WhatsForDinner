# What's for Dinner? 🍽️

An AI-powered meal recommendation application that suggests delicious recipes based on your pantry ingredients and dietary preferences. Built with Next.js 15, React 19, TypeScript, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.76.1-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

- 🤖 **AI-Powered Recipe Generation** - Get personalized meal suggestions using OpenAI GPT-4o-mini
- 🥘 **Pantry Management** - Track your ingredients and quantities
- ❤️ **Save Favorites** - Keep your favorite recipes for later
- 📱 **Progressive Web App** - Install as a native app on your device
- 🔄 **Offline Support** - Browse saved recipes even without internet
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Optimized with React Query and caching
- 🔒 **Secure** - Built with TypeScript and comprehensive validation
- 🌙 **Dark Mode** - System preference detection and theme switching
- 📊 **Analytics** - Track usage and performance metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or later
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/whats-for-dinner.git
   cd whats-for-dinner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your environment variables:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL migration from `supabase/migrations/001_create_tables.sql`
   - Enable Row Level Security (RLS) policies

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run tests in CI mode
- `npm run test:coverage` - Run tests with coverage

### Database
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset local database
- `npm run supabase:deploy` - Deploy Supabase functions
- `npm run supabase:gen:types` - Generate TypeScript types

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **AI**: OpenAI GPT-4o-mini
- **Payments**: Stripe

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Type Checking**: TypeScript

## 📁 Project Structure

```
whats-for-dinner/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and configurations
│   └── utils/                # Helper utilities
├── supabase/                 # Supabase configuration
│   ├── functions/            # Edge functions
│   └── migrations/           # Database migrations
├── tests/                    # Test files
├── docs/                     # Documentation
└── scripts/                  # Build and deployment scripts
```

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Run the database migration from `supabase/migrations/`
4. Enable Row Level Security (RLS) policies

### OpenAI Setup

1. Get an API key from [OpenAI](https://platform.openai.com)
2. Add it to your `.env.local` file
3. Ensure you have credits available

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Optional: Stripe (for payments)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your reverse proxy

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Structure

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API route and database tests
- **E2E Tests**: Full user journey tests with Playwright

## 📚 Documentation

- [Technical Documentation](./TECH_DOCS.md) - Comprehensive technical details
- [API Reference](./TECH_DOCS.md#api-endpoints) - API endpoint documentation
- [Database Schema](./TECH_DOCS.md#database-schema) - Database structure
- [Deployment Guide](./TECH_DOCS.md#deployment) - Deployment instructions
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Supabase](https://supabase.com) for the backend services
- [OpenAI](https://openai.com) for the AI capabilities
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [Vercel](https://vercel.com) for the deployment platform

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](./TECH_DOCS.md)
2. Search [existing issues](https://github.com/yourusername/whats-for-dinner/issues)
3. Create a [new issue](https://github.com/yourusername/whats-for-dinner/issues/new)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Recipe sharing and social features
- [ ] Advanced dietary restrictions
- [ ] Meal planning and calendar integration
- [ ] Grocery list generation
- [ ] Voice commands and smart speaker integration

---

Made with ❤️ by [Your Name](https://github.com/yourusername)