# Incident Response Runbook

## Severity Levels

### Critical (P1)
- **Definition:** Complete service outage or data breach
- **Response Time:** 15 minutes
- **Resolution Target:** 4 hours
- **On-Call:** Immediate escalation to engineering lead

### Major (P2)
- **Definition:** Significant degradation affecting > 50% of users
- **Response Time:** 1 hour
- **Resolution Target:** 8 hours
- **On-Call:** Engineering team

### Low (P3)
- **Definition:** Minor issues affecting < 10% of users
- **Response Time:** 4 hours
- **Resolution Target:** 24 hours
- **On-Call:** Engineering team (non-urgent)

## Incident Detection

### Automated Detection

- **Error Rate Spike:** > 1% error rate triggers P2 incident
- **SLO Violations:** Critical SLO violation triggers P1 incident
- **Health Check Failures:** Unhealthy status triggers P1 incident

### Manual Detection

- User reports
- Customer support escalations
- Monitoring dashboards

## Response Procedures

### Phase 1: Detection & Triage (0-15 minutes)

1. **Acknowledge Incident**
   - Incident automatically created via `packages/server/src/incidents/automation.ts`
   - Slack notification sent to #incidents
   - PagerDuty alert (if Critical)

2. **Assess Severity**
   - Review error metrics
   - Check SLO status
   - Review health check status

3. **Assign Incident Owner**
   - Auto-assigned based on rotation
   - Manual override if needed

### Phase 2: Investigation (15-60 minutes)

1. **Gather Information**
   ```bash
   # Check service health
   curl https://api.nomad.app/healthz
   
   # Check recent errors
   # Query Prometheus/Grafana dashboards
   
   # Check logs
   # Loki/Grafana log explorer
   ```

2. **Identify Root Cause**
   - Review application logs
   - Check database performance
   - Review recent deployments

3. **Document Findings**
   - Update incident timeline
   - Add notes to incident record

### Phase 3: Mitigation (60 minutes - 4 hours)

1. **Immediate Mitigation**
   - Rollback deployment (if applicable)
   - Scale resources (if needed)
   - Disable feature flags (if needed)

2. **Long-term Fix**
   - Implement permanent fix
   - Deploy to staging first
   - Deploy to production after validation

### Phase 4: Resolution & Post-Mortem

1. **Verify Resolution**
   - Confirm error rate normalized
   - Verify SLOs back to green
   - Monitor for 1 hour

2. **Post-Mortem**
   - Schedule within 48 hours
   - Document:
     - Timeline
     - Root cause
     - Contributing factors
     - Action items
   - Share in #engineering channel

## Common Incidents

### Database Connection Issues

**Symptoms:**
- High error rate (> 5%)
- Health check shows database unhealthy
- Slow response times

**Actions:**
1. Check Supabase status page
2. Verify connection pool settings
3. Check for long-running queries
4. Failover to replica if needed

### High Error Rate

**Symptoms:**
- Error rate > 1%
- Increase in 5xx responses

**Actions:**
1. Check recent deployments
2. Review error logs in Grafana
3. Check for rate limiting issues
4. Rollback if deployment-related

### Performance Degradation

**Symptoms:**
- P95 latency > 400ms
- High database query times

**Actions:**
1. Check database performance
2. Review slow query logs
3. Check for missing indexes
4. Scale resources if needed

## RACI Matrix

| Role | Responsibility |
|------|---------------|
| **Incident Commander** | Overall incident coordination |
| **On-Call Engineer** | Technical investigation and fix |
| **Engineering Lead** | Critical incident escalation |
| **Product Manager** | Customer communication |
| **DevOps** | Infrastructure changes |

## Communication Templates

### Internal Slack Update
```
?? Incident: [Title]
Severity: [P1/P2/P3]
Status: [Investigating/Mitigating/Resolved]
Impact: [Description]
ETA: [Time]
```

### Customer Status Page Update
```
We are currently experiencing [issue description] affecting [percentage] of users.
Our team is actively working on resolution.
Estimated resolution time: [timeframe]
```

## Tools & Dashboards

- **Incident Management:** Internal incident system (`packages/server/src/incidents/`)
- **Monitoring:** Grafana dashboards
- **Logs:** Loki
- **Traces:** Tempo
- **Alerts:** Prometheus ? PagerDuty/Slack

## Escalation Path

1. **Level 1:** On-Call Engineer (auto-assigned)
2. **Level 2:** Engineering Lead (Critical incidents)
3. **Level 3:** CTO (Extended outages > 8 hours)

## Revision History

- **v1.0** (2024-01-XX): Initial incident runbook