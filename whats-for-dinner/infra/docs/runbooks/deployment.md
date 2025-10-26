# Deployment Runbook

## Overview

This runbook provides step-by-step procedures for deploying the "What's for Dinner" application using blue-green deployment strategy.

## Prerequisites

### Required Tools
- Node.js 20+
- npm/pnpm
- Docker
- kubectl
- AWS CLI
- Terraform
- Supabase CLI
- Vercel CLI

### Required Access
- AWS account with appropriate permissions
- Supabase project access
- Vercel account access
- GitHub repository access
- Kubernetes cluster access

### Required Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Deployment Process

### 1. Pre-Deployment Checklist

#### Code Quality
- [ ] All tests pass
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

#### Infrastructure
- [ ] Terraform plan reviewed
- [ ] Infrastructure changes tested
- [ ] Database migrations tested
- [ ] Monitoring configured

#### Environment
- [ ] Environment variables set
- [ ] Secrets configured
- [ ] Backup created
- [ ] Rollback plan ready

### 2. Blue-Green Deployment

#### Blue Environment (Current)
- Currently serving production traffic
- Stable and tested version
- All monitoring in place

#### Green Environment (New)
- New deployment target
- Isolated from production traffic
- Testing and validation environment

### 3. Deployment Steps

#### Step 1: Validate Deployment
```bash
# Checkout code
git checkout main
git pull origin main

# Install dependencies
npm ci

# Run tests
npm run test:ci

# Run security scan
npm run security:scan

# Build application
npm run build
```

#### Step 2: Deploy to Blue Environment
```bash
# Deploy to blue environment
npx vercel --prod --token $VERCEL_TOKEN \
  --scope $VERCEL_ORG_ID \
  --project $VERCEL_PROJECT_ID \
  --env BLUE_GREEN_ENV=blue \
  --env DEPLOYMENT_ID=$(date +%s)-$(git rev-parse --short HEAD)

# Wait for deployment
sleep 30

# Health check
curl -f https://whats-for-dinner-blue.vercel.app/api/health
```

#### Step 3: Database Migration
```bash
# Create migration backup
supabase db dump --project-ref $SUPABASE_PROJECT_REF \
  --schema public > migration-backup-$(date +%s).sql

# Run database migrations
supabase db push --project-ref $SUPABASE_PROJECT_REF

# Validate migration
supabase db diff --project-ref $SUPABASE_PROJECT_REF --schema public
```

#### Step 4: Deploy Edge Functions
```bash
# Deploy all edge functions
supabase functions deploy api --project-ref $SUPABASE_PROJECT_REF
supabase functions deploy generate-meal --project-ref $SUPABASE_PROJECT_REF
supabase functions deploy job-processor --project-ref $SUPABASE_PROJECT_REF

# Set secrets
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref $SUPABASE_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" --project-ref $SUPABASE_PROJECT_REF
```

#### Step 5: Deploy to Green Environment
```bash
# Deploy to green environment
npx vercel --prod --token $VERCEL_TOKEN \
  --scope $VERCEL_ORG_ID \
  --project $VERCEL_PROJECT_ID \
  --env BLUE_GREEN_ENV=green \
  --env DEPLOYMENT_ID=$(date +%s)-$(git rev-parse --short HEAD)

# Wait for deployment
sleep 30

# Health check
curl -f https://whats-for-dinner-green.vercel.app/api/health
```

#### Step 6: Run Smoke Tests
```bash
# Install Playwright
npx playwright install --with-deps

# Run smoke tests
npx playwright test --config=playwright.green.config.ts
```

#### Step 7: Switch Traffic
```bash
# Switch traffic to green environment
# This would typically involve updating DNS records or load balancer config
echo "Traffic switched to Green environment"

# Monitor traffic switch
sleep 60

# Check key metrics
curl -f https://whats-for-dinner.com/api/health
```

#### Step 8: Monitor and Validate
```bash
# Monitor for 5 minutes
for i in {1..5}; do
  echo "Monitoring cycle $i/5..."
  # Check error rates, response times, etc.
  sleep 60
done
```

#### Step 9: Finalize or Rollback
```bash
# If healthy, keep green
if curl -f https://whats-for-dinner.com/api/health; then
  echo "✅ Green deployment successful"
  # Clean up blue environment
  echo "🧹 Cleaning up blue environment"
else
  echo "❌ Green deployment failed, rolling back"
  # Switch traffic back to blue
  echo "🔄 Switching traffic back to blue"
  # Clean up green environment
  echo "🧹 Cleaning up green environment"
fi
```

### 4. Post-Deployment

#### Verification
1. **Health Checks**
   - Application health endpoint
   - Database connectivity
   - Redis connectivity
   - External service connectivity

