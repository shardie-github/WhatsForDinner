# What's for Dinner? 🍽️

An AI-powered meal recommendation application that suggests delicious recipes based on your pantry ingredients and dietary preferences. Built with Next.js 16, React 19, TypeScript, and Supabase.

## ✨ Features

- 🤖 **AI-Powered Recipe Generation** - Get personalized meal suggestions using OpenAI GPT-4o-mini
- 🥘 **Pantry Management** - Track your ingredients and quantities
- ❤️ **Save Favorites** - Keep your favorite recipes for later
- 📱 **Progressive Web App** - Install as a native app on your device
- 🔄 **Offline Support** - Browse saved recipes even without internet
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Optimized with React Query and caching
- 🔒 **Secure** - Built with TypeScript and comprehensive validation

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ci` - Run tests in CI mode
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **AI**: OpenAI GPT-4o-mini
- **State Management**: TanStack Query
- **Testing**: Jest, React Testing Library
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel

## 📱 PWA Features

This app is a Progressive Web App (PWA) that can be installed on your device:

- **Install Prompt**: Click the install button when it appears
- **Offline Support**: Browse saved recipes without internet
- **App-like Experience**: Full-screen, native app feel
- **Fast Loading**: Cached resources for quick access

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

Run the test suite:

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

## 📚 Documentation

- [Technical Documentation](./TECH_DOCS.md) - Comprehensive technical details
- [API Reference](./TECH_DOCS.md#api-endpoints) - API endpoint documentation
- [Database Schema](./TECH_DOCS.md#database-schema) - Database structure
- [Deployment Guide](./TECH_DOCS.md#deployment) - Deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

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

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
