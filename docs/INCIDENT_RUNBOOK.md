# Incident Response Runbook

## Overview

This runbook provides step-by-step procedures for handling incidents, organized by severity and type.

## Severity Levels

### Critical (P1)
- **Response Time**: 15 minutes
- **Resolution Target**: 1 hour
- **Impact**: Complete service outage or data loss risk
- **Examples**: Database down, payment processing failure

### Major (P2)
- **Response Time**: 1 hour
- **Resolution Target**: 4 hours
- **Impact**: Significant degradation, affects many users
- **Examples**: High error rate, SLO violation

### Low (P3)
- **Response Time**: 4 hours
- **Resolution Target**: 24 hours
- **Impact**: Minor issues, limited user impact
- **Examples**: Non-critical feature degraded, minor performance issue

## RACI Matrix

| Role | Responsibility | Authority | Consulted | Informed |
|------|---------------|-----------|-----------|----------|
| On-Call Engineer | Initial response, triage | Escalate, apply fixes | Team Lead | All stakeholders |
| Team Lead | Coordinate response | Approve rollback | Product, Security | Management |
| Product Manager | Business impact assessment | Prioritize features | Engineering | Customers |
| Security Team | Security incidents | Block deployments | Engineering | Management |

## Incident Lifecycle

1. **Detection**: Automated or manual
2. **Triage**: Assess severity and impact
3. **Investigation**: Identify root cause
4. **Mitigation**: Apply fix or workaround
5. **Resolution**: Verify fix
6. **Post-Mortem**: Document and learn

## Common Incident Types

### Database Issues

#### Symptoms
- High query latency
- Connection pool exhaustion
- Query timeouts

#### Steps
1. Check database metrics (Prometheus)
2. Identify long-running queries
3. Check connection pool usage
4. Review recent deployments
5. Check for locks/deadlocks

#### Mitigation
```bash
# Kill runaway queries
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds';"

# Check connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### High Error Rate

#### Symptoms
- Error rate > 1%
- Spike in 5xx responses
- User complaints

#### Steps
1. Check error logs (Grafana/Loki)
2. Identify error pattern
3. Check recent deployments
4. Review dependency status
5. Check SLO status

#### Mitigation
- Rollback if recent deployment
- Scale up if capacity issue
- Fix code if bug identified

### Performance Degradation

#### Symptoms
- P95 latency > 400ms
- SLO violation
- User complaints about slowness

#### Steps
1. Check latency metrics (Prometheus)
2. Identify slow endpoints
3. Check database query performance
4. Review external API dependencies
5. Check resource usage (CPU, memory)

#### Mitigation
- Optimize slow queries
- Scale horizontally
- Enable caching
- Reduce external API calls

### Payment Processing Failure

#### Symptoms
- Stripe webhook failures
- Payment errors
- Revenue impact

#### Steps
1. Check Stripe dashboard
2. Review webhook logs
3. Check payment service health
4. Verify API keys
5. Check recent code changes

#### Mitigation
- Retry failed payments
- Fix webhook handler
- Rollback if recent change

## Escalation Procedures

### Level 1: On-Call Engineer
- Initial response and triage
- Apply known fixes
- Escalate if unable to resolve

### Level 2: Team Lead
- Coordinate multiple engineers
- Approve rollbacks
- Communicate with stakeholders

### Level 3: Engineering Manager
- Strategic decisions
- Resource allocation
- External communication

### Level 4: CTO/Leadership
- Critical business decisions
- Customer communication
- Media response

## Communication Templates

### Slack Alert (Automated)
```
?? [P1/P2/P3] Incident: <Title>
Severity: <Critical/Major/Low>
Status: <Investigating/Mitigating/Resolved>
Incident ID: <ID>
```

### Status Page Update
```
We are currently experiencing <issue>. Our team is investigating and working on a resolution. We will update this page as we learn more.
```

### Customer Communication (If needed)
```
We are aware of an issue affecting <service> and are working to resolve it. We apologize for any inconvenience and will update you as soon as we have more information.
```

## Rollback Procedures

### Automatic Rollback Triggers
- Error rate > 5% for 5 minutes
- P95 latency > 2s for 5 minutes
- Health check failures for 2 minutes

### Manual Rollback
```bash
# Vercel
vercel rollback --prod

# GitHub Actions
gh workflow run rollback.yml
```

## Post-Incident

### Immediate (Within 1 hour)
- [ ] Document timeline
- [ ] Verify resolution
- [ ] Update status page
- [ ] Notify stakeholders

### Within 24 Hours
- [ ] Schedule post-mortem
- [ ] Collect metrics/logs
- [ ] Prepare summary

### Within 1 Week
- [ ] Conduct post-mortem
- [ ] Create action items
- [ ] Update runbooks
- [ ] Share learnings

## Post-Mortem Template

1. **Summary**: What happened?
2. **Timeline**: When did it happen?
3. **Impact**: Who/what was affected?
4. **Root Cause**: Why did it happen?
5. **Resolution**: How was it fixed?
6. **Action Items**: What will we do differently?
7. **Action Items**: Specific tasks with owners

## Tooling

- **Incident Management**: Admin console incidents page
- **Monitoring**: Grafana dashboards
- **Logs**: Loki
- **Traces**: Tempo
- **Metrics**: Prometheus
- **Alerts**: PagerDuty/Slack

## Training

- Quarterly incident response drills
- On-call rotation training
- Tool usage workshops
- Post-mortem reviews
