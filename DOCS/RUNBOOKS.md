# Runbooks

This document contains operational procedures for incident response, maintenance, and troubleshooting.

## Incident Response

### Severity Levels
- **P0 (Critical)**: Service completely down, data loss, security breach
- **P1 (High)**: Major feature broken, significant performance degradation
- **P2 (Medium)**: Minor feature issues, performance concerns
- **P3 (Low)**: Cosmetic issues, minor bugs

### Incident Response Process

1. **Detection**
   - Monitor health check endpoints
   - Check error rates and alerts
   - Review user reports

2. **Assessment**
   - Determine severity level
   - Identify affected systems
   - Estimate impact and scope

3. **Response**
   - P0/P1: Immediate response required
   - P2/P3: Plan response within business hours

4. **Resolution**
   - Implement fix or workaround
   - Verify resolution
   - Monitor for recurrence

5. **Post-Incident**
   - Document incident details
   - Conduct post-mortem
   - Implement preventive measures

### Emergency Contacts
- **On-call Engineer**: [Contact Info]
- **Escalation**: [Manager Contact]
- **External Services**: [Support Contacts]

## Rollback Procedures

### Database Rollback

#### Prisma Migrations
```bash
# Check migration status
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back [migration_name]

# Rollback to specific migration
npx prisma migrate reset --to [migration_name]
```

#### Supabase Migrations
```bash
# Check current migration state
supabase migration list

# Rollback to previous migration
supabase db reset --to [migration_name]

# Emergency rollback (use with caution)
supabase db reset
```

### Application Rollback

#### Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment_url]

# Promote specific deployment
vercel promote [deployment_url]
```

#### Manual Rollback
1. Revert code to previous stable commit
2. Push to main branch
3. Monitor deployment
4. Verify system health

### Rollback Checklist
- [ ] Identify rollback target
- [ ] Backup current state
- [ ] Execute rollback
- [ ] Verify system health
- [ ] Notify stakeholders
- [ ] Document rollback reason

## Key Rotation

### Supabase Keys
1. **Generate new keys** in Supabase dashboard
2. **Update environment variables**:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Update secrets** in GitHub and Vercel
4. **Deploy changes**
5. **Verify functionality**
6. **Revoke old keys** after verification

### API Keys
1. **Generate new keys** in respective services
2. **Update environment variables**
3. **Update secrets** in deployment platforms
4. **Deploy changes**
5. **Verify functionality**
6. **Revoke old keys**

### Key Rotation Checklist
- [ ] Generate new keys
- [ ] Update all environments
- [ ] Deploy changes
- [ ] Verify functionality
- [ ] Revoke old keys
- [ ] Update documentation

## Backup and Restore

### Database Backup

#### Automated Backups
- Supabase provides automated daily backups
- Retention: 7 days for free tier, 30 days for pro tier
- Point-in-time recovery available

#### Manual Backup
```bash
# Create manual backup
supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
supabase db dump --table profiles,tenants --file tables_backup.sql
```

### Application Backup
- Code is version controlled in Git
- Environment variables backed up in deployment platforms
- Static assets backed up in Vercel

### Restore Procedures

#### Database Restore
```bash
# Restore from backup file
supabase db reset
psql -h [host] -U [user] -d [database] < backup_file.sql

# Restore specific tables
psql -h [host] -U [user] -d [database] -c "\\copy table_name FROM 'backup_file.csv'"
```

#### Application Restore
1. Deploy from previous stable commit
2. Restore environment variables
3. Verify system functionality
4. Monitor for issues

### Backup Verification
- [ ] Test restore procedures regularly
- [ ] Verify data integrity
- [ ] Document restore process
- [ ] Train team on procedures

## Monitoring and Alerting

### Health Checks
- **Endpoint**: `/api/health`
- **Self-test**: `/api/selftest`
- **Frequency**: Every 5 minutes
- **Timeout**: 30 seconds

### Key Metrics
- **Uptime**: > 99.9%
- **Response Time**: P95 < 300ms
- **Error Rate**: < 0.1%
- **Database Performance**: P95 < 300ms

### Alerting Rules
- Health check failures
- High error rates (> 1%)
- Slow response times (P95 > 500ms)
- Database connection issues
- High memory usage
- Disk space warnings

## Troubleshooting

### Common Issues

#### Database Connection Issues
1. Check Supabase status
2. Verify connection strings
3. Check network connectivity
4. Review connection limits

#### Performance Issues
1. Check bundle sizes
2. Review database queries
3. Monitor memory usage
4. Check external API calls

#### Authentication Issues
1. Verify Supabase configuration
2. Check RLS policies
3. Review user permissions
4. Test with different users

### Debug Commands
```bash
# Check system health
node scripts/healthcheck.js

# Run RLS tests
node scripts/rls-smoke.ts

# Check database performance
node scripts/db-slowquery-check.mjs

# Scan for secrets
node scripts/secrets-scan.mjs

# Check bundle sizes
pnpm bundle:check
```

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Monthly
- **Duration**: 2-4 hours
- **Notification**: 48 hours advance notice

### Maintenance Tasks
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Optimize database
- [ ] Clean up old data
- [ ] Review logs
- [ ] Update documentation

## Security Procedures

### Security Incidents
1. **Immediate Response**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation**
   - Analyze logs
   - Identify attack vector
   - Assess damage

3. **Remediation**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security measures

4. **Recovery**
   - Restore services
   - Monitor for recurrence
   - Document lessons learned

### Security Checklist
- [ ] Regular security scans
- [ ] Dependency updates
- [ ] Access review
- [ ] Log monitoring
- [ ] Incident response plan

## Communication

### Incident Communication
- **Internal**: Slack #incidents channel
- **External**: Status page updates
- **Stakeholders**: Email notifications

### Status Page
- **URL**: [Status Page URL]
- **Updates**: Every 15 minutes during incidents
- **Post-incident**: Detailed report within 24 hours

## Documentation Updates

### After Each Incident
- [ ] Update runbooks
- [ ] Document lessons learned
- [ ] Update procedures
- [ ] Train team on changes

### Regular Reviews
- [ ] Monthly runbook review
- [ ] Quarterly procedure updates
- [ ] Annual disaster recovery testing