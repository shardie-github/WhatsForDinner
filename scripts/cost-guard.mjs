#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Cost thresholds
const COST_THRESHOLDS = {
  daily: {
    supabase: 10, // $10/day
    vercel: 5,    // $5/day
    total: 15,    // $15/day
  },
  monthly: {
    supabase: 300, // $300/month
    vercel: 150,   // $150/month
    total: 450,    // $450/month
  }
};

async function getSupabaseUsage() {
  try {
    // Get usage from usage_logs table
    const { data: usageData, error } = await supabase
      .from('usage_logs')
      .select('cost_usd, timestamp')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.warn('⚠️  Could not fetch Supabase usage data:', error.message);
      return { daily: 0, monthly: 0, details: [] };
    }
    
    const daily = usageData?.reduce((sum, log) => sum + (log.cost_usd || 0), 0) || 0;
    
    // Get monthly usage
    const { data: monthlyData } = await supabase
      .from('usage_logs')
      .select('cost_usd, timestamp')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const monthly = monthlyData?.reduce((sum, log) => sum + (log.cost_usd || 0), 0) || 0;
    
    return {
      daily: Math.round(daily * 100) / 100,
      monthly: Math.round(monthly * 100) / 100,
      details: usageData || []
    };
  } catch (error) {
    console.warn('⚠️  Error fetching Supabase usage:', error.message);
    return { daily: 0, monthly: 0, details: [] };
  }
}

async function getVercelUsage() {
  // This would typically use Vercel's API, but for now we'll estimate
  // based on function invocations and bandwidth
  try {
    const { data: functionLogs } = await supabase
      .from('logs')
      .select('*')
      .eq('source', 'api')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    const invocations = functionLogs?.length || 0;
    const estimatedCost = (invocations * 0.0001) + (invocations * 0.00005); // Rough estimate
    
    return {
      daily: Math.round(estimatedCost * 100) / 100,
      monthly: Math.round(estimatedCost * 30 * 100) / 100,
      invocations,
      details: { invocations }
    };
  } catch (error) {
    console.warn('⚠️  Error estimating Vercel usage:', error.message);
    return { daily: 0, monthly: 0, invocations: 0, details: {} };
  }
}

