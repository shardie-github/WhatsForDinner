#!/usr/bin/env tsx
/**
 * Weekly Activation Review Script
 * Analyzes activation funnel and generates recommendations
 * Run weekly: pnpm weekly:activation:review
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('weekly-activation-review-ts');
interface ActivationMetrics {
  signups: number;
  activations: number;
  activationRate: number;
  avgTimeToActivation: number;
  dropoffPoints: Array<{ stage: string; count: number; percentage: number }>;
  abTestResults: Array<{ test: string; variant: string; activationRate: number }>;
}

async function runWeeklyActivationReview() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  logger.info('📊 Running Weekly Activation Review...\n');

  // Get date range (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Analyze activation funnel
  const { data: signups } = await supabase
    .from('profiles')
    .select('id, created_at')
    .gte('created_at', sevenDaysAgo.toISOString());

  const { data: activations } = await supabase
    .from('analytics_events')
    .select('user_id, timestamp, properties')
    .eq('event_type', 'meal_plan_created')
    .gte('timestamp', sevenDaysAgo.toISOString());

  // Get activation times
  const activationTimes: number[] = [];
  const activatedUserIds = new Set(activations?.map(a => a.user_id) || []);

  for (const signup of signups || []) {
    const userActivations = activations?.filter(a => a.user_id === signup.id) || [];
    if (userActivations.length > 0) {
      const firstActivation = userActivations[0];
      const signupTime = new Date(signup.created_at).getTime();
      const activationTime = new Date(firstActivation.timestamp).getTime();
      activationTimes.push(activationTime - signupTime);
    }
  }

  const avgTimeToActivation = activationTimes.length > 0
    ? activationTimes.reduce((a, b) => a + b, 0) / activationTimes.length / 1000 / 60 // Convert to minutes
    : 0;

  // Analyze dropoff points
  const { data: funnelEvents } = await supabase
    .from('funnel_events')
    .select('funnel_stage, user_id')
    .gte('created_at', sevenDaysAgo.toISOString());

  const stageCounts: Record<string, number> = {};
  const uniqueUsersByStage: Record<string, Set<string>> = {};

  funnelEvents?.forEach(event => {
    if (!stageCounts[event.funnel_stage]) {
      stageCounts[event.funnel_stage] = 0;
      uniqueUsersByStage[event.funnel_stage] = new Set();
    }
    stageCounts[event.funnel_stage]++;
    uniqueUsersByStage[event.funnel_stage].add(event.user_id);
  });

  const dropoffPoints = Object.entries(stageCounts).map(([stage, count]) => ({
    stage,
    count,
    percentage: signups ? (count / signups.length) * 100 : 0,
  })).sort((a, b) => b.percentage - a.percentage);

  // Get A/B test results
  const { data: abTests } = await supabase
    .from('ab_test_assignments')
    .select(`
      experiment_id,
      variant_id,
      ab_test_experiments(name),
      ab_test_variants(name)
    `)
    .gte('created_at', sevenDaysAgo.toISOString());

  const abTestResults: Array<{ test: string; variant: string; activationRate: number }> = [];
  const testGroups: Record<string, Record<string, string[]>> = {};

  abTests?.forEach(assignment => {
    const expName = (assignment.ab_test_experiments as any)?.name || 'unknown';
    const variantName = (assignment.ab_test_variants as any)?.name || 'unknown';
    if (!testGroups[expName]) {
      testGroups[expName] = {};
    }
    if (!testGroups[expName][variantName]) {
      testGroups[expName][variantName] = [];
    }
    // Note: We'd need to join with user activations to get actual rates
    // For now, we'll track assignment counts
  });

  const metrics: ActivationMetrics = {
    signups: signups?.length || 0,
    activations: activatedUserIds.size,
    activationRate: signups && signups.length > 0
      ? (activatedUserIds.size / signups.length) * 100
      : 0,
    avgTimeToActivation,
    dropoffPoints,
    abTestResults,
  };

  // Compare with previous period (30 days ago)
  const { data: prevSignups } = await supabase
    .from('profiles')
    .select('id, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .lt('created_at', sevenDaysAgo.toISOString());

  const { data: prevActivations } = await supabase
    .from('analytics_events')
    .select('user_id')
    .eq('event_type', 'meal_plan_created')
    .gte('timestamp', thirtyDaysAgo.toISOString())
    .lt('timestamp', sevenDaysAgo.toISOString());

  const prevActivatedUserIds = new Set(prevActivations?.map(a => a.user_id) || []);
  const prevActivationRate = prevSignups && prevSignups.length > 0
    ? (prevActivatedUserIds.size / prevSignups.length) * 100
    : 0;

  const activationRateChange = metrics.activationRate - prevActivationRate;

  // Generate recommendations
  const recommendations: string[] = [];

  if (metrics.activationRate < 50) {
    recommendations.push('⚠️ Activation rate is below 50%. Focus on onboarding improvements.');
  }

  if (metrics.avgTimeToActivation > 40) {
    recommendations.push(`⏱️ Average time to activation is ${metrics.avgTimeToActivation.toFixed(1)} minutes. Target: <2 minutes.`);
  }

  const biggestDropoff = dropoffPoints[0];
  if (biggestDropoff && biggestDropoff.percentage < 80) {
    recommendations.push(`📉 Biggest dropoff at "${biggestDropoff.stage}" stage (${biggestDropoff.percentage.toFixed(1)}% completion). Investigate and optimize.`);
  }

  if (activationRateChange < 0) {
    recommendations.push(`📉 Activation rate decreased by ${Math.abs(activationRateChange).toFixed(1)}% compared to previous period. Review recent changes.`);
  } else if (activationRateChange > 0) {
    recommendations.push(`✅ Activation rate improved by ${activationRateChange.toFixed(1)}% compared to previous period.`);
  }

  // Generate report
  const report = {
    period: {
      start: sevenDaysAgo.toISOString(),
      end: new Date().toISOString(),
    },
    metrics,
    comparison: {
      previousPeriodRate: prevActivationRate,
      change: activationRateChange,
      trend: activationRateChange > 0 ? 'improving' : activationRateChange < 0 ? 'declining' : 'stable',
    },
    recommendations,
    nextSteps: [
      'Review dropoff points and optimize conversion',
      'A/B test onboarding improvements',
      'Monitor activation rate weekly',
      'Set up alerts for activation rate drops',
    ],
  };

  // Save report
  const reportsDir = path.join(process.cwd(), 'reports', 'activation');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, `activation-review-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary
  logger.info('📈 Activation Metrics:');
  logger.info('   Signups: ${metrics.signups}');
  logger.info('   Activations: ${metrics.activations}');
  logger.info('   Activation Rate: ${metrics.activationRate.toFixed(2')}%`);
  logger.info('   Avg Time to Activation: ${metrics.avgTimeToActivation.toFixed(1')} minutes`);
  logger.info('   Trend: ${report.comparison.trend} (${activationRateChange > 0 ? '+' : ''}${activationRateChange.toFixed(2')}%)`);
  logger.info('\n📉 Top Dropoff Points:');
  dropoffPoints.slice(0, 5).forEach(point => {
    logger.info('   ${point.stage}: ${point.percentage.toFixed(1')}% (${point.count} users)`);
  });
  logger.info('\n💡 Recommendations:');
  recommendations.forEach(rec => logger.info('   ${rec}'));
  logger.info('\n📄 Full report saved to: ${reportPath}');

  return report;
}

if (require.main === module) {
  runWeeklyActivationReview()
    .then(() => {
      logger.info('\n✅ Weekly activation review completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Failed to run activation review:', { error });
      process.exit(1);
    });
}

export { runWeeklyActivationReview };
