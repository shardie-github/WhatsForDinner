#!/usr/bin/env tsx
/**
 * Collect Metrics Script
 * Gathers user validation evidence and metrics for dashboards
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Metrics {
  users: {
    total: number;
    active: number;
    dau: number;
    wau: number;
    mau: number;
  };
  growth: {
    growthRate: number;
    newSignups: number;
  };
  activation: {
    activationRate: number;
    timeToFirstRecipe: number;
  };
  retention: {
    retention7d: number;
    retention30d: number;
  };
  revenue: {
    mrr: number;
    arpu: number;
    conversionRate: number;
  };
  engagement: {
    recipesGenerated: number;
    recipesPerUser: number;
    averageRating: number;
  };
}

async function collectMetrics(): Promise<Metrics> {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Users
  const { data: allUsers } = await supabase.from('profiles').select('id').limit(10000);
  const totalUsers = allUsers?.length || 0;

  const { data: dauData } = await supabase
    .from('analytics_events')
    .select('user_id')
    .gte('timestamp', todayStart.toISOString())
    .not('user_id', 'is', null);
  const dau = new Set(dauData?.map((d) => d.user_id) || []).size;

  const { data: wauData } = await supabase
    .from('analytics_events')
    .select('user_id')
    .gte('timestamp', weekAgo.toISOString())
    .not('user_id', 'is', null);
  const wau = new Set(wauData?.map((d) => d.user_id) || []).size;

  const { data: mauData } = await supabase
    .from('analytics_events')
    .select('user_id')
    .gte('timestamp', monthAgo.toISOString())
    .not('user_id', 'is', null);
  const mau = new Set(mauData?.map((d) => d.user_id) || []).size;

  // Growth
  const { data: currentWeek } = await supabase
    .from('analytics_events')
    .select('user_id')
    .eq('event_type', 'user_signed_up')
    .gte('timestamp', weekAgo.toISOString());
  const currentWeekCount = new Set(currentWeek?.map((u) => u.user_id) || []).size;

  const { data: previousWeek } = await supabase
    .from('analytics_events')
    .select('user_id')
    .eq('event_type', 'user_signed_up')
    .gte('timestamp', twoWeeksAgo.toISOString())
    .lt('timestamp', weekAgo.toISOString());
  const previousWeekCount = new Set(previousWeek?.map((u) => u.user_id) || []).size;
  const growthRate = previousWeekCount > 0 ? ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100 : 0;

  // Activation
  const { data: signups } = await supabase
    .from('analytics_events')
    .select('user_id')
    .eq('event_type', 'user_signed_up')
    .gte('timestamp', weekAgo.toISOString());
  const signupCount = new Set(signups?.map((s) => s.user_id) || []).size;

  const { data: activated } = await supabase
    .from('recipe_metrics')
    .select('user_id, generated_at')
    .in('user_id', signups?.map((s) => s.user_id) || [])
    .gte('generated_at', weekAgo.toISOString());
  const activatedCount = new Set(activated?.map((a) => a.user_id) || []).size;
  const activationRate = signupCount > 0 ? (activatedCount / signupCount) * 100 : 0;

  // Calculate average time to first recipe
  const firstRecipes = activated?.filter((a, index, self) => 
    index === self.findIndex((r) => r.user_id === a.user_id)
  ) || [];
  const timeToFirstRecipe = firstRecipes.length > 0
    ? firstRecipes.reduce((sum, r) => {
        const signupTime = signups?.find((s) => s.user_id === r.user_id)?.timestamp;
        if (signupTime) {
          const diff = new Date(r.generated_at).getTime() - new Date(signupTime).getTime();
          return sum + diff / 1000 / 60; // minutes
        }
        return sum;
      }, 0) / firstRecipes.length
    : 0;

  // Retention
  const { data: returned7d } = await supabase
    .from('analytics_events')
    .select('user_id')
    .in('user_id', signups?.map((s) => s.user_id) || [])
    .gte('timestamp', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .neq('event_type', 'user_signed_up');
  const retention7d = signupCount > 0 ? (new Set(returned7d?.map((r) => r.user_id) || []).size / signupCount) * 100 : 0;

  const { data: signups30d } = await supabase
    .from('analytics_events')
    .select('user_id')
    .eq('event_type', 'user_signed_up')
    .gte('timestamp', monthAgo.toISOString());
  const signupCount30d = new Set(signups30d?.map((s) => s.user_id) || []).size;

  const { data: returned30d } = await supabase
    .from('analytics_events')
    .select('user_id')
    .in('user_id', signups30d?.map((s) => s.user_id) || [])
    .gte('timestamp', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .neq('event_type', 'user_signed_up');
  const retention30d = signupCount30d > 0 ? (new Set(returned30d?.map((r) => r.user_id) || []).size / signupCount30d) * 100 : 0;

  // Revenue
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('status', 'active');
  
  const mrr = subscriptions?.reduce((sum, s) => {
    return sum + (s.plan === 'pro' ? 9.99 : s.plan === 'premium' ? 19.99 : 0);
  }, 0) || 0;

  const payingUsers = new Set(subscriptions?.map((s) => s.user_id) || []).size;
  const arpu = payingUsers > 0 ? mrr / payingUsers : 0;

  const { data: freeUsers } = await supabase
    .from('profiles')
    .select('id')
    .not('id', 'in', `(${subscriptions?.map((s) => `'${s.user_id}'`).join(',') || ''})`)
    .limit(10000);
  const freeUserCount = freeUsers?.length || 0;
  const totalUserCount = payingUsers + freeUserCount;
  const conversionRate = totalUserCount > 0 ? (payingUsers / totalUserCount) * 100 : 0;

  // Engagement
  const { data: recipes } = await supabase
    .from('recipe_metrics')
    .select('user_id, feedback_score')
    .gte('generated_at', weekAgo.toISOString());
  const recipesGenerated = recipes?.length || 0;
  const recipesPerUser = wau > 0 ? recipesGenerated / wau : 0;

  const ratings = recipes?.filter((r) => r.feedback_score !== null).map((r) => r.feedback_score) || [];
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r || 0), 0) / ratings.length
    : 0;

  return {
    users: {
      total: totalUsers,
      active: wau,
      dau,
      wau,
      mau,
    },
    growth: {
      growthRate: Math.round(growthRate * 10) / 10,
      newSignups: currentWeekCount,
    },
    activation: {
      activationRate: Math.round(activationRate * 10) / 10,
      timeToFirstRecipe: Math.round(timeToFirstRecipe * 10) / 10,
    },
    retention: {
      retention7d: Math.round(retention7d * 10) / 10,
      retention30d: Math.round(retention30d * 10) / 10,
    },
    revenue: {
      mrr: Math.round(mrr * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      conversionRate: Math.round(conversionRate * 10) / 10,
    },
    engagement: {
      recipesGenerated,
      recipesPerUser: Math.round(recipesPerUser * 10) / 10,
      averageRating: Math.round(averageRating * 100) / 100,
    },
  };
}

async function main() {
  console.log('📊 Collecting Metrics...\n');

  try {
    const metrics = await collectMetrics();

    // Save to file
    const outputPath = join(process.cwd(), 'yc', 'CURRENT_METRICS.json');
    writeFileSync(outputPath, JSON.stringify(metrics, null, 2));

    console.log('✅ Metrics collected and saved to:', outputPath);
    console.log('\n📈 Current Metrics:');
    console.log(`Users: ${metrics.users.total} total, ${metrics.users.dau} DAU, ${metrics.users.wau} WAU, ${metrics.users.mau} MAU`);
    console.log(`Growth: ${metrics.growth.growthRate > 0 ? '+' : ''}${metrics.growth.growthRate}% WoW (${metrics.growth.newSignups} new signups)`);
    console.log(`Activation: ${metrics.activation.activationRate}% (${metrics.activation.timeToFirstRecipe} min avg)`);
    console.log(`Retention: ${metrics.retention.retention7d}% (7d), ${metrics.retention.retention30d}% (30d)`);
    console.log(`Revenue: $${metrics.revenue.mrr} MRR, $${metrics.revenue.arpu} ARPU, ${metrics.revenue.conversionRate}% conversion`);
    console.log(`Engagement: ${metrics.engagement.recipesGenerated} recipes, ${metrics.engagement.recipesPerUser} per user, ${metrics.engagement.averageRating}★ avg`);

    // Update validation milestones
    await updateValidationMilestones(metrics);
  } catch (error: any) {
    console.error('Failed to collect metrics:', error);
    process.exit(1);
  }
}

async function updateValidationMilestones(metrics: Metrics) {
  const milestonesPath = join(process.cwd(), 'yc', 'VALIDATION_MILESTONES.md');
  const fs = await import('fs');
  let content = fs.readFileSync(milestonesPath, 'utf-8');

  // Update activation rate
  content = content.replace(
    /### ⚠️ Testing: AI Personalization Creates Value[\s\S]*?**Status**: Testing[\s\S]*?**Target**: 4\+ star average rating, 60%\+ recipe success rate/,
    `### ⚠️ Testing: AI Personalization Creates Value
**Status**: Testing  
**Evidence**: Average recipe rating: ${metrics.engagement.averageRating.toFixed(1)}/5 stars, ${metrics.engagement.recipesGenerated} recipes generated  
**Target**: 4+ star average rating, 60%+ recipe success rate`
  );

  // Update activation rate
  content = content.replace(
    /### ⚠️ Testing: Problem Urgency[\s\S]*?**Status**: Testing[\s\S]*?**Target**: Validate 15\+ minutes wasted/,
    `### ⚠️ Testing: Problem Urgency
**Status**: Testing  
**Evidence**: Average time to first recipe: ${metrics.activation.timeToFirstRecipe.toFixed(1)} minutes  
**Target**: Validate 15+ minutes wasted`
  );

  fs.writeFileSync(milestonesPath, content);
  console.log('\n✅ Updated VALIDATION_MILESTONES.md with current metrics');
}

main().catch(console.error);
