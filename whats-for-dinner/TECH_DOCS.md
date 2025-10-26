# What's for Dinner? - Technical Documentation

## Overview

"What's for Dinner?" is a production-ready AI-powered meal recommendation application built with Next.js 16, React 19, TypeScript, and Supabase. The application provides intelligent recipe suggestions based on user's pantry ingredients and dietary preferences.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - Backend-as-a-Service (Database, Auth, Real-time)
- **OpenAI GPT-4o-mini** - AI recipe generation
- **Next.js API Routes** - Serverless API endpoints

### Development & Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **TypeScript** - Type checking

### PWA & Performance
- **Service Worker** - Offline functionality
- **Web App Manifest** - PWA installation
- **React Query** - Intelligent caching
- **Skeleton Loaders** - Loading states

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── dinner/        # Recipe generation endpoint
│   ├── auth/              # Authentication page
│   ├── favorites/         # Saved recipes page
│   ├── pantry/            # Pantry management page
│   ├── offline/           # Offline fallback page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── InputPrompt.tsx    # Recipe input form
│   ├── RecipeCard.tsx     # Recipe display card
│   ├── PantryManager.tsx  # Pantry CRUD interface
│   ├── Navbar.tsx         # Navigation component
│   ├── PWAInstaller.tsx   # PWA installation prompt
│   └── SkeletonLoader.tsx # Loading state components
├── hooks/                 # Custom React hooks
│   ├── useRecipes.ts      # Recipe generation logic
│   ├── usePantry.ts       # Pantry management
│   └── useFavorites.ts    # Favorites management
├── lib/                   # Utility libraries
│   ├── openaiClient.ts    # OpenAI configuration
│   ├── openaiService.ts   # AI service with retry logic
│   ├── supabaseClient.ts  # Supabase configuration
│   ├── queryClient.ts     # React Query setup
│   └── validation.ts      # Zod schemas
└── __tests__/             # Test files
    └── components/        # Component tests
```

## Database Schema

### Tables

#### `profiles`
- `id` (uuid, primary key) - References auth.users
- `name` (text) - User's display name
- `preferences` (jsonb) - Dietary preferences

#### `pantry_items`
- `id` (bigint, primary key) - Auto-incrementing ID
- `user_id` (uuid) - References profiles.id
- `ingredient` (text) - Ingredient name
- `quantity` (int) - Quantity available

#### `recipes`
- `id` (bigint, primary key) - Auto-incrementing ID
- `user_id` (uuid) - References profiles.id
- `title` (text) - Recipe title
- `details` (jsonb) - Full recipe object
- `calories` (int) - Calories per serving
- `time` (text) - Cook time

#### `favorites`
- `id` (bigint, primary key) - Auto-incrementing ID
- `user_id` (uuid) - References profiles.id
- `recipe_id` (bigint) - References recipes.id

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data.

## API Endpoints

### POST /api/dinner
Generates AI-powered recipe suggestions.

**Request Body:**
```json
{
  "ingredients": ["pasta", "tomatoes", "garlic"],
  "preferences": "vegetarian"
}
```

**Response:**
```json
{
  "recipes": [
    {
      "title": "Pasta with Tomatoes",
      "cookTime": "30 minutes",
      "calories": 450,
      "ingredients": ["pasta", "tomatoes", "garlic", "olive oil"],
      "steps": ["Boil pasta", "Sauté garlic", "Add tomatoes"]
    }
  ],
  "metadata": {
    "model": "gpt-4o-mini",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "retryCount": 0
  }
}
```

## Environment Variables

### Required
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### Optional
```bash
# Vercel Configuration (for deployment)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## Security Features

### Input Validation
- **Zod schemas** for all API inputs and outputs
- **Type-safe** request/response handling
- **Sanitized** user inputs

### Authentication
- **Supabase Auth** with email/password
- **Row Level Security** for data isolation
- **JWT tokens** for session management

### API Security
- **Server-side only** OpenAI API key
- **Rate limiting** via Supabase
- **CORS protection** built into Next.js

## Performance Optimizations

### Caching Strategy
- **React Query** for client-side caching
- **Service Worker** for offline caching
- **Static generation** for public pages
- **Image optimization** via Next.js

### Loading States
- **Skeleton loaders** for better UX
- **Progressive loading** of components
- **Error boundaries** for graceful failures

### Bundle Optimization
- **Code splitting** via Next.js
- **Tree shaking** for unused code
- **Minification** in production builds

## PWA Features

### Offline Support
- **Service Worker** for offline functionality
- **Cached resources** for offline browsing
- **Offline page** for navigation failures

### Installation
- **Web App Manifest** for native app feel
- **Install prompt** for supported browsers
- **App-like experience** on mobile devices

## Testing Strategy

### Unit Tests
- **Component testing** with React Testing Library
- **Hook testing** for custom logic
- **API testing** for endpoints

### Integration Tests
- **User flow testing** end-to-end
- **Database integration** testing
- **External API** mocking

### Coverage Goals
- **80%+ code coverage** across all modules
- **Critical path testing** for user journeys
- **Error scenario testing** for edge cases

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure reverse proxy (nginx/Apache)

### Environment Setup
1. Create Supabase project
2. Run database migrations
3. Configure OpenAI API key
4. Set up Vercel project

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint
```

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for pre-commit hooks

### Git Workflow
- **Feature branches** for new features
- **Pull requests** for code review
- **Automated testing** on PR creation
- **Deployment** on main branch merge

## Monitoring & Analytics

### Error Tracking
- **Console logging** for development
- **Error boundaries** for React errors
- **API error handling** with user feedback

### Performance Monitoring
- **Core Web Vitals** tracking
- **Bundle size** monitoring
- **API response time** tracking

## Future Enhancements

### Planned Features
- **Recipe ratings** and reviews
- **Meal planning** calendar
- **Grocery list** generation
- **Social sharing** of recipes
- **Nutritional analysis** integration

### Technical Improvements
- **Real-time updates** with Supabase
- **Advanced caching** strategies
- **Microservices** architecture
- **GraphQL** API layer

## Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables are set
- Verify all dependencies are installed
- Run `npm run type-check` for TypeScript errors

#### API Errors
- Verify OpenAI API key is valid
- Check Supabase connection
- Review network connectivity

#### PWA Issues
- Ensure HTTPS in production
- Check service worker registration
- Verify manifest.json is accessible

### Support
- Check GitHub Issues for known problems
- Review documentation for setup guides
- Contact development team for critical issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Changelog

### v1.0.0 (Current)
- Initial release with core functionality
- AI-powered recipe generation
- Pantry management
- User authentication
- PWA support
- Offline functionality