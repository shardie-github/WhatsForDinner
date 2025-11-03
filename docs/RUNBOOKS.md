# SRE Runbooks

## Overview

This document contains daily, weekly, and monthly operational runbooks for Site Reliability Engineering tasks.

## Daily Tasks

### Morning Checks (9 AM UTC)

#### Health Check
```bash
# Check overall system health
curl https://nomad.app/healthz

# Check Prometheus metrics
curl http://prometheus:9090/api/v1/query?query=up

# Review overnight alerts
# Check PagerDuty/Slack for any incidents
```

#### Error Rate Review
- Check error rate in Grafana dashboard
- Review error logs in Loki
- Check for any new error patterns

#### SLO Status
- Verify SLOs are within budget
- Check error budget consumption
- Review any SLO violations

### Backup Verification
```bash
# Verify backups completed successfully
pnpm backup:verify

# Check backup storage
# Verify backup checksums
```

### Monitoring Review
- Review Grafana dashboards
- Check for anomalies
- Verify alert rules are working

### Afternoon Checks (2 PM UTC)

#### Capacity Review
- Check resource utilization (CPU, memory, disk)
- Review queue backlogs
- Check database connection pools

#### Performance Metrics
- Review P95/P99 latency
- Check database query performance
- Review API response times

## Weekly Tasks

### Monday: Weekly Review

#### Incident Review
- Review all incidents from previous week
- Update incident runbooks if needed
- Share learnings with team

#### SLO Review
```bash
# Generate weekly SLO report
pnpm slo:report
```

#### Capacity Planning
- Review usage trends
- Plan for upcoming capacity needs
- Update scaling rules if needed

### Tuesday: Security Review

#### Security Scans
- Review Snyk scan results
- Check for new vulnerabilities
- Update dependencies if needed

#### Access Review
- Review admin access logs
- Verify access controls
- Check for unauthorized access

### Wednesday: Performance Optimization

#### Performance Analysis
- Review slow queries
- Optimize database indexes
- Review API performance

#### Load Testing
```bash
# Run performance tests
pnpm perf:analyze

# Compare with baseline
pnpm perf:monitor
```

### Thursday: Documentation Updates

#### Documentation Review
- Update runbooks based on incidents
- Review and update architecture docs
- Update onboarding docs

#### Knowledge Sharing
- Share learnings with team
- Update post-mortems
- Document new procedures

### Friday: Backup & Restore Test

#### Backup Verification
```bash
# Full backup verification
pnpm backup:verify

# Test restore (dry-run)
pnpm restore:run --dry-run
```

#### DR Readiness
- Review DR documentation
- Verify failover procedures
- Check backup integrity

## Monthly Tasks

### First Week: Capacity & Cost Review

#### Capacity Analysis
- Review usage trends
- Forecast capacity needs
- Update scaling rules
- Plan for peak periods

#### Cost Review
- Review infrastructure costs
- Identify cost optimization opportunities
- Review budget vs. actual spending

### Second Week: Security Audit

#### Security Review
- Full security audit
- Review access controls
- Update security policies
- Review compliance status

#### Dependency Updates
- Review dependency updates
- Update critical dependencies
- Test updates in staging

### Third Week: Disaster Recovery Drill

#### DR Drill
- Run full DR drill
- Test failover procedures
- Verify backup/restore
- Document drill results

#### Runbook Updates
- Update DR runbooks based on drill
- Fix any issues found
- Share learnings

### Fourth Week: Performance & Reliability Review

#### Performance Review
- Analyze performance trends
- Identify optimization opportunities
- Update performance budgets
- Review SLO targets

#### Reliability Metrics
- Review availability metrics
- Analyze incident trends
- Update reliability targets
- Plan improvements

## Quarterly Tasks

### Q1: Annual Planning
- Review annual objectives
- Plan capacity for year
- Review security roadmap
- Update compliance plans

### Q2: Compliance Review
- SOC 2 audit preparation
- ISO 27001 audit preparation
- Review compliance evidence
- Update compliance docs

### Q3: Architecture Review
- Review system architecture
- Identify technical debt
- Plan improvements
- Review scalability

### Q4: Year-End Review
- Annual performance review
- Incident summary
- Lessons learned
- Plan for next year

## On-Call Responsibilities

### Incident Response
- Respond within SLA (15 min for P1, 1 hour for P2)
- Follow `docs/INCIDENT_RUNBOOK.md`
- Document all actions
- Escalate if needed

### Monitoring
- Monitor alerts
- Review dashboards
- Respond to alerts
- Document incidents

### Communication
- Update status page
- Notify stakeholders
- Communicate resolution
- Write post-mortem

## Emergency Procedures

### Critical Incident (P1)
1. **Assess**: Determine impact and scope
2. **Communicate**: Notify team and stakeholders
3. **Mitigate**: Apply fixes or workarounds
4. **Resolve**: Fix root cause
5. **Document**: Write post-mortem

### Data Breach
1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope of breach
3. **Notify**: Inform stakeholders and authorities
4. **Remediate**: Fix vulnerabilities
5. **Document**: Document incident and response

### Service Outage
1. **Detect**: Monitor for outages
2. **Diagnose**: Identify root cause
3. **Mitigate**: Apply fixes or failover
4. **Resolve**: Restore service
5. **Review**: Post-mortem and improvements

## Automation

### Automated Tasks
- ? Daily backups
- ? Health checks
- ? Error rate monitoring
- ? SLO tracking
- ? Security scans
- ? Performance monitoring

### Manual Tasks
- ?? Incident response
- ?? Post-mortems
- ?? Capacity planning
- ?? Documentation updates
- ?? Compliance reviews

## Metrics & KPIs

### Daily Metrics
- Error rate
- Latency (P95, P99)
- Availability
- SLO compliance

### Weekly Metrics
- Incident count
- MTTR (Mean Time to Resolve)
- MTBF (Mean Time Between Failures)
- Error budget consumption

### Monthly Metrics
- Uptime percentage
- SLO compliance rate
- Security scan results
- Cost trends

## Tools & Resources

- **Monitoring**: Grafana, Prometheus, Loki, Tempo
- **Alerting**: PagerDuty, Slack
- **Incidents**: Admin console
- **Backups**: Backup scripts
- **Documentation**: This repository
