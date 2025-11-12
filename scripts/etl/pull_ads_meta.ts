#!/usr/bin/env tsx
/**
 * ETL Script: Pull Meta Ads Data
 * 
 * Fetches ad spend, clicks, impressions, conversions from Meta Marketing API
 * and stores in Supabase spend table.
 * 
 * Usage:
 *   tsx scripts/etl/pull_ads_meta.ts
 *   tsx scripts/etl/pull_ads_meta.ts --cron  # Run in cron mode (no interactive output)
 */

import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;

interface MetaAdData {
  campaign_id: string;
  adset_id: string;
  date: string;
  spend_cents: number;
  clicks: number;
  impressions: number;
  conv: number;
}

async function fetchMetaAdsData(
  accessToken: string,
  accountId: string,
  startDate: string,
  endDate: string
): Promise<MetaAdData[]> {
  // Meta Marketing API endpoint
  const url = `https://graph.facebook.com/v18.0/${accountId}/insights`;
  
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: 'campaign_id,adset_id,date_start,spend,clicks,impressions,actions',
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
    level: 'adset',
  });

  const response = await fetch(`${url}?${params}`);
  if (!response.ok) {
    throw new Error(`Meta API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return data.data.map((item: any) => {
    // Extract conversions from actions array
    const conversions = item.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;
    
    return {
      campaign_id: item.campaign_id || '',
      adset_id: item.adset_id || '',
      date: item.date_start,
      spend_cents: Math.round(parseFloat(item.spend || '0') * 100),
      clicks: parseInt(item.clicks || '0', 10),
      impressions: parseInt(item.impressions || '0', 10),
      conv: parseInt(conversions, 10),
    };
  });
}

async function storeSpendData(
  dbUrl: string,
  platform: string,
  data: MetaAdData[]
): Promise<void> {
  const pool = new Pool({ connectionString: dbUrl });

  try {
    for (const row of data) {
      await pool.query(
        `INSERT INTO public.spend (platform, campaign_id, adset_id, date, spend_cents, clicks, impressions, conv)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (platform, campaign_id, adset_id, date) 
         DO UPDATE SET
           spend_cents = EXCLUDED.spend_cents,
           clicks = EXCLUDED.clicks,
           impressions = EXCLUDED.impressions,
           conv = EXCLUDED.conv`,
        [
          platform,
          row.campaign_id,
          row.adset_id,
          row.date,
          row.spend_cents,
          row.clicks,
          row.impressions,
          row.conv,
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  const isCron = process.argv.includes('--cron');
  
  const metaToken = process.env.META_TOKEN;
  const metaAccountId = process.env.META_ACCOUNT_ID || process.env.META_AD_ACCOUNT_ID;
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!metaToken || !metaAccountId || !dbUrl) {
    throw new Error('Missing required env vars: META_TOKEN, META_ACCOUNT_ID, SUPABASE_DB_URL');
  }

  // Default to last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  if (!isCron) {
    console.log(`Fetching Meta ads data from ${startDateStr} to ${endDateStr}...`);
  }

  try {
    const data = await fetchMetaAdsData(metaToken, metaAccountId, startDateStr, endDateStr);
    
    if (data.length === 0) {
      if (!isCron) {
        console.log('No Meta ads data found for date range.');
      }
      return;
    }

    await storeSpendData(dbUrl, 'meta', data);
    
    if (!isCron) {
      console.log(`✅ Stored ${data.length} Meta ads records`);
    }
  } catch (error) {
    console.error('Error fetching Meta ads data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { fetchMetaAdsData, storeSpendData };
