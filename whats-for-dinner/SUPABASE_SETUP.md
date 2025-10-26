# Supabase Backend Setup for "What's for Dinner"

This document outlines the complete Supabase backend setup for the "What's for Dinner" application, including database schema, Edge Functions, job queue system, and CI/CD pipeline.

## 🏗️ Architecture Overview

The backend consists of:
- **PostgreSQL Database** with Row Level Security (RLS)
- **Edge Functions** for API endpoints and AI meal generation
- **Job Queue System** for asynchronous task processing
- **GitHub Actions CI/CD** for automated deployment
- **Multi-tenant SaaS** architecture with usage tracking

## 📊 Database Schema

### Core Tables
- `users` - User profiles and authentication
- `recipes` - Generated and saved recipes
- `pantry_items` - User's available ingredients
- `favorites` - User's favorite recipes
- `jobs_queue` - Asynchronous job processing
- `job_results` - Job execution results
- `job_logs` - Detailed job logging

### Multi-tenant Tables
- `tenants` - Organization/team management
- `tenant_memberships` - User-tenant relationships
- `subscriptions` - Billing and plan management
- `usage_logs` - API usage tracking
- `ai_cache` - OpenAI response caching

### Analytics Tables
- `analytics_events` - User behavior tracking
- `recipe_metrics` - Recipe performance data
- `system_metrics` - Infrastructure monitoring
- `recipe_feedback` - User feedback on recipes

## 🚀 Edge Functions

### 1. API Function (`/functions/v1/api`)
- **Pantry Management**: CRUD operations for pantry items
- **Recipe Management**: CRUD operations for recipes
- **Favorites Management**: CRUD operations for user favorites
- **Authentication**: JWT token validation
- **CORS Support**: Cross-origin request handling

### 2. Meal Generation Function (`/functions/v1/generate-meal`)
- **OpenAI Integration**: GPT-4 powered meal generation
- **Caching**: Response caching for cost optimization
- **Quota Management**: User plan-based usage limits
- **Recipe Storage**: Automatic recipe saving
- **Metrics Tracking**: Performance and usage analytics

### 3. Job Processor Function (`/functions/v1/job-processor`)
- **Job Processing**: Asynchronous task execution
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Handling**: Comprehensive error logging
- **Job Types**: Meal generation, email notifications, data cleanup, analytics

## 🔄 Job Queue System

### Job Types
1. **meal_generation** - AI-powered recipe creation
2. **email_notification** - User communication
3. **data_cleanup** - Database maintenance
4. **analytics_processing** - Data analysis

### Job Management
- **Priority System**: Higher priority jobs processed first
- **Retry Logic**: Configurable retry attempts
- **Dead Letter Queue**: Failed job handling
- **Scheduling**: Cron-based job creation
- **Monitoring**: Real-time job statistics

### Job Queue Manager
```bash
# Start the job processor
npm run job-queue:start

# Check job statistics
npm run job-queue:stats

# Create a meal generation job
npm run job-queue:create-meal

# Run cleanup jobs
npm run job-queue:cleanup
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Supabase CLI
- Deno (for Edge Functions)
- PostgreSQL (local development)

### Installation
```bash
# Install dependencies
npm install

# Start local Supabase
npm run supabase:start

# Deploy Edge Functions locally
npm run supabase:deploy:all

# Generate TypeScript types
npm run supabase:gen:types
```

### Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_REF=your_project_ref

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# GitHub Actions Secrets
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
```

## 🚀 Deployment

### GitHub Actions CI/CD
The deployment pipeline includes:
1. **Linting & Testing**: Code quality checks
2. **Database Migration**: Schema updates
3. **Edge Function Deployment**: Function updates
4. **Secret Management**: Environment variable injection
5. **Verification**: Post-deployment testing

### Manual Deployment
```bash
# Deploy database changes
npm run supabase:db:push

# Deploy all Edge Functions
npm run supabase:deploy:all

# Set environment secrets
supabase secrets set OPENAI_API_KEY="your_key" --project-ref your_project_ref
```

## 🔒 Security Features

### Row Level Security (RLS)
- **Tenant Isolation**: Data separated by organization
- **User Authentication**: JWT-based access control
- **Role-based Access**: Owner, Editor, Viewer permissions
- **API Security**: Service role key for admin operations

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: API usage throttling
- **Input Validation**: Request sanitization

## 📈 Monitoring & Analytics

### Metrics Tracked
- **API Performance**: Response times and error rates
- **User Engagement**: Feature usage and retention
- **Cost Analysis**: OpenAI token usage and costs
- **System Health**: Database and function performance

### Logging
- **Structured Logging**: JSON-formatted logs
- **Error Tracking**: Detailed error reporting
- **Audit Trails**: User action logging
- **Performance Metrics**: Response time tracking

## 🧪 Testing

### Edge Function Testing
```bash
# Lint functions
npm run functions:lint

# Type check functions
npm run functions:type-check

# Format functions
npm run functions:format
```

### Database Testing
```bash
# Run migrations
npm run supabase:db:migrate

# Check schema differences
npm run supabase:db:diff

# Reset database
npm run supabase:db:reset
```

## 📚 API Documentation

### Authentication
All API endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Pantry Management
- `GET /functions/v1/api/pantry` - Get pantry items
- `POST /functions/v1/api/pantry` - Add pantry item
- `DELETE /functions/v1/api/pantry?id={id}` - Remove pantry item

#### Recipe Management
- `GET /functions/v1/api/recipes` - Get recipes
- `POST /functions/v1/api/recipes` - Add recipe

#### Favorites Management
- `GET /functions/v1/api/favorites` - Get favorites
- `POST /functions/v1/api/favorites` - Add favorite
- `DELETE /functions/v1/api/favorites?recipe_id={id}` - Remove favorite

#### Meal Generation
- `POST /functions/v1/generate-meal` - Generate meal from pantry items

#### Job Processing
- `POST /functions/v1/job-processor` - Process pending jobs

## 🔧 Troubleshooting

### Common Issues

1. **Edge Function Deployment Fails**
   - Check Supabase CLI version
   - Verify project reference
   - Ensure proper authentication

2. **Database Migration Errors**
   - Check migration file syntax
   - Verify RLS policies
   - Review foreign key constraints

3. **Job Queue Not Processing**
   - Verify job processor is running
   - Check database connectivity
   - Review job logs for errors

4. **OpenAI API Errors**
   - Verify API key configuration
   - Check usage quotas
   - Review request formatting

### Debug Commands
```bash
# Check Supabase status
supabase status

# View function logs
supabase functions logs api

# Check database connection
supabase db ping

# View job queue status
npm run job-queue:stats
```

## 📋 Maintenance

### Daily Tasks
- Monitor job queue performance
- Review error logs
- Check API usage metrics

### Weekly Tasks
- Clean up old job data
- Review user feedback
- Update analytics reports

### Monthly Tasks
- Database optimization
- Security audit
- Performance review

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Wait for CI/CD approval

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
