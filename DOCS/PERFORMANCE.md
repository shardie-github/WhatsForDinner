# Performance Guidelines

This document outlines performance budgets, monitoring strategies, and optimization guidelines for the Whats For Dinner application.

## Bundle Size Budgets

### Client Bundles
- **Warning Threshold**: 250 KB per page
- **Failure Threshold**: 400 KB per page
- **Target**: < 200 KB per page

### Serverless/Edge Bundles
- **Warning Threshold**: 1.2 MB
- **Failure Threshold**: 1.5 MB
- **Target**: < 1.0 MB

## Performance Monitoring

### API Response Times
- **P50**: < 100ms
- **P95**: < 300ms (warning), < 700ms (failure)
- **P99**: < 500ms
- **Max**: < 1000ms

### Database Performance
- **Query P95**: < 300ms
- **Connection Pool**: 10-20 connections
- **Index Coverage**: > 95% for hot paths

## How to Check Performance

### Bundle Analysis
```bash
# Generate bundle report
pnpm analyze:bundle

# Check against budgets
pnpm bundle:check
```

### Database Performance
```bash
# Run database performance tests
node scripts/db-slowquery-check.mjs

# Check with budgets
node scripts/db-slowquery-check.mjs --check
```

### Load Testing
```bash
# Run micro-load test (requires perf-check label)
# This runs automatically in CI when PR has 'perf-check' label
```

## Optimization Strategies

### Bundle Optimization
1. **Tree Shaking**: Ensure unused code is eliminated
2. **Code Splitting**: Split vendor and app code
3. **Dynamic Imports**: Load heavy libraries on demand
4. **Image Optimization**: Use next/image with proper formats

### Database Optimization
1. **Indexing**: Create indexes for frequently queried columns
2. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
3. **Connection Pooling**: Reuse database connections
4. **Caching**: Implement appropriate caching strategies

### Runtime Optimization
1. **ISR/SSR**: Choose appropriate rendering strategy per route
2. **Edge Functions**: Use for simple, fast operations
3. **CDN**: Leverage Vercel's global CDN
4. **Compression**: Enable gzip/brotli compression

## Monitoring Tools

### Built-in Monitoring
- Bundle size analysis in CI
- Database performance checks
- Health check endpoints (`/api/health`, `/api/selftest`)

### External Monitoring
- Vercel Analytics
- Supabase Dashboard
- Sentry (error tracking)

## Performance Budgets in CI

The following checks run automatically in CI:

1. **Bundle Size Check**: Fails if bundles exceed thresholds
2. **Database Performance**: Fails if queries exceed P95 threshold
3. **Micro-load Test**: Runs when PR has 'perf-check' label
4. **Health Checks**: Validates system health

## Troubleshooting

### Bundle Size Issues
1. Check for large dependencies
2. Verify tree shaking is working
3. Use dynamic imports for heavy libraries
4. Optimize images and assets

### Database Performance Issues
1. Check query execution plans
2. Add missing indexes
3. Optimize query patterns
4. Consider caching strategies

### API Performance Issues
1. Check database query performance
2. Verify caching is working
3. Review external API calls
4. Check for memory leaks

## Cost Optimization

### Vercel Optimization
- Use Edge Functions for simple operations
- Optimize bundle sizes to reduce cold starts
- Implement proper caching strategies

### Supabase Optimization
- Use appropriate indexes
- Optimize query patterns
- Monitor usage and costs
- Use connection pooling

## Performance Checklist

Before deploying:
- [ ] Bundle sizes within budget
- [ ] Database queries optimized
- [ ] Images properly optimized
- [ ] Caching strategies implemented
- [ ] Performance tests passing
- [ ] Health checks green