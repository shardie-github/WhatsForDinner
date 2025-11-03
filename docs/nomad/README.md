# Nomad - Front-End Experience Documentation

## ??? Overview

**Nomad** is a comprehensive, customizable meal planner + health tracker + cooking inspiration + family communication app. This document covers the complete front-end experience, visual system, and production-ready scaffold.

---

## ? Features

### Core Functionality
- **Meal Planning**: Drag-and-drop weekly meal planning with recipe integration
- **Health Tracking**: Calories, hydration, steps, sleep monitoring
- **Grocery Lists**: Auto-populated shopping lists with voice input and barcode scanning
- **Recipe Discovery**: AI-powered recommendations, video tutorials, trending recipes
- **Family Communication**: Real-time chat and shared meal planning
- **Gamification**: Streaks, badges, progress tracking

### Product Tiers

#### 1. Free Edition
- Core features with contextual in-app advertising
- Basic recipe recommendations
- Limited AI features
- Standard themes (Light/Dark)

#### 2. Nomad Premium
- AI-powered personalized recommendations
- Ad-free experience
- Offline sync capability
- Seasonal themes (Spring, Summer, Fall, Winter)
- Advanced health analytics

#### 3. Partner Integration Edition
- Co-branded API integration
- White-label customization
- Data partnerships
- Affiliate revenue sharing

---

## ?? Project Structure

```
apps/web/src/
??? app/
?   ??? nomad/                    # Nomad-specific routes
?   ?   ??? dashboard/           # Main dashboard
?   ?   ??? onboarding/         # Onboarding wizard
?   ?   ??? meal-planner/       # Meal planning interface
?   ?   ??? health-tracker/     # Health metrics
?   ?   ??? cooking/            # Recipe inspiration
?   ?   ??? family/             # Family features
?   ?       ??? chat/           # Family chat
?   ??? api/
?       ??? nomad/              # API routes
?           ??? user/           # User profile
?           ??? mealplan/       # Meal plans CRUD
?           ??? recipes/        # Recipe recommendations
?           ??? nutrition/      # Nutrition data
?           ??? family/         # Family features
??? components/
?   ??? nomad/                  # Nomad components
?       ??? MealPlanCard.tsx
?       ??? HealthMetricsCard.tsx
?       ??? GroceryListCard.tsx
?       ??? RecipeSpotlightCard.tsx
?       ??? FamilyFeedCard.tsx
?       ??? StreaksBadgesCard.tsx
?       ??? AdPlacement.tsx
??? hooks/
    ??? nomad/                  # Nomad hooks
        ??? useNomadData.ts

packages/
??? theme/src/
    ??? nomad-tokens.ts        # Design tokens

docs/nomad/
??? README.md                  # This file
??? UX_JOURNEY_MAPS.md        # User journey documentation
??? ARCHITECTURE.md           # Technical architecture
```

---

## ?? Design System

### Color Palette

**Primary Brand** (Orange - Adventure)
- `brand-500`: `#f59e0b` - Main brand color
- Warm, inviting, adventurous

**Secondary** (Earth Tones)
- Grounded, natural feel
- Supports primary brand

**Accent** (Green - Health)
- `accent-500`: `#22c55e` - Health and growth

**Health** (Blue - Wellness)
- `health-500`: `#3b82f6` - Calm, wellness

### Typography

- **Display**: Poppins (Headings)
- **Body**: Inter (Main text)
- **Accent**: Playfair Display (Recipe names, highlights)

### Components

All components follow a consistent design system:
- **Cards**: Rounded corners (`lg`), subtle shadows, hover effects
- **Buttons**: Multiple variants (default, outline, ghost)
- **Badges**: Color-coded by category
- **Inputs**: Consistent padding and border radius

See `/packages/theme/src/nomad-tokens.ts` for complete token definitions.

---

## ?? Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
pnpm dev:web
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Nutrition APIs
EDAMAM_APP_ID=your_edamam_id
EDAMAM_API_KEY=your_edamam_key
NUTRITIONIX_APP_ID=your_nutritionix_id
NUTRITIONIX_API_KEY=your_nutritionix_key

