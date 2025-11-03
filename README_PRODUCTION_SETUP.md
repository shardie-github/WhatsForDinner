# Production Setup Guide

This guide walks you through setting up Nomad for production deployment with full observability, security, and compliance features.

## Quick Start

Run the automated setup script:

```bash
./scripts/setup-production.sh
```

This interactive script will guide you through:
1. Environment variable configuration
2. Observability stack setup
3. Alerting configuration
4. Backup setup
5. Performance baseline generation
6. Security validation
7. Health checks
8. Evidence bundle generation

## Manual Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
# Edit .env.local with production values
```

**Critical Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)
- `STRIPE_SECRET_KEY` - Stripe API key
- `OPENAI_API_KEY` - OpenAI API key
- `SLACK_ALERT_WEBHOOK` - Slack webhook for alerts
- `PAGERDUTY_API_KEY` - PagerDuty integration key
- `BACKUP_BUCKET_URL` - S3/GCS bucket URL
- `BACKUP_ENCRYPTION_KEY` - 32+ character encryption key

### 2. Observability Stack

Start Prometheus, Grafana, Loki, and Tempo:

```bash
docker-compose -f docker-compose.observability.yml up -d
```

**Access:**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin - change password!)
- Loki: http://localhost:3100
- Tempo: http://localhost:3200

**Configure Grafana:**
1. Login to Grafana
2. Go to Configuration > Data Sources
3. Prometheus should be auto-configured
4. Import dashboards from `grafana/dashboards/`

### 3. Alerting Setup

Configure Slack and PagerDuty:

```bash
./scripts/setup-alerts.sh
```

Or manually:
1. **Slack:** Create webhook at https://api.slack.com/apps
2. **PagerDuty:** Create service and get integration key
3. Update `.env.local` with credentials
4. Update `alertmanager.yml` with webhook URLs

### 4. Backup Configuration

**S3:**
```bash
export BACKUP_BUCKET_URL=s3://nomad-backups
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
```

**GCS:**
```bash
export BACKUP_BUCKET_URL=gs://nomad-backups
# Configure gcloud auth
```

**Test Backup:**
```bash
pnpm backup:run
pnpm backup:verify
```

**Schedule Daily Backups:**
```bash
# Add to crontab
0 2 * * * cd /app && pnpm backup:run
```

### 5. Performance Baseline

Generate performance baseline for regression detection:

```bash
# Install k6 first: https://k6.io/docs/getting-started/installation/
pnpm perf:baseline
```

### 6. Security Validation

Run security scans:

```bash
pnpm security:audit
pnpm security:scan
pnpm secrets:scan
```

### 7. Health Checks

Verify all services are healthy:

```bash
pnpm health:check
curl https://api.nomad.app/healthz
```

### 8. Evidence Bundle (for Audits)

Generate compliance evidence bundle:

```bash
pnpm evidence:bundle
# Creates: .evidence/evidence-bundle-YYYY-MM-DD.zip
```

## Verification Checklist

After setup, verify:

- [ ] Prometheus scraping metrics (check http://localhost:9090/targets)
- [ ] Grafana dashboards loaded
- [ ] Slack alerts working (test alert)
- [ ] PagerDuty integration tested
- [ ] Backups running and verified
- [ ] Performance baseline generated
- [ ] Security scans passing
- [ ] Health checks passing
- [ ] Evidence bundle generated

## Monitoring Dashboards

### Service Overview
- **URL:** Grafana ? Service Overview dashboard
- **Metrics:** Request rate, error rate, latency, active requests

### SLO Dashboard
- **URL:** Grafana ? SLO Dashboard
- **Metrics:** Availability, latency P95, error rate, error budgets

### Cost Dashboard
- **URL:** https://nomad.app/admin/costs
- **Metrics:** Infrastructure costs, trends, forecasts

## Alerting

### Critical Alerts (PagerDuty)
- Error rate > 5%
- SLO critical violation
- Health check failure
- Database unavailable

### Warning Alerts (Slack)
- Error rate > 1%
- SLO yellow status
- High latency (P95 > 500ms)
- Backup failures

## Disaster Recovery

### Quarterly DR Drill

Automated quarterly drill via GitHub Actions (first Monday of each quarter).

**Manual Trigger:**
```bash
# Via GitHub Actions UI or:
gh workflow run dr-drill.yml
```

**Procedure:**
1. Verify backups
2. Test restore (dry-run)
3. Simulate failover
4. Measure RTO/RPO
5. Generate report

See `docs/DR_BCP.md` for detailed procedures.

## Ongoing Maintenance

### Daily
- Review error rates and SLO status
- Check overnight incidents
- Verify backup completion

### Weekly
- Review performance metrics
- Check security scan results
- Verify backup integrity
- Review incidents

### Monthly
- DR drill
- Compliance review
- Performance baseline update
- Monthly report

See `docs/RUNBOOKS.md` for detailed maintenance procedures.

## Troubleshooting

### Prometheus Not Scraping

Check:
1. Service exposing metrics on port 9464
2. Prometheus config (`prometheus.yml`) has correct target
3. Network connectivity (Docker networking)

### Grafana Can't Connect to Prometheus

Verify:
1. Prometheus service name in datasource config
2. Network connectivity between containers
3. Prometheus is running

### Alerts Not Firing

Check:
1. Alertmanager configuration
2. Slack/PagerDuty webhook URLs
3. Alert rules in `alerts.yml`
4. Prometheus alertmanager integration

### Backups Failing

Verify:
1. Backup bucket URL and credentials
2. Network access to storage
3. Encryption key configured
4. Disk space available

## Support

**Documentation:**
- Full Implementation: `PRODUCTION_GRADE_IMPLEMENTATION_SUMMARY.md`
- Runbooks: `docs/RUNBOOKS.md`
- DR/BCP: `docs/DR_BCP.md`
- Incident Response: `docs/INCIDENT_RUNBOOK.md`
- Audit Readiness: `docs/AUDIT_READINESS_CHECKLIST.md`

**Contact:**
- Engineering: engineering@nomad.app
- Infrastructure: infrastructure@nomad.app
- On-Call: PagerDuty rotation

---

**Last Updated:** 2024-01-XX