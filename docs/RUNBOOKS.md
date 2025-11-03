# Site Reliability Engineering Runbooks

## Daily Tasks

### Morning Health Check (9:00 AM UTC)

**Checklist:**
- [ ] Review overnight error rates (Grafana dashboard)
- [ ] Check SLO status (all green?)
- [ ] Review overnight incidents (#incidents Slack channel)
- [ ] Verify backup completion (check logs)
- [ ] Check queue worker health

**Commands:**
```bash
# Check health
curl https://api.nomad.app/healthz | jq

# Check SLO status
# Query Grafana: nomad_slo_error_budget_remaining

# Check backup status
# Review backup logs or run verification
pnpm backup:verify
```

**Alerts:**
- Error rate > 0.1%
- SLO status not green
- Backup failures
- Queue worker failures

### Queue Monitoring

**Check:**
- Stalled jobs
- Failed jobs count
- Processing latency

**Actions:**
```bash
# Self-healing will auto-handle, but manual check:
# Review BullMQ dashboard or Redis monitoring
```

### Performance Monitoring

**Metrics to Watch:**
- P95 latency < 400ms
- Error rate < 0.1%
- Database query performance
- API response times

**Grafana Dashboards:**
- Service Overview
- Database Performance
- API Latency
- Error Rates

## Weekly Tasks

### Monday: Performance Review

**Tasks:**
1. Review last week's performance metrics
2. Identify performance regressions
3. Review cost dashboard
4. Plan capacity adjustments if needed

**Reports:**
- Weekly performance summary
- Cost trends
- SLO compliance report

### Tuesday: Security Scan Review

**Tasks:**
1. Review security scan results (GitHub Actions)
2. Address high/critical vulnerabilities
3. Update dependencies if needed

**Commands:**
```bash
# Review latest security scan
# GitHub Actions: security.yml workflow

# Run dependency audit
pnpm supply-chain:audit
```

### Wednesday: Backup Verification

**Tasks:**
1. Run backup restore test (dry-run)
2. Verify backup integrity
3. Review backup retention

**Commands:**
```bash
# Verify backups
pnpm backup:verify

# Test restore (dry-run)
pnpm backup:restore --dry-run --backup=<latest>
```

### Thursday: Incident Review

**Tasks:**
1. Review incidents from past week
2. Update incident documentation
3. Follow up on action items
4. Schedule post-mortems if needed

### Friday: Capacity Planning

**Tasks:**
1. Review usage trends
2. Forecast capacity needs
3. Plan scaling actions
4. Review cost optimization opportunities

**Cost Dashboard:**
- Access: `/admin/costs`
- Review trends and forecasts
- Set budget alerts

## Monthly Tasks

### First Monday: DR Drill

**Procedure:**
1. Schedule DR drill (quarterly is minimum, monthly preferred)
2. Execute failover test
3. Verify RTO/RPO targets
4. Document results

**Commands:**
```bash
# Simulate failover (staging environment)
# Follow docs/DR_BCP.md procedures
```

### Second Monday: Compliance Review

**Tasks:**
1. Review compliance checklist
2. Generate evidence bundle
3. Review audit logs
4. Update documentation

**Commands:**
```bash
# Generate evidence bundle
pnpm evidence:bundle

# Review audit logs
# Query audit_logs table for anomalies
```

### Third Monday: Performance Baseline Update

**Tasks:**
1. Run performance tests
2. Compare with baseline
3. Update baseline if acceptable
4. Document regressions

**Commands:**
```bash
# Run performance tests
pnpm perf:baseline

# Compare with existing baseline
pnpm perf:compare
```

### Last Monday: Monthly Report

**Generate:**
1. Monthly SLO report
2. Incident summary
3. Performance metrics
4. Cost summary

## Quarterly Tasks

### Q1: Annual Security Assessment

**Tasks:**
1. Penetration testing
2. Security audit
3. Compliance review
4. Policy updates

### Q2: Capacity Planning Review

**Tasks:**
1. Review growth trends
2. Plan infrastructure scaling
3. Cost optimization review

### Q3: Disaster Recovery Full Test

**Tasks:**
1. Full DR drill
2. Multi-region failover test
3. Backup/restore validation
4. Documentation update

### Q4: Annual Review

**Tasks:**
1. Year-end performance review
2. SLO target review
3. Budget review
4. Planning for next year

## On-Demand Tasks

### Deploy to Production

**Pre-Deployment:**
1. Check SLO status (must be green)
2. Run tests
3. Security scan
4. Review changes

**Deployment:**
1. Deploy to staging
2. Smoke tests
3. Deploy to production (canary if configured)
4. Monitor post-deployment

**Post-Deployment:**
1. Monitor error rates (5 minutes)
2. Check latency metrics
3. Verify health endpoints
4. Rollback if needed

**Commands:**
```bash
# Check SLO before deploy
# Query Prometheus or use API

# Deploy
pnpm deploy:production

# Monitor
watch -n 5 'curl -s https://api.nomad.app/healthz | jq'
```

### Incident Response

**See:** `docs/INCIDENT_RUNBOOK.md` for detailed procedures.

**Quick Reference:**
1. Acknowledge incident
2. Assess severity
3. Investigate
4. Mitigate
5. Resolve
6. Post-mortem

### Scale Resources

**Database Scaling:**
- Supabase dashboard (if needed)
- Monitor connection pool

**Application Scaling:**
- Vercel auto-scaling (configured)
- Manual override if needed

**Redis Scaling:**
- Upstash dashboard (if using)
- Monitor memory usage

## Monitoring Dashboards

### Grafana URLs

**Service Overview:**
- URL: `http://grafana.nomad.app/d/service-overview`
- Metrics: Request rate, error rate, latency

**Database Performance:**
- URL: `http://grafana.nomad.app/d/db-performance`
- Metrics: Query time, connections, slow queries

**SLO Dashboard:**
- URL: `http://grafana.nomad.app/d/slo`
- Metrics: SLO status, error budgets

**Cost Dashboard:**
- URL: `https://nomad.app/admin/costs`
- Metrics: Infrastructure costs, trends

## Alert Thresholds

### Critical Alerts (PagerDuty)

- Error rate > 5%
- Health check failed
- SLO critical violation
- Database unavailable

### Warning Alerts (Slack)

- Error rate > 1%
- SLO yellow status
- High latency (P95 > 500ms)
- Backup failures

## Escalation

**Level 1:** On-Call Engineer
**Level 2:** Engineering Lead
**Level 3:** CTO

## Tools Reference

- **Monitoring:** Grafana + Prometheus
- **Logs:** Loki
- **Traces:** Tempo
- **Alerts:** PagerDuty + Slack
- **Incidents:** Internal incident system
- **Costs:** Admin dashboard

## Revision History

- **v1.0** (2024-01-XX): Initial runbook