# Release Management

## Overview

This document describes the release process, promotion flow, and rollback procedures for the What's for Dinner application.

## Release Flow

### 1. Development Process

- **Branch Strategy**: Trunk-based development with protected main branch
- **Commit Convention**: All commits follow Conventional Commits specification
- **Pull Requests**: All changes must go through PR review process
- **Automated Testing**: All PRs run comprehensive test suite

### 2. Release Process

#### Automatic Release Creation
When a PR is merged to main with conventional commits:

1. **Validation**: Check conventional commit format
2. **Version Bump**: Auto-generate semantic version based on commit types
3. **Build & Test**: Run full test suite and build process
4. **Migration Check**: Validate EMC migration steps
5. **Release Creation**: Create GitHub release with artifacts
6. **Preview Deployment**: Auto-deploy to Vercel preview

#### Manual Promotion
Production deployments require manual promotion:

1. **Prerequisites Check**: Verify all checks are green
2. **SLO Validation**: Ensure SLOs are within budget
3. **Migration Gate**: Confirm migrations are safe
4. **Feature Flags**: Update flags for target environment
5. **Deployment**: Deploy to Vercel production
6. **Post-Deployment**: Run health checks and smoke tests

## Environments

### Development
- **Purpose**: Local development and testing
- **URL**: `http://localhost:3000`
- **Database**: Local Supabase instance
- **Feature Flags**: All flags enabled for testing

### Staging
- **Purpose**: Pre-production testing and validation
- **URL**: `https://staging.whats-for-dinner.vercel.app`
- **Database**: Staging Supabase project
- **Feature Flags**: Production-like configuration
- **Chaos Testing**: Safe drills enabled

### Production
- **Purpose**: Live user-facing application
- **URL**: `https://whats-for-dinner.vercel.app`
- **Database**: Production Supabase project
- **Feature Flags**: Carefully controlled rollouts
- **Monitoring**: Full observability stack

## Promotion Gates

### Staging Promotion
- **Trigger**: Automatic on PR merge to main
- **Requirements**:
  - All CI checks passing
  - No critical security issues
  - Migration checks passing
- **Process**: Automated deployment with feature flag updates

### Production Promotion
- **Trigger**: Manual via GitHub Actions workflow
- **Requirements**:
  - Staging deployment successful
  - SLOs within budget
  - Migration gates passed
  - Feature flags configured
- **Process**: Manual approval required

## Rollback Procedures

### Quick Rollback (≤ 5 minutes)

1. **Identify Issue**: Monitor alerts and user reports
2. **Assess Impact**: Determine severity and scope
3. **Execute Rollback**: Promote previous Vercel build
4. **Verify Schema**: Ensure database compatibility
5. **Monitor**: Watch for resolution

### Rollback Steps

```bash
# 1. Get previous deployment
vercel deployments list --limit 10

# 2. Promote previous deployment
vercel promote <deployment-url>

# 3. Verify health
curl -f https://whats-for-dinner.vercel.app/api/health

# 4. Update feature flags if needed
# (Use Supabase dashboard or API)
```

### Emergency Procedures

For critical issues:

1. **Immediate Response**: Rollback to last known good state
2. **Communication**: Notify stakeholders via status page
3. **Investigation**: Root cause analysis
4. **Fix**: Develop and test fix
5. **Deploy**: Careful re-deployment with monitoring

## Feature Flags

### Flag Management

Feature flags are managed in Supabase `config_flags` table:

- **Environment Targeting**: Flags can target specific environments
- **Rollout Percentage**: Gradual rollout capability
- **User Targeting**: Specific user targeting
- **Expiration**: Automatic flag expiration

### Common Flags

- `maintenance_mode`: Show downtime page
- `new_ui_enabled`: Enable new UI components
- `beta_features`: Enable beta functionality
- `analytics_enabled`: Enable user analytics
- `debug_mode`: Enable debug logging

### Flag Lifecycle

1. **Create**: Add flag with initial configuration
2. **Test**: Enable in staging environment
3. **Rollout**: Gradual production rollout
4. **Monitor**: Watch metrics and user feedback
5. **Complete**: Remove flag after full rollout

## Monitoring & Observability

### Key Metrics

- **API Success Rate**: ≥ 99.9% (7-day rolling)
- **API Latency**: p95 ≤ 300ms (production)
- **Database Error Rate**: < 0.1%
- **Error Budget**: ≥ 5% remaining

### Dashboards

- **Production Health**: Real-time system status
- **SLO Dashboard**: Service level objective tracking
- **Feature Flag Usage**: Flag adoption metrics
- **Deployment History**: Release timeline

### Alerts

- **Critical**: Immediate notification for system failures
- **Warning**: Proactive alerts for degrading performance
- **Info**: Deployment notifications and status updates

## Release Artifacts

### GitHub Releases

Each release includes:

- **Source Code**: Tagged commit with full history
- **Build Artifacts**: Compiled application bundles
- **Schema Hash**: Database schema fingerprint
- **Bundle Report**: Performance and size analysis
- **Changelog**: Automated from conventional commits

### Deployment Records

- **Build SHA**: Git commit hash
- **Schema Hash**: Database schema version
- **Environment Matrix**: Node.js, pnpm, Prisma versions
- **Health Check Results**: Post-deployment validation
- **SLO Snapshot**: Performance metrics at deployment

## Best Practices

### Before Release

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan clean
- [ ] Performance budget met
- [ ] Documentation updated

### During Release

- [ ] Monitor deployment progress
- [ ] Watch for error spikes
- [ ] Verify feature flags
- [ ] Check SLO compliance
- [ ] Validate health endpoints

### After Release

- [ ] Monitor for 30 minutes
- [ ] Check error rates
- [ ] Verify user experience
- [ ] Update runbooks if needed
- [ ] Document any issues

## Troubleshooting

### Common Issues

#### Deployment Failures
- Check Vercel logs for build errors
- Verify environment variables
- Ensure database migrations are applied
- Check feature flag configuration

#### Performance Degradation
- Review SLO dashboard
- Check for resource constraints
- Analyze recent changes
- Consider feature flag rollback

#### Database Issues
- Verify migration status
- Check connection limits
- Review query performance
- Validate RLS policies

### Escalation

1. **Level 1**: Development team
2. **Level 2**: DevOps team
3. **Level 3**: Engineering leadership
4. **Level 4**: Emergency response team

## Contact Information

- **Release Manager**: releases@whats-for-dinner.com
- **DevOps Team**: devops@whats-for-dinner.com
- **Emergency**: +1-XXX-XXX-XXXX

---

Last updated: $(date -u +%Y-%m-%d)