# Optional: Ad Networks
ADMOB_AD_UNIT_ID=your_admob_id
```

---

## ?? Core Screens

### 1. Onboarding (`/nomad/onboarding`)
Multi-step wizard collecting:
- Name and email
- Dietary preferences
- Allergens
- Health goals
- Household size
- Theme and notifications

### 2. Dashboard (`/nomad/dashboard`)
Modular widget layout:
- Meal Plan Card
- Health Metrics
- Grocery List
- Recipe Spotlight
- Family Feed
- Streaks & Badges
- Ad Placements (Free)

### 3. Meal Planner (`/nomad/meal-planner`)
Weekly grid with drag-and-drop:
- Calendar view
- Meal slots (breakfast, lunch, dinner, snack)
- Recipe integration
- Nutrition tracking

### 4. Health Tracker (`/nomad/health-tracker`)
Comprehensive metrics:
- Calories intake
- Hydration (glass tracker)
- Steps (wearable sync)
- Sleep tracking
- Weekly progress charts

### 5. Cooking Inspiration (`/nomad/cooking`)
Recipe discovery:
- Search and filter
- AI-powered recommendations
- Video tutorials
- Trending recipes
- Save favorites

### 6. Family Chat (`/nomad/family/chat`)
Real-time messaging:
- Message history
- Family member avatars
- Timestamps
- Typing indicators (future)

---

## ?? API Integration

### User Profile
```typescript
GET  /api/nomad/user
POST /api/nomad/user
```

### Meal Plans
```typescript
GET    /api/nomad/mealplan?week=2025-01-20
POST   /api/nomad/mealplan
DELETE /api/nomad/mealplan?id=123
```

### Recipes
```typescript
GET /api/nomad/recipes?preferences=vegetarian,mediterranean&limit=10
POST /api/nomad/recipes/ai-recommend (Premium)
```

### Nutrition
```typescript
GET /api/nomad/nutrition?q=chicken+breast
GET /api/nomad/nutrition?barcode=123456789
```

### Family
```typescript
GET  /api/nomad/family
POST /api/nomad/family (create/join)
GET  /api/nomad/family/chat?family_id=123
POST /api/nomad/family/chat
```

---

## ?? React Hooks

### useUserProfile()
Fetch and update user profile data.

### useMealPlans(week?, familyId?)
Fetch meal plans with optional filtering.

### useRecipes(options)
Get recipe recommendations with filters.

### useAIRecipeRecommendations()
AI-powered recipe suggestions (Premium).

### useNutritionData(query?, barcode?)
Look up nutrition information.

### useFamily()
Get family members and shared data.

### useFamilyChat(familyId)
Real-time family chat messages.

---

## ?? Ad Placement (Free Edition)

Ads are strategically placed:

1. **Feed Tiles**: Every 5th item in scrollable feeds
2. **Banners**: Below dashboard widgets
3. **Interstitials**: Between recipe views (dismissible, 5min cooldown)
4. **Sponsored**: Native ingredient recommendations

Component: `<AdPlacement tier="free" type="feed-tile" />`

---

## ?? Gamification

### Streaks
- Meal Planning Streak
- Health Tracking Streak
- Family Activity Streak

### Badges
- Week Warrior (7 days meal planning)
- Nutrition Master (50 meals logged)
- Family Champion (10 family meals)

### Progress Tracking
- Visual progress bars
- Percentage completion
- Achievement notifications

---

## ?? State Management

### Server State (React Query)
- User profiles
- Meal plans
- Recipes
- Family data
- Chat messages

### Client State (React Context)
- Theme selection
- Modal state
- Navigation
- Form state

### Real-time (Supabase)
- Chat messages
- Family activity
- Shared lists
- Meal plan updates

---

## ?? Performance

### Optimizations
- Route-based code splitting
- Dynamic imports
- Image optimization
- React Query caching
- Service Worker (offline)

### Bundle Size
- Target: < 200KB initial JS
- Lazy load heavy components
- Tree shaking enabled

---

## ? Accessibility

### WCAG AAA Compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Font scaling (200%)
- Motion reduction support

### Features
- Voice input for grocery lists
- High contrast mode
- Focus indicators
- Skip navigation links

---

## ?? Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm smoke:test
```

---

## ?? Deployment

### Build
```bash
pnpm build:web
```

### Environment
- Production Supabase instance
- CDN for static assets
- Analytics integration
- Error tracking (Sentry)

---

## ?? Future Enhancements

1. **Mobile Apps**: React Native/Expo
2. **Voice Assistant**: Alexa/Google Home
3. **Smart Home**: Kitchen device integration
4. **Social Features**: Recipe sharing, community
5. **Advanced AI**: Meal prep suggestions
6. **Nutrition Coaching**: Personalized guidance

---

## ?? Additional Documentation

- [UX Journey Maps](./UX_JOURNEY_MAPS.md) - User experience flows
- [Architecture](./ARCHITECTURE.md) - Technical details
- [Design Tokens](../../packages/theme/src/nomad-tokens.ts) - Complete design system

---

## ?? Contributing

1. Follow the design system
2. Use TypeScript
3. Write tests for new features
4. Follow accessibility guidelines
5. Update documentation

---

## ?? License

See LICENSE file in repository root.

---

## ?? Acknowledgments

Built with:
- Next.js
- React
- Tailwind CSS
- Radix UI
- Supabase
- TanStack Query
