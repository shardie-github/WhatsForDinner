# Incident Response Runbook

## Overview

This runbook provides step-by-step procedures for responding to incidents in the "What's for Dinner" application.

## Incident Classification

### Severity Levels

- **P0 - Critical**: Complete service outage, data loss, security breach
- **P1 - High**: Major feature unavailable, significant performance degradation
- **P2 - Medium**: Minor feature issues, moderate performance impact
- **P3 - Low**: Cosmetic issues, minor performance impact

### Response Times

- **P0**: 15 minutes
- **P1**: 1 hour
- **P2**: 4 hours
- **P3**: 24 hours

## Incident Response Process

### 1. Detection and Alerting

#### Automated Detection
- Monitor alerts from CloudWatch, DataDog, Sentry
- Check Slack #incidents channel
- Review PagerDuty notifications

#### Manual Detection
- User reports via support channels
- Team member observations
- External monitoring services

### 2. Initial Response

#### Immediate Actions
1. **Acknowledge the incident**
   - Respond to alerts within SLA
   - Update incident status in tracking system
   - Notify team via Slack

2. **Assess impact**
   - Determine affected services
   - Estimate number of affected users
   - Identify business impact

3. **Escalate if needed**
   - P0/P1 incidents: Notify on-call engineer
   - P2/P3 incidents: Add to team backlog

### 3. Investigation

#### Information Gathering
1. **Check monitoring dashboards**
   - Application metrics (response time, error rate)
   - Infrastructure metrics (CPU, memory, disk)
   - Database metrics (connections, query performance)
   - Network metrics (latency, packet loss)

2. **Review logs**
   - Application logs (CloudWatch, ELK)
   - System logs (OS, container)
   - Database logs (slow queries, errors)
   - Load balancer logs

3. **Check recent changes**
   - Recent deployments
   - Configuration changes
   - Infrastructure changes
   - Third-party service updates

#### Common Investigation Commands

```bash
# Check application health
curl -f https://whats-for-dinner.com/api/health

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check Redis connectivity
redis-cli -h $REDIS_HOST ping

# Check recent deployments
git log --oneline -10

# Check system resources
top
df -h
free -m

# Check application logs
kubectl logs -f deployment/whats-for-dinner-app

# Check database logs
kubectl logs -f deployment/postgres
```

### 4. Resolution

#### Immediate Mitigation
1. **Rollback if needed**
   ```bash
   # Rollback to previous version
   kubectl rollout undo deployment/whats-for-dinner-app
   
   # Rollback database migration
   supabase db rollback --project-ref $SUPABASE_PROJECT_REF
   ```

2. **Scale resources**
   ```bash
   # Scale up application
   kubectl scale deployment whats-for-dinner-app --replicas=5
   
   # Scale up database
   aws rds modify-db-instance --db-instance-identifier whats-for-dinner-db --db-instance-class db.t3.large
   ```

3. **Restart services**
   ```bash
   # Restart application
   kubectl rollout restart deployment/whats-for-dinner-app
   
   # Restart database
   aws rds reboot-db-instance --db-instance-identifier whats-for-dinner-db
   ```

#### Root Cause Resolution
1. **Identify root cause**
   - Analyze logs and metrics
   - Review recent changes
   - Test hypotheses

2. **Implement fix**
   - Deploy code fix
   - Update configuration
   - Modify infrastructure

3. **Verify resolution**
   - Monitor metrics
   - Test functionality
   - Confirm user impact resolved

### 5. Communication

#### Internal Communication
1. **Status updates**
   - Regular updates in Slack #incidents
   - Update incident tracking system
   - Notify stakeholders

2. **Escalation**
   - Escalate to management for P0/P1
   - Request additional resources if needed
   - Coordinate with other teams

#### External Communication
1. **User notifications**
   - Update status page
   - Send email notifications
   - Post on social media

2. **Customer support**
   - Update support tickets
   - Provide estimated resolution time
   - Offer workarounds if available

### 6. Post-Incident

#### Post-Mortem
1. **Incident timeline**
   - Detection time
   - Response time
   - Resolution time
   - Total downtime

2. **Root cause analysis**
   - What happened
   - Why it happened
   - How it was resolved

3. **Lessons learned**
   - What went well
   - What could be improved
   - Action items

#### Follow-up Actions
1. **Prevention measures**
   - Update monitoring
   - Improve alerting
   - Add safeguards

2. **Process improvements**
   - Update runbooks
   - Improve documentation
   - Enhance training

## Common Incidents

### Application Outage

#### Symptoms
- 5xx errors from load balancer
- Application pods not responding
- Health checks failing

#### Investigation
1. Check pod status: `kubectl get pods`
2. Check pod logs: `kubectl logs -f deployment/whats-for-dinner-app`
3. Check resource usage: `kubectl top pods`
4. Check recent deployments: `kubectl rollout history deployment/whats-for-dinner-app`

