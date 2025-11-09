#!/usr/bin/env node
/**
 * ETL Script: Pull Ads Data from Meta (Facebook/Instagram)
 * 
 * Fetches ad spend, impressions, clicks, conversions from Meta Marketing API
 * and inserts into Supabase spend table.
 * 
 * Usage:
 *   node scripts/etl/pull_ads_meta.ts [--dry-run] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD]
 * 
 * Environment Variables:
 *   META_TOKEN - Meta Marketing API access token
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface MetaAdData {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_value: number;
  date_start: string;
  hour?: number;
}

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
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
 * Fetch ad data from Meta Marketing API
 */
async function fetchMetaAds(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<MetaAdData[]> {
  // Placeholder: Replace with actual Meta Marketing API call
  // Example API endpoint: https://graph.facebook.com/v18.0/{ad_account_id}/insights
  const adAccountId = process.env.META_AD_ACCOUNT_ID || 'act_123456789';
  const url = `https://graph.facebook.com/v18.0/${adAccountId}/insights`;
  
  const params = new URLSearchParams({
    access_token: accessToken,
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
    fields: 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,actions,action_values',
    level: 'ad',
    time_increment: '1', // Daily breakdown
  });
  
  console.log(`Fetching Meta ads data from ${startDate} to ${endDate}...`);
  
  return withRetry(async () => {
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform Meta API response to our format
    return (data.data || []).map((item: any) => ({
      ad_id: item.ad_id,
      ad_name: item.ad_name,
      adset_id: item.adset_id,
      adset_name: item.adset_name,
      campaign_id: item.campaign_id,
      campaign_name: item.campaign_name,
      spend: parseFloat(item.spend || '0') * 100, // Convert to cents
      impressions: parseInt(item.impressions || '0'),
      clicks: parseInt(item.clicks || '0'),
      conversions: parseInt(item.actions?.find((a: any) => a.action_type === 'purchase')?.value || '0'),
      conversion_value: parseFloat(item.action_values?.find((a: any) => a.action_type === 'purchase')?.value || '0') * 100,
      date_start: item.date_start,
    }));
  });
}

/**
 * Insert spend data into Supabase
 */
async function insertSpendData(
  supabase: any,
  adData: MetaAdData[],
  dryRun: boolean
): Promise<{ inserted: number; updated: number; failed: number }> {
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  
  for (const ad of adData) {
    try {
      const spendRecord = {
        channel: 'meta',
        campaign_id: ad.campaign_id,
        campaign_name: ad.campaign_name,
        ad_set_id: ad.adset_id,
        ad_set_name: ad.adset_name,
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        spend_cents: Math.round(ad.spend),
        impressions: ad.impressions,
        clicks: ad.clicks,
        conversions: ad.conversions,
        conversion_value_cents: Math.round(ad.conversion_value),
        date: ad.date_start,
        hour: ad.hour || null,
        source: 'meta_api',
        etl_pulled_at: new Date().toISOString(),
      };
      
      if (dryRun) {
        console.log(`[DRY RUN] Would insert:`, spendRecord);
        inserted++;
      } else {
        const { error } = await supabase
          .from('spend')
          .upsert(spendRecord, {
            onConflict: 'channel,campaign_id,ad_set_id,ad_id,date,hour',
          });
        
        if (error) {
          console.error(`Error inserting spend record:`, error);
          failed++;
        } else {
          inserted++;
        }
      }
    } catch (error) {
      console.error(`Error processing ad ${ad.ad_id}:`, error);
      failed++;
    }
  }
  
  return { inserted, updated, failed };
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
  
  // Parse date arguments
  const startDateIndex = args.indexOf('--start-date');
  const endDateIndex = args.indexOf('--end-date');
  
  const endDate = endDateIndex >= 0 && args[endDateIndex + 1]
    ? args[endDateIndex + 1]
    : new Date().toISOString().split('T')[0]; // Today
  
  const startDate = startDateIndex >= 0 && args[startDateIndex + 1]
    ? args[startDateIndex + 1]
    : cronMode
    ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days ago
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days ago
  
  console.log('='.repeat(60));
  console.log('Meta Ads ETL Job');
  console.log('='.repeat(60));
  console.log(`Start Date: ${startDate}`);
  console.log(`End Date: ${endDate}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Cron Mode: ${cronMode}`);
  console.log('='.repeat(60));
  
  const startedAt = new Date();
  let logId: string | null = null;
  
  try {
    // Validate environment variables
    const metaToken = process.env.META_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!metaToken) {
      throw new Error('META_TOKEN environment variable is required');
    }
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
      'pull_ads_meta',
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
    
    // Fetch ad data from Meta
    const adData = await fetchMetaAds(metaToken, startDate, endDate);
    console.log(`Fetched ${adData.length} ad records from Meta`);
    
    // Insert into Supabase
    const { inserted, updated, failed } = await insertSpendData(
      supabase,
      adData,
      dryRun
    );
    
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    console.log('='.repeat(60));
    console.log('ETL Job Completed');
    console.log(`Duration: ${duration}ms`);
    console.log(`Records Processed: ${adData.length}`);
    console.log(`Records Inserted: ${inserted}`);
    console.log(`Records Updated: ${updated}`);
    console.log(`Records Failed: ${failed}`);
    console.log('='.repeat(60));
    
    // Log job completion
    await logEtlJob(
      supabase,
      'pull_ads_meta',
      'completed',
      startedAt,
      completedAt,
      adData.length,
      inserted,
      updated,
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
        'pull_ads_meta',
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

export { fetchMetaAds, insertSpendData, withRetry };
