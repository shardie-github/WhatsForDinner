#!/usr/bin/env node
/**
 * ETL Script: Compute Daily Metrics
 * 
 * Aggregates data from orders, spend, and events tables to compute daily metrics
 * for finance model and dashboards.
 * 
 * Usage:
 *   node scripts/etl/compute_metrics.ts [--dry-run] [--date YYYY-MM-DD]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DailyMetrics {
  metric_date: string;
  revenue: number;
  orders: number;
  refund_rate: number;
  cogs_pct: number;
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  gross_margin_pct: number;
  ebitda_margin_pct: number;
  cash_flow: number;
  cumulative_cash: number;
}

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

/**
 * Exponential backoff retry wrapper
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < options.maxRetries) {
        const delay = Math.min(
          options.baseDelay * Math.pow(2, attempt),
          options.maxDelay
        );
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Compute daily metrics from orders, spend, and events
 */
async function computeDailyMetrics(
  supabase: any,
  targetDate: string
): Promise<DailyMetrics> {
  console.log(`Computing metrics for ${targetDate}...`);
  
  // Get revenue and orders from orders table
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('total_cents, refund_amount_cents, status')
    .eq('ordered_at::date', targetDate);
  
  if (ordersError) {
    throw new Error(`Error fetching orders: ${ordersError.message}`);
  }
  
  const revenue = (ordersData || [])
    .filter((o: any) => o.status === 'paid')
    .reduce((sum: number, o: any) => sum + (o.total_cents || 0), 0);
  
  const refundAmount = (ordersData || [])
    .reduce((sum: number, o: any) => sum + (o.refund_amount_cents || 0), 0);
  
  const orders = (ordersData || []).filter((o: any) => o.status === 'paid').length;
  const refundRate = revenue > 0 ? (refundAmount / revenue) * 100 : 0;
  
  // Get spend (CAC calculation)
  const { data: spendData, error: spendError } = await supabase
    .from('spend')
    .select('spend_cents, conversions')
    .eq('date', targetDate);
  
  if (spendError) {
    throw new Error(`Error fetching spend: ${spendError.message}`);
  }
  
  const totalSpend = (spendData || [])
    .reduce((sum: number, s: any) => sum + (s.spend_cents || 0), 0);
  
  const totalConversions = (spendData || [])
    .reduce((sum: number, s: any) => sum + (s.conversions || 0), 0);
  
  const cac = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;
  
  // Get LTV (simplified: average order value * average customer lifetime)
  // In production, this should use cohort analysis
  const avgOrderValue = orders > 0 ? revenue / orders : 0;
  const avgCustomerLifetimeMonths = 12; // Placeholder - should come from cohort analysis
  const ltv = Math.round(avgOrderValue * avgCustomerLifetimeMonths);
  
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  
  // COGS calculation (35% of revenue as per assumptions)
  const cogsPct = 35; // Placeholder - should be calculated from actual COGS data
  const cogs = Math.round(revenue * (cogsPct / 100));
  const grossMargin = revenue - cogs;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  
  // Operating expenses (simplified - should come from actual expense tracking)
  const operatingExpenses = Math.round(revenue * 0.4); // Placeholder
  const ebitda = grossMargin - operatingExpenses;
  const ebitdaMarginPct = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  
  // Cash flow
  const cashFlow = revenue - cogs - operatingExpenses;
  
  // Cumulative cash (simplified - should track from starting cash)
  const { data: prevCashData } = await supabase
    .from('metrics_daily')
    .select('metric_value')
    .eq('metric_name', 'cumulative_cash')
    .lt('metric_date', targetDate)
    .order('metric_date', { ascending: false })
    .limit(1);
  
  const prevCumulativeCash = prevCashData?.[0]?.metric_value || 500000; // Starting cash
  const cumulativeCash = prevCumulativeCash + cashFlow;
  
  return {
    metric_date: targetDate,
    revenue,
    orders,
    refund_rate: refundRate,
    cogs_pct: cogsPct,
    cac,
    ltv,
    ltv_cac_ratio: ltvCacRatio,
    gross_margin_pct: grossMarginPct,
    ebitda_margin_pct: ebitdaMarginPct,
    cash_flow: cashFlow,
    cumulative_cash: cumulativeCash,
  };
}

/**
 * Insert metrics into Supabase
 */
