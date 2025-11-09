# Performance Intelligence Layer

Autonomous Performance Intelligence Layer for the Hardonia stack. Observes, visualizes, and continuously enhances uptime, speed, and reliability across all connected services — without user intervention.

## 🎯 Overview

The Performance Intelligence Layer automatically:

1. **Instruments** the stack with live metrics (backend + frontend + CI)
2. **Aggregates** telemetry in a central Supabase table (`metrics_log`)
3. **Visualizes** insights through JSON dashboards rendered in `/admin/metrics`
4. **Detects** anomalies or regressions automatically
5. **Recommends** or applies safe, incremental optimizations

## 📊 Architecture

### Components

- **Database**: `metrics_log` table in Supabase with RLS policies
- **API Endpoints**:
  - `/api/metrics/dashboard` - Aggregated metrics dashboard (JSON)
  - `/api/metrics.json` - Public JSON endpoint
  - `/api/telemetry` - Beacon endpoint for client-side metrics
- **Admin Dashboard**: `/admin/metrics` - Visual dashboard with Recharts
- **Collection Scripts**: `infra/scripts/collect-metrics.mjs`
- **Analysis Scripts**: `infra/scripts/analyze-metrics.mjs`
- **Report Generator**: `infra/scripts/generate-performance-report.mjs`
- **GitHub Actions**: `.github/workflows/telemetry.yml` - Nightly collection

### Data Flow

```
Client Browser → Telemetry Beacon → /api/telemetry → metrics_log
                                                          ↓
GitHub Actions → collect-metrics.mjs → metrics_log → analyze-metrics.mjs
                                                          ↓
                                            PERFORMANCE_REPORT.md
```

## 🚀 Setup

### 1. Database Migration

Run the Supabase migration:

```bash
supabase migration up
# Or apply manually: supabase/migrations/053_performance_intelligence_metrics_log.sql
```

### 2. Environment Variables

Ensure these are set in your environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_TOKEN=your_github_token  # Optional, for CI metrics
VERCEL_TOKEN=your_vercel_token  # Optional, for Vercel analytics
TELEMETRY_WEBHOOK_URL=your_webhook_url  # Optional, for alerts
```

### 3. GitHub Actions

The workflow runs automatically:
- **Nightly** at 2 AM UTC
- **On push** to main/master
- **Manually** via workflow_dispatch

### 4. Client-Side Telemetry

Telemetry is automatically initialized via `layout.tsx`. The beacon collects:
- Core Web Vitals (LCP, CLS, FID, FCP)
- Navigation timing (TTFB)
- Connection type
- Anonymized URLs

## 📈 Usage

### View Dashboard

Navigate to `/admin/metrics` in your application to see:
- Core Web Vitals charts
- Backend performance metrics
- Mobile build metrics
- CI/CD success rates
- Trend analysis

### Access JSON API

```bash
curl https://your-domain.com/api/metrics/dashboard
curl https://your-domain.com/api/metrics.json
```

### Manual Collection

```bash
node infra/scripts/collect-metrics.mjs
```

### Manual Analysis

```bash
node infra/scripts/analyze-metrics.mjs
```

### Generate Report

```bash
node infra/scripts/generate-performance-report.mjs
```

## 🔍 Metrics Collected

### Vercel (Web Vitals)
- **LCP** (Largest Contentful Paint)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)
- **FID** (First Input Delay)
- **FCP** (First Contentful Paint)

### Supabase
- Query latency (ms)
- Query count
- Edge latency

### Expo
- Bundle size (MB)
- Build duration (minutes)
- Build success rate

### GitHub Actions
- Build duration (minutes)
- Success rate (%)
- Queue length

## 🚨 Alerting

### Automatic Alerts

Alerts are triggered when:
- **3+ consecutive regressions** detected
- Any metric degrades by **>10%**

### Alert Channels

1. **GitHub Issues**: Created automatically with label `performance`
2. **Webhook**: POST to `TELEMETRY_WEBHOOK_URL` (if configured)

## 💡 Optimization Recommendations

The system automatically suggests:

- **Image optimization** if LCP > 2.5s
- **Database indexes** if latency > 500ms
- **Bundle optimization** if bundle > 30MB
- **CI throttling** if queue > 3 pending

## 📝 Performance Reports

Reports are auto-generated and committed to the repo:

- **File**: `PERFORMANCE_REPORT.md`
- **Frequency**: After each metrics collection
- **Content**: Summary metrics, trends, recommendations

## 🔒 Security & Privacy

- **RLS Policies**: Metrics are protected by Row Level Security
- **Anonymization**: URLs and user data are anonymized
- **Service Role**: Only service role can write metrics
- **No PII**: No personally identifiable information stored

## 🧪 Testing

### Test Telemetry Endpoint

```bash
curl -X POST https://your-domain.com/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"url": "/test", "ttfb": 100, "lcp": 1.5, "cls": 0.05}'
```

### Test Dashboard

```bash
curl https://your-domain.com/api/metrics/dashboard
```

## 📚 API Reference

### POST /api/telemetry

Accepts telemetry data from client beacons.

**Request Body:**
```json
{
  "url": "/page-path",
  "ttfb": 100,
  "lcp": 1.5,
  "cls": 0.05,
  "fid": 50,
  "fcp": 800,
  "ts": 1234567890
}
```

### GET /api/metrics/dashboard

Returns aggregated metrics dashboard.

**Response:**
```json
{
  "performance": {
    "webVitals": {
      "LCP": 1.8,
      "CLS": 0.01,
      "TTFB": 120,
      "FID": 50
    },
    "supabase": {
      "avgLatencyMs": 120,
      "queryCount": 1000
    },
    "expo": {
      "bundleMB": 24,
      "buildDurationMin": 5.2
    },
    "ci": {
      "avgBuildMin": 5.2,
      "successRate": 95
    }
  },
  "status": "healthy",
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

## 🔧 Troubleshooting

### Metrics Not Appearing

1. Check Supabase connection: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Verify RLS policies allow service role writes
3. Check browser console for telemetry errors

### Dashboard Not Loading

1. Verify `/admin/metrics` route exists
2. Check API endpoint: `/api/metrics/dashboard`
3. Review browser console for errors

### GitHub Actions Failing

1. Verify `GITHUB_TOKEN` has `actions:read` permission
2. Check repository name format: `owner/repo`
3. Review workflow logs for specific errors

## 🚀 Future Enhancements

- [ ] OpenTelemetry integration
- [ ] Grafana dashboard export
- [ ] ML-based anomaly detection (z-score, Prophet)
- [ ] EAS crash analytics integration
- [ ] Predictive scaling recommendations
- [ ] Cost estimation based on usage

## 📄 License

Part of the Hardonia stack. See main LICENSE file.

---

**Last Updated**: 2025-01-01  
**Version**: 1.0.0
