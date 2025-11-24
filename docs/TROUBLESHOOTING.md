# Troubleshooting Guide

## Common Issues and Solutions

### Build Failures

**Issue**: TypeScript compilation errors
**Solution**: 
```bash
pnpm typecheck
# Fix errors shown
pnpm build
```

**Issue**: Missing dependencies
**Solution**:
```bash
pnpm install --frozen-lockfile
```

### Database Connection Issues

**Issue**: Cannot connect to Supabase
**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check Supabase project status
3. Verify network connectivity

**Issue**: RLS policy blocking queries
**Solution**:
1. Check RLS policies: `pnpm rls:test`
2. Review policy logic
3. Verify user authentication

### Environment Variable Issues

**Issue**: Missing environment variables
**Solution**:
```bash
pnpm env:validate
# Follow instructions to set missing variables
```

### Test Failures

**Issue**: Tests failing
**Solution**:
1. Run tests: `pnpm test`
2. Check test output for specific failures
3. Verify test environment setup

### Performance Issues

**Issue**: Slow page loads
**Solution**:
1. Run performance audit: `pnpm perf:analyze`
2. Check bundle size: `pnpm analyze:bundle`
3. Review performance budgets

### Security Issues

**Issue**: Security vulnerabilities
**Solution**:
1. Run security audit: `pnpm security:audit`
2. Update dependencies: `pnpm update`
3. Review security report

## Getting Help

- Check documentation in `docs/`
- Review error logs
- Check GitHub Issues
- Contact support
