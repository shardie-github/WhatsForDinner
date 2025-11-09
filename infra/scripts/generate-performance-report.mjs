#!/usr/bin/env node
/**
 * Performance Intelligence Layer: Performance Report Generator
 * Generates PERFORMANCE_REPORT.md with insights and recommendations
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate performance report
 */
async function generateReport() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get metrics summary
  const { data: summary } = await supabase.rpc('get_metrics_summary', {
    p_start_time: sevenDaysAgo.toISOString(),
    p_end_time: now.toISOString(),
  });

  // Get recent metrics by source
  const { data: vercelMetrics } = await supabase
    .from('metrics_log')
    .select('metric, ts')
    .eq('source', 'vercel')
    .gte('ts', sevenDaysAgo.toISOString())
    .order('ts', { ascending: false })
    .limit(100);

  const { data: supabaseMetrics } = await supabase
    .from('metrics_log')
    .select('metric, ts')
    .eq('source', 'supabase')
    .gte('ts', sevenDaysAgo.toISOString())
    .order('ts', { ascending: false })
    .limit(100);

  const { data: expoMetrics } = await supabase
    .from('metrics_log')
    .select('metric, ts')
    .eq('source', 'expo')
    .gte('ts', sevenDaysAgo.toISOString())
    .order('ts', { ascending: false })
    .limit(50);

  const { data: ciMetrics } = await supabase
    .from('metrics_log')
    .select('metric, ts')
    .eq('source', 'github')
    .gte('ts', sevenDaysAgo.toISOString())
    .order('ts', { ascending: false })
    .limit(50);

  // Calculate averages
  const avgLCP =
    vercelMetrics?.reduce((sum, m) => sum + (m.metric?.LCP || 0), 0) /
      (vercelMetrics?.length || 1) || 0;
  const avgCLS =
    vercelMetrics?.reduce((sum, m) => sum + (m.metric?.CLS || 0), 0) /
      (vercelMetrics?.length || 1) || 0;
  const avgTTFB =
    vercelMetrics?.reduce((sum, m) => sum + (m.metric?.TTFB || 0), 0) /
      (vercelMetrics?.length || 1) || 0;

  const avgSupabaseLatency =
    supabaseMetrics?.reduce((sum, m) => sum + (m.metric?.latencyMs || 0), 0) /
      (supabaseMetrics?.length || 1) || 0;

  const avgBundleSize =
    expoMetrics?.reduce((sum, m) => sum + (m.metric?.bundleSizeMB || 0), 0) /
      (expoMetrics?.length || 1) || 0;

  const avgBuildTime =
    ciMetrics?.reduce((sum, m) => sum + (m.metric?.duration || 0), 0) /
      (ciMetrics?.length || 1) || 0;
  const ciSuccessRate =
    (ciMetrics?.filter((m) => m.metric?.conclusion === 'success').length /
      (ciMetrics?.length || 1)) *
      100 || 0;

  // Determine status
  const status =
    avgLCP > 2.5 ||
    avgCLS > 0.1 ||
    avgSupabaseLatency > 500 ||
    ciSuccessRate < 90
      ? '⚠️ DEGRADED'
      : '✅ HEALTHY';

  // Generate recommendations
  const recommendations = [];

  if (avgLCP > 2.5) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Optimize Largest Contentful Paint (LCP)',
      details: `Current: ${avgLCP.toFixed(2)}s (target: <2.5s)`,
      suggestions: [
        'Enable image compression and next-image optimization',
        'Preload critical resources',
        'Optimize server response times',
      ],
    });
  }

  if (avgCLS > 0.1) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Reduce Cumulative Layout Shift (CLS)',
      details: `Current: ${avgCLS.toFixed(3)} (target: <0.1)`,
      suggestions: [
        'Set explicit dimensions for images and embeds',
        'Reserve space for dynamic content',
        'Avoid inserting content above existing content',
      ],
    });
  }

  if (avgSupabaseLatency > 500) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Optimize Database Query Performance',
      details: `Current: ${avgSupabaseLatency.toFixed(0)}ms (target: <500ms)`,
      suggestions: [
        'Add database indexes for frequently queried columns',
        'Review and optimize slow queries',
        'Consider query result caching',
      ],
    });
  }

  if (avgBundleSize > 30) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Reduce Mobile Bundle Size',
      details: `Current: ${avgBundleSize.toFixed(1)}MB (target: <30MB)`,
      suggestions: [
        'Run expo optimize',
        'Remove unused dependencies',
        'Enable code splitting',
      ],
    });
  }

  if (ciSuccessRate < 90) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Improve CI Success Rate',
      details: `Current: ${ciSuccessRate.toFixed(1)}% (target: >90%)`,
      suggestions: [
        'Review failing test cases',
        'Investigate flaky tests',
        'Optimize CI pipeline configuration',
      ],
    });
  }

  // Generate markdown report
  const report = `# Performance Intelligence Report

**Generated:** ${now.toISOString()}  
**Status:** ${status}  
**Period:** Last 7 days

---

## 📊 Summary Metrics

### Core Web Vitals
- **LCP (Largest Contentful Paint):** ${avgLCP.toFixed(2)}s ${avgLCP > 2.5 ? '⚠️' : '✅'}
- **CLS (Cumulative Layout Shift):** ${avgCLS.toFixed(3)} ${avgCLS > 0.1 ? '⚠️' : '✅'}
- **TTFB (Time to First Byte):** ${avgTTFB.toFixed(0)}ms ${avgTTFB > 800 ? '⚠️' : '✅'}

### Backend Performance
- **Supabase Avg Latency:** ${avgSupabaseLatency.toFixed(0)}ms ${avgSupabaseLatency > 500 ? '⚠️' : '✅'}
- **Total Queries:** ${supabaseMetrics?.length || 0}

### Mobile Build Metrics
- **Bundle Size:** ${avgBundleSize.toFixed(1)}MB ${avgBundleSize > 30 ? '⚠️' : '✅'}
- **Build Duration:** ${(avgBuildTime / 60).toFixed(1)} minutes

### CI/CD Performance
- **Success Rate:** ${ciSuccessRate.toFixed(1)}% ${ciSuccessRate < 90 ? '⚠️' : '✅'}
- **Avg Build Time:** ${(avgBuildTime / 60).toFixed(1)} minutes

---

## 📈 Data Collection

- **Total Records:** ${summary?.total_records || 0}
- **Sources:** ${Object.keys(summary?.sources || {}).join(', ') || 'None'}

---

## 💡 Optimization Recommendations

${
  recommendations.length === 0
    ? '✅ No critical optimizations needed at this time.'
    : recommendations
        .map(
          (rec) => `### [${rec.priority}] ${rec.action}

${rec.details}

**Suggested Actions:**
${rec.suggestions.map((s) => `- ${s}`).join('\n')}
`
        )
        .join('\n---\n\n')
}

---

## 🔄 Next Best Actions

${
  recommendations.length > 0
    ? recommendations
        .filter((r) => r.priority === 'HIGH')
        .map((r) => `1. ${r.action}`)
        .join('\n')
    : '1. Continue monitoring metrics\n2. Review trends weekly\n3. Proactively optimize before thresholds are reached'
}

---

## 📝 Notes

- This report is auto-generated by the Performance Intelligence Layer
- Metrics are collected from Vercel, Supabase, Expo, and GitHub Actions
- Regressions are automatically detected and alerts are sent when thresholds are exceeded
- View live dashboard at \`/admin/metrics\`

---

*Last updated: ${now.toISOString()}*
`;

  // Write to file
  const reportPath = join(process.cwd(), 'PERFORMANCE_REPORT.md');
  writeFileSync(reportPath, report, 'utf-8');

  console.log('✅ Performance report generated:', reportPath);
  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateReport };
