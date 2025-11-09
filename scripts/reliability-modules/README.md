# Reliability Orchestrator System

Autonomous reliability, financial, and security orchestrator for the Hardonia full-stack environment (Vercel × Supabase × Expo × GitHub).

## Overview

The Reliability Orchestrator provides comprehensive monitoring, forecasting, and automated remediation capabilities:

1. **Dependency Health** - Monitors outdated packages and vulnerabilities
2. **Cost Forecasting** - Predicts infrastructure costs and detects overruns
3. **Error Triage** - Identifies recurring failures and auto-creates fixes
4. **Uptime Monitoring** - Tracks uptime and latency, alerts on downtime
5. **Security & Compliance** - Audits secrets, licenses, TLS, CORS, RLS, GDPR
6. **Dashboard Generation** - Auto-generates admin dashboards
7. **Auto-PR Generation** - Creates PRs for safe remediations

## Usage

### Run Full Orchestration

```bash
pnpm run reliability:orchestrate
```

### Check Only (No PRs)

```bash
pnpm run reliability:check
```

### Generate Dashboards Only

```bash
pnpm run reliability:dashboard
```

## Modules

### DependencyHealthChecker

- Runs `pnpm outdated --json`
- Runs `npm audit --json`
- Runs `expo doctor` (if Expo is present)
- Validates lockfile consistency
- Groups findings by service/workspace

### CostForecaster

- Collects metrics from Vercel, Supabase, Expo, GitHub Actions
- Computes rolling averages for build time, latency, bandwidth, usage cost
- Produces `cost_forecast.json` and `reliability_trends.json`
- Generates recommendations if cost > budget

### ErrorTriage

- Analyzes deployment logs and CI runs
- Classifies root cause (build, API, auth, network)
- Identifies recurring failures (> 3 occurrences)
- Auto-creates GitHub issues for fixes

### UptimeMonitor

- Pings `/api/health` endpoint
- Records latency in `metrics_log` table
- Detects downtime > 2 minutes
- Sends webhook alerts if configured

### SecurityComplianceAuditor

- **Secrets Auditing**: Scans `.env` files for exposed patterns (never prints values)
- **SBOM**: Builds dependency inventory
- **License Compliance**: Flags GPL or non-commercial licenses
- **TLS & CORS**: Confirms HTTPS and proper CORS headers
- **RLS Validation**: Verifies RLS enabled on all tables
- **GDPR Checks**: Ensures data anonymization, PII handling, retention policies

### DashboardGenerator

Generates:
- `/admin/reliability.json` - Machine-readable reliability metrics
- `/admin/reliability.md` - Human-readable reliability report
- `/admin/compliance.json` - Compliance status and scores

### PRGenerator

- **Minor security fixes** → Auto-PR with label `security-auto`
- **Major or breaking** → Open issue + draft PR requiring manual approval
- **Recurring failures** → Create GitHub issue with details

## Outputs

### Reports Directory

- `REPORTS/dependency-report.json` - Dependency health findings
- `REPORTS/cost_forecast.json` - Cost forecasting data
- `REPORTS/reliability_trends.json` - Reliability trends over time

### Compliance Directory

- `compliance/audits/YYYY-MM-DD/SECURITY_COMPLIANCE_REPORT.json` - Daily security audit
- `SECURITY_COMPLIANCE_REPORT.md` - Human-readable security report

### Admin Dashboards

- `apps/web/public/admin/reliability.json` - Reliability dashboard (JSON)
- `apps/web/public/admin/reliability.md` - Reliability dashboard (Markdown)
- `apps/web/public/admin/compliance.json` - Compliance dashboard

### Metrics Storage

All metrics are stored in Supabase `metrics_log` table for historical analysis.

## Configuration

### Environment Variables

- `MONTHLY_BUDGET` - Monthly budget threshold (default: $75)
- `HEALTH_CHECK_URL` - Health check endpoint URL
- `RELIABILITY_ALERT_WEBHOOK` - Webhook URL for alerts
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Config Object

```javascript
{
  budget: 75, // Monthly budget in USD
  uptimeThreshold: 0.999, // 99.9% uptime target
  downtimeThreshold: 2 * 60 * 1000, // 2 minutes
  vulnerabilityWindow: 48 * 60 * 60 * 1000, // 48 hours
  complianceAuditDir: './compliance/audits',
  adminDir: './apps/web/public/admin'
}
```

## GitHub Actions

The orchestrator runs automatically:

- **Every 6 hours** via scheduled cron job
- **On-demand** via `workflow_dispatch`
- **On PRs** (comments with reliability report)

See `.github/workflows/reliability-orchestrator.yml`

## Success Criteria

- ✅ All services ≥ 99.9% uptime
- ✅ No high-severity vulnerabilities open > 48h
- ✅ Monthly cost forecast within ±10% accuracy
- ✅ GDPR / SOC 2 / ISO 27001 hygiene met
- ✅ Security & performance dashboards auto-refresh post-deploy

## Guardrails

- ❌ Never exposes secret values
- ❌ Skips breaking upgrades without approval
- ✅ Operates in safe mode by default → simulate → log → PR
- ✅ Always retains last three audit snapshots for rollback

## Extensions

Optional enhancements:

- OpenTelemetry traces → Grafana board
- AI anomaly detector (Z-score/Prophet) for proactive alerts
- Slack/Discord feeds for security or cost regressions
- Weekly digest → Google Sheet or email summary
