# Architecture Overview

**What's for Dinner** - Enterprise-Grade Meal Planning Platform

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Mobile App  │  │  Partner API  │         │
│  │  (Next.js)   │  │ (React Native)│  │   (REST)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                     │
│                  ┌────────▼────────┐                            │
│                  │  API Gateway   │                            │
│                  │  (Next.js API) │                            │
│                  └────────┬────────┘                            │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                  ┌────────▼────────┐                            │
│                  │  Business Logic │                            │
│                  │     Layer       │                            │
│                  └────────┬────────┘                            │
│                           │                                     │
│  ┌────────────────────────┼────────────────────────┐         │
│  │                        │                        │         │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐ │
│  │  Meal Service   │  │  Pantry Service │  │ Recipe Service  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐ │
│  │  AI Service     │  │  Auth Service  │  │ Analytics Svc   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                  ┌────────▼────────┐                            │
│                  │  Data Layer    │                            │
│                  └────────┬────────┘                            │
│                           │                                     │
│  ┌────────────────────────┼────────────────────────┐         │
│  │                        │                        │         │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐ │
│  │   Supabase      │  │   OpenAI API   │  │  External APIs  │ │
│  │  (PostgreSQL)   │  │   (GPT-4)      │  │  (Stripe, etc)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

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

---

## Key Components

### 1. Web Application (`apps/web`)

**Technology:** Next.js 16, React 19, TypeScript

**Key Features:**
- Server-side rendering (SSR)
- API routes for backend logic
- Static site generation (SSG)
- Incremental static regeneration (ISR)

**Structure:**
```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes
│   │   └── (routes)/    # Page routes
│   ├── components/      # React components
│   ├── lib/             # Utilities and services
│   └── hooks/           # Custom React hooks
```

### 2. Mobile Application (`apps/mobile`)

**Technology:** React Native, Expo SDK 52

**Key Features:**
- Cross-platform (iOS & Android)
- Offline support
- Push notifications
- Native device integration

### 3. Shared Packages

#### `@whats-for-dinner/ui`
- Reusable UI components
- Design system implementation
- Accessible components

#### `@whats-for-dinner/utils`
- Shared utilities
- Logger service
- Error handling
- Retry logic
- Health checks

#### `@whats-for-dinner/config`
- Environment configuration
- Feature flags
- Shared constants

#### `@whats-for-dinner/server`
- Server-side utilities
- Database helpers
- API clients

---

## Data Flow

### User Request Flow

```
1. User Action (Click, Form Submit)
   ↓
2. React Component Handler
   ↓
3. API Route Handler (Next.js API)
   ↓
4. Business Logic Service
   ↓
5. Data Access Layer (Supabase Client)
   ↓
6. Database (PostgreSQL)
   ↓
7. Response flows back up
```

### Error Handling Flow

```
1. Error Occurs
   ↓
2. Error Handler Catches
   ↓
3. Logger Records Error
   ↓
4. Sentry Reports (if production)
   ↓
5. User-Friendly Error Response
```

---

## Key Patterns

### 1. Error Handling

**Unified Error Handler:**
```typescript
import { handleApiError } from '@whats-for-dinner/utils';

export async function POST(req: Request) {
  try {
    // Your code
  } catch (error) {
    return handleApiError(error, {
      component: 'api-route',
      context: { endpoint: '/api/example' },
    });
  }
}
```

### 2. Logging

**Component Logger:**
```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('component-name');

logger.info('Operation completed', { userId, result });
logger.error('Operation failed', { error });
```

### 3. Retry Logic

**With Exponential Backoff:**
```typescript
import { retry } from '@whats-for-dinner/utils';

const result = await retry(
  () => apiCall(),
  {
    maxAttempts: 3,
    initialDelayMs: 1000,
  }
);
```

### 4. Health Checks

**Health Endpoints:**
- `GET /api/health` - Full health check
- `GET /api/health/live` - Liveness probe
- `GET /api/health/ready` - Readiness probe

---

## Security Architecture

### Authentication & Authorization

- **Supabase Auth:** JWT-based authentication
- **Row-Level Security (RLS):** Database-level access control
- **Middleware:** Route protection and CSRF protection

### Data Protection

- **Encryption:** Data encrypted at rest and in transit
- **Secrets Management:** Environment variables, no hardcoded secrets
- **Input Validation:** Zod schemas for all inputs
- **Sensitive Data Redaction:** Automatic redaction in logs

---

## Performance Optimizations

### Caching Strategy

- **API Response Caching:** In-memory cache for frequent requests
- **Static Asset Caching:** CDN caching for static files
- **Database Query Caching:** Query result caching

### Code Splitting

- **Route-based:** Automatic code splitting per route
- **Component-based:** Dynamic imports for large components
- **Library Splitting:** Separate vendor bundles

### Database Optimization

- **Indexes:** Optimized database indexes
- **Query Optimization:** N+1 query prevention
- **Connection Pooling:** Efficient database connections

---

## Monitoring & Observability

### Logging

- **Structured Logging:** JSON format in production
- **Log Levels:** Debug, Info, Warn, Error
- **Correlation IDs:** Request tracing across services

### Error Tracking

- **Sentry Integration:** Automatic error reporting
- **Error Boundaries:** React error boundaries
- **Error Classification:** Categorized error types

### Performance Monitoring

- **Lighthouse CI:** Automated performance testing
- **Web Vitals:** Core Web Vitals tracking
- **API Monitoring:** Response time tracking

---

## Deployment Architecture

### Environments

- **Development:** Local development with hot reload
- **Staging:** Preview deployments for testing
- **Production:** Vercel-hosted production environment

### CI/CD Pipeline

1. **Code Push:** Triggers CI pipeline
2. **Tests:** Run test suite
3. **Linting:** Code quality checks
4. **Build:** Build application
5. **Deploy:** Deploy to Vercel

---

## Future Architecture Considerations

### Scalability

- **Horizontal Scaling:** Stateless API design
- **Database Scaling:** Read replicas, connection pooling
- **CDN:** Global content delivery

### Microservices (Future)

- **Service Separation:** Extract services as needed
- **API Gateway:** Centralized API management
- **Service Mesh:** Inter-service communication

---

## Technology Decisions

### Why Next.js?

- **SSR/SSG:** Better SEO and performance
- **API Routes:** Unified full-stack framework
- **File-based Routing:** Simple route management

### Why Supabase?

- **PostgreSQL:** Robust relational database
- **Real-time:** Built-in real-time subscriptions
- **Auth:** Integrated authentication
- **Storage:** File storage included

### Why TypeScript?

- **Type Safety:** Catch errors at compile time
- **Better IDE Support:** Autocomplete and refactoring
- **Documentation:** Types serve as documentation

### Why Turborepo?

- **Monorepo Management:** Efficient builds
- **Task Orchestration:** Parallel task execution
- **Caching:** Intelligent build caching

---

## Glossary

- **SSR:** Server-Side Rendering
- **SSG:** Static Site Generation
- **ISR:** Incremental Static Regeneration
- **RLS:** Row-Level Security
- **JWT:** JSON Web Token
- **API:** Application Programming Interface
- **CDN:** Content Delivery Network
- **CI/CD:** Continuous Integration/Continuous Deployment

---

**Last Updated:** 2025-01-27
