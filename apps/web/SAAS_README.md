# What's for Dinner? - Multi-Tenant SaaS Platform

A production-ready, scalable SaaS platform that transforms AI meal planning into a monetized, multi-tenant service with Stripe integration, usage analytics, and comprehensive admin controls.

## 🚀 Features

### Multi-Tenant Architecture

- **Tenant Isolation**: Complete data separation using Supabase RLS
- **Role-Based Access**: Owner, Editor, Viewer roles with granular permissions
- **Team Management**: Invite users, manage memberships, and control access
- **Automatic Tenant Creation**: New users get their own isolated workspace

### Subscription & Billing

- **Stripe Integration**: Complete checkout, webhooks, and subscription management
- **Three Pricing Tiers**:
  - **Free**: 3 AI meals/day, 1 pantry list
  - **Pro**: $9.99/month, unlimited meals, AI nutrition summaries
  - **Family**: $19.99/month, shared pantry, up to 5 members
- **Usage Tracking**: Real-time quota monitoring and cost analysis
- **Billing Portal**: Self-service subscription management

### AI Cost Optimization

- **Smart Caching**: Reduces API costs with intelligent response caching
- **Model Selection**: Automatic GPT-4o vs GPT-4o-mini selection based on plan
- **Fallback Systems**: Graceful degradation when APIs are unavailable
- **Cost Analytics**: Detailed tracking of AI usage and expenses

### Admin Dashboard

- **Comprehensive Analytics**: Usage metrics, revenue tracking, user activity
- **User Management**: Invite users, manage roles, view activity
- **Billing Overview**: Subscription status, payment history, cost analysis
- **System Settings**: Configure limits, features, and tenant preferences

### Advanced Features

- **Usage Quotas**: Enforce daily limits based on subscription plan
- **Analytics Tracking**: Detailed user behavior and system performance metrics
- **Error Monitoring**: Comprehensive logging and error reporting
- **Performance Optimization**: Caching, query optimization, and resource management

## 🏗️ Architecture

### Database Schema

```sql
-- Core tenant tables
tenants (id, name, plan, stripe_customer_id, status, settings)
tenant_memberships (tenant_id, user_id, role, status)
subscriptions (tenant_id, stripe_subscription_id, plan, status)
usage_logs (tenant_id, action, tokens_used, cost_usd, timestamp)

-- AI optimization
ai_cache (tenant_id, cache_key, response_data, expires_at)

-- Existing tables with tenant isolation
profiles, pantry_items, recipes, favorites (all with tenant_id)
```

### Key Components

#### Frontend

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for state management
- **Multi-tenant hooks** for data access

#### Backend

- **Supabase** for database and auth
- **Stripe** for payments and subscriptions
- **OpenAI API** for AI meal generation
- **Row Level Security** for tenant isolation

#### AI Optimization

- **Intelligent Caching** with TTL-based expiration
- **Model Selection** based on plan and cost
- **Fallback Mechanisms** for reliability
- **Cost Tracking** and analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- OpenAI API key

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRO_PRICE_ID=your_pro_price_id
STRIPE_FAMILY_PRICE_ID=your_family_price_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

### Database Setup

1. Run the migration files in order:
   - `001_create_tables.sql`
   - `002_analytics_logging_tables.sql`
   - `003_multi_tenant_saas_schema.sql`

2. Set up Stripe webhooks pointing to `/api/stripe/webhook`

3. Configure Supabase RLS policies for tenant isolation

## 📊 Usage Analytics

### Key Metrics Tracked

- **User Engagement**: Page views, session duration, feature usage
- **AI Performance**: Response times, success rates, error rates
- **Cost Analysis**: Token usage, API costs, optimization savings
- **Business Metrics**: Revenue, churn, conversion rates

### Admin Dashboard Features

- **Real-time Usage**: Live quota tracking and cost monitoring
- **User Management**: Team member administration and role management
- **Billing Overview**: Subscription status and payment history
- **System Health**: Performance metrics and error monitoring

## 🔧 Configuration

### Tenant Settings

```typescript
interface TenantSettings {
  notifications: {
    email: boolean;
    push: boolean;
    weekly_digest: boolean;
  };
  features: {
    ai_optimization: boolean;
    analytics_tracking: boolean;
    data_retention_days: number;
  };
  limits: {
    max_members: number;
    max_pantry_items: number;
    max_recipes: number;
  };
}
```

### AI Optimization Config

```typescript
interface OptimizationConfig {
  enableCaching: boolean;
  cacheTTL: number; // seconds
  fallbackToCache: boolean;
  costThreshold: number; // USD per request
  modelSelection: 'auto' | 'gpt-4o-mini' | 'gpt-4o';
}
```

## 🛡️ Security

### Data Protection

- **Row Level Security**: Database-level tenant isolation
- **API Authentication**: JWT-based user authentication
- **Webhook Security**: Stripe signature verification
- **Input Validation**: Zod schema validation for all inputs

### Privacy Compliance

- **GDPR Ready**: Data retention controls and user consent
- **Data Isolation**: Complete tenant data separation
- **Audit Logging**: Comprehensive activity tracking
- **Secure Storage**: Encrypted sensitive data

## 📈 Scaling Considerations

### Performance

- **Database Indexing**: Optimized queries for multi-tenant access
- **Caching Strategy**: Redis for session and API response caching
- **CDN Integration**: Static asset optimization
- **Load Balancing**: Horizontal scaling support

### Cost Optimization

- **AI Caching**: Reduce OpenAI API costs by 60-80%
- **Model Selection**: Use cheaper models when appropriate
- **Usage Monitoring**: Real-time cost tracking and alerts
- **Resource Limits**: Prevent runaway costs with quotas

## 🚀 Deployment

### Production Checklist

- [ ] Configure production environment variables
- [ ] Set up Stripe webhooks for production
- [ ] Configure Supabase production database
- [ ] Set up monitoring and alerting
- [ ] Configure CDN and caching
- [ ] Set up backup and disaster recovery
- [ ] Configure SSL certificates
- [ ] Set up CI/CD pipeline

### Monitoring

- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: Revenue, user growth, conversion rates
- **Infrastructure Metrics**: CPU, memory, database performance
- **Cost Metrics**: AI usage, infrastructure costs, revenue

## 📚 API Documentation

### Core Endpoints

- `POST /api/dinner` - Generate AI recipes
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create customer portal session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Admin Endpoints

- `GET /admin` - Dashboard overview
- `GET /admin/users` - User management
- `GET /admin/analytics` - Usage analytics
- `GET /admin/billing` - Billing overview
- `GET /admin/settings` - Tenant settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ for the future of AI-powered meal planning**