async function insertMetrics(
  supabase: any,
  metrics: DailyMetrics,
  dryRun: boolean
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;
  
  const metricRecords = [
    { metric_name: 'revenue', metric_value: metrics.revenue, metric_unit: 'cents' },
    { metric_name: 'orders', metric_value: metrics.orders, metric_unit: 'count' },
    { metric_name: 'refund_rate', metric_value: metrics.refund_rate, metric_unit: 'percentage' },
    { metric_name: 'cogs_pct', metric_value: metrics.cogs_pct, metric_unit: 'percentage' },
    { metric_name: 'cac', metric_value: metrics.cac, metric_unit: 'cents' },
    { metric_name: 'ltv', metric_value: metrics.ltv, metric_unit: 'cents' },
    { metric_name: 'ltv_cac_ratio', metric_value: metrics.ltv_cac_ratio, metric_unit: 'ratio' },
    { metric_name: 'gross_margin_pct', metric_value: metrics.gross_margin_pct, metric_unit: 'percentage' },
    { metric_name: 'ebitda_margin_pct', metric_value: metrics.ebitda_margin_pct, metric_unit: 'percentage' },
    { metric_name: 'cash_flow', metric_value: metrics.cash_flow, metric_unit: 'cents' },
    { metric_name: 'cumulative_cash', metric_value: metrics.cumulative_cash, metric_unit: 'cents' },
  ];
  
  for (const record of metricRecords) {
    try {
      const metricRecord = {
        metric_date: metrics.metric_date,
        metric_name: record.metric_name,
        metric_value: record.metric_value,
        metric_unit: record.metric_unit,
        breakdown: {},
      };
      
      if (dryRun) {
        console.log(`[DRY RUN] Would insert:`, metricRecord);
        inserted++;
      } else {
        const { error } = await supabase
          .from('metrics_daily')
          .upsert(metricRecord, {
            onConflict: 'metric_date,metric_name,breakdown',
          });
        
        if (error) {
          console.error(`Error inserting metric ${record.metric_name}:`, error);
          failed++;
        } else {
          inserted++;
        }
      }
    } catch (error) {
      console.error(`Error processing metric ${record.metric_name}:`, error);
      failed++;
    }
  }
  
  return { inserted, failed };
}

/**
 * Log ETL job execution
 */
async function logEtlJob(
  supabase: any,
  jobName: string,
  status: 'started' | 'completed' | 'failed',
  startedAt: Date,
  completedAt: Date | null,
  recordsProcessed: number,
  recordsInserted: number,
  recordsUpdated: number,
  recordsFailed: number,
  errorMessage: string | null,
  dryRun: boolean
) {
  if (dryRun) {
    console.log(`[DRY RUN] Would log ETL job:`, {
      jobName,
      status,
      recordsProcessed,
      recordsInserted,
      recordsUpdated,
      recordsFailed,
    });
    return;
  }
  
  const { error } = await supabase.from('etl_logs').insert({
    job_name: jobName,
    status,
    started_at: startedAt.toISOString(),
    completed_at: completedAt?.toISOString() || null,
    records_processed: recordsProcessed,
    records_inserted: recordsInserted,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    error_message: errorMessage,
    dry_run: dryRun,
  });
  
  if (error) {
    console.error(`Error logging ETL job:`, error);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cronMode = args.includes('--cron');
  
  // Parse date argument
  const dateIndex = args.indexOf('--date');
  const targetDate = dateIndex >= 0 && args[dateIndex + 1]
    ? args[dateIndex + 1]
    : cronMode
    ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Yesterday
    : new Date().toISOString().split('T')[0]; // Today
  
  console.log('='.repeat(60));
  console.log('Compute Metrics ETL Job');
  console.log('='.repeat(60));
  console.log(`Target Date: ${targetDate}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Cron Mode: ${cronMode}`);
  console.log('='.repeat(60));
  
  const startedAt = new Date();
  
  try {
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log job start
    await logEtlJob(
      supabase,
      'compute_metrics',
      'started',
      startedAt,
      null,
      0,
      0,
      0,
      0,
      null,
      dryRun
    );
    
    // Compute metrics
    const metrics = await computeDailyMetrics(supabase, targetDate);
    
    console.log('Computed Metrics:');
    console.log(`  Revenue: $${(metrics.revenue / 100).toFixed(2)}`);
    console.log(`  Orders: ${metrics.orders}`);
    console.log(`  Refund Rate: ${metrics.refund_rate.toFixed(2)}%`);
    console.log(`  CAC: $${(metrics.cac / 100).toFixed(2)}`);
    console.log(`  LTV: $${(metrics.ltv / 100).toFixed(2)}`);
    console.log(`  LTV:CAC Ratio: ${metrics.ltv_cac_ratio.toFixed(2)}`);
    console.log(`  Gross Margin: ${metrics.gross_margin_pct.toFixed(2)}%`);
    console.log(`  EBITDA Margin: ${metrics.ebitda_margin_pct.toFixed(2)}%`);
    console.log(`  Cash Flow: $${(metrics.cash_flow / 100).toFixed(2)}`);
    console.log(`  Cumulative Cash: $${(metrics.cumulative_cash / 100).toFixed(2)}`);
    
    // Insert metrics
    const { inserted, failed } = await insertMetrics(
      supabase,
      metrics,
      dryRun
    );
    
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    console.log('='.repeat(60));
    console.log('ETL Job Completed');
    console.log(`Duration: ${duration}ms`);
    console.log(`Metrics Computed: ${Object.keys(metrics).length}`);
    console.log(`Records Inserted: ${inserted}`);
    console.log(`Records Failed: ${failed}`);
    console.log('='.repeat(60));
    
    // Log job completion
    await logEtlJob(
      supabase,
      'compute_metrics',
      'completed',
      startedAt,
      completedAt,
      Object.keys(metrics).length,
      inserted,
      0,
      failed,
      null,
      dryRun
    );
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('='.repeat(60));
    console.error('ETL Job Failed');
    console.error(`Error: ${errorMessage}`);
    if (errorStack) {
      console.error(`Stack: ${errorStack}`);
    }
    console.error('='.repeat(60));
    
    // Log job failure
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await logEtlJob(
        supabase,
        'compute_metrics',
        'failed',
        startedAt,
        completedAt,
        0,
        0,
        0,
        0,
        errorMessage,
        dryRun
      );
    }
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { computeDailyMetrics, insertMetrics, withRetry };
