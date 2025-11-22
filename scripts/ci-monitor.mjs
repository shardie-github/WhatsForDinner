#!/usr/bin/env node
/**
 * CI Monitoring Script
 * Tracks CI pass rates, runtime, and check counts
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'your-org';
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'your-repo';
const DAYS_BACK = parseInt(process.env.DAYS_BACK || '7', 10);

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getWorkflowRuns(workflowId, daysBack = 7) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  
  const runs = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const { data } = await octokit.rest.actions.listWorkflowRuns({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        workflow_id: workflowId,
        per_page: 100,
        page,
        created: `>=${since.toISOString()}`,
      });

      runs.push(...data.workflow_runs);
      hasMore = data.workflow_runs.length === 100;
      page++;
    } catch (error) {
      console.error(`Error fetching workflow runs for ${workflowId}:`, error.message);
      break;
    }
  }

  return runs;
}

async function getWorkflowRunJobs(runId) {
  try {
    const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      run_id: runId,
    });
    return data.jobs;
  } catch (error) {
    console.error(`Error fetching jobs for run ${runId}:`, error.message);
    return [];
  }
}

async function analyzeCI() {
  console.log('🔍 Analyzing CI metrics...\n');

  // Get all workflows
  let workflows;
  try {
    const { data } = await octokit.rest.actions.listWorkflows({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });
    workflows = data.workflows.filter(w => w.name === 'CI' || w.path.includes('ci.yml'));
  } catch (error) {
    console.error('Error fetching workflows:', error.message);
    return;
  }

  if (workflows.length === 0) {
    console.log('⚠️  No CI workflow found');
    return;
  }

  const ciWorkflow = workflows[0];
  console.log(`📊 Analyzing workflow: ${ciWorkflow.name} (${ciWorkflow.id})\n`);

  // Get workflow runs
  const runs = await getWorkflowRuns(ciWorkflow.id, DAYS_BACK);
  console.log(`Found ${runs.length} runs in the last ${DAYS_BACK} days\n`);

  if (runs.length === 0) {
    console.log('⚠️  No runs found');
    return;
  }

  // Analyze runs
  const stats = {
    total: runs.length,
    success: 0,
    failure: 0,
    cancelled: 0,
    in_progress: 0,
    queued: 0,
    totalRuntime: 0,
    totalChecks: 0,
    runsByDay: {},
    jobStats: {},
  };

  for (const run of runs) {
    // Count by status
    if (run.status === 'completed') {
      if (run.conclusion === 'success') stats.success++;
      else if (run.conclusion === 'failure') stats.failure++;
      else if (run.conclusion === 'cancelled') stats.cancelled++;
    } else if (run.status === 'in_progress') {
      stats.in_progress++;
    } else if (run.status === 'queued') {
      stats.queued++;
    }

    // Calculate runtime
    if (run.status === 'completed' && run.updated_at && run.created_at) {
      const runtime = new Date(run.updated_at) - new Date(run.created_at);
      stats.totalRuntime += runtime;
    }

    // Count by day
    const day = new Date(run.created_at).toISOString().split('T')[0];
    stats.runsByDay[day] = (stats.runsByDay[day] || 0) + 1;

    // Get job details
    if (run.status === 'completed') {
      const jobs = await getWorkflowRunJobs(run.id);
      stats.totalChecks += jobs.length;

      for (const job of jobs) {
        const jobName = job.name;
        if (!stats.jobStats[jobName]) {
          stats.jobStats[jobName] = {
            total: 0,
            success: 0,
            failure: 0,
            cancelled: 0,
            totalRuntime: 0,
          };
        }
        stats.jobStats[jobName].total++;
        if (job.conclusion === 'success') stats.jobStats[jobName].success++;
        else if (job.conclusion === 'failure') stats.jobStats[jobName].failure++;
        else if (job.conclusion === 'cancelled') stats.jobStats[jobName].cancelled++;
        
        if (job.completed_at && job.started_at) {
          const jobRuntime = new Date(job.completed_at) - new Date(job.started_at);
          stats.jobStats[jobName].totalRuntime += jobRuntime;
        }
      }
    }
  }

  // Calculate metrics
  const completedRuns = stats.success + stats.failure + stats.cancelled;
  const passRate = completedRuns > 0 ? (stats.success / completedRuns * 100).toFixed(1) : 0;
  const avgRuntime = completedRuns > 0 ? Math.round(stats.totalRuntime / completedRuns / 1000 / 60) : 0;
  const avgChecks = completedRuns > 0 ? (stats.totalChecks / completedRuns).toFixed(1) : 0;

  // Generate report
  const report = {
    period: `${DAYS_BACK} days`,
    workflow: ciWorkflow.name,
    summary: {
      totalRuns: stats.total,
      success: stats.success,
      failure: stats.failure,
      cancelled: stats.cancelled,
      inProgress: stats.in_progress,
      queued: stats.queued,
      passRate: `${passRate}%`,
      avgRuntimeMinutes: avgRuntime,
      avgChecksPerRun: avgChecks,
    },
    jobStats: Object.entries(stats.jobStats).map(([name, jobStat]) => ({
      name,
      total: jobStat.total,
      success: jobStat.success,
      failure: jobStat.failure,
      cancelled: jobStat.cancelled,
      passRate: jobStat.total > 0 ? `${(jobStat.success / jobStat.total * 100).toFixed(1)}%` : '0%',
      avgRuntimeMinutes: jobStat.total > 0 ? Math.round(jobStat.totalRuntime / jobStat.total / 1000 / 60) : 0,
    })),
    runsByDay: stats.runsByDay,
    generatedAt: new Date().toISOString(),
  };

  // Save report
  const reportsDir = path.join(process.cwd(), 'reports', 'ci-metrics');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `ci-metrics-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary
  console.log('📈 CI Metrics Summary\n');
  console.log(`Period: Last ${DAYS_BACK} days`);
  console.log(`Total Runs: ${stats.total}`);
  console.log(`✅ Success: ${stats.success}`);
  console.log(`❌ Failure: ${stats.failure}`);
  console.log(`🚫 Cancelled: ${stats.cancelled}`);
  console.log(`⏳ In Progress: ${stats.in_progress}`);
  console.log(`📋 Queued: ${stats.queued}`);
  console.log(`\n📊 Pass Rate: ${passRate}%`);
  console.log(`⏱️  Avg Runtime: ${avgRuntime} minutes`);
  console.log(`🔢 Avg Checks/Run: ${avgChecks}\n`);

  console.log('📋 Job Statistics:\n');
  for (const job of report.jobStats) {
    console.log(`  ${job.name}:`);
    console.log(`    Pass Rate: ${job.passRate}`);
    console.log(`    Avg Runtime: ${job.avgRuntimeMinutes} minutes`);
    console.log(`    Success: ${job.success}, Failure: ${job.failure}`);
  }

  console.log(`\n💾 Full report saved to: ${reportPath}`);

  // Check thresholds
  const thresholds = {
    passRate: 95,
    avgRuntime: 15,
    maxChecks: 8,
  };

  console.log('\n🎯 Threshold Checks:\n');
  const issues = [];
  if (parseFloat(passRate) < thresholds.passRate) {
    issues.push(`⚠️  Pass rate (${passRate}%) is below target (${thresholds.passRate}%)`);
  } else {
    console.log(`✅ Pass rate (${passRate}%) meets target (${thresholds.passRate}%)`);
  }

  if (avgRuntime > thresholds.avgRuntime) {
    issues.push(`⚠️  Avg runtime (${avgRuntime}min) exceeds target (${thresholds.avgRuntime}min)`);
  } else {
    console.log(`✅ Avg runtime (${avgRuntime}min) meets target (${thresholds.avgRuntime}min)`);
  }

  if (parseFloat(avgChecks) > thresholds.maxChecks) {
    issues.push(`⚠️  Avg checks (${avgChecks}) exceeds target (${thresholds.maxChecks})`);
  } else {
    console.log(`✅ Avg checks (${avgChecks}) meets target (${thresholds.maxChecks})`);
  }

  if (issues.length > 0) {
    console.log('\n⚠️  Issues Found:\n');
    issues.forEach(issue => console.log(`  ${issue}`));
    process.exit(1);
  } else {
    console.log('\n✅ All thresholds met!');
  }
}

analyzeCI().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