2. **Smoke Tests**
   - User authentication
   - Core functionality
   - API endpoints
   - Database queries

3. **Performance Tests**
   - Response times
   - Throughput
   - Resource utilization
   - Error rates

#### Monitoring
1. **Application Metrics**
   - Response time
   - Error rate
   - Throughput
   - User activity

2. **Infrastructure Metrics**
   - CPU utilization
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Business Metrics**
   - User registrations
   - Meal generations
   - API usage
   - Revenue

## Rollback Procedures

### Automatic Rollback
The deployment pipeline includes automatic rollback triggers:
- Health check failures
- High error rates
- Performance degradation
- Security issues

### Manual Rollback
```bash
# Switch traffic back to blue
echo "🔄 Rolling back to blue environment"

# Restore database from backup if needed
supabase db restore --project-ref $SUPABASE_PROJECT_REF --backup-id backup-id

# Clean up green environment
echo "🧹 Cleaning up green environment"
```

### Database Rollback
```bash
# Restore from backup
supabase db restore --project-ref $SUPABASE_PROJECT_REF --backup-id backup-id

# Or rollback migration
supabase db rollback --project-ref $SUPABASE_PROJECT_REF
```

## Environment-Specific Procedures

### Staging Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Run staging tests
npm run test:staging

# Check staging health
curl -f https://staging.whats-for-dinner.com/api/health
```

### Production Deployment
```bash
# Deploy to production
npm run deploy:production

# Run production smoke tests
npm run test:smoke:production

# Check production health
curl -f https://whats-for-dinner.com/api/health
```

## Troubleshooting

### Common Issues

#### Deployment Failures
1. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Check environment variables
   - Review build logs

2. **Health Check Failures**
   - Check application logs
   - Verify database connectivity
   - Check Redis connectivity
   - Review configuration

3. **Database Migration Failures**
   - Check migration syntax
   - Verify database permissions
   - Review migration logs
   - Test migration locally

#### Performance Issues
1. **Slow Response Times**
   - Check database queries
   - Review Redis cache
   - Check external API calls
   - Monitor resource usage

2. **High Error Rates**
   - Check application logs
   - Review error patterns
   - Check external dependencies
   - Monitor system resources

### Debug Commands
```bash
# Check application status
kubectl get pods
kubectl logs -f deployment/whats-for-dinner-app

# Check database status
aws rds describe-db-instances --db-instance-identifier whats-for-dinner-db

# Check Redis status
aws elasticache describe-cache-clusters --cache-cluster-id whats-for-dinner-redis

# Check load balancer
aws elbv2 describe-load-balancers --names whats-for-dinner-alb
```

## Best Practices

### Deployment
- Always test in staging first
- Use blue-green deployment
- Monitor during deployment
- Have rollback plan ready

### Database
- Always backup before migration
- Test migrations in staging
- Use transaction-safe migrations
- Monitor migration performance

### Monitoring
- Set up comprehensive alerting
- Monitor key metrics
- Track business metrics
- Regular health checks

### Security
- Scan for vulnerabilities
- Use secure secrets management
- Implement proper access controls
- Regular security audits

## Emergency Procedures

### Critical Issues
1. **Immediate Rollback**
   - Switch traffic to blue
   - Restore database if needed
   - Notify team and users

2. **Emergency Fix**
   - Deploy hotfix to blue
   - Test thoroughly
   - Switch traffic back

3. **Communication**
   - Update status page
   - Notify stakeholders
   - Post incident updates

### Contact Information
- **On-call Engineer**: [Contact info]
- **Team Lead**: [Contact info]
- **Management**: [Contact info]
- **Support**: [Contact info]

## Documentation

### Deployment Records
- Keep deployment logs
- Document issues and resolutions
- Update runbooks
- Share lessons learned

### Knowledge Sharing
- Regular team reviews
- Document best practices
- Share troubleshooting tips
- Update procedures

## Automation

### CI/CD Pipeline
The deployment process is automated through GitHub Actions:
- `zero-downtime-deployment.yml` - Main deployment pipeline
- `infrastructure-deployment.yml` - Infrastructure deployment
- `monitoring-setup.yml` - Monitoring stack setup

### Manual Triggers
- Emergency deployments
- Hotfix deployments
- Configuration changes
- Infrastructure updates

## Monitoring and Alerting

### Key Metrics
- Deployment success rate
- Rollback frequency
- Deployment duration
- Error rates during deployment

### Alerts
- Deployment failures
- Health check failures
- Performance degradation
- Security issues

### Dashboards
- Deployment status
- Application health
- Infrastructure metrics
- Business metrics