#### Resolution
1. Restart application: `kubectl rollout restart deployment/whats-for-dinner-app`
2. Scale up if needed: `kubectl scale deployment whats-for-dinner-app --replicas=5`
3. Rollback if recent deployment: `kubectl rollout undo deployment/whats-for-dinner-app`

### Database Issues

#### Symptoms
- Database connection errors
- Slow query performance
- High CPU usage on database

#### Investigation
1. Check database status: `aws rds describe-db-instances --db-instance-identifier whats-for-dinner-db`
2. Check database logs: `aws logs get-log-events --log-group-name /aws/rds/instance/whats-for-dinner-db/postgresql`
3. Check active connections: `psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"`

#### Resolution
1. Restart database: `aws rds reboot-db-instance --db-instance-identifier whats-for-dinner-db`
2. Scale up database: `aws rds modify-db-instance --db-instance-identifier whats-for-dinner-db --db-instance-class db.t3.large`
3. Kill long-running queries: `psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes'"`

### Performance Issues

#### Symptoms
- High response times
- Slow page loads
- Timeout errors

#### Investigation
1. Check application metrics in Grafana
2. Check database query performance
3. Check Redis cache hit rate
4. Check CDN performance

#### Resolution
1. Scale up application: `kubectl scale deployment whats-for-dinner-app --replicas=5`
2. Optimize database queries
3. Clear Redis cache: `redis-cli FLUSHALL`
4. Invalidate CDN cache

### Security Incidents

#### Symptoms
- Unusual traffic patterns
- Failed login attempts
- Suspicious API calls

#### Investigation
1. Check security logs in CloudWatch
2. Review GuardDuty findings
3. Check WAF logs
4. Analyze access patterns

#### Resolution
1. Block suspicious IPs in WAF
2. Rotate compromised credentials
3. Update security policies
4. Notify security team

## Emergency Contacts

### On-Call Rotation
- **Primary**: [On-call engineer name and contact]
- **Secondary**: [Backup engineer name and contact]
- **Escalation**: [Team lead name and contact]

### External Services
- **AWS Support**: [Support case number]
- **Supabase Support**: [Support contact]
- **Vercel Support**: [Support contact]

### Communication Channels
- **Slack**: #incidents, #alerts, #devops
- **PagerDuty**: [PagerDuty service]
- **Status Page**: [Status page URL]

## Tools and Resources

### Monitoring Tools
- **Grafana**: [Grafana dashboard URL]
- **Prometheus**: [Prometheus query interface]
- **DataDog**: [DataDog dashboard URL]
- **Sentry**: [Sentry project URL]

### Logging Tools
- **CloudWatch**: [CloudWatch logs URL]
- **ELK Stack**: [Kibana URL]
- **Application Logs**: [Log aggregation URL]

### Infrastructure Tools
- **Kubernetes**: `kubectl` commands
- **Terraform**: Infrastructure management
- **AWS CLI**: AWS resource management
- **Supabase CLI**: Database management

### Documentation
- **Runbooks**: This document
- **Architecture**: [Architecture documentation]
- **API Docs**: [API documentation]
- **Deployment Guide**: [Deployment documentation]

## Escalation Matrix

| Severity | Response Time | Escalation | Actions |
|----------|---------------|------------|---------|
| P0 | 15 minutes | On-call → Team Lead → Management | Immediate response, all hands on deck |
| P1 | 1 hour | On-call → Team Lead | Urgent response, team coordination |
| P2 | 4 hours | On-call | Standard response, next business day |
| P3 | 24 hours | On-call | Low priority, scheduled response |

## Recovery Procedures

### Application Recovery
1. **Health Check**: Verify application is responding
2. **Smoke Tests**: Run basic functionality tests
3. **Load Test**: Verify performance under load
4. **User Testing**: Confirm user experience

### Database Recovery
1. **Backup Verification**: Ensure backups are current
2. **Data Integrity**: Verify data consistency
3. **Performance Test**: Check query performance
4. **Connection Test**: Verify connectivity

### Infrastructure Recovery
1. **Resource Check**: Verify all resources are running
2. **Network Test**: Check connectivity
3. **Security Scan**: Verify security posture
4. **Monitoring**: Confirm monitoring is working

## Prevention Measures

### Proactive Monitoring
- Set up comprehensive alerting
- Regular health checks
- Performance monitoring
- Security scanning

### Regular Maintenance
- Keep dependencies updated
- Regular security patches
- Performance optimization
- Capacity planning

### Testing
- Automated testing
- Load testing
- Security testing
- Disaster recovery testing

### Documentation
- Keep runbooks updated
- Document procedures
- Share knowledge
- Regular training