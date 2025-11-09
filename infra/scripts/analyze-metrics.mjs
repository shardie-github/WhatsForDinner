#!/usr/bin/env node
/**
 * Performance Intelligence Layer: Auto-Analysis Script
 * Detects regressions and generates optimization recommendations
 */

import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const githubRepo = process.env.GITHUB_REPOSITORY || 'owner/repo';
const webhookUrl = process.env.TELEMETRY_WEBHOOK_URL;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Detect regressions using SQL function
 */
async function detectRegressions() {
  const regressions = [];

  // Check LCP regressions
  const { data: lcpRegressions } = await supabase.rpc('detect_regressions', {
    p_metric_key: 'LCP',
    p_threshold_percent: 10,
    p_window_size: 10,
  });

  if (lcpRegressions?.some((r) => r.is_regression)) {
    regressions.push({
      metric: 'LCP',
      source: 'vercel',
      severity: 'high',
      message: 'LCP has degraded by >10%',
    });
  }

  // Check CLS regressions
  const { data: clsRegressions } = await supabase.rpc('detect_regressions', {
    p_metric_key: 'CLS',
    p_threshold_percent: 10,
    p_window_size: 10,
  });

  if (clsRegressions?.some((r) => r.is_regression)) {
    regressions.push({
      metric: 'CLS',
      source: 'vercel',
      severity: 'medium',
      message: 'CLS has degraded by >10%',
    });
  }

  // Check Supabase latency regressions
  const { data: latencyRegressions } = await supabase.rpc('detect_regressions', {
    p_metric_key: 'latencyMs',
    p_threshold_percent: 10,
    p_window_size: 10,
  });

  if (latencyRegressions?.some((r) => r.is_regression)) {
    regressions.push({
      metric: 'Supabase Latency',
      source: 'supabase',
      severity: 'high',
      message: 'Database query latency has increased by >10%',
    });
  }

  return regressions;
}

/**
 * Generate optimization recommendations
 */
async function generateRecommendations() {
  const recommendations = [];

  // Get recent metrics summary
  const { data: summary } = await supabase.rpc('get_metrics_summary', {
    p_start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Check bundle size
  const { data: expoMetrics } = await supabase
    .from('metrics_log')
    .select('metric')
    .eq('source', 'expo')
    .order('ts', { ascending: false })
    .limit(5);

  const avgBundleSize =
    expoMetrics?.reduce(
      (sum, m) => sum + (m.metric?.bundleSizeMB || 0),
      0
    ) / (expoMetrics?.length || 1);

  if (avgBundleSize > 30) {
    recommendations.push({
      type: 'expo',
      action: 'Trigger expo optimize',
      reason: `Bundle size (${avgBundleSize.toFixed(1)}MB) exceeds 30MB threshold`,
      priority: 'high',
    });
  }

  // Check Supabase latency
  const { data: supabaseMetrics } = await supabase
    .from('metrics_log')
    .select('metric')
    .eq('source', 'supabase')
    .order('ts', { ascending: false })
    .limit(10);

  const avgLatency =
    supabaseMetrics?.reduce(
      (sum, m) => sum + (m.metric?.latencyMs || 0),
      0
    ) / (supabaseMetrics?.length || 1);

  if (avgLatency > 500) {
    recommendations.push({
      type: 'supabase',
      action: 'Add database indexes',
      reason: `Average query latency (${avgLatency.toFixed(0)}ms) exceeds 500ms`,
      priority: 'high',
    });
  }

  // Check CI queue
  if (githubToken) {
    try {
      const octokit = new Octokit({ auth: githubToken });
      const [owner, repo] = githubRepo.split('/');
      const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        status: 'queued',
        per_page: 10,
      });

      if (runs.workflow_runs.length > 3) {
        recommendations.push({
          type: 'ci',
          action: 'Throttle GitHub workflow concurrency',
          reason: `${runs.workflow_runs.length} workflows queued (threshold: 3)`,
          priority: 'medium',
        });
      }
    } catch (error) {
      console.warn('Could not check CI queue:', error.message);
    }
  }

  return recommendations;
}

/**
 * Create GitHub issue for regression alert
 */
async function createRegressionIssue(regressions) {
  if (!githubToken) {
    console.warn('⚠️  GITHUB_TOKEN not set, skipping GitHub issue creation');
    return;
  }

  try {
    const octokit = new Octokit({ auth: githubToken });
    const [owner, repo] = githubRepo.split('/');

    const title = '🚨 Performance Regression Detected';
    const body = `## Performance Regression Alert

The following performance regressions have been detected:

${regressions
  .map(
    (r) => `- **${r.metric}** (${r.source}): ${r.message} [${r.severity}]`
  )
  .join('\n')}

### Recommended Actions

1. Review recent deployments
2. Check for resource constraints
3. Review optimization recommendations

---
*Generated by Performance Intelligence Layer*`;

    await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels: ['performance', 'regression', 'automated'],
    });

    console.log('✅ Created GitHub issue for regression');
  } catch (error) {
    console.error('❌ Error creating GitHub issue:', error.message);
  }
}

/**
 * Send webhook alert
 */
async function sendWebhookAlert(regressions, recommendations) {
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '🚨 Performance Regression Detected',
        regressions,
        recommendations,
        timestamp: new Date().toISOString(),
      }),
    });
    console.log('✅ Sent webhook alert');
  } catch (error) {
    console.error('❌ Error sending webhook:', error.message);
  }
}

/**
 * Main analysis function
 */
async function analyzeMetrics() {
  console.log('🔍 Analyzing metrics for regressions...\n');

  const regressions = await detectRegressions();
  const recommendations = await generateRecommendations();

  if (regressions.length > 0) {
    console.log(`⚠️  Found ${regressions.length} regression(s):`);
    regressions.forEach((r) => {
      console.log(`  - ${r.metric}: ${r.message}`);
    });

    // Check if we have 3+ consecutive regressions
    if (regressions.length >= 3) {
      console.log('\n🚨 Three or more regressions detected - creating alert');
      await createRegressionIssue(regressions);
      await sendWebhookAlert(regressions, recommendations);
    }
  } else {
    console.log('✅ No regressions detected');
  }

  if (recommendations.length > 0) {
    console.log(`\n💡 Generated ${recommendations.length} recommendation(s):`);
    recommendations.forEach((r) => {
      console.log(`  - [${r.priority}] ${r.action}: ${r.reason}`);
    });
  }

  return { regressions, recommendations };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeMetrics().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { analyzeMetrics };
