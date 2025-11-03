# Nomad Front-End Architecture

## Overview
Nomad is a comprehensive meal planning, health tracking, cooking inspiration, and family communication app built as a Next.js application within a monorepo structure.

---

## Tech Stack

### Front-End Framework
- **Next.js 16** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### State Management
- **TanStack Query (React Query)** for server state
- **React Context** for UI state
- **Supabase Realtime** for live updates (chat, family activity)

### UI Component Libraries
- **Lucide React** for icons
- **Radix UI** primitives
- **Custom components** in `/components/nomad/`

### Monorepo Structure
```
apps/
  web/                    # Next.js web app
    src/
      app/
        nomad/           # Nomad-specific routes
          dashboard/     # Main dashboard
          onboarding/    # Onboarding wizard
          meal-planner/  # Meal planning interface
          health-tracker/# Health metrics
          family/        # Family features
      components/
        nomad/          # Nomad components
      hooks/
        nomad/          # Nomad-specific hooks
      app/api/
        nomad/          # Nomad API routes
packages/
  theme/                # Design tokens
  ui/                   # Shared UI components
  utils/                # Shared utilities
```

---

## Design System

### Theme Tokens
Located in `/packages/theme/src/nomad-tokens.ts`:

- **Colors**: Brand (orange), Secondary (earth tones), Accent (green), Health (blue), Food palette
- **Typography**: Display (Poppins), Body (Inter), Accent (Playfair Display)
- **Spacing**: 4px base scale
- **Elevation**: Card shadows, modal overlays
- **Motion**: Easing curves, transition presets

### Theme Variants
- **Light**: Default light theme
- **Dark**: Dark mode support
- **Seasonal** (Premium): Spring, Summer, Fall, Winter themes

---

## Core Screens

### 1. Onboarding (`/nomad/onboarding`)
Multi-step wizard for:
- Account creation / social login
- Dietary preferences selection
- Allergen identification
- Health goals setup
- Household configuration
- Theme and notification preferences

### 2. Dashboard (`/nomad/dashboard`)
Modular widget system:
- Meal Plan Card
- Health Metrics Card
- Grocery List Card
- Recipe Spotlight Card
- Family Feed Card
- Streaks & Badges Card
- Ad Placements (Free tier)

### 3. Meal Planner (`/nomad/meal-planner`)
Drag-and-drop weekly meal planning:
- Calendar view with meal slots
- Recipe integration
- Nutrition tracking
- Family coordination

### 4. Health Tracker (`/nomad/health-tracker`)
Comprehensive health metrics:
- Calories tracking
- Hydration logging
- Activity sync (wearables)
- Sleep monitoring
- Weekly progress charts

### 5. Grocery List (`/nomad/grocery-list`)
Auto-populated shopping lists:
- Voice input support
- Barcode scanning
- Category organization
- Family sharing
- Check-off progress

### 6. Cooking Inspiration (`/nomad/recipes`)
Recipe discovery and recommendations:
- Browse recipes
- AI-powered suggestions (Premium)
- Video tutorials
- Save favorites
- Share with family

### 7. Family Chat (`/nomad/family/chat`)
Real-time communication:
- Message history
- Activity feed
- Shared meal planning
- Notifications

### 8. Profile & Settings (`/nomad/settings`)
User customization:
- Theme selection
- Privacy controls
- Subscription management
- Family management
- Notification preferences

---

## API Integration Layer

### Backend Routes

#### `/api/nomad/user`
- `GET`: Fetch user profile, preferences, allergens, goals
- `POST`: Update user profile and preferences

#### `/api/nomad/mealplan`
- `GET`: Fetch meal plans (with week/family filtering)
- `POST`: Create new meal plan entry
- `DELETE`: Remove meal plan entry

#### `/api/nomad/recipes`
- `GET`: Get recipe recommendations (with filters)
- `POST`: AI-powered recommendations (Premium)

#### `/api/nomad/nutrition`
- `GET`: Nutrition data lookup (Edamam/Nutritionix/Open Food Facts)

#### `/api/nomad/family`
- `GET`: Get family members, grocery lists, activity
- `POST`: Create or join family group

#### `/api/nomad/family/chat`
- `GET`: Fetch chat messages
- `POST`: Send chat message

### External Integrations

#### Nutrition Data
- **Open Food Facts**: Barcode lookup (free, no API key)
- **Edamam Nutrition API**: Food nutrition analysis (requires API key)
- **Nutritionix API**: Alternative nutrition data (requires API key)

#### Wearables
- **Google Fit**: Activity and health data sync
- **Apple HealthKit**: iOS health data integration

#### Messaging
- **Supabase Realtime**: Real-time chat and notifications
- **Firebase Cloud Messaging**: Push notifications (alternative)

#### Advertising (Free Edition)
- **Google AdMob**: Primary ad network
- **House Ads**: Fallback promotional content

---

## Component Architecture

### Widget System
Dashboard widgets are modular, reusable components:

```typescript
// Widget structure
<WidgetCard>
  <WidgetHeader />
  <WidgetContent />
  <WidgetActions />
</WidgetCard>
```

### Data Flow
1. **Server Components**: Fetch initial data
2. **Client Components**: Interactive UI
3. **React Query**: Cache and sync server state
4. **Supabase Realtime**: Live updates
5. **Local State**: UI-only state (modals, forms)

---

## State Management

### Server State (React Query)
- User profile
- Meal plans
- Recipes
- Family data
- Chat messages

### Client State (React Context)
- UI theme
- Modal state
- Navigation state
- Form state

### Real-time State (Supabase)
- Chat messages
- Family activity
- Shared grocery lists
- Meal plan updates

---

## Performance Optimizations

### Code Splitting
- Route-based code splitting (Next.js App Router)
- Dynamic imports for heavy components
- Lazy loading of images and videos

### Caching Strategy
- React Query with stale-while-revalidate
- Next.js ISR for recipe pages
- Service Worker for offline support

### Bundle Optimization
- Tree shaking
- Unused code elimination
- Image optimization (Next.js Image component)

---

## Accessibility

### WCAG Compliance
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels)
- Color contrast (AAA compliant)
- Font scaling support (up to 200%)
- Motion reduction support (`prefers-reduced-motion`)

### Features
- Voice input for grocery lists
- High contrast mode
- Focus indicators
- Skip navigation links

---

## Ad Placement System (Free Edition)

### Ad Types
1. **Feed Tiles**: Every 5th item in scrollable feeds
2. **Banners**: Below dashboard widgets
3. **Interstitials**: Between recipe views (dismissible, 5min cooldown)
4. **Sponsored Content**: Native-style ingredient recommendations

### Implementation
- Component: `/components/nomad/AdPlacement.tsx`
- Configuration: `nomadAdPlacements` in design tokens
- Tracking: Click and impression tracking

---

## Premium Features

### AI-Powered Recommendations
- Personalized recipe suggestions based on:
  - Available pantry items
  - Dietary preferences
  - Health goals
  - Past meal history

### Offline Sync
- Service Worker for offline access
- IndexedDB for local storage
- Sync when online

### Ad-Free Experience
- No ad placements
- Uninterrupted experience

### Seasonal Themes
- Spring, Summer, Fall, Winter themes
- Auto-switching based on date (optional)

---

## Partner Integration

### Co-branding
- Custom themes and colors
- Partner logo integration
- White-label options

### API Partnerships
- OAuth integration (Walmart, Instacart)
- Affiliate data feeds
- Revenue sharing

### Data Partnerships
- Shared recipe databases
- Ingredient recommendations
- Nutritional data

---

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev:web

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

### Building
```bash
# Build all packages
pnpm build:packages

# Build web app
pnpm build:web
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Nutrition APIs
EDAMAM_APP_ID=
EDAMAM_API_KEY=
NUTRITIONIX_APP_ID=
NUTRITIONIX_API_KEY=

# Ad Networks
ADMOB_AD_UNIT_ID=
ADMOB_APP_ID=

# Google Fit / Apple Health
GOOGLE_FIT_CLIENT_ID=
APPLE_HEALTHKIT_ENABLED=true
```

---

## Testing Strategy

### Unit Tests
- Component rendering
- Hook behavior
- Utility functions

### Integration Tests
- API route handlers
- Database queries
- Authentication flows

### E2E Tests
- User onboarding
- Meal planning workflow
- Family chat
- Health tracking

---

## Deployment

### Build Output
- Static pages for marketing
- ISR for recipe pages
- API routes for dynamic content
- Service Worker for PWA

### Environment Setup
- Production Supabase instance
- CDN for static assets
- Analytics integration
- Error tracking (Sentry)

---

## Future Enhancements

1. **Mobile Apps**: React Native/Expo apps using shared components
2. **Voice Assistant**: Alexa/Google Home integration
3. **Smart Home**: Integration with smart kitchen devices
4. **Social Features**: Recipe sharing, community feed
5. **Advanced AI**: Meal prep suggestions, ingredient substitutions
6. **Nutrition Coaching**: Personalized nutritionist recommendations

---

## Resources

- [Design Tokens](./nomad-tokens.ts)
- [UX Journey Maps](./UX_JOURNEY_MAPS.md)
- [Component Library](../../apps/web/src/components/nomad/)
- [API Documentation](../../apps/web/src/app/api/nomad/)