function checkCostThresholds(supabaseUsage, vercelUsage) {
  const violations = [];
  
  const totalDaily = supabaseUsage.daily + vercelUsage.daily;
  const totalMonthly = supabaseUsage.monthly + vercelUsage.monthly;
  
  // Check daily thresholds
  if (supabaseUsage.daily > COST_THRESHOLDS.daily.supabase) {
    violations.push({
      type: 'supabase_daily',
      value: supabaseUsage.daily,
      threshold: COST_THRESHOLDS.daily.supabase,
      severity: 'warning'
    });
  }
  
  if (vercelUsage.daily > COST_THRESHOLDS.daily.vercel) {
    violations.push({
      type: 'vercel_daily',
      value: vercelUsage.daily,
      threshold: COST_THRESHOLDS.daily.vercel,
      severity: 'warning'
    });
  }
  
  if (totalDaily > COST_THRESHOLDS.daily.total) {
    violations.push({
      type: 'total_daily',
      value: totalDaily,
      threshold: COST_THRESHOLDS.daily.total,
      severity: 'critical'
    });
  }
  
  // Check monthly thresholds
  if (supabaseUsage.monthly > COST_THRESHOLDS.monthly.supabase) {
    violations.push({
      type: 'supabase_monthly',
      value: supabaseUsage.monthly,
      threshold: COST_THRESHOLDS.monthly.supabase,
      severity: 'critical'
    });
  }
  
  if (vercelUsage.monthly > COST_THRESHOLDS.monthly.vercel) {
    violations.push({
      type: 'vercel_monthly',
      value: vercelUsage.monthly,
      threshold: COST_THRESHOLDS.monthly.vercel,
      severity: 'critical'
    });
  }
  
  if (totalMonthly > COST_THRESHOLDS.monthly.total) {
    violations.push({
      type: 'total_monthly',
      value: totalMonthly,
      threshold: COST_THRESHOLDS.monthly.total,
      severity: 'critical'
    });
  }
  
  return violations;
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function printCostReport(supabaseUsage, vercelUsage, violations) {
  console.log('\n💰 Cost Guard Report');
  console.log('===================\n');
  
  const totalDaily = supabaseUsage.daily + vercelUsage.daily;
  const totalMonthly = supabaseUsage.monthly + vercelUsage.monthly;
  
  console.log('📊 Current Usage:');
  console.log(`   Supabase Daily: ${formatCurrency(supabaseUsage.daily)}`);
  console.log(`   Supabase Monthly: ${formatCurrency(supabaseUsage.monthly)}`);
  console.log(`   Vercel Daily: ${formatCurrency(vercelUsage.daily)} (${vercelUsage.invocations} invocations)`);
  console.log(`   Vercel Monthly: ${formatCurrency(vercelUsage.monthly)}`);
  console.log(`   Total Daily: ${formatCurrency(totalDaily)}`);
  console.log(`   Total Monthly: ${formatCurrency(totalMonthly)}`);
  
  console.log('\n🎯 Thresholds:');
  console.log(`   Daily - Supabase: ${formatCurrency(COST_THRESHOLDS.daily.supabase)}`);
  console.log(`   Daily - Vercel: ${formatCurrency(COST_THRESHOLDS.daily.vercel)}`);
  console.log(`   Daily - Total: ${formatCurrency(COST_THRESHOLDS.daily.total)}`);
  console.log(`   Monthly - Supabase: ${formatCurrency(COST_THRESHOLDS.monthly.supabase)}`);
  console.log(`   Monthly - Vercel: ${formatCurrency(COST_THRESHOLDS.monthly.vercel)}`);
  console.log(`   Monthly - Total: ${formatCurrency(COST_THRESHOLDS.monthly.total)}`);
  
  if (violations.length > 0) {
    console.log('\n🚨 Cost Violations:');
    violations.forEach(violation => {
      const icon = violation.severity === 'critical' ? '🚨' : '⚠️';
      const type = violation.type.replace(/_/g, ' ').toUpperCase();
      console.log(`   ${icon} ${type}: ${formatCurrency(violation.value)} > ${formatCurrency(violation.threshold)}`);
    });
  } else {
    console.log('\n✅ All costs within thresholds!');
  }
  
  console.log(`\n🕐 Report generated at: ${new Date().toISOString()}`);
}

function generateArtifact(supabaseUsage, vercelUsage, violations) {
  const artifact = {
    timestamp: new Date().toISOString(),
    costs: {
      supabase: supabaseUsage,
      vercel: vercelUsage,
      total: {
        daily: supabaseUsage.daily + vercelUsage.daily,
        monthly: supabaseUsage.monthly + vercelUsage.monthly
      }
    },
    thresholds: COST_THRESHOLDS,
    violations: violations.map(v => ({
      type: v.type,
      value: v.value,
      threshold: v.threshold,
      severity: v.severity
    })),
    status: violations.some(v => v.severity === 'critical') ? 'critical' : 
            violations.length > 0 ? 'warning' : 'healthy'
  };
  
  return JSON.stringify(artifact, null, 2);
}

async function main() {
  const args = process.argv.slice(2);
  const generateArtifact = args.includes('--artifact');
  const checkOnly = args.includes('--check');
  
  console.log('🔍 Running cost guard check...');
  
  try {
    const supabaseUsage = await getSupabaseUsage();
    const vercelUsage = await getVercelUsage();
    const violations = checkCostThresholds(supabaseUsage, vercelUsage);
    
    printCostReport(supabaseUsage, vercelUsage, violations);
    
    if (generateArtifact) {
      const artifact = generateArtifact(supabaseUsage, vercelUsage, violations);
      const artifactPath = join(projectRoot, 'REPORTS', 'cost-guard.json');
      
      // Ensure REPORTS directory exists
      const fs = await import('fs');
      const reportsDir = join(projectRoot, 'REPORTS');
      if (!existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(artifactPath, artifact);
      console.log(`\n📄 Artifact saved to: ${artifactPath}`);
    }
    
    if (checkOnly) {
      const hasCritical = violations.some(v => v.severity === 'critical');
      if (hasCritical) {
        console.log('\n❌ Cost guard check failed! Critical violations found.');
        process.exit(1);
      } else if (violations.length > 0) {
        console.log('\n⚠️  Cost guard check completed with warnings.');
        process.exit(1);
      } else {
        console.log('\n✅ Cost guard check passed!');
      }
    }
  } catch (error) {
    console.error('❌ Error running cost guard check:', error);
    process.exit(1);
  }
}

main();