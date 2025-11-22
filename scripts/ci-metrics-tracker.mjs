#!/usr/bin/env node
/**
 * CI Metrics Tracker
 * Continuously tracks CI metrics and generates reports
 * 
 * Usage:
 *   node scripts/ci-metrics-tracker.mjs [--watch] [--days=7]
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'your-org';
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'your-repo';
const WATCH_MODE = process.argv.includes('--watch');
const DAYS_ARG = process.argv.find(arg => arg.startsWith('--days='));
const DAYS = DAYS_ARG ? parseInt(DAYS_ARG.split('=')[1], 10) : 7;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const METRICS_DIR = path.join(process.cwd(), 'reports', 'ci-metrics');

async function collectMetrics() {
  const timestamp = new Date().toISOString();
  console.log(`📊 Collecting CI metrics at ${timestamp}...\n`);

  // Get CI workflow
  let ciWorkflow;
  try {
    const { data } = await octokit.rest.actions.listWorkflows({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });
    ciWorkflow = data.workflows.find(w => w.name === 'CI' || w.path.includes('ci.yml'));
  } catch (error) {
    console.error('Error fetching workflows:', error.message);
    return null;
  }

  if (!ciWorkflow) {
    console.log('⚠️  No CI workflow found');
    return null;
  }

  // Get recent runs
  const since = new Date();
  since.setDate(since.getDate() - DAYS);
  
  let runs = [];
  try {
    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: ciWorkflow.id,
      per_page: 100,
      created: `>=${since.toISOString()}`,
    });
    runs = data.workflow_runs;
  } catch (error) {
    console.error('Error fetching workflow runs:', error.message);
    return null;
  }

  // Calculate metrics
  const metrics = {
    timestamp,
    period: `${DAYS} days`,
    totalRuns: runs.length,
    byStatus: {
      success: runs.filter(r => r.conclusion === 'success').length,
      failure: runs.filter(r => r.conclusion === 'failure').length,
      cancelled: runs.filter(r => r.conclusion === 'cancelled').length,
      in_progress: runs.filter(r => r.status === 'in_progress').length,
      queued: runs.filter(r => r.status === 'queued').length,
    },
    runtimes: [],
    checkCounts: [],
  };

  // Calculate runtimes and check counts
  for (const run of runs.filter(r => r.status === 'completed')) {
    if (run.updated_at && run.created_at) {
      const runtime = (new Date(run.updated_at) - new Date(run.created_at)) / 1000 / 60; // minutes
      metrics.runtimes.push(runtime);
    }

    try {
      const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        run_id: run.id,
      });
      metrics.checkCounts.push(data.jobs.length);
    } catch (error) {
      // Skip if can't get jobs
    }
  }

  // Calculate averages
  const completedRuns = metrics.byStatus.success + metrics.byStatus.failure + metrics.byStatus.cancelled;
  metrics.summary = {
    passRate: completedRuns > 0 
      ? ((metrics.byStatus.success / completedRuns) * 100).toFixed(1) 
      : '0.0',
    avgRuntimeMinutes: metrics.runtimes.length > 0
      ? Math.round(metrics.runtimes.reduce((a, b) => a + b, 0) / metrics.runtimes.length)
      : 0,
    medianRuntimeMinutes: metrics.runtimes.length > 0
      ? Math.round(metrics.runtimes.sort((a, b) => a - b)[Math.floor(metrics.runtimes.length / 2)])
      : 0,
    avgChecksPerRun: metrics.checkCounts.length > 0
      ? (metrics.checkCounts.reduce((a, b) => a + b, 0) / metrics.checkCounts.length).toFixed(1)
      : '0.0',
    maxChecksPerRun: metrics.checkCounts.length > 0
      ? Math.max(...metrics.checkCounts)
      : 0,
  };

  // Save metrics
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }

  const metricsFile = path.join(METRICS_DIR, `metrics-${new Date().toISOString().split('T')[0]}.json`);
  const allMetrics = fs.existsSync(metricsFile)
    ? JSON.parse(fs.readFileSync(metricsFile, 'utf-8'))
    : { daily: [] };
  
  allMetrics.daily.push(metrics);
  allMetrics.lastUpdated = timestamp;
  
  // Keep only last 30 days
  if (allMetrics.daily.length > 30) {
    allMetrics.daily = allMetrics.daily.slice(-30);
  }

  fs.writeFileSync(metricsFile, JSON.stringify(allMetrics, null, 2));

  // Print summary
  console.log('📈 Metrics Summary:\n');
  console.log(`   Total Runs: ${metrics.totalRuns}`);
  console.log(`   ✅ Success: ${metrics.byStatus.success}`);
  console.log(`   ❌ Failure: ${metrics.byStatus.failure}`);
  console.log(`   📊 Pass Rate: ${metrics.summary.passRate}%`);
  console.log(`   ⏱️  Avg Runtime: ${metrics.summary.avgRuntimeMinutes} min`);
  console.log(`   ⏱️  Median Runtime: ${metrics.summary.medianRuntimeMinutes} min`);
  console.log(`   🔢 Avg Checks: ${metrics.summary.avgChecksPerRun}`);
  console.log(`   🔢 Max Checks: ${metrics.summary.maxChecksPerRun}\n`);

  // Check thresholds
  const thresholds = {
    passRate: 95,
    avgRuntime: 15,
    maxChecks: 8,
  };

  let allGood = true;
  if (parseFloat(metrics.summary.passRate) < thresholds.passRate) {
    console.log(`⚠️  Pass rate (${metrics.summary.passRate}%) below target (${thresholds.passRate}%)`);
    allGood = false;
  }
  if (metrics.summary.avgRuntimeMinutes > thresholds.avgRuntime) {
    console.log(`⚠️  Avg runtime (${metrics.summary.avgRuntimeMinutes}min) exceeds target (${thresholds.avgRuntime}min)`);
    allGood = false;
  }
  if (parseInt(metrics.summary.maxChecksPerRun) > thresholds.maxChecks) {
    console.log(`⚠️  Max checks (${metrics.summary.maxChecksPerRun}) exceeds target (${thresholds.maxChecks})`);
    allGood = false;
  }

  if (allGood) {
    console.log('✅ All metrics within targets!\n');
  }

  console.log(`💾 Metrics saved to: ${metricsFile}\n`);

  return metrics;
}

async function watch() {
  console.log('👀 Watching CI metrics (collecting every hour)...\n');
  
  // Collect immediately
  await collectMetrics();

  // Then collect every hour
  setInterval(async () => {
    await collectMetrics();
  }, 60 * 60 * 1000);
}

if (WATCH_MODE) {
  watch();
} else {
  collectMetrics().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}
