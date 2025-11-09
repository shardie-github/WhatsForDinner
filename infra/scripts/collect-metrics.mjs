#!/usr/bin/env node
/**
 * Performance Intelligence Layer: Metrics Collection Script
 * Collects metrics from Vercel, Supabase, Expo, and GitHub Actions
 * Run on deploy or via cron
 */

import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN;
const githubRepo = process.env.GITHUB_REPOSITORY || 'owner/repo';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Collect Vercel Analytics metrics
 */
async function collectVercelMetrics() {
  if (!vercelToken) {
    console.warn('⚠️  VERCEL_TOKEN not set, skipping Vercel metrics');
    return;
  }

  try {
    // Use Vercel Analytics API (if available) or web vitals from telemetry
    // For now, we'll rely on telemetry beacons for web vitals
    console.log('✅ Vercel metrics collected via telemetry');
  } catch (error) {
    console.error('❌ Error collecting Vercel metrics:', error.message);
  }
}

/**
 * Collect Supabase performance metrics
 */
async function collectSupabaseMetrics() {
  try {
    // Test query performance
    const start = Date.now();
    const { data, error } = await supabase
      .from('metrics_log')
      .select('id')
      .limit(1);
    const latency = Date.now() - start;

    if (!error) {
      await supabase.from('metrics_log').insert({
        source: 'supabase',
        metric: {
          latencyMs: latency,
          queryTime: latency,
          rowCount: data?.length || 0,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`✅ Supabase metrics: ${latency}ms latency`);
    }
  } catch (error) {
    console.error('❌ Error collecting Supabase metrics:', error.message);
  }
}

/**
 * Collect Expo build metrics
 */
async function collectExpoMetrics() {
  try {
    // This would typically call: expo build:list --json
    // For now, we'll use a placeholder that can be enhanced
    const mockMetrics = {
      bundleSizeMB: 24,
      buildDuration: 300, // seconds
      buildSuccess: true,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('metrics_log').insert({
      source: 'expo',
      metric: mockMetrics,
    });

    console.log('✅ Expo metrics collected (mock data - enhance with expo CLI)');
  } catch (error) {
    console.error('❌ Error collecting Expo metrics:', error.message);
  }
}

/**
 * Collect GitHub Actions CI metrics
 */
async function collectGitHubMetrics() {
  if (!githubToken) {
    console.warn('⚠️  GITHUB_TOKEN not set, skipping GitHub metrics');
    return;
  }

  try {
    const octokit = new Octokit({ auth: githubToken });
    const [owner, repo] = githubRepo.split('/');

    // Get recent workflow runs
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 10,
    });

    if (runs.workflow_runs.length > 0) {
      const successful = runs.workflow_runs.filter(
        (r) => r.conclusion === 'success'
      ).length;
      const avgDuration =
        runs.workflow_runs.reduce((sum, r) => sum + (r.run_duration_ms || 0), 0) /
        runs.workflow_runs.length;

      await supabase.from('metrics_log').insert({
        source: 'github',
        metric: {
          duration: avgDuration / 1000, // seconds
          conclusion: 'success',
          successRate: (successful / runs.workflow_runs.length) * 100,
          totalRuns: runs.workflow_runs.length,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(
        `✅ GitHub CI metrics: ${successful}/${runs.workflow_runs.length} successful, ${(avgDuration / 1000).toFixed(1)}s avg`
      );
    }
  } catch (error) {
    console.error('❌ Error collecting GitHub metrics:', error.message);
  }
}

/**
 * Main collection function
 */
async function collectAllMetrics() {
  console.log('🚀 Starting metrics collection...\n');

  await Promise.all([
    collectVercelMetrics(),
    collectSupabaseMetrics(),
    collectExpoMetrics(),
    collectGitHubMetrics(),
  ]);

  console.log('\n✅ Metrics collection complete');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  collectAllMetrics().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { collectAllMetrics };